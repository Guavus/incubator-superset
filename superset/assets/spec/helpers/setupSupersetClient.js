/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import fetchMock from 'fetch-mock';
import { SupersetClient, SupersetClientClass } from '@superset-ui/connection';
import URI from 'urijs';
import { APPLICATION_PREFIX } from "../../src/public-path";

export default function setupSupersetClient() {
  // The following is needed to mock out SupersetClient requests
  // including CSRF authentication and initialization
  global.FormData = window.FormData; // used by SupersetClient
  fetchMock.get('glob:*superset/csrf_token/*', { csrf_token: '1234' });

  URI.prototype.prefix = APPLICATION_PREFIX;
  
  SupersetClientClass.prototype.getUrl = function({
    host: inputHost,
    endpoint = '',
    url,
  }) {
    if(endpoint && endpoint.charAt(0) == "/") {
      endpoint = APPLICATION_PREFIX+endpoint;
    } else {
      endpoint = APPLICATION_PREFIX+"/"+endpoint;
    }
    if (typeof url === 'string') return url;
    const host = inputHost || this.host;
    const cleanHost = host.slice(-1) === '/' ? host.slice(0, -1) : host; // no backslash

    return `${this.protocol}//${cleanHost}/${endpoint[0] === '/' ? endpoint.slice(1) : endpoint}`;
  }


  SupersetClient.configure({ protocol: 'http', host: 'localhost' }).init();
}
