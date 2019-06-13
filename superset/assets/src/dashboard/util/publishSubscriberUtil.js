import { union, find } from 'lodash';

export const APPLY_FILTER = 'APPLY_FILTER';
export const USE_AS_MODAL = 'USE_AS_MODAL';

const CHART_UPDATE_SUCCEEDED = 'CHART_UPDATE_SUCCEEDED';
const INCLUDE_IN_TITLE = 'INCLUDE_IN_TITLE';
//check slice is modal or not
export function isModalSlice(slice) {
    let actions = getUniqueActionsForSlice(slice);
    return isUseAsModalActionExist(actions);
}

export function isUseAsModalActionExist(actions) {
    return (actions && actions.indexOf(USE_AS_MODAL) != -1) ? true : false;
}

export function getUniqueActionsForSlice(slice) {
    let actions;
    if (slice && slice.form_data && slice.form_data.hasOwnProperty('subscriber_layers')) {
        let subscriberLayers = slice.form_data.subscriber_layers
        if (subscriberLayers) {
            actions = [];
            subscriberLayers.forEach(element => {
                actions = union(actions, element.actions);
            });
        }
    }
    return actions;
}

export function getModalSliceIDFor(publishSubscriberMap, publisherId) {
    if (publishSubscriberMap && publishSubscriberMap.hasOwnProperty('subscribers')) {
        const subscribers = Object.values(publishSubscriberMap.subscribers);
        var item = find(subscribers, function (item) {
            return ((item.actions.indexOf(USE_AS_MODAL) > -1) && (Object.keys(item.linked_slices).indexOf(publisherId) != -1));
        });
        return item ? item.id : undefined;
    }
    return undefined
}

export function getSlicesWithSubHeader(subscribers, chartId, filters) {
    let subHeader = '';
    if (chartId != -1 && subscribers && subscribers[chartId]) {
        const subscriber = subscribers[chartId];
        if (subscriber.actions.indexOf(INCLUDE_IN_TITLE) > -1) {
            subHeader = '';
            for (let lsKey in subscriber.linked_slices) {
                if (keyExists(lsKey, filters)) {
                    let linkedSlicesLength = subscriber.linked_slices[lsKey].length;

                    for (let i = 0; i < linkedSlicesLength; i++) {
                        let linkedSlice = subscriber.linked_slices[lsKey];

                        if (linkedSlice[i].actions.indexOf(INCLUDE_IN_TITLE) > -1) {
                            let columnName = linkedSlice[i]['col'];
                            let subHeaderValues = filters[lsKey][columnName];
                            const values = subHeaderValues ? subHeaderValues.constructor == Array ? subHeaderValues.concat() : [subHeaderValues] : [];

                            if (subHeaderValues) {
                                (subHeader != '') ? values.push(subHeader) : [];
                                subHeader = values.join(' | ');
                            }
                        }
                    }
                }
            }
        }
    }
    return subHeader;
}

export function keyExists(key, search) {
    if (!search || (search.constructor !== Array && search.constructor !== Object)) {
        return false;
    }
    for (let i = 0; i < search.length; i++) {
        if (search[i] === key) {
            return true;
        }
    }
    return key in search;
}

export default {
    APPLY_FILTER,
    USE_AS_MODAL,
    isModalSlice,
    getModalSliceIDFor,
    getSlicesWithSubHeader,
    keyExists,
}