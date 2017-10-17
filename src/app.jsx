import "./css/app.css";

import React from "react";
import ReactDOM from "react-dom";
import Infinite from 'react-infinite';

import PressReleaseStore from './data/press-release-store';

import { BeatLoader } from 'react-spinners';

import moment from 'moment';

import { filterWith, groupBy } from './utils/functional';


class Header extends React.Component {
  render() {
    return (
      <header className="header">
        <div className="title">Press Releases</div>
      </header>
    )
  }
}

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

class EndOfStream extends React.Component {
  render() {
    if (this.props.endOfStream) {
      return (<p className="stream-eos">Finished loading stream</p>);
    }
    else {
      return (<div/>);
    }
  }
}

class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.handleInfiniteLoad = this.handleInfiniteLoad.bind(this);
    this.showLoadingSpinner = this.showLoadingSpinner.bind(this);

    this.state = {
      isLoading: false
    }
  }

  handleInfiniteLoad() {
    this.setState({ isLoading: true});

    const limit = this.props.limit;
    const offset = this.props.offset + this.props.limit;

    this.props.loadMore(limit, offset).then(() => {
      this.setState({isLoading: false})
      this.props.updateStreamMetaParams(limit, offset);
    });
  }

  showLoadingSpinner() {
    return (
      <div className="loading-item">
        <BeatLoader color={'#123abc'} loading={this.state.isLoading} />
      </div>
    )
  }

  render() {
    var props = this.props;
    var infiniteLoadingOffset = props.filterTerm ? undefined : 100;

    function showResults() {
      if (props.pressReleases.length) {
        return props.pressReleases.map(pressRelease => (
          <StreamItem key={pressRelease.id} model={pressRelease} />
        ));
      }
  
      return (
        <div className="stream-empty">
          We couldn't find any matching results for you. 🤷‍
        </div>
      );
    }

    return (
      <div className="stream">
        <Infinite 
          elementHeight={92}
          containerHeight={650}
          infiniteLoadBeginEdgeOffset={infiniteLoadingOffset}
          onInfiniteLoad={this.handleInfiniteLoad}
          loadingSpinnerDelegate={this.showLoadingSpinner()}
          isInfiniteLoading={this.state.isLoading}
          useWindowAsScrollContainer={true}>

          {showResults()}
        </Infinite>

        <EndOfStream endOfStream={this.props.endOfStream} />
      </div>
    )
  }
}

class FilterInput extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      value: ''
    };
  }

  handleChange(event) {
    // Update the input field
    this.setState({value: event.target.value});

    // Inform stream of change to filter
    this.props.updateStreamFilter(event.target.value);
  }

  render() {
    return (
      <div className="filter">
        <input 
          value={this.state.value} 
          onChange={this.handleChange} 
          type="text" 
          placeholder="Search press releases by title..."/>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.updateStreamMetaParams = this.updateStreamMetaParams.bind(this);
    this.updateStreamFilter = this.updateStreamFilter.bind(this);

    this.filterStream = this.filterStream.bind(this);

    // Fetch items async
    this.pressReleaseStore = new PressReleaseStore();

    this.pressReleaseStore.itemListeners.register(updatedPressReleases => {
      this.setState({ 
        pressReleases: this.filterStream(this.state.filter, updatedPressReleases) 
      });
    });

    this.state = {
      filterTerm: '',
      limit: this.pressReleaseStore.defaultLimit,
      offset: this.pressReleaseStore.defaultOffset,
      pressReleases: this.pressReleaseStore.items()
    }
  }

  updateStreamMetaParams(limit, offset) {
    this.setState({ limit, offset });
  }

  updateStreamFilter(term) {
    this.setState({
      filterTerm: term, 
      pressReleases: this.filterStream(term, this.pressReleaseStore.items())
    });
  }

  filterStream(term, pressReleases) {
    if (term) {
      term = term.toLowerCase();
      var itemsWithMatchingTitle = filterWith(item => {
        return item.title.toLowerCase().indexOf(term) > -1;
      });

      return itemsWithMatchingTitle(pressReleases);
    }

    return pressReleases;
  }


  render() {
    return (
      <div className="container">
        <Header />
        <FilterInput updateStreamFilter={this.updateStreamFilter} />
        <Stream 
          pressReleases={this.state.pressReleases} 
          loadMore={this.pressReleaseStore.loadMore}
          updateStreamMetaParams={this.updateStreamMetaParams}
          endOfStream={this.pressReleaseStore.endOfStream()}
          filterTerm={this.state.filterTerm}
          limit={this.state.limit}
          offset={this.state.offset} />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#root'));