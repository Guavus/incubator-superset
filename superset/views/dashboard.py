# pylint: disable=C,R,W
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
from flask import g, redirect, request, Response
from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access

from superset import appbuilder, db
from superset.models import core as models
from .base import BaseSupersetView
import simplejson as json
import logging



class Dashboard(BaseSupersetView):
    """The base views for Superset!"""

    @has_access
    @expose('/new/')
    def new(self):
        """Creates a new, blank dashboard and redirects to it in edit mode"""
        new_dashboard = models.Dashboard(
            dashboard_title='[ untitled dashboard ]',
            owners=[g.user],
        )
        db.session.add(new_dashboard)
        db.session.commit()
        return redirect(f'/superset/dashboard/{new_dashboard.id}/?edit=true')


    @expose('/add_new', methods=['POST'])
    def addnew(self):
        """Creates a new, blank dashboard and redirects to it in edit mode"""
        new_dashboard = models.Dashboard(
            dashboard_title= request.form.get('dashboard_title'),
            slug=request.form.get('slug'),
        )
        db.session.add(new_dashboard)
        db.session.commit()
        logging.info('new dashboard created with name = ' + request.form.get('dashboard_title'))

        return self.json_success(json.dumps({
            'dashboard_id': new_dashboard.id,
        }))

appbuilder.add_view_no_menu(Dashboard)
