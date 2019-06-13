import * as _ from 'lodash';

export const APPLY_FILTER = 'APPLY_FILTER';
export const USE_AS_MODAL = 'USE_AS_MODAL';
const CHART_UPDATE_SUCCEEDED = 'CHART_UPDATE_SUCCEEDED';
//check slice is modal or not
export function isModalSlice(slice) {
    let actions = getUniqueActionsForSlice(slice);
    return isUseAsModalActionExist(actions);
}

export function isUseAsModalActionExist(actions) {
    if (actions) {
        if (actions.constructor == Object) {
            return (actions[USE_AS_MODAL]) ? true : false;
        }
        else if (actions.constructor == Array) {
            return (actions.indexOf(USE_AS_MODAL) != -1) ? true : false;
        }
    }
    return false;
}

export function getActionsMapForSlice(slice) {
    let actions = {};
    if (slice && slice.formData && slice.formData.hasOwnProperty('subscriber_layers')) {
        let subscriberLayers = slice.formData.subscriber_layers
        if (subscriberLayers) {
            subscriberLayers.forEach(element => {
                if (isUseAsModalActionExist(element.actions)) {
                    if (!actions['USE_AS_MODAL'])
                        actions['USE_AS_MODAL'] = [];
                    actions['USE_AS_MODAL'] = _.union(actions['USE_AS_MODAL'], [element.linked_slice[0]['publisher_id']]);
                }
                let subscribe_columns = element.linked_slice[0]['subscribe_columns']
                subscribe_columns.forEach(item => {
                    let column_actions = item.actions;
                    column_actions.forEach(action => {
                        if (!actions[action])
                            actions[action] = [];
                        actions[action] = _.union(actions[action], [element.linked_slice[0]['publisher_id']]);
                    })
                })
            });
        }
    }// backward compitable
    else if (slice && slice.formData && slice.formData.hasOwnProperty('linked_slice')) {
        let linked_slice = slice.formData['linked_slice'];
        if (linked_slice && linked_slice.length > 0) {
            linked_slice.forEach(element => {
                if (Number.isInteger(element)) {
                    if (!actions['APPLY_FILTER'])
                        actions['APPLY_FILTER'] = [];
                    actions['APPLY_FILTER'].push(element);
                }
            })
        }
    }
    return actions;
}

export function getUniqueActionsForSlice(slice) {
    let actions;
    if (slice && slice.form_data && slice.form_data.hasOwnProperty('subscriber_layers')) {
        let subscriberLayers = slice.form_data.subscriber_layers
        if (subscriberLayers) {
            actions = [];
            subscriberLayers.forEach(element => {
                actions = _.union(actions, element.actions);
            });
        }
    }
    return actions;
}

export function getModalSliceIDFor(publishSubscriberMap, publisherId) {
    if (publishSubscriberMap && publishSubscriberMap.hasOwnProperty('subscribers')) {
        const subscribers = publishSubscriberMap.publishers[publisherId]['subcribers'];
        let modalSliceId;
        subscribers.forEach(subscriberId => {
            let subscriberSlice = publishSubscriberMap.subscribers[subscriberId];
            if ((subscriberSlice.actions[USE_AS_MODAL] && (subscriberSlice.actions[USE_AS_MODAL].indexOf(parseInt(publisherId)) != -1)))
                modalSliceId = subscriberSlice.id;
        })
        return modalSliceId ? modalSliceId : undefined;
    }
    return undefined
}

export default {
    APPLY_FILTER,
    USE_AS_MODAL,
    isModalSlice,
    getModalSliceIDFor,
    getActionsMapForSlice,
}