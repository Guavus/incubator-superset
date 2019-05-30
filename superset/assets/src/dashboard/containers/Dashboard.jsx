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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Dashboard from '../components/Dashboard';

import {
  addSliceToDashboard,
  removeSliceFromDashboard,
  reconcileSuccess,
  changeFilter,
  updateModalChart,
  hideModal,
} from '../actions/dashboardState';
import { runQuery } from '../../chart/chartAction';
import getLoadStatsPerTopLevelComponent from '../util/logging/getLoadStatsPerTopLevelComponent';

function mapStateToProps(state) {
  const {
    datasources,
    sliceEntities,
    charts,
    dashboardInfo,
    dashboardState,
    dashboardLayout,
    impressionId,
  } = state;

  return {
    initMessages: dashboardInfo.common.flash_messages,
    timeout: dashboardInfo.common.conf.SUPERSET_WEBSERVER_TIMEOUT,
    userId: dashboardInfo.userId,
    dashboardInfo,
    dashboardState,
    charts,
    datasources,
    slices: sliceEntities.slices,
    layout: dashboardLayout.present,
    impressionId,
    loadStats: getLoadStatsPerTopLevelComponent({
      layout: dashboardLayout.present,
      chartQueries: charts,
    }),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        addSliceToDashboard,
        removeSliceFromDashboard,
        runQuery,
        reconcileSuccess,
        changeFilter,
        updateModalChart,
        hideModal,
      },
      dispatch,
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Dashboard);
