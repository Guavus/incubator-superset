import logging
import simplejson as json

from flask import g 

from superset import app, db, security_manager
from superset.connectors.sqla.models import SqlaTable
import superset.models.core as models
from superset.utils import core as utils
from superset.views.default_slice_metadata import update_slice_metadata
from superset.utils import dashboard_import_export

def get_table_columns(columns):
    table_columns = []
    TableColumn = SqlaTable.column_class
    for column in columns:
        table_column = TableColumn()
        for prop in column:
            setattr(table_column, prop, column[prop])
        table_columns.append(table_column)
    return table_columns

def create_table(args,fetch_metadata = False):
    database_id = int(args.get('database_id'))
    table_name =  args.get('table_name')
    schema =  args.get('schema')
    # Because of table_name unique constraint at db table level 
    # we cannot create table with same name across dbs/schemas
    # if there is table with provided name then using it as table_model
    table_models = (
                db.session.query(SqlaTable)
                .filter_by(table_name=table_name
                )
                .all()
            )
    if len(table_models) == 0:
        database = db.session.query(models.Database).filter_by(id=database_id).one()
        columns = json.loads(args.get('columns'))
        table_columns = get_table_columns(columns)
        table_model = SqlaTable(
            table_name=table_name,
            schema=schema,
            database_id=database_id,
            database = database,
            columns= table_columns,
        )
        db.session.add(table_model)
        db.session.commit()
        fetch_table_metadata(table_model, fetch_metadata)
        logging.info('table is created with id = '+str(table_model.id)+' and linked with database id = '+str(database_id))
        return table_model
    else:
        # pick first one
        logging.info('reused table with id = '+str(table_models[0].id))
        fetch_table_metadata(table_models[0], fetch_metadata)
        return table_models[0]


def fetch_table_metadata(table_model,fetch_metadata = False):
    if fetch_metadata:
        table_model.fetch_metadata()
        security_manager.merge_perm('datasource_access', table_model.get_perm())
        if table_model.schema:
            security_manager.merge_perm('schema_access', table_model.schema_perm)

    
def add_slice_to_dashboard(request,args, datasource_type=None, datasource_id=None):
    form_data = json.loads(args.get('form_data'))
    datasource_id = args.get('datasource_id')
    datasource_type = args.get('datasource_type')
    datasource_name = args.get('datasource_name')
    viz_type = form_data.get('viz_type')  
    
    form_data['datasource'] = str(datasource_id) + '__' + datasource_type

    # On explore, merge legacy and extra filters into the form data
    utils.convert_legacy_filters_into_adhoc(form_data)
    utils.merge_extra_filters(form_data)

    """Save or overwrite a slice"""
    slice_name = args.get('slice_name')
    action = args.get('action')
    #saving slice
    slc = models.Slice(owners=[g.user] if g.user else [])
    slc.params = json.dumps(form_data, indent=2, sort_keys=True)
    slc.datasource_name = datasource_name
    slc.viz_type = form_data['viz_type']
    slc.datasource_type = datasource_type
    slc.datasource_id = datasource_id
    slc.slice_name = slice_name
    session = db.session()
    session.add(slc)
    session.commit()
    
    #adding slice to dashboard
    dash = (
        db.session.query(models.Dashboard)
        .filter_by(id=int(args.get('save_to_dashboard_id')))
        .one()
    )

    dash.slices.append(slc)
    db.session.commit()
    logging.info(
    'Slice [{}] was added to dashboard [{}]'.format(
        slc.slice_name,
        dash.dashboard_title),
    'info')

    return {
        'form_data': slc.form_data,
        'slice': slc.data,
    }


def create_database(form):
    # create database  connection
    database_name = form.get('database_name')
    if database_name is None:
        return None

    sqlalchemy_uri = form.get('sqlalchemy_uri')
    extra = form.get('extra')
    impersonate_user = eval(form.get('impersonate_user'))

    db_models = (
                db.session.query(models.Database)
                .filter_by(database_name=database_name)
                .all()
            )
    if len(db_models) == 0:        
        db_model = models.Database(
            database_name=database_name,
            sqlalchemy_uri=sqlalchemy_uri,
            extra=extra,
            impersonate_user=impersonate_user
        )
        db.session.add(db_model)
        db.session.commit()
        database_id = db_model.id 
        logging.info('database connection is created with id = '+str(database_id))
        return database_id
    else:
        # pick first one
        logging.info('reused database connection with id = '+str(db_models[0].id))
        return db_models[0].id    

def add_to_dashboard(request):
    # create database  connection
    database_id = create_database(request.form)    

    # create dashboard
    dash_model = models.Dashboard(
        dashboard_title= request.form.get('dashboard_title'),
        slug=request.form.get('slug'),
    )
    db.session.add(dash_model)
    db.session.commit()
    dashboard_id = dash_model.id
    logging.info('new dashboard created with id = ' + str(dashboard_id))


    slices = json.loads(request.form.get('slices'))
    for _slice in slices:
        columns = json.dumps([])
        if 'columns' in _slice:
            columns = json.dumps(_slice['columns'])
        params = {
            'database_id':database_id ,
            'table_name':_slice['table_name'],
            'schema':_slice['schema'],
            'columns':columns,
            }
        
        # create table for slice
        table_model = create_table(params)
        
        # add slice into dashboard
        _slice = update_slice_metadata(_slice)
        slice_param_data = {
        'action':'saveas',
        'slice_name':_slice['slice_name'],
        'add_to_dash':'existing',
        'save_to_dashboard_id':dashboard_id,
        'goto_dash':'false',
        'form_data':json.dumps(_slice),
        'datasource_id' : table_model.id,
        'datasource_type' : table_model.type,
        'datasource_name' : table_model.name
        }

        add_slice_to_dashboard(request,slice_param_data)

    return get_dashboard_response(request.url_root,dashboard_id)    


def update_slices_in_dashboard(dashboards, parameters):
    dashboard = dashboards['dashboards'][0]
    title = parameters['dashboard_title']
    if title:
        dashboard.dashboard_title = title
    # assuming sinle dashboard per JSON
    for slice_item in dashboard.slices:
        datasource = None
        if slice_item.datasource_name in parameters:
            datasource = parameters[slice_item.datasource_name]
        if datasource is not None:
            slice_item.alter_params(
                        datasource_name = datasource.name,
                        schema = datasource.name,
                        database_name = datasource.database_name,
                    )
    return dashboards

def get_dashboard_response(url_root,dash_id):
    return json.dumps({'dashboard_url' : url_root.rstrip('/')+ app.config.get('APPLICATION_PREFIX') + "/superset/dashboard/" + str(dash_id) + "/"})

def replicate_dashboard(request):
    database_id = create_database(request.form)

    dashboard_title = request.form.get('dashboard_title')
    template_parameters = {'dashboard_title': dashboard_title}
    tables_param = {}
    dashboard_data_param = request.form.get('template')
    dashboard_data = dashboard_import_export.dashboard_json(dashboard_data_param)

    if database_id is not None:
        # get tables from request
        tables = request.form.get('tables')
        if tables is not None:
            tables_param = json.loads(r''+request.form.get('tables'))

        # update tables_param with datasource_name of  slices, not defined in  tables
        for slice_item in dashboard_data['dashboards'][0].slices:
            if slice_item.datasource_name not in tables_param:
                tables_param[slice_item.datasource_name] = slice_item.datasource_name
        
        for table_placeholder in tables_param:
            schema_and_table_name = tables_param[table_placeholder].split('.')
            table_name = schema_and_table_name[0]
            schema = None
            if len(schema_and_table_name) >= 2:
                table_name = schema_and_table_name[1]
                schema = schema_and_table_name[0]
                
            params = {
                'database_id': database_id ,
                'table_name': table_name,
                'schema': schema,
                'columns': json.dumps([])
            }
            # create table for slice
            table = create_table(params,True)
            template_parameters[table_placeholder] = table
    
    update_slices_in_dashboard(dashboard_data,template_parameters)
    dash_id = dashboard_import_export.import_dashboard_json(db.session, dashboard_data)
    return get_dashboard_response(request.url_root,dash_id)
