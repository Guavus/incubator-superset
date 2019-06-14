DEFAULT_SLICES = {
                  "table": {
                      'slice_name':'new_table2',
                      'datasource':'2__table',
                      'viz_type':'table',
                      'url_params':{},
                      'publish_columns':[],
                      'granularity_sqla':'timestamp',
                      'time_grain_sqla':'P1D',
                      'time_range':'No filter',
                      'query_with_partitions':'true',
                      'groupby':[],
                      'metrics':'null',
                      'percent_metrics':[],
                      'timeseries_limit_metric':'null',
                      'row_limit':100,
                      'include_time':'false',
                      'order_desc':'true',
                      'all_columns':['event','counts','timestamp'],
                      'order_by_cols':[],
                      'adhoc_filters':[],
                      'table_timestamp_format':'%Y-%m-%d %H:%M:%S',
                      'page_length':0,
                      'include_search':'false',
                      'table_filter':'false',
                      'align_pn':'false',
                      'color_pn':'true'
                  },
                  "pie": {
                      "datasource":"5__table",
                      "viz_type":"pie",
                      "url_params":{},
                      "publish_columns":[],
                      "granularity_sqla":"bin_ts",
                      "time_grain_sqla":"P1D",
                      "time_range":"No filter",
                      "query_with_partitions":'true',
                      "metric":{
                          "expressionType":"SIMPLE",
                          "column":{
                              "id":'46',
                              "column_name":"variable",
                              "verbose_name":'null',
                              "description":'null',
                              "expression":"",
                              "filterable":'true',
                              "groupby":'true',
                              "is_dttm":'false',
                              "type":"STRING",
                              "database_expression":'null',
                              "python_date_format":'null',
                              "optionName":"_col_variable"
                            },
                          "aggregate":"COUNT_DISTINCT",
                          "sqlExpression":'null',
                          "hasCustomLabel":'false',
                          "fromFormData":'false',
                          "label":"COUNT_DISTINCT(variable)",
                          "optionName":"metric_02qsr6hpi1cw_a31d68o81b"
                      },
                      "adhoc_filters":[],
                      "groupby":["agg_count"],
                      "row_limit":'25',
                      "pie_label_type":"key",
                      "number_format":".3s",
                      "donut":'false',
                      "show_legend":'true',
                      "show_labels":'true',
                      "labels_outside":'true',
                      "color_scheme":"bnbColors"
                    }
}

SIMPLE_ADHOC_FILTER = {
                "clause": "WHERE",
                "comparator": "0",
                "expressionType": "SIMPLE",
                "filterOptionName": "filter_kzua5dxzas_eny55grh7z",
                "fromFormData": 'true',
                "operator": "==",
                "sqlExpression": 'null',
                "subject": "control_availability"
}

DEFAULT_COLUMN = {
              "column_name": "aggregated_metric",
              "database_expression": 'null',
              "description": 'null',
              "expression": "",
              "filterable": 'true',
              "groupby": 'true',
              "id": '193',
              "is_dttm": 'false',
              "optionName": "_col_aggregated_metric",
              "python_date_format": 'null',
              "type": "NUMBER",
              "verbose_name": 'null'
}

DEFAULT_METRIC = {
              "aggregate": "SUM",
              "column": {
              },
              "expressionType": "SIMPLE",
              "fromFormData": 'true',
              "hasCustomLabel": 'false',
              "label": "SUM(aggregated_metric)",
              "optionName": "metric_kdw7m7era8_n3780y6yebi",
              "sqlExpression": 'null'
}

def update_slice_metadata(slice):
    default_slice_info = DEFAULT_SLICES[slice['viz_type']]
    temp_slice = list(default_slice_info)

    for key in temp_slice:

      if key not in slice:
        slice[key] = default_slice_info[key]

      if key == 'adhoc_filters' and key in slice  and slice[key] != 'null':
        for filter in slice[key]:
          for prop in SIMPLE_ADHOC_FILTER:
            if prop not in filter:
              filter[prop] = SIMPLE_ADHOC_FILTER[prop]

      if key == 'metrics' and key in slice and slice[key] != 'null':
          for metric in slice[key]:
              for prop in DEFAULT_METRIC:
                if prop not in metric:
                  metric[prop] = SIMPLE_ADHOC_FILTER[prop]
                  if prop == 'column':
                    for column_prop in DEFAULT_COLUMN:
                      if column_prop in metric[prop]:
                        metric[prop][column_prop] = DEFAULT_COLUMN[column_prop]

    return slice



