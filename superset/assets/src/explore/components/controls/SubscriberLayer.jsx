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
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { t } from '@superset-ui/translation';
import SelectControl from './SelectControl';
import PopoverSection from '../../../components/PopoverSection';
import TextControl from './TextControl';
import CheckboxControl from './CheckboxControl';
import { nonEmpty } from '../../validators';
import { uniq } from 'lodash';

const propTypes = {
  name: PropTypes.string,
  sliceId: PropTypes.number,
  subscriptionList: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  overrides: PropTypes.object,
  subscribe_columns: PropTypes.arrayOf(PropTypes.object),
  publishedSliceColumns: PropTypes.arrayOf(PropTypes.object),
  vizType: PropTypes.string,
  sliceOptions: PropTypes.arrayOf(PropTypes.object),
  error: PropTypes.string,
  addSubscriberLayer: PropTypes.func,
  removeSubscriberLayer: PropTypes.func,
  close: PropTypes.func,
  extraValue: PropTypes.string,
  allowMoreColumns: PropTypes.bool,
  allowColumnSelection: PropTypes.bool,
  useAsModal: PropTypes.bool,
};

const defaultProps = {
  name: '',
  overrides: {},
  subscriptionList: [],
  subscribe_columns: [],
  publishedSliceColumns: [],
  timeColumn: '',
  extraValue: '',
  allowMoreColumns: false,
  allowColumnSelection: false,
  useAsModal: false,
  addSubscriberLayer: () => { },
  removeSubscriberLayer: () => { },
  close: () => { },
};

export default class SubscriberLayer extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      name,
      value,
      sliceId,
      overrides,
      subscribe_columns,
      sliceOptions,
      publishedSliceColumns,
      subscriptionList,
      extraValue,
      allowMoreColumns,
      allowColumnSelection,
      useAsModal
    } = props;

    this.state = {
      // base
      name,
      oldName: !this.props.name ? null : name,
      sliceId,
      value,
      overrides,
      subscriptionList,
      extraValue,
      allowMoreColumns,
      allowColumnSelection,
      subscribe_columns,
      publishedSliceColumns,
      isNew: !this.props.name,
      validationErrors: {},
      useAsModal
    };

    this.state.subscriptionList = this.state.isNew ? [{ columnType: '', operatorType: '', actionType: '', index: 0 }] : this.state.subscriptionList;

    this.handleSliceType = this.handleSliceType.bind(this);
    this.handleColumnType = this.handleColumnType.bind(this);
    this.handleOperatorType = this.handleOperatorType.bind(this);
    this.submitSubscription = this.submitSubscription.bind(this);
    this.deleteSubscriber = this.deleteSubscriber.bind(this);
    this.applySubscription = this.applySubscription.bind(this);
    this.isValidForm = this.isValidForm.bind(this);
    this.addMoreColumns = this.addMoreColumns.bind(this);
    this.getSupportedOperators = this.getSupportedOperators.bind(this);
    this.getActions = this.getActions.bind(this);
    this.getPublishedColumns = this.getPublishedColumns.bind(this);
    this.getPublishedSlices = this.getPublishedSlices.bind(this);
    this.getRefactoredPublisedColumns = this.getRefactoredPublisedColumns.bind(this);
  }

  getSupportedOperators() {
    return [
      { label: 'equals', value: '==' },
      { label: 'not equal to', value: '!=' },
      { label: '>', value: '>' },
      { label: '<', value: '<' },
      { label: '>=', value: '>=' },
      { label: '<=', value: '<=' },
      { label: 'in', value: 'in' },
      { label: 'not in', value: 'not in' },
      { label: 'like', value: 'like' },
      { label: 'IS NOT NULL', value: 'IS NOT NULL' },
      { label: 'IS NULL', value: 'IS NULL' }];
  }

  getActions() {
    return [
      { label: 'APPLY FILTER', value: 'APPLY_FILTER' },
      { label: 'INCLUDE IN TITLE', value: 'INCLUDE_IN_TITLE' }];
  }

  getPublishedSlices() {
    return this.props.sliceOptions;
  }

  getPublishedColumns(sliceId) {
    let sliceColumns = [];
    this.props.sliceOptions.forEach(slice => {
      if (slice.value === sliceId) {
        sliceColumns = slice.columns;
        return sliceColumns;
      }
    });
    return sliceColumns;
  }

  getRefactoredPublisedColumns(pubSliceCols) {
    let publishSliceCols = [];

    pubSliceCols.forEach(element => {
      publishSliceCols.push({ label: element, value: element })
    });

    return publishSliceCols;
  }

  isValidForm() {
    const { sliceId, name } = this.state;
    const errors = [nonEmpty(sliceId), nonEmpty(name)];
    this.state.subscribe_columns ? errors.push(!this.state.subscribe_columns.length) : '';
    errors.push(!this.state.allowColumnSelection);
    errors.push(!this.state.allowMoreColumns);

    return !errors.filter(x => x).length;
  }

  handleSliceType(sliceId) {
    let publishedSliceColumns = this.getPublishedColumns(sliceId);
    publishedSliceColumns = this.getRefactoredPublisedColumns(publishedSliceColumns);
    this.setState({
      sliceId,
      allowColumnSelection: true,
      publishedSliceColumns,
    });
  }

  handleColumnType(columnType, index) {
    const subscriptionList = this.state.subscriptionList;
    subscriptionList[index]['columnType'] = columnType;

    let subscribe_columns = this.state.subscribe_columns;
    subscribe_columns.length <= index ? subscribe_columns.push({}) : subscribe_columns;
    subscribe_columns[index]['col'] = columnType;

    this.setState({
      subscriptionList,
      subscribe_columns,
      allowMoreColumns: subscribe_columns[index]['col'] && subscribe_columns[index]['op'] ? true : false,
    });

    this.forceUpdate();

  }

  handleOperatorType(operatorType, index) {
    let subscriptionList = this.state.subscriptionList;
    subscriptionList[index]['operatorType'] = operatorType;

    let subscribe_columns = this.state.subscribe_columns;
    subscribe_columns.length <= index ? subscribe_columns.push({}) : subscribe_columns;
    subscribe_columns[index]['op'] = operatorType;

    this.setState({
      subscriptionList,
      subscribe_columns,
      allowMoreColumns: subscribe_columns[index]['col'] && subscribe_columns[index]['op'] ? true : false,
    });

    this.forceUpdate();
  }

  handleTitleInclusion(actionType, index) {
    let subscriptionList = this.state.subscriptionList;
    subscriptionList[index]['actionType'] = actionType;

    let subscribe_columns = this.state.subscribe_columns;
    subscribe_columns.length <= index ? subscribe_columns.push({}) : subscribe_columns;
    subscribe_columns[index]['actions'] = actionType;

    this.setState({
      subscriptionList,
      subscribe_columns,
      allowMoreColumns: subscribe_columns[index]['col'] && subscribe_columns[index]['op'] ? true : false,
    });

    this.forceUpdate();
  }

  addMoreColumns() {
    const subscriptionList = this.state.subscriptionList;
    const data = subscriptionList[subscriptionList.length - 1];
    const newData = { columnType: '', operatorType: '', actionType: '', index: data.index + 1 }
    this.setState(prevState => ({ subscriptionList: [...prevState.subscriptionList, newData] }))
    this.setState({
      allowMoreColumns: false,
    })
  }

  removeColumn(e, column) {
    this.state.subscribe_columns.splice(column.index, 1);

    this.setState(prevState => ({ subscriptionList: [...prevState.subscriptionList.filter(x => x.index !== column.index)] }))

    this.setState({
      allowMoreColumns: this.state.subscribe_columns.length === this.state.subscriptionList.length - 1 ? true : false,
    })
  }

  deleteSubscriber() {
    this.props.close();
    if (!this.state.isNew) {
      this.props.removeSubscriberLayer(this.state);
    }
  }

  applySubscription() {
    if (this.state.name.length && this.state.sliceId) {
      const subscription = {};

      Object.keys(this.state).forEach((k) => {
        if (this.state[k] !== null) {
          subscription[k] = this.state[k];
        }
      });

      subscription['actions'] = this.getUniqueActions(this.state.subscribe_columns);

      if (subscription['useAsModal']) {
        subscription['actions'].push('USE_AS_MODAL')
      }

      subscription['linked_slice'] = [
        {
          publisher_id: this.state.sliceId,
          subscribe_columns: this.state.subscribe_columns,
        }
      ];

      subscription['extras'] = this.state.extraValue;

      this.props.addSubscriberLayer(subscription);
      this.setState({ isNew: false, oldName: this.state.name });
    }
  }

  getUniqueActions(subscribe_columns) {
    let uniqActions = [];
    let allActions = [];

    subscribe_columns.map(function (column) {
      allActions.push(column['actions']);
    })

    let flattenedActions = allActions.flat(Infinity);
    uniqActions = uniq(flattenedActions);

    return uniqActions;
  }

  submitSubscription() {
    this.applySubscription();
    this.props.close();
  }

  renderSingleSubscription(subscriptionData) {
    const { columnType, operatorType, actionType, index } = subscriptionData;
    const { allowColumnSelection } = this.state;

    const operators = this.getSupportedOperators();
    const actions = this.getActions();
    const publishedSlices = this.state.sliceId ? this.getRefactoredPublisedColumns(this.getPublishedColumns(this.state.sliceId)) : this.state.publishedSliceColumns;

    return (
      <div key={index} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '885px', marginTop: '10px' }}>

        <SelectControl
          hovered
          autosize={false}
          description="Choose the Column"
          disabled={!allowColumnSelection}
          label="Select Column"
          name="column-source-type"
          options={publishedSlices}
          value={columnType}
          onChange={(e) => this.handleColumnType(e, index)}
        />

        <SelectControl
          hovered
          autosize={false}
          description="Choose the Operator"
          disabled={!allowColumnSelection}
          label="Select Operator"
          name="operator-source-type"
          options={operators}
          value={operatorType}
          valueKey='value'
          onChange={(e) => this.handleOperatorType(e, index)}
        />

        <SelectControl
          multi={true}
          hovered
          autosize={false}
          description="Select Actions"
          disabled={!allowColumnSelection}
          label="Select Actions"
          name="action-source-type"
          options={actions}
          value={actionType}
          valueKey='value'
          onChange={(e) => this.handleTitleInclusion(e, index)}
        />

        <Button title="Remove subscription columns and operators" bsSize="sm"
              disabled={ this.state.subscriptionList.length === 1 }
              style={{ height: '30px', marginTop: '25px', marginLeft: '10px' }}
              onClick={(e) => this.removeColumn(e, subscriptionData)}>
          {'-'}
        </Button>

      </div>
    );
  }

  render() {
    const { isNew, sliceId, allowMoreColumns, name, useAsModal } = this.state;
    const isValid = this.isValidForm();

    const publishedSlices = this.getPublishedSlices();

    return (
      <div>
        {this.props.error && <span style={{ color: 'red' }}>ERROR: {this.props.error}</span>}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ marginRight: '2rem' }}>
            <PopoverSection
              isSelected
              onSelect={() => { }}
              title={t('Subscription Configuration')}
              info={t('Configure Subscription')}
            >
              <TextControl
                name="subscriber-layer-name"
                label={t('Name')}
                placeholder=""
                value={name}
                onChange={v => this.setState({ name: v })}
                validationErrors={!name ? [t('Mandatory')] : []}
              />

              <CheckboxControl
                hovered
                name="subscriber-use-modal"
                label="Use as modal"
                description={'This option enables to add this slice in dashboard only as a Modal.'}
                value={useAsModal}
                onChange={v => this.setState({ useAsModal: v })}
              />


              <SelectControl
                hovered
                description={t('Choose the chart to subscribe')}
                label={t('Select chart')}
                name="publised-layer-name"
                options={publishedSlices}
                value={sliceId}
                onChange={this.handleSliceType}
              />

              <div style={{ overflow: 'auto', height: '100px' }}> {
                this.state.subscriptionList.map(subscription => {
                  return (
                    this.renderSingleSubscription(subscription)
                  )
                })
              }
              </div>

              <Button title="Add subscription columns and operators" bsSize="sm" disabled={!allowMoreColumns} onClick={this.addMoreColumns} style={{ marginTop: '10px' }}>
                {'+'}
              </Button>
              {/* <TextControl
                name="extra-subscription-layer"
                label={t('Extra')}
                description={'Set Extra parameters (If any)'}
                value={extraValue}
                onChange={v => this.setState({ extraValue: v })}
              /> */}

            </PopoverSection>
          </div>

        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button bsSize="sm" onClick={this.deleteSubscriber}>
            {!isNew ? t('Remove') : t('Cancel')}
          </Button>
          <div>
            <Button bsSize="sm" disabled={!isValid} onClick={this.submitSubscription}>
              {t('Save')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

SubscriberLayer.propTypes = propTypes;
SubscriberLayer.defaultProps = defaultProps;
