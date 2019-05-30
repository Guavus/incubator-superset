import * as _ from 'lodash';

export const APPLY_FILTER = 'APPLY_FILTER';
export const USE_AS_MODAL = 'USE_AS_MODAL';
const CHART_UPDATE_SUCCEEDED = "CHART_UPDATE_SUCCEEDED"
//check slice is modal or not
export function isModalSlice(slice) {
    let actions = getUniqueActionsForSlice(slice);
    return isUseAsModalActionExist(actions);
}

export function isUseAsModalActionExist(actions) {
    return (actions.indexOf(USE_AS_MODAL) != -1)
}

export function getUniqueActionsForSlice(slice) {
    let actions = [];
    let subscriberLayers = slice.form_data.subscriber_layers
    if (subscriberLayers) {
        subscriberLayers.forEach(element => {
            actions = _.union(actions, element.actions);
        });
    }
    return actions;
}

export function getModalSliceIDFor(publishSubscriberMap, publisherId) {
    const subscribers = Object.values(publishSubscriberMap.subscribers);
    var item = _.find(subscribers, function (item) {
        return ((item.actions.indexOf(USE_AS_MODAL) > -1) && (Object.keys(item.linked_slices).indexOf(publisherId) != -1));
    });
    return item ? item.id : undefined
}

export function getUpdateSucceededChartId(items) {
    let _chart = _.find(items, function (item) {
        return (item.type == CHART_UPDATE_SUCCEEDED);
    })
    return _chart.key;
}

export default {
    APPLY_FILTER,
    USE_AS_MODAL,
    isModalSlice,
    getModalSliceIDFor,
    getUpdateSucceededChartId,
}