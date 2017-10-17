import ListenerSupport from './listener-support';

const API_ENDPOINT = "https://www.stellarbiotechnologies.com/media/press-releases/json";

export default class PressReleaseStore {
  constructor() {
    this.items = this.items.bind(this);
    this.flatMap = this.flatMap.bind(this);
    this.isMoreDataAvailableFromServer = this.isMoreDataAvailableFromServer.bind(this);
    this.fetchItems = this.fetchItems.bind(this);
    this.fetchAndLoadData= this.fetchAndLoadData.bind(this);
    this.publishChanges = this.publishChanges.bind(this);

    this._identityMap = new Map();
    this._maxId = 0;
    this._count = 0;
    this._limitReached = false;

    this.defaultLimit = 10;
    this.defaultOffset = 0;

    this.itemListeners = new ListenerSupport();

    this.fetchAndLoadData(this.defaultLimit, this.defaultOffset);
  }

  isMoreDataAvailableFromServer() {
    return this._limitReached;
  }

  items() {
    return Object.freeze([...this.flatMap()]);
  }

  fetchAndLoadData(limit, offset) {
    return this.fetchItems(limit, offset).then(this.publishChanges);
  }

  fetchItems(limit, offset) {
    if (this._limitReached) {
      return Promise.resolve({news: []});
    }

    return fetch(`${API_ENDPOINT}?limit=${limit}&offset=${offset}`)
      .then(response => response.json())
      .then(json => json)
      .catch(err => console.error(err))
  }

  publishChanges(newsItems) {
    if (newsItems.news) {
      const oldCount = this._count;

      newsItems.news.forEach(item => {
        if (!this._identityMap.has(item.published)) {
          this._identityMap.set(
            item.published, 
            Object.assign({}, item, { id: this._maxId += 1 } )
          );

          this._count += 1;
        }
      });

      // Check if we've added new items to the identity map
      if (this._count > oldCount) {
        this.itemListeners.fire(this.flatMap());
      }
      else {
        this._limitReached = true;
      }

      return Promise.resolve(true);
    }
    else {
      return Promise.reject('Press release API error. 😩');
    }
  }

  incrementId() {
    return this._maxId += 1;
  }

  flatMap() {
    return Array.from(this._identityMap).map(pair => pair[1]);
  }
}