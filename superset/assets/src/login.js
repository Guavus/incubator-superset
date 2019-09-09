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

import { encryptText } from './utils/common';
/**
 * apply onsubmit event for  login form to encrypt pwd before send in request
 */
$(document).ready(function () {
    var elements = document.getElementsByName('login');
    if (elements.length > 0 && elements[0].tagName.toLowerCase() == 'form') {
        document.getElementsByName('login')[0].addEventListener('submit', function (e) {
            var _m = document.getElementById('password').value;
            document.getElementById('password').value = encryptText(_m);
            return true;
        }, false);
    }

});