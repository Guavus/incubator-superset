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
import textwrap

from superset import db
from superset.models.core import CssTemplate


def load_css_templates():
    """Loads 2 css templates to demonstrate the feature"""
    print('Creating default CSS templates')

    obj = db.session.query(CssTemplate).filter_by(template_name='Flat').first()
    if not obj:
        obj = CssTemplate(template_name='Flat')
    css = textwrap.dedent("""\
    .gridster div.widget {
        transition: background-color 0.5s ease;
        background-color: #FAFAFA;
        border: 1px solid #CCC;
        box-shadow: none;
        border-radius: 0px;
    }
    .gridster div.widget:hover {
        border: 1px solid #000;
        background-color: #EAEAEA;
    }
    .navbar {
        transition: opacity 0.5s ease;
        opacity: 0.05;
    }
    .navbar:hover {
        opacity: 1;
    }
    .chart-header .header{
        font-weight: normal;
        font-size: 12px;
    }
    /*
    var bnbColors = [
        //rausch    hackb      kazan      babu      lima        beach     tirol
        '#ff5a5f', '#7b0051', '#007A87', '#00d1c1', '#8ce071', '#ffb400', '#b4a76c',
        '#ff8083', '#cc0086', '#00a1b3', '#00ffeb', '#bbedab', '#ffd266', '#cbc29a',
        '#ff3339', '#ff1ab1', '#005c66', '#00b3a5', '#55d12e', '#b37e00', '#988b4e',
     ];
    */
    """)
    obj.css = css
    db.session.merge(obj)
    db.session.commit()

    obj = (
        db.session.query(CssTemplate).filter_by(template_name='Courier Black').first())
    if not obj:
        obj = CssTemplate(template_name='Courier Black')
    css = textwrap.dedent("""\
    .gridster div.widget {
        transition: background-color 0.5s ease;
        background-color: #EEE;
        border: 2px solid #444;
        border-radius: 15px;
        box-shadow: none;
    }
    h2 {
        color: white;
        font-size: 52px;
    }
    .navbar {
        box-shadow: none;
    }
    .gridster div.widget:hover {
        border: 2px solid #000;
        background-color: #EAEAEA;
    }
    .navbar {
        transition: opacity 0.5s ease;
        opacity: 0.05;
    }
    .navbar:hover {
        opacity: 1;
    }
    .chart-header .header{
        font-weight: normal;
        font-size: 12px;
    }
    .nvd3 text {
        font-size: 12px;
        font-family: inherit;
    }
    body{
        background: #000;
        font-family: Courier, Monaco, monospace;;
    }
    /*
    var bnbColors = [
        //rausch    hackb      kazan      babu      lima        beach     tirol
        '#ff5a5f', '#7b0051', '#007A87', '#00d1c1', '#8ce071', '#ffb400', '#b4a76c',
        '#ff8083', '#cc0086', '#00a1b3', '#00ffeb', '#bbedab', '#ffd266', '#cbc29a',
        '#ff3339', '#ff1ab1', '#005c66', '#00b3a5', '#55d12e', '#b37e00', '#988b4e',
     ];
    */
    """)
    obj.css = css
    db.session.merge(obj)
    db.session.commit()


    obj = (
        db.session.query(CssTemplate).filter_by(template_name='Guavus_Brown').first())
    if not obj:
        obj = CssTemplate(template_name='Guavus_Brown')
    css = textwrap.dedent("""\

    .navbar-default-template, .navbar-inverse {
      background-color: #383846;
    }
    .navbar-inverse {
      border: 3px solid #383846;
    }
    """)
    obj.css = css
    db.session.merge(obj)
    db.session.commit()

    obj = (
        db.session.query(CssTemplate).filter_by(template_name='Guavus_Blue').first())
    if not obj:
        obj = CssTemplate(template_name='Guavus_Blue')
    css = textwrap.dedent("""\
    .navbar-default-template, .navbar-inverse  {
      background-color: #0d9d7f;
    }
    .navbar-inverse {
      border: 3px solid #0d9d7f;
    }
    """)
    obj.css = css
    db.session.merge(obj)
    db.session.commit()

    obj = (
        db.session.query(CssTemplate).filter_by(template_name='Guavus_Green').first())
    if not obj:
        obj = CssTemplate(template_name='Guavus_Green')
    css = textwrap.dedent("""\
    .navbar-default-template, .navbar-inverse  {
      background-color: #1a396b;
    }
    .navbar-inverse {
      border: 3px solid #1a396b;
    }
    """)
    obj.css = css
    db.session.merge(obj)
    db.session.commit()

