import React, { Component } from 'react';
import './Topic.css';

class Topic extends Component {

  constructor(props) {
    super(props);
    this.state = {isDone: this.props.isDone}
  }
  onclick = () => {
    this.setState({isDone: true});
  }
  render() {
    return (
      <div className="row">
        <div className="topic">
          <span className={this.state.isDone ? 'check' : ''}></span>
           {
             this.props.link ? 
             <a href={this.props.link} target="_new"><span className="name">{this.props.name}</span> </a>
             : <span className="name">{this.props.name}</span>
           }
        </div>
        {
          this.state.isDone === false && 
          <button className="button" onClick={this.onclick}>Mark Done</button>
        }
      </div>
    )
  }
}

export default Topic;
