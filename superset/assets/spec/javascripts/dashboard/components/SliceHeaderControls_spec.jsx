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
import React from 'react';
import { shallow } from 'enzyme';
import SliceHeaderControls from '../../../../src/dashboard/components/SliceHeaderControls';
describe('SliceHeaderControls', () => {
  const defaultProps = {
    slice: {
      slice_id: 1,
      isCached: true,
      form_data: {
        navigate_to_dashboards: 'UIC-2453',
        navigate_to_dash_link_name: 'Navigate to dashboard'
      }
    },
    conf: { TICKET_GENERATION_SYSTEM_ENDPOINT: "https://guavus-jira.atlassian.net/" },
    updatedDttm: 1
  };
  const wrapper = shallow(<SliceHeaderControls {...defaultProps} />);
  it('renders Slice Header Controls', () => {
    expect(
      React.isValidElement(<SliceHeaderControls {...defaultProps}/>),
    ).toBe(true);
  });
  it('Check value of state variable', () => {
    expect(wrapper.state().showControls).toBeFalsy();
  });
  it('should call getNavigateToDashboardAction', () => {
    expect(wrapper.instance().getNavigateToDashboardAction()).toEqual({label:'Navigate to dashboard', url:'/superset/dashboard/UIC-2453/', method:'GET'});
  });
  it('should call getNavigateToDashboardAction, is pass filter true', () => {
    const overrideProps = { ...defaultProps };
    overrideProps.slice.form_data['passing_filter_to_dasboard'] = true;
    const wrapper = shallow(<SliceHeaderControls {...overrideProps} />);
    expect(wrapper.instance().getNavigateToDashboardAction()).toEqual({label:'Navigate to dashboard', url:'/superset/dashboard/UIC-2453/', method:'GET', passFilters: true});
  });
});
