import React, { Component } from 'react';
import topics from './topics';
import Topic from './Topic';

const Topics = (props) => {
  const children = [];
  for ( let i=0; i < props.topics.length; i++) {
    const topic = props.topics[i];
    // i is not good choice as it can change
    children.push(<Topic key={topic.name} {...topic} />);
  }
  return children;
}

class ToC extends Component {
   chapters = topics; 

  render() {
    return (
      <div>
        <Topics topics={this.chapters} />
      </div>
    )
  }
}

export default ToC;
