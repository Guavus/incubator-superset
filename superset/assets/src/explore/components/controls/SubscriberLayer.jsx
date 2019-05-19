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
import { SupersetClient } from '@superset-ui/connection';
import { getChartMetadataRegistry } from '@superset-ui/chart';

import SelectControl from './SelectControl';
import TextAreaControl from './TextAreaControl';


import PopoverSection from '../../../components/PopoverSection';
import TextControl from './TextControl';

const propTypes = {
  name: PropTypes.string,
  operatorType: PropTypes.string,
  columnType: PropTypes.string,
  sliceType: PropTypes.string,
  width: PropTypes.number,
  subscriptionList: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  overrides: PropTypes.object,
  show: PropTypes.bool,
  titleColumn: PropTypes.string,
  descriptionColumns: PropTypes.arrayOf(PropTypes.string),
  timeColumn: PropTypes.string,
  intervalEndColumn: PropTypes.string,
  vizType: PropTypes.string,
  error: PropTypes.string,
  addSubscriberLayer: PropTypes.func,
  removeSubscriberLayer: PropTypes.func,
  close: PropTypes.func,
  maxNumSubscriptions: PropTypes.number,
};

const defaultProps = {
  name: '',
  operatorType: '',
  columnType: '',
  sliceType: '',
  overrides: {},
  subscriptionList: [],
  show: true,
  titleColumn: '',
  descriptionColumns: [],
  maxNumSubscriptions: 5,
  timeColumn: '',
  intervalEndColumn: '',

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
      operatorType,
      columnType,
      sliceType,
      overrides,
      show,
      maxNumSubscriptions,
      titleColumn,
      descriptionColumns,
      timeColumn,
      intervalEndColumn,
      subscriptionList,
    } = props;

    const overridesKeys = Object.keys(overrides);
    if (overridesKeys.includes('since') || overridesKeys.includes('until')) {
      overrides.time_range = null;
      delete overrides.since;
      delete overrides.until;
    }

    this.state = {
      // base
      name,
      oldName: !this.props.name ? null : name,
      columnType,
      operatorType,
      columnType,
      maxNumSubscriptions,
      sliceType,
      value,
      overrides,
      show,
      subscriptionList,
      // slice
      titleColumn,
      descriptionColumns,
      timeColumn,
      intervalEndColumn,
      // refData
      isNew: !this.props.name,
      isLoadingOptions: true,
      valueOptions: [],
      validationErrors: {},
    };

    this.state.subscriptionList = [{}];

    this.handleSliceType = this.handleSliceType.bind(this);
    this.submitSubscription = this.submitSubscription.bind(this);
    this.deleteSubscriber = this.deleteSubscriber.bind(this);
    this.applySubscription = this.applySubscription.bind(this);
    this.fetchOptions = this.fetchOptions.bind(this);
    this.handleColumnType = this.handleColumnType.bind(this);
    this.handleOperatorType = this.handleOperatorType.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.isValidForm = this.isValidForm.bind(this);
    this.addSubscription = this.addSubscription.bind(this);
    this.getSupportedOperators = this.getSupportedOperators.bind(this);
    this.getPublisedColumns = this.getPublisedColumns.bind(this);
    this.getPublishedSlices = this.getPublishedSlices.bind(this);
  }

  componentDidMount() {
    const { columnType, operatorType, isLoadingOptions, sliceType } = this.state;

  }

  componentDidUpdate(prevProps, prevState) {

  }

  getSupportedOperators() {
    // Get vis types that can be source.

  }

  getPublishedSlices() {

  }

  getPublisedColumns() {

  }

  isValidForm() {

  }

  handleSliceType(slice) {
    this.setState({
      slice,
    });
  }

  handleColumnType(column) {
    this.setState({
      column,
    });
  }

  handleOperatorType(operator) {
    this.setState({
      operator,
    });
  }

  addSubscription() {
    const newData = {name: 's', age: '21', company:'xyz', url: "https://avatars.githubusercontent.com/u/k8297"}
    this.setState(prevState => ({subscriptionList: [...prevState.subscriptionList, newData]}))
  }

  handleValue(value) {
    this.setState({
      value,
      descriptionColumns: null,
      intervalEndColumn: null,
      timeColumn: null,
      titleColumn: null,
      overrides: { time_range: null },
    });
  }

  fetchOptions(annotationType, operatorType, isLoadingOptions) {
    if (isLoadingOptions === true) {
      if (operatorType === ANNOTATION_SOURCE_TYPES.NATIVE) {
        SupersetClient.get({ endpoint: '/annotationlayermodelview/api/read?' }).then(({ json }) => {
          const layers = json
            ? json.result.map(layer => ({
              value: layer.id,
              label: layer.name,
            }))
            : [];
          this.setState({
            isLoadingOptions: false,
            valueOptions: layers,
          });
        });
      } else if (requiresQuery(operatorType)) {
        SupersetClient.get({ endpoint: '/superset/user_slices' }).then(({ json }) => {
          const registry = getChartMetadataRegistry();
          this.setState({
            isLoadingOptions: false,
            valueOptions: json
              .filter((x) => {
                const metadata = registry.get(x.viz_type);
                return metadata && metadata.canBeAnnotationType(annotationType);
              })
              .map(x => ({ value: x.id, label: x.title, slice: x })),
          });
        });
      } else {
        this.setState({
          isLoadingOptions: false,
          valueOptions: [],
        });
      }
    }
  }

  deleteSubscriber() {
    this.props.close();
    if (!this.state.isNew) {
      this.props.removeSubscriberLayer(this.state);
    }
  }

  applySubscription() {
    if (this.state.name.length) {
      const annotation = {};
      Object.keys(this.state).forEach((k) => {
        if (this.state[k] !== null) {
          annotation[k] = this.state[k];
        }
      });
      delete annotation.isNew;
      delete annotation.valueOptions;
      delete annotation.isLoadingOptions;
      delete annotation.validationErrors;
      annotation.color = annotation.color === AUTOMATIC_COLOR ? null : annotation.color;
      this.props.addSubscriberLayer(annotation);
      this.setState({ isNew: false, oldName: this.state.name });
    }
  }

  submitSubscription() {
    this.applySubscription();
    this.props.close();
  }

  renderSingleSubscription() {
    const { columnType, operatorType, sliceType } = this.state;

    const operators = this.getSupportedOperators();
    const columns = this.getPublisedColumns(columns);

    const publishedSlices = this.getPublishedSlices();

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <SelectControl
          hovered
          description={t('Choose the Chart to subscribe')}
          label={t('Select Chart')}
          name="publised-layer-name"
          options={publishedSlices}
          value={sliceType}
          onChange={this.handleSliceType}
        />
        <SelectControl
          hovered
          description="Choose the column"
          label="Column Source"
          name="annotation-source-type"
          options={columns}
          value={columnType}
          onChange={this.handleColumnType}
        />

    <SelectControl
          hovered
          description="Choose the Operator"
          label="Operator Source"
          name="operator-source-type"
          options={operators}
          value={operatorType}
          onChange={this.handleOperatorType}
        />

    </div>
    );
  }


  render() {
    const { isNew, columnType, operatorType, sliceType, maxNumSubscriptions } = this.state;
    const isValid = this.isValidForm();

    // const newState = this.state.slices ? this.state.slices.filter( slice => this.state.slice ? slice.id != this.state.slice.slice_id : true).map( slice =>  ({label: slice.title, value: slice.id})) : {};



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


                 {this.state.subscriptionList.map(subscription => {
                  console.log('came here');
                  // this.renderSingleSubscription()
                  return (
                  this.renderSingleSubscription()
                )
                })
              }


              <Button bsSize="sm" onClick={this.addSubscription}>
                {'+'}
              </Button>
              <TextControl
                name="annotation-layer-marker-width"
                label={t('Extra')}
                description={'Set Extra parameters (If any)'}
              />

            </PopoverSection>
          </div>

        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button bsSize="sm" onClick={this.deleteSubscriber}>
            {!isNew ? t('Remove') : t('Cancel')}
          </Button>
          <div>

            <Button bsSize="sm" disabled={!isValid} onClick={this.submitSubscription}>
              {t('OK')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

SubscriberLayer.propTypes = propTypes;
SubscriberLayer.defaultProps = defaultProps;
