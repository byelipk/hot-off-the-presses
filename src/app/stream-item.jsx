import React from "react";

import moment from 'moment';

class StreamItem extends React.Component {
  render() {
    return (
      <div className="stream-item">
        <div className="title">
          {this.props.model.title}
        </div>
        <div className="meta">
          Published on {moment(this.props.model.published).format('MMMM d, YYYY')}
        </div>
      </div>
    )
  }
}

export default StreamItem;