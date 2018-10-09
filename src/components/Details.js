import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './Details.css';

export class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageError: false,
      expanded: false,
    };
  }

  onImageError = e => {
    e.preventDefault();
    this.setState({
      imageError: true
    });
  }

  toggleExpanded = e => {
    e.preventDefault();
    this.setState({
      expanded: !this.state.expanded
    });
  }

  sendSlackGif = e => {
    e.preventDefault();
    const { title, src } = this.props;
    axios.post(process.env.REACT_APP_SLACK_WEBHOOK, JSON.stringify({
      text: `Someone shared a GIF! "${title}": ${src}`
    }))
      .then(resp => {
        console.log(resp);
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const {
      state: { imageError, expanded },
      props: { src, title },
      onImageError,
      toggleExpanded,
      sendSlackGif
    } = this;

    return imageError ? (
      <div onClick={toggleExpanded} className="Gif-card">
        <img src={logo} className="App-logo" alt="logo" />
      </div>
    ) : (
      <div onClick={toggleExpanded} className="Gif-card">
        {expanded && <span className="Gif-title">{title}</span>}
        <img src={src} alt={title} onError={onImageError}/>
        {expanded && <button
          className="Gif-slack"
          onClick={sendSlackGif}
          >
            Share to Slack
          </button>}
      </div>
    );
  }
}
