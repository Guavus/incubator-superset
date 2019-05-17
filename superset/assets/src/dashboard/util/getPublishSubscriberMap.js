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
import * as _ from 'lodash';
const APPLY_FILTER = 'APPLY_FILTER';

function createPublishData(chart, charts) {
    return {
        id: chart.id,
        publish_columns: chart.formData.publish_columns,
        subcribers: getSubsribersFor(chart.id, charts),
        viz_type: chart.formData.viz_type
    }

}

function getSubsribersFor(publisherId, charts) {
    var subs = [];
    charts.forEach(element => {
        if (isSubscriber(element) && isPublisherExistInLinkedSlices(element, publisherId)) {
            subs.push(element.id);
        }
    });
    return subs;
}

function isPublisher(chart) {
    return (chart.formData.publish_columns && chart.formData.publish_columns.length > 0)
}

function getPublishers(charts) {
    var pubs = undefined;
    charts.forEach(element => {
        if (isPublisher(element)) {
            if (pubs == undefined) {
                pubs = {};
            }
            pubs[element.id] = createPublishData(element, charts);
        }
    });
    return pubs;
}

function createFilterDataFromPublishColumns(obj) {
    var filterList = [];
    obj.publish_columns.forEach(element => {
        filterList.push({
            col: element,
            op: 'in'
        })
    });
    return filterList;
}

function isPublisherExistInLinkedSlices(slice, publisherId) {
    var item = _.find(slice.formData.linked_slice ,function(item) {
        return  ((Number.isInteger(item) && item == publisherId ) ||
        (item instanceof Object && item.publisher_id == publisherId))
    })
    return (item != undefined)
}

function getLinkedSlices(slices, publishers) {
    var ls = {};
    slices.forEach(element => {
        // backward compitable
        if (Number.isInteger(element) && publishers && publishers.hasOwnProperty(element)) {
            ls[element] = createFilterDataFromPublishColumns(publishers[element]);
        }
        // as per new ds
        else if (element instanceof Object && publishers.hasOwnProperty(element.publisher_id)) {
            ls[element.publisher_id] = element.subscribe_columns;
        }
    });
    return ls;
}

function createSubscriberData(chart, publishers) {
    return {
        id: chart.id,
        viz_type: chart.formData.viz_type,
        actions: chart.formData.hasOwnProperty('actions') ? chart.formData.actions : [APPLY_FILTER],
        linked_slices: getLinkedSlices(chart.formData.linked_slice, publishers),
        extras: undefined
    }

}

function isSubscriber(chart) {
    return (chart.formData.linked_slice && chart.formData.linked_slice.length > 0)
}

function getSubscribers(charts, publishers) {
    var subs = undefined;
    charts.forEach(element => {
        if (isSubscriber(element)) {
            if (subs == undefined) {
                subs = {};
            }
            subs[element.id] = createSubscriberData(element, publishers)
        }
    });
    return subs;
}

export default function getPublishSubscriberMap(charts) {
    var publishers = getPublishers(charts);
    var subscribers = getSubscribers(charts, publishers);
    return {
        publishers: publishers,
        subscribers: subscribers
    };
}
