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
# pylint: disable=C,R,W

import re
import json
import time
import logging
from datetime import timedelta, datetime

# Grain valaue map, supported grain by hive db engine
GRAIN_VALUE_MAP = {
    'PT1S': 1,
    'PT1M': 60,
    'PT1H': 3600,
    'P1D': 86400,
    'P1W': 604800,   # 7 days
    'P1M': 2592000,  # 30 days
    'P3M': 7776000,  # 3*30 days
    'P0.25Y': 7776000,  # 3*30 days
    'P1Y': 31536000  # 365 days
}


def get_partitions_min_grain(time_partitions):
    if 'bin_interval' in time_partitions:
        return time_partitions['bin_interval']

    partition_grains = list()
    if 'year' in time_partitions:
        partition_grains.append(GRAIN_VALUE_MAP['P1Y'])
    if 'month' in time_partitions:
        partition_grains.append(GRAIN_VALUE_MAP['P1M'])
    if 'day' in time_partitions:
        partition_grains.append(GRAIN_VALUE_MAP['P1D'])
    if 'hour' in time_partitions:
        partition_grains.append(GRAIN_VALUE_MAP['PT1H'])
    if 'minute' in time_partitions:
        partition_grains.append(GRAIN_VALUE_MAP['PT1M'])

    if partition_grains:
        return partition_grains[-1]

    return None


def get_partitioned_query_format(time_partitions):
    partition_seq = list()
    if 'year' in time_partitions:
        partition_seq.append('`' + time_partitions['year'] + '`' + " = %Y ")
    if 'month' in time_partitions:
        partition_seq.append('`' + time_partitions['month'] + '`' + " = %m ")
    if 'day' in time_partitions:
        partition_seq.append('`' + time_partitions['day'] + '`' + " = %d ")
    if 'hour' in time_partitions:
        partition_seq.append('`' + time_partitions['hour'] + '`' + " = %H ")
    if 'minute' in time_partitions:
        partition_seq.append('`' + time_partitions['minute'] + '`' + " = %M ")

    partition_seq_str = "AND ".join(partition_seq)
    query_str = "( " + partition_seq_str + ")"
    return query_str

def get_partitioned_whereclause(_st, _en, gran_seconds, time_partitions):
    time_seq = list()
    # consider here only till < condition because hive store data like that
    # ie 10-11 hr data will exist in 10th hr partition

    # handle same st and ed selection case,single point selection
    if _st == _en:
        time_seq.append(_st.strftime(get_partitioned_query_format(time_partitions)))

    while _st < _en:
        time_seq.append(_st.strftime(get_partitioned_query_format(time_partitions)))
        _st = _st + timedelta(seconds=gran_seconds)

    where_clause = " OR ".join(time_seq)

    # all time based  condition  should be in AND with other filters
    if time_seq and len(time_seq) > 1:
        where_clause = " ( " + where_clause + " ) "

    return where_clause

# Custom query for Hive Partitons (Date Based)
def where_clause_date_based(_st, _en, date_partitions, grain):
    time_seq = list()
    part_time_seq = list()
    if grain == 0:
        # Partition = Date   
        date = date_partitions['date']
        if _st == _en:
            time_seq.append("(" + _st.strftime('`' + date + '`' + " = '%Y-%m-%d'") + ")")
        while _st <= _en:
            time_seq.append("(" + _st.strftime('`' + date + '`' + " = '%Y-%m-%d'") + ")")
            _st = _st + timedelta(seconds=GRAIN_VALUE_MAP['PT1D'])
    elif grain == 1:
        # Partition = Date, Hour
        date = date_partitions['date']
        hour = date_partitions['hour']
        if _st == _en:
            part_time_seq.append(_st.strftime('`' + date + '`' + " = '%Y-%m-%d'"))
            part_time_seq.append(_st.strftime('`' + hour + '`' + " = '%H'"))
            time_seq.append("(" + " AND ".join(part_time_seq) + ")")
            part_time_seq.clear()
        while _st <= _en:
            part_time_seq.append(_st.strftime('`' + date + '`' + " = '%Y-%m-%d'"))
            part_time_seq.append(_st.strftime('`' + hour + '`' + " = '%H'"))
            time_seq.append("(" + " AND ".join(part_time_seq) + ")")
            part_time_seq.clear()
            _st = _st + timedelta(seconds=GRAIN_VALUE_MAP['PT1H'])
    # TODO = Partition support for minute, second

    where_clause = " OR ".join(time_seq)
    if time_seq and len(time_seq) > 1:
        where_clause = "(" + where_clause + ")"
    return where_clause


def replace_whereclause_in_org_sql(granularity, sql, where_clause, granularity_in_partitions):
    sql_updated = sql
    if granularity_in_partitions:
        # regex for  `granularity` >= 1549497600 type of string
        # any word regex (?:[a-z][a-z]+)
        regex_st = "(`)(" + granularity + ")(`)(\\s+)(>)(=)(\\s+)(\\d+)"
        # regex for `granularity` <= 1549497600
        regex_et = "(AND)(\\s+)(`)(" + granularity + ")(`)(\\s+)(<)(=)(\\s+)(\\d+)"

        sql_updated = re.sub(regex_st, where_clause, sql)
        sql_updated = re.sub(regex_et, '\n', sql_updated)
    else:
        sql_updated = sql.replace("WHERE", " WHERE " + where_clause + " AND ")
    return sql_updated

def get_hive_partitions(database, datasource_name):
    tables = list(filter(lambda tname: (
        tname.datasource_name == datasource_name), database.tables))
    table = tables[0]
    return table.hive_partitions

def default_hive_query_generator(sql, query_obj, database, datasource_name):
    st_seconds = datetime.now()

    """ 
    Schema for time and date based partition in table
    {
      "time": {
            "year":"year",
            "month":"month",
            "day":"day",
            "hour":"hour",
            "minute":"minute",
            "bin_interval":900
        },
        "date": {
            "date": "date",
            "hour": "hour"
        }
    }

    Here we replace simply default date/ time range based
    where clause from sql to specific partition based  where clause
    and returning update sql
    """

    if database.backend == 'hive' and query_obj['extras']['query_with_partitions']:
        hive_partitions = get_hive_partitions(database, datasource_name)
        if hive_partitions:
            hive_partitions_obj = json.loads(hive_partitions)
            if 'date' in hive_partitions_obj:
                date_partitions = (hive_partitions_obj['date'])
                st = query_obj['from_dttm']
                en = query_obj['to_dttm']
                granularity = query_obj['granularity']
                granularity_in_partitions = (granularity in date_partitions)
                if st and en:
                    if 'date' in date_partitions:
                        # TODO: Support upto Minutes, Seconds
                        # Currently supported upto DATE (YYYY - MM - DD), HOUR (HH)
                        if 'hour' in date_partitions:
                            # Date, Hour based partition
                            where_clause = where_clause_date_based(st, en, date_partitions, 1)
                        else:
                            # Date based partition
                            where_clause = where_clause_date_based(st, en, date_partitions, 0)
                    sql_updated = replace_whereclause_in_org_sql(granularity, sql, where_clause, granularity_in_partitions)
                    return sql_updated

            if 'date' not in hive_partitions_obj and 'time' in hive_partitions_obj:
                time_partitions = (hive_partitions_obj['time'])
                st = query_obj['from_dttm']
                en = query_obj['to_dttm']
                gran_seconds = get_partitions_min_grain(time_partitions)
                granularity = query_obj['granularity']
                granularity_in_partitions = (granularity in time_partitions)
                if st and en and gran_seconds:
                    where_clause = get_partitioned_whereclause(st, en, gran_seconds, time_partitions)
                    sql_updated = replace_whereclause_in_org_sql(granularity, sql, where_clause, granularity_in_partitions)
                    logging.info('[PERFORMANCE CHECK] Hive Partition Query formation time {0} '.format(datetime.now() - st_seconds))
                    return sql_updated
    logging.info('[PERFORMANCE CHECK] Hive Partition Query formation time {0} '.format(datetime.now() - st_seconds))
    return sql
