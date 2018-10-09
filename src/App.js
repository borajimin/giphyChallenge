import React, { Component } from 'react';
import { throttle, debounce } from 'throttle-debounce';
import axios from 'axios';
import { Details } from './components/Details.js';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      data: [],
      currentPage: 0,
      limit: 25
    };
    this.searchGiphyDebounced = debounce(800, this.searchGiphy);
    this.searchGiphyThrottled = throttle(500, this.searchGiphy);
    this.cache = {};
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll, false);
  }

  onScroll = () => {
    if(window.innerHeight + window.scrollY
      >= document.body.offsetHeight - 500
      && this.state.data.length
    ) {
      this.searchGiphyDebounced();
    }
  }

  onSearchInputChange = e => {
    e.preventDefault();
    this.setState({
      searchInput: e.target.value,
      currentPage: 0
    }, () => {
      const { searchInput } = this.state;
      if(searchInput.length < 5) {
        this.searchGiphyThrottled();
      } else {
        this.searchGiphyDebounced();
      }
    });
  }

  searchGiphy = () => {
    const { cache, state: { searchInput, currentPage, limit } } = this;

    if(cache.hasOwnProperty(searchInput) && !currentPage) {
      this.setState({ data: cache[searchInput] });
    } else {
      axios.get(process.env.REACT_APP_GIPHY_BASE_URL,{
        params: {
          api_key: process.env.REACT_APP_GIPHY_API_KEY,
          q: searchInput.split(' ').join('+'),
          limit,
          offset: currentPage ? currentPage + limit : currentPage
        }
      })
      .then(({data}) => {
        const isNotInitialPage = data.pagination.offset > 0;
          this.setState({
            data: isNotInitialPage ? [...this.state.data, ...data.data] : data.data,
            currentPage: data.pagination.offset + limit
          }, () => {
            if(!isNotInitialPage) {
              cache[searchInput] = data.data;
            }
          });
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  render() {
    const {
      onSearchInputChange,
      state: {
        searchInput,
        data
      }
     } = this;
    return (
      <div className="App">
        <header className="App-header">
          <input
            autoFocus
            className="Search"
            onChange={onSearchInputChange}
            value={searchInput}
            placeholder="Speak your mind with Gifs!"
          />
        </header>
        <div className="Masonry">
          {
            data.map(d => <Details
              key={d.id}
              src={d.images.fixed_width.url}
              title={d.title}
            />)
          }
        </div>
      </div>
    );
  }
}

export default App;
