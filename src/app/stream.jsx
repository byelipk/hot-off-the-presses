import React from "react";
import Infinite from 'react-infinite';

import { BeatLoader } from 'react-spinners';

import StreamItem from './stream-item';

class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.handleInfiniteLoad = this.handleInfiniteLoad.bind(this);
    this.showLoadingSpinner = this.showLoadingSpinner.bind(this);
    this.showEndOfStream = this.showEndOfStream.bind(this);
    this.showStreamItems = this.showStreamItems.bind(this);

    this.state = {
      isLoading: false
    }
  }

  handleInfiniteLoad() {
    this.setState({ isLoading: true});

    const limit = this.props.limit;
    const offset = this.props.offset + this.props.limit;

    if (!this.props.endOfStream) {
      this.props.loadMore(limit, offset).then(() => {
        this.setState({isLoading: false})
        this.props.updateStreamMetaParams(limit, offset);
      });
    }
  }

  showEndOfStream() {
    if (this.props.endOfStream) {
      return (<p className="stream-eos">Finished loading stream</p>);
    }

    return (<div/>);
  }

  showStreamItems() {
    if (this.props.pressReleases.length) {
      return this.props.pressReleases.map(pressRelease => (
        <StreamItem key={pressRelease.id} model={pressRelease} />
      ));
    }

    return (
      <div className="stream-empty">
        We couldn't find any matching results for you. 🤷‍
      </div>
    );
  }

  showLoadingSpinner() {
    return (
      <div className="loading-item">
        <BeatLoader color={'#123abc'} loading={this.state.isLoading} />
      </div>
    )
  }

  render() {
    return (
      <div className="stream">
        <Infinite 
          elementHeight={92}
          containerHeight={650}
          infiniteLoadBeginEdgeOffset={100}
          onInfiniteLoad={this.handleInfiniteLoad}
          loadingSpinnerDelegate={this.showLoadingSpinner()}
          isInfiniteLoading={this.state.isLoading}
          useWindowAsScrollContainer={true}>

          {this.showStreamItems()}

        </Infinite>

        {this.showEndOfStream()}

      </div>
    )
  }
}

export default Stream;