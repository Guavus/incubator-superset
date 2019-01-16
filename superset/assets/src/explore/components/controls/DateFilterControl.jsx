import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  DropdownButton,
  FormControl,
  FormGroup,
  InputGroup,
  Label,
  MenuItem,
  OverlayTrigger,
  Popover,
  Radio,
  Tab,
  Tabs,
} from 'react-bootstrap';
import 'react-datetime/css/react-datetime.css';
import DateTimeField from 'react-bootstrap-datetimepicker';
import 'react-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css';
import moment from 'moment';

import ControlHeader from '../ControlHeader';
import { t } from '../../../locales';
import PopoverSection from '../../../components/PopoverSection';

const TYPES = Object.freeze({
  DEFAULTS: 'defaults',
  CUSTOM_START_END: 'custom_start_end',
  CUSTOM_RANGE: 'custom_range',
  CUSTOM_RULE: "custom_rule",
});
const RELATIVE_TIME_OPTIONS = Object.freeze({
  LAST: 'Last',
  NEXT: 'Next',
});
const COMMON_TIME_FRAMES = [
  'Last day',
  'Last week',
  'Last month',
  'Last quarter',
  'Last year',
  'No filter',
];
const TIME_GRAIN_OPTIONS = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];

const MOMENT_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss';
const DEFAULT_SINCE = moment().startOf('day').subtract(7, 'days').format(MOMENT_FORMAT);
const DEFAULT_UNTIL = moment().startOf('day').format(MOMENT_FORMAT);
const INVALID_DATE_MESSAGE = 'Invalid date';
const SEPARATOR = ' : ';
const FREEFORM_TOOLTIP = t(
  'Superset supports smart date parsing. Strings like `last sunday` or ' +
  '`last october` can be used.',
);

const propTypes = {
  animation: PropTypes.bool,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  height: PropTypes.number,
};

const defaultProps = {
  animation: true,
  onChange: () => { },
  value: 'Last week',
};


function isFreeform(s) {
  /* Moment sometimes consider invalid dates as valid, eg, "10 years ago" gets
   * parsed as "Fri Jan 01 2010 00:00:00" local time. This function does a
   * better check by comparing a string with a parse/format roundtrip.
   */
  return (s !== moment(s, MOMENT_FORMAT).format(MOMENT_FORMAT));
}

export default class DateFilterControl extends React.Component {
  constructor(props) {
    super(props);
    const value = props.value || defaultProps.value;
    this.state = {
      type: TYPES.DEFAULTS,

      // default time frames, for convenience
      common: COMMON_TIME_FRAMES[0],

      // "last 7 days", "next 4 weeks", etc.
      rel: RELATIVE_TIME_OPTIONS.LAST,
      num: '7',
      grain: TIME_GRAIN_OPTIONS[3],

      // distinct start/end values, either ISO or freeform
      since: DEFAULT_SINCE,
      until: DEFAULT_UNTIL,
      // define new  var next for rule view tab to handle next rule time range
      next: undefined,
      freeformInputs: {},
    };
    if (value.indexOf(SEPARATOR) >= 0) {
      this.state.type = TYPES.CUSTOM_START_END;
      [this.state.since, this.state.until] = value.split(SEPARATOR, 2);
    } else {
      this.state.type = TYPES.DEFAULTS;
      if (COMMON_TIME_FRAMES.indexOf(value) >= 0) {
        this.state.common = value;
      } else {
        this.state.common = null;
        [this.state.rel, this.state.num, this.state.grain] = value.split(' ', 3);
      }
    }
    this.state.freeformInputs.since = isFreeform(this.state.since);
    this.state.freeformInputs.until = isFreeform(this.state.until);

    // We need direct access to the state of the `DateTimeField` component
    this.dateTimeFieldRefs = {};

    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    document.addEventListener('click', this.handleClick);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }
  onEnter(event) {
    if (event.key === 'Enter') {
      this.close();
    }
  }
  setDefaults(timeFrame) {
    const nextState = {
      type: TYPES.DEFAULTS,
      common: timeFrame,
      until: moment().startOf('day').format(MOMENT_FORMAT),
    };
    const units = timeFrame.split(' ')[1] + 's';
    nextState.since = moment().startOf('day').subtract(1, units).format(MOMENT_FORMAT);
    this.setState(nextState, this.updateRefs);
  }
  setCustomRange(key, value) {
    const nextState = { ...this.state, type: TYPES.CUSTOM_RANGE };
    if (key !== undefined && value !== undefined) {
      nextState[key] = value;
    }
    if (nextState.rel === RELATIVE_TIME_OPTIONS.LAST) {
      nextState.until = moment().startOf('day').format(MOMENT_FORMAT);
      nextState.since = moment()
        .startOf('day')
        .subtract(nextState.num, nextState.grain)
        .format(MOMENT_FORMAT);
    } else {
      nextState.until = moment()
        .startOf('day')
        .add(nextState.num, nextState.grain)
        .format(MOMENT_FORMAT);
      nextState.since = moment().startOf('day').format(MOMENT_FORMAT);
    }

    // reset next value as one of tab section can enable at a time
    nextState.next = undefined;
    
    this.setState(nextState, this.updateRefs);
  }

  // replica of setCustomRange method 
  // plus it create start/end date relative to ref instead today (defualt)
  setCustomRule(key, value) {

    const nextState = { ...this.state, type: TYPES.CUSTOM_RULE };
    if (key !== undefined && value !== undefined) {
      nextState[key] = value;
    }

    if (nextState.rel === RELATIVE_TIME_OPTIONS.LAST) {
      nextState.next = undefined;
      nextState.until = moment(nextState.until, MOMENT_FORMAT).format(MOMENT_FORMAT);
      nextState.since = moment(nextState.until, MOMENT_FORMAT)
        .subtract(nextState.num, nextState.grain)
        .format(MOMENT_FORMAT);
    } else {
      // update next var and maintain until,because of until is bind with ref date component instance
      nextState.until = moment(nextState.until, MOMENT_FORMAT).format(MOMENT_FORMAT);
      nextState.next = moment(nextState.until, MOMENT_FORMAT)
        .add(nextState.num, nextState.grain)
        .format(MOMENT_FORMAT);
    }
    this.setState(nextState, this.updateRefs);

  }


  setCustomStartEnd(key, value) {
    const nextState = {
      type: TYPES.CUSTOM_START_END,
      freeformInputs: { ...this.state.freeformInputs },
    };
    if (value === INVALID_DATE_MESSAGE) {
      // the DateTimeField component will return `Invalid date` for freeform
      // text, so we need to cheat and steal the value from the state
      const freeformValue = this.dateTimeFieldRefs[key].state.inputValue;
      nextState.freeformInputs[key] = true;
      nextState[key] = freeformValue;
    } else {
      nextState.freeformInputs[key] = false;
      nextState[key] = value;
    }
    
    // reset next value as one of tab section can enable at a time
    nextState.next = undefined;

    this.setState(nextState, this.updateRefs);
  }

  // replica of setCustomStartEnd method 
  // plus it take care for rule/fran/num value to calculate end/start date
  setCustomRuleStartEnd(key, value) {
    const nextState = {
      type: TYPES.CUSTOM_RULE,
      freeformInputs: { ...this.state.freeformInputs },
    };

    if (value === INVALID_DATE_MESSAGE) {
      // the DateTimeField component will return `Invalid date` for freeform
      // text, so we need to cheat and steal the value from the state
      const freeformValue = this.dateTimeFieldRefs[key].state.inputValue;
      nextState.freeformInputs[key] = true;
      nextState[key] = freeformValue;
    } else {
      nextState.freeformInputs[key] = false;
      nextState[key] = value;
    }

    // update since and until/next value in state as per  num/gran/rel values
    if (key == 'until') {
      if (this.state.rel === RELATIVE_TIME_OPTIONS.LAST) {
        nextState.next = undefined;
        nextState.until = moment(nextState.until, MOMENT_FORMAT).format(MOMENT_FORMAT);
        nextState.since = moment(nextState.until, MOMENT_FORMAT)
          .subtract(this.state.num, this.state.grain)
          .format(MOMENT_FORMAT);
      } else {
        // update next var and maintain until,because of until is bind with ref date component instance
        nextState.until = moment(nextState.until, MOMENT_FORMAT).format(MOMENT_FORMAT);
        nextState.next = moment(nextState.until, MOMENT_FORMAT)
          .add(this.state.num, this.state.grain)
          .format(MOMENT_FORMAT);
      }
    }

    this.setState(nextState, this.updateRefs);
  }
  handleClick(e) {
    // switch to `TYPES.CUSTOM_START_END/CUSTOM_RULE` when the calendar is clicked
    if (this.startEndSectionRef && this.startEndSectionRef.contains(e.target)) {
      if(this.state.type == TYPES.CUSTOM_RULE)
         this.setState({ type: TYPES.CUSTOM_RULE });
      else  
         this.setState({ type: TYPES.CUSTOM_START_END }); 
    }
  }
  updateRefs() {
    /* This is required because the <DateTimeField> component does not accept
     * freeform dates as props, since they can't be parsed by `moment`.
     */
    this.dateTimeFieldRefs.since.setState({ inputValue: this.state.since });
    this.dateTimeFieldRefs.until.setState({ inputValue: this.state.until });
  }
  close() {
    let val;
    if (this.state.type === TYPES.DEFAULTS) {
      val = this.state.common;
    } else if (this.state.type === TYPES.CUSTOM_RANGE) {
      val = `${this.state.rel} ${this.state.num} ${this.state.grain}`;
    } else {
      // update val if we choose next
      if (this.state.next) {
        val = [this.state.until, this.state.next].join(SEPARATOR);
      }
      else
        val = [this.state.since, this.state.until].join(SEPARATOR);
    }
    this.props.onChange(val);
    this.refs.trigger.hide();
  }
  renderPopover() {
    const grainOptions = TIME_GRAIN_OPTIONS.map(grain => (
      <MenuItem
        onSelect={this.setCustomRange.bind(this, 'grain')}
        key={grain}
        eventKey={grain}
        active={grain === this.state.grain}
      >
        {grain}
      </MenuItem>
    ));
    const timeFrames = COMMON_TIME_FRAMES.map(timeFrame => (
      <Radio
        key={timeFrame.replace(' ', '').toLowerCase()}
        checked={this.state.common === timeFrame}
        onChange={this.setDefaults.bind(this, timeFrame)}
      >
        {timeFrame}
      </Radio>
    ));

    // replica of grainOptions just change onselect function
    const ruleGrainOptions = TIME_GRAIN_OPTIONS.map(grain => (
      <MenuItem
        onSelect={this.setCustomRule.bind(this, 'grain')}
        key={grain}
        eventKey={grain}
        active={grain === this.state.grain}
      >
        {grain}
      </MenuItem>
    ));
    return (
      <Popover id="filter-popover" placement="top" positionTop={0}>
        <div style={{ width: '250px' }}>
          <Tabs
            defaultActiveKey={this.state.type === TYPES.DEFAULTS ? 1 : this.state.type === TYPES.CUSTOM_RULE ? 3 : 2}
            id="type"
            className="time-filter-tabs"
          >
            <Tab eventKey={1} title="Defaults">
              <FormGroup>{timeFrames}</FormGroup>
            </Tab>
            <Tab eventKey={2} title="Custom">
              <FormGroup>
                <PopoverSection
                  title="Relative to today"
                  isSelected={this.state.type === TYPES.CUSTOM_RANGE}
                  onSelect={this.setCustomRange.bind(this)}
                >
                  <div className="clearfix centered" style={{ marginTop: '12px' }}>
                    <div style={{ width: '60px', marginTop: '-4px' }} className="input-inline">
                      <DropdownButton
                        bsSize="small"
                        componentClass={InputGroup.Button}
                        id="input-dropdown-rel"
                        title={this.state.rel}
                        onFocus={this.setCustomRange.bind(this)}
                      >
                        <MenuItem
                          onSelect={this.setCustomRange.bind(this, 'rel')}
                          key={RELATIVE_TIME_OPTIONS.LAST}
                          eventKey={RELATIVE_TIME_OPTIONS.LAST}
                          active={this.state.rel === RELATIVE_TIME_OPTIONS.LAST}
                        >Last
                        </MenuItem>
                        <MenuItem
                          onSelect={this.setCustomRange.bind(this, 'rel')}
                          key={RELATIVE_TIME_OPTIONS.NEXT}
                          eventKey={RELATIVE_TIME_OPTIONS.NEXT}
                          active={this.state.rel === RELATIVE_TIME_OPTIONS.NEXT}
                        >Next
                        </MenuItem>
                      </DropdownButton>
                    </div>
                    <div style={{ width: '60px', marginTop: '-4px' }} className="input-inline">
                      <FormControl
                        bsSize="small"
                        type="text"
                        onChange={event => (
                          this.setCustomRange.call(this, 'num', event.target.value)
                        )}
                        onFocus={this.setCustomRange.bind(this)}
                        onKeyPress={this.onEnter.bind(this)}
                        value={this.state.num}
                        style={{ height: '30px' }}
                      />
                    </div>
                    <div style={{ width: '90px', marginTop: '-4px' }} className="input-inline">
                      <DropdownButton
                        bsSize="small"
                        componentClass={InputGroup.Button}
                        id="input-dropdown-grain"
                        title={this.state.grain}
                        onFocus={this.setCustomRange.bind(this)}
                      >
                        {grainOptions}
                      </DropdownButton>
                    </div>
                  </div>
                </PopoverSection>
                <PopoverSection
                  title="Start / end"
                  isSelected={this.state.type === TYPES.CUSTOM_START_END}
                  onSelect={this.setCustomStartEnd.bind(this)}
                  info={FREEFORM_TOOLTIP}
                >
                  <div ref={(ref) => { this.startEndSectionRef = ref; }}>
                    <InputGroup>
                      <div style={{ margin: '5px 0' }}>
                        <DateTimeField
                          ref={(ref) => { this.dateTimeFieldRefs.since = ref; }}
                          dateTime={
                            this.state.freeformInputs.since ?
                              DEFAULT_SINCE :
                              this.state.since
                          }
                          defaultText={this.state.since}
                          onChange={this.setCustomStartEnd.bind(this, 'since')}
                          maxDate={moment(this.state.until, MOMENT_FORMAT)}
                          format={MOMENT_FORMAT}
                          inputFormat={MOMENT_FORMAT}
                          onClick={this.setCustomStartEnd.bind(this)}
                          inputProps={{
                            onKeyPress: this.onEnter.bind(this),
                            onFocus: this.setCustomStartEnd.bind(this),
                          }}
                        />
                      </div>
                      <div style={{ margin: '5px 0' }}>
                        <DateTimeField
                          ref={(ref) => { this.dateTimeFieldRefs.until = ref; }}
                          dateTime={
                            this.state.freeformInputs.until ?
                              DEFAULT_UNTIL :
                              this.state.until
                          }
                          defaultText={this.state.until}
                          onChange={this.setCustomStartEnd.bind(this, 'until')}
                          minDate={moment(this.state.since, MOMENT_FORMAT).add(1, 'days')}
                          format={MOMENT_FORMAT}
                          inputFormat={MOMENT_FORMAT}
                          inputProps={{
                            onKeyPress: this.onEnter.bind(this),
                            onFocus: this.setCustomStartEnd.bind(this),
                          }}
                        />
                      </div>
                    </InputGroup>
                  </div>
                </PopoverSection>
              </FormGroup>
            </Tab>
            {/* adding third tab for rule view and enable user to create time range relative to ref date */}
            <Tab eventKey={3} title="Rule">
              <FormGroup>
                <PopoverSection
                  title="Relative to reference date"
                  isSelected={this.state.type === TYPES.CUSTOM_RULE}
                  onSelect={this.setCustomRule.bind(this)}
                >
                <div className="clearfix centered" style={{ marginTop: '13px' }}>
                  <div style={{ width: '60px', marginTop: '-4px' }} className="input-inline">
                    <sapn>Rule</sapn>
                    <DropdownButton
                      bsSize="small"
                      componentClass={InputGroup.Button}
                      id="input-dropdown-rel"
                      title={this.state.rel}
                      onFocus={this.setCustomRule.bind(this)}
                    >
                      <MenuItem
                        onSelect={this.setCustomRule.bind(this, 'rel')}
                        key={RELATIVE_TIME_OPTIONS.LAST}
                        eventKey={RELATIVE_TIME_OPTIONS.LAST}
                        active={this.state.rel === RELATIVE_TIME_OPTIONS.LAST}
                      >Last
                        </MenuItem>
                      <MenuItem
                        onSelect={this.setCustomRule.bind(this, 'rel')}
                        key={RELATIVE_TIME_OPTIONS.NEXT}
                        eventKey={RELATIVE_TIME_OPTIONS.NEXT}
                        active={this.state.rel === RELATIVE_TIME_OPTIONS.NEXT}
                      >Next
                        </MenuItem>
                    </DropdownButton>
                  </div>
                  <div style={{ width: '80px', marginTop: '-4px' }} className="input-inline">
                    <sapn>Frequency</sapn>
                    <FormControl
                      bsSize="small"
                      type="text"
                      onChange={event => (
                        this.setCustomRule.call(this, 'num', event.target.value)
                      )}
                      onFocus={this.setCustomRule.bind(this)}
                      onKeyPress={this.onEnter.bind(this)}
                      value={this.state.num}
                      style={{ height: '30px' }}
                    />
                  </div>
                  <div style={{ width: '90px', marginTop: '-4px' }} className="input-inline">
                    <sapn>Unit</sapn>
                    <DropdownButton
                      bsSize="small"
                      componentClass={InputGroup.Button}
                      id="input-dropdown-grain"
                      title={this.state.grain}
                      onFocus={this.setCustomRule.bind(this)}
                    >
                      {ruleGrainOptions}
                    </DropdownButton>
                  </div>
                </div>
                <div ref={(ref) => { this.startEndSectionRef = ref; }} style={{ marginTop: '13px' }}>
                  <sapn>Reference Date</sapn>
                  <InputGroup>
                    <div style={{ margin: '5px 0' }}>
                      <DateTimeField
                        ref={(ref) => { this.dateTimeFieldRefs.until = ref; }}
                        dateTime={
                          this.state.freeformInputs.until ?
                            DEFAULT_UNTIL :
                            this.state.until
                        }
                        defaultText={this.state.until}
                        onChange={this.setCustomRuleStartEnd.bind(this, 'until')}
                        format={MOMENT_FORMAT}
                        inputFormat={MOMENT_FORMAT}
                        inputProps={{
                          onKeyPress: this.onEnter.bind(this),
                          onFocus: this.setCustomRuleStartEnd.bind(this),
                        }}
                      />
                    </div>
                  </InputGroup>
                </div>
                </PopoverSection>
              </FormGroup>
            </Tab>
          </Tabs>
          <div className="clearfix">
            <Button
              bsSize="small"
              className="float-right ok"
              bsStyle="primary"
              onClick={this.close.bind(this)}
            >
              Ok
            </Button>
          </div>
        </div>
      </Popover>
    );
  }
  render() {
    let value = this.props.value || defaultProps.value;
    value = value.split(SEPARATOR).map(v => v.replace('T00:00:00', '') || '∞').join(SEPARATOR);
    // diaplay single time if start and end are same
    let values = value.split(SEPARATOR);
    if (values.length == 2 && values[0] == values[1])
      value = values[0]

    return (
      <div>
        <ControlHeader {...this.props} />
        <OverlayTrigger
          animation={this.props.animation}
          container={document.body}
          trigger="click"
          rootClose
          ref="trigger"
          placement="right"
          overlay={this.renderPopover()}
        >
          <Label style={{ cursor: 'pointer' }}>{value}</Label>
        </OverlayTrigger>
      </div>
    );
  }
}

DateFilterControl.propTypes = propTypes;
DateFilterControl.defaultProps = defaultProps;
