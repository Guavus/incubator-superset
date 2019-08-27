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
"""Unit tests for Superset"""
import json
import unittest

from flask import escape
from sqlalchemy import func

from superset import db, security_manager
from superset.connectors.sqla.models import SqlaTable
from superset.models import core as models
from .base_tests import SupersetTestCase

class AddToDashboardTests(SupersetTestCase):

    def __init__(self, *args, **kwargs):
        super(AddToDashboardTests, self).__init__(*args, **kwargs)

    @classmethod
    def setUpClass(cls):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_add_to_dashboard(self):
        self.login(username='admin',password='Ym8Hg1+u3VmyM8mRul3xnWuvh2xalT/soSM3z5fTosQ=')
        url = '/superset/add_to_dashboard'
        data = {
                    
        }
        resp = self.client.post(url, data=data=dict(
            database_name="test_add_to_dashboard",
            sqlalchemy_uri="hive://yarn@192.168.135.144:10000/",
            impersonate_user=False,
            extra= json.dumps({
                "metadata_params": {},
                "engine_params": {},
                "metadata_cache_timeout": {},
                "schemas_allowed_for_csv_upload": []
            }),
            dashboard_title="test_add_to_dashboard",
            slug="test_add_to_dashboard",
            slices=json.dumps([
                        {
                            "table_name":"control_plane_table",
                            "schema":"demo",
                            "slice_name":"bardemo",
                            "viz_type":"dist_bar",
                            "metrics":[{"column":{"column_name":"c_call_duration"}}],
                            "groupby":["c_to_msisdn"]}
            ])

        ))
        self.assertIn({"dashboard_url":"/superset/test_add_to_dashboard"}, resp)

if __name__ == '__main__':
    unittest.main()