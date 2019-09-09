#!/usr/bin/env bash
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -ex

  echo "Initializing database"
  superset db upgrade

  echo "Creating default roles and permissions"
  superset init

# To start a development web server, use the -d switch
 
  gunicorn --bind  0.0.0.0:$CONTAINER_PORT \
      --workers $((2 * $GUNICORN_PROCESSORS + 1)) \
      -k gevent \
      --keep-alive $GUNICORN_WORKER_KEEP_ALIVE \
      --timeout $GUNICORN_WORKER_TIMEOUT \
      --limit-request-line 0 \
      --limit-request-field_size 0 \
      superset:app