import React from "react";

import moment from 'moment';

var StreamItem = function streamItem(props) {
  return (
    <div className="stream-item">
      <div className="title">
        {props.model.title}
      </div>
      <div className="meta">
        Published on {moment(props.model.published).format('MMMM d, YYYY')}
      </div>
    </div> 
  )
}

export default StreamItem;