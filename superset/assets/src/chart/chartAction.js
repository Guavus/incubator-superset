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
/* global window, AbortController */
/* eslint no-undef: 'error' */
/* eslint no-param-reassign: ["error", { "props": false }] */
import { t } from '@superset-ui/translation';
import { SupersetClient } from '@superset-ui/connection';
import { getExploreUrlAndPayload, getAnnotationJsonUrl } from '../explore/exploreUtils';
import { requiresQuery, ANNOTATION_SOURCE_TYPES } from '../modules/AnnotationTypes';
import { addDangerToast } from '../messageToasts/actions';
import { Logger, LOG_ACTIONS_LOAD_CHART } from '../logger';
import getClientErrorObject from '../utils/getClientErrorObject';
import { allowCrossDomain } from '../utils/hostNamesConfig';
import { APPLICATION_PREFIX } from '../public-path';
import { createPostPayload, getSuccessToastMessage }  from '../utils/restActions';
import { addSuccessToast } from '../messageToasts/actions'

export const CHART_UPDATE_STARTED = 'CHART_UPDATE_STARTED';
export function chartUpdateStarted(queryController, latestQueryFormData, key) {
  return { type: CHART_UPDATE_STARTED, queryController, latestQueryFormData, key };
}

export const CHART_UPDATE_SUCCEEDED = 'CHART_UPDATE_SUCCEEDED';
export function chartUpdateSucceeded(queryResponse, key) {
  return { type: CHART_UPDATE_SUCCEEDED, queryResponse, key };
}

export const CHART_UPDATE_STOPPED = 'CHART_UPDATE_STOPPED';
export function chartUpdateStopped(key) {
  return { type: CHART_UPDATE_STOPPED, key };
}

export const CHART_UPDATE_TIMEOUT = 'CHART_UPDATE_TIMEOUT';
export function chartUpdateTimeout(statusText, timeout, key) {
  return { type: CHART_UPDATE_TIMEOUT, statusText, timeout, key };
}

export const CHART_UPDATE_FAILED = 'CHART_UPDATE_FAILED';
export function chartUpdateFailed(queryResponse, key) {
  return { type: CHART_UPDATE_FAILED, queryResponse, key };
}

export const CHART_RENDERING_FAILED = 'CHART_RENDERING_FAILED';
export function chartRenderingFailed(error, key, stackTrace) {
  return { type: CHART_RENDERING_FAILED, error, key, stackTrace };
}

export const CHART_RENDERING_SUCCEEDED = 'CHART_RENDERING_SUCCEEDED';
export function chartRenderingSucceeded(key) {
  return { type: CHART_RENDERING_SUCCEEDED, key };
}

export const REMOVE_CHART = 'REMOVE_CHART';
export function removeChart(key) {
  return { type: REMOVE_CHART, key };
}

export const ANNOTATION_QUERY_SUCCESS = 'ANNOTATION_QUERY_SUCCESS';
export function annotationQuerySuccess(annotation, queryResponse, key) {
  return { type: ANNOTATION_QUERY_SUCCESS, annotation, queryResponse, key };
}

export const ANNOTATION_QUERY_STARTED = 'ANNOTATION_QUERY_STARTED';
export function annotationQueryStarted(annotation, queryController, key) {
  return { type: ANNOTATION_QUERY_STARTED, annotation, queryController, key };
}

export const ANNOTATION_QUERY_FAILED = 'ANNOTATION_QUERY_FAILED';
export function annotationQueryFailed(annotation, queryResponse, key) {
  return { type: ANNOTATION_QUERY_FAILED, annotation, queryResponse, key };
}
export const REST_ACTION_SUCCESS = 'REST_ACTION_SUCCESS';
export function restActionSuccess(queryResponse, key) {
  return { type: REST_ACTION_SUCCESS, queryResponse, key };
}

export const REST_ACTION_STARTED = 'REST_ACTION_STARTED';
export function restActionStarted(queryController,restAction, key) {
  return { type: REST_ACTION_STARTED, restAction, queryController, key };
}

export const REST_ACTION_FAILED = 'REST_ACTION_FAILED';
export function restActionFailed(queryResponse, key) {
  return { type: REST_ACTION_FAILED, queryResponse, key };
}

export const REST_ACTION_TIMEOUT = 'REST_ACTION_TIMEOUT';
export function restActionTimeout(queryResponse,timeout ,key) {
  return { type: REST_ACTION_TIMEOUT, queryResponse, key };
}

export const REST_ACTION_STOPPED = 'REST_ACTION_STOPPED';
export function restActionStopped(key) {
  return { type: REST_ACTION_STOPPED, key };
}

export function runAnnotationQuery(annotation, timeout = 60, formData = null, key) {
  return function (dispatch, getState) {
    const sliceKey = key || Object.keys(getState().charts)[0];
    // make a copy of formData, not modifying original formData
    const fd = { ...(formData || getState().charts[sliceKey].latestQueryFormData) };

    if (!requiresQuery(annotation.sourceType)) {
      return Promise.resolve();
    }

    const granularity = fd.time_grain_sqla || fd.granularity;
    fd.time_grain_sqla = granularity;
    fd.granularity = granularity;
    const overridesKeys = Object.keys(annotation.overrides);
    if (overridesKeys.includes('since') || overridesKeys.includes('until')) {
      annotation.overrides = {
        ...annotation.overrides,
        time_range: null,
      };
    }
    const sliceFormData = Object.keys(annotation.overrides).reduce(
      (d, k) => ({
        ...d,
        [k]: annotation.overrides[k] || fd[k],
      }),
      {},
    );
    const isNative = annotation.sourceType === ANNOTATION_SOURCE_TYPES.NATIVE;
    const url = getAnnotationJsonUrl(annotation.value, sliceFormData, isNative);
    const controller = new AbortController();
    const { signal } = controller;

    dispatch(annotationQueryStarted(annotation, controller, sliceKey));

    return SupersetClient.get({
      url,
      signal,
      timeout: timeout * 1000,
    })
      .then(({ json }) => dispatch(annotationQuerySuccess(annotation, json, sliceKey)))
      .catch(response => getClientErrorObject(response).then((err) => {
        if (err.statusText === 'timeout') {
          dispatch(annotationQueryFailed(annotation, { error: 'Query Timeout' }, sliceKey));
        } else if ((err.error || '').toLowerCase().includes('no data')) {
          dispatch(annotationQuerySuccess(annotation, err, sliceKey));
        } else if (err.statusText !== 'abort') {
          dispatch(annotationQueryFailed(annotation, err, sliceKey));
        }}),
      );
  };
}

export const TRIGGER_QUERY = 'TRIGGER_QUERY';
export function triggerQuery(value = true, key) {
  return { type: TRIGGER_QUERY, value, key };
}

// this action is used for forced re-render without fetch data
export const RENDER_TRIGGERED = 'RENDER_TRIGGERED';
export function renderTriggered(value, key) {
  return { type: RENDER_TRIGGERED, value, key };
}

export const UPDATE_QUERY_FORM_DATA = 'UPDATE_QUERY_FORM_DATA';
export function updateQueryFormData(value, key) {
  return { type: UPDATE_QUERY_FORM_DATA, value, key };
}

// in the sql lab -> explore flow, user can inline edit chart title,
// then the chart will be assigned a new slice_id
export const UPDATE_CHART_ID = 'UPDATE_CHART_ID';
export function updateChartId(newId, key = 0) {
  return { type: UPDATE_CHART_ID, newId, key };
}

export const ADD_CHART = 'ADD_CHART';
export function addChart(chart, key) {
  return { type: ADD_CHART, chart, key };
}
export const RUN_REST_QUERY = 'RUN_REST_QUERY';
export function runRestQuery(action,timeout = 60, key) {
  return (dispatch) => {
    if ("get" === (action.method).toLowerCase()) {
      window.open(action.url, action.target || "_blank");
      return Promise.resolve(true);
    }
    else {

      const actions = {
        requestStarted: restActionStarted,
        requestSucceeded: restActionSuccess,
        requestTimeout: restActionTimeout,
        requestStopped: restActionStopped,
        requestFailed: restActionFailed,
      };
      const loggers = {
        success: (json, starttime, duration) => { 
        } , 
        failure: (errorDetails, starttime, duration) => {
        }
      }
      var queryPromise = executeQuery('/superset/execute_rest_action', timeout, key, {action: action}, actions, loggers, dispatch, true)
      queryPromise.then( (value) => {
        if(value.type == REST_ACTION_SUCCESS) {
          dispatch(
            addSuccessToast(getSuccessToastMessage(action, value.queryResponse)),
          )}
        }
      );
      return queryPromise; 
    }
  }
}



export const RUN_QUERY = 'RUN_QUERY';
export function runQuery(formData, force = false, timeout = 60, key) {
  return (dispatch) => {
    const { url, payload } = getExploreUrlAndPayload({
      formData,
      endpointType: 'json',
      force,
      allowDomainSharding: true,
    });

    const actions = {
      requestStarted: chartUpdateStarted,
      requestSucceeded: chartUpdateSucceeded,
      requestTimeout: chartUpdateTimeout,
      requestStopped: chartUpdateStopped,
      requestFailed: chartUpdateFailed,
    };

    const loggers = {
      success: (json, starttime, duration) => { 
        Logger.append(LOG_ACTIONS_LOAD_CHART, {
          slice_id: key,
          is_cached: json.is_cached,
          force_refresh: force,
          row_count: json.rowcount,
          datasource: formData.datasource,
          start_offset: starttime,
          duration: duration,
          has_extra_filters: formData.extra_filters && formData.extra_filters.length > 0,
          viz_type: formData.viz_type,
        })
      } , 
      failure: (errorDetails, starttime, duration) => {
        Logger.append(LOG_ACTIONS_LOAD_CHART, {
          slice_id: key,
          has_err: true,
          error_details: errorDetails,
          datasource: formData.datasource,
          start_offset: starttime,
          duration: duration,
        });
      }
    }
    const queryPromise = executeQuery(url,timeout,key,{form_data: payload }, actions, loggers, dispatch);
    const annotationLayers = formData.annotation_layers || [];

    return Promise.all([
      queryPromise,
      dispatch(triggerQuery(false, key)),
      dispatch(updateQueryFormData(payload, key)),
      ...annotationLayers.map(x => dispatch(runAnnotationQuery(x, timeout, formData, key))),
    ]);
  };
}

export function executeQuery(url, timeout = 60, key, payload, actions, loggers,dispatch, isEndpoint = false) {
    const {requestStarted, requestSucceeded, requestTimeout, requestStopped, requestFailed} = actions || {};
    const {success, failure} = loggers || {};
    const logStart = Logger.getTimestamp();
    const controller = new AbortController();
    const { signal } = controller;

    dispatch(requestStarted(controller, payload, key));

    let querySettings = {
      url,
      postPayload: payload,
      signal,
      timeout: timeout * 1000,
    };
    if(isEndpoint) {
      querySettings = {
        ...querySettings,
        endpoint: url,
        url: undefined
      }
    }
    if (allowCrossDomain) {
      querySettings = {
        ...querySettings,
        mode: 'cors',
        credentials: 'include',
      };
    }
    const queryPromise = SupersetClient.post(querySettings)
    .then(({ json }) => {
      success(json, logStart, Logger.getTimestamp() - logStart);
      return dispatch(requestSucceeded(json, key));
    })
    .catch((response) => {
      const appendErrorLog = (errorDetails) => {
        failure(errorDetails,logStart, Logger.getTimestamp() - logStart);
      };
      if (response.statusText === 'timeout') {
        appendErrorLog('timeout');
        return dispatch(requestTimeout(response.statusText, timeout, key));
      } else if (response.name === 'AbortError') {
        appendErrorLog('abort');
        return dispatch(requestStopped(key));
      }
      return getClientErrorObject(response).then((parsedResponse) => {
        appendErrorLog(parsedResponse.error);
        return dispatch(requestFailed(parsedResponse, key));
      });
    });

    return queryPromise;
}

export function redirectSQLLab(formData) {
  return (dispatch) => {
    const { url } = getExploreUrlAndPayload({ formData, endpointType: 'query' });
    return SupersetClient.get({ url })
      .then(({ json }) => {
        const redirectUrl = new URL(window.location);
        redirectUrl.pathname = APPLICATION_PREFIX + '/superset/sqllab';
        for (const key of redirectUrl.searchParams.keys()) {
          redirectUrl.searchParams.delete(key);
        }
        redirectUrl.searchParams.set('datasourceKey', formData.datasource);
        redirectUrl.searchParams.set('sql', json.query);
        window.open(redirectUrl.href, '_blank');
      })
      .catch(() => dispatch(addDangerToast(t('An error occurred while loading the SQL'))));
  };
}

export function refreshChart(chart, force, timeout) {
  return (dispatch) => {
    if (!chart.latestQueryFormData || Object.keys(chart.latestQueryFormData).length === 0) {
      return;
    }
    dispatch(runQuery(chart.latestQueryFormData, force, timeout, chart.id));
  };
}

export function executeRestAction(payload, restAction, timeout) {
  return (dispatch) => {
    const {chart} = payload;
    payload = {
      ...payload,
      time: new Date().toLocaleString(),
      chart_query: chart.queryResponse && chart.queryResponse.query,
      chart_selection: ((obj) => {
           var selection = "No Selection";
           if(Object.keys(obj).length > 0) selection = Object.keys(obj).reduce((p,c) =>  p+"\n"+c+": "+obj[c],"")
           return selection
        })(payload.filters)
    };

    restAction = {
      ...restAction,
      data: createPostPayload(restAction.data,payload)
    };
    
    // update url with filters info as queryparmas for nvaigatetodashbaord rest action
    if (restAction.hasOwnProperty('passFilters') && restAction.passFilters && Object.keys(payload.filters).length > 0) {
      var queryparams="?preslice_filters="+encodeURIComponent(JSON.stringify(payload.filters));
      restAction.url += queryparams;
    }
    dispatch(runRestQuery(restAction,timeout, chart.id));
  };
}
