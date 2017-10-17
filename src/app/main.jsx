import React from "react";
import PressReleaseStore from '../data/press-release-store';

import FilterInput from './filter-input';
import Header from './header';
import Stream from './stream';

import { filterWith } from '../utils/functional';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.updateStreamMetaParams = this.updateStreamMetaParams.bind(this);
    this.updateStreamFilter = this.updateStreamFilter.bind(this);
    this.itemsWithMatchingTitle = this.itemsWithMatchingTitle.bind(this);
    this.itemsSortedNewestFirst = this.itemsSortedNewestFirst.bind(this);

    this.filterStream = this.filterStream.bind(this);

    // Initilize the data store
    this.pressReleaseStore = new PressReleaseStore();
    this.pressReleaseStore.itemListeners.register(updatedPressReleases => {
      var pressReleases;

      pressReleases = this.filterStream(this.state.filterTerm, updatedPressReleases);
      pressReleases = this.itemsSortedNewestFirst(pressReleases);

      this.setState({ pressReleases:  pressReleases });
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
      const lowerCaseTerm = term.toLowerCase();
      return this.itemsWithMatchingTitle(lowerCaseTerm)(pressReleases);
    }

    return pressReleases;
  }

  itemsSortedNewestFirst(pressReleases) {
    return pressReleases.sort((a, b) => b.published >= a.published);
  }

  itemsWithMatchingTitle(term) {
    return filterWith(item => {
      return item.title.toLowerCase().indexOf(term) > -1;
    });
  }

  render() {
    return (
      <div className="container">
        <Header />
        <FilterInput updateStreamFilter={this.updateStreamFilter} />
        <Stream 
          pressReleases={this.state.pressReleases} 
          loadMore={this.pressReleaseStore.fetchAndLoadData}
          updateStreamMetaParams={this.updateStreamMetaParams}
          endOfStream={this.pressReleaseStore.isMoreDataAvailableFromServer()}
          filterTerm={this.state.filterTerm}
          limit={this.state.limit}
          offset={this.state.offset} />
      </div>
    )
  }
}

export default Main;