import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as chartActions from './chartAction';
import * as  saveModalActions from '../explore/actions/saveModalActions';
import Chart from './Chart';

function mapDispatchToProps(dispatch) {
  const actions = Object.assign({}, chartActions, saveModalActions );
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(Chart);
