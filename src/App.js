import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Signin from './components/Signin/Singin'
import Facerecognition from './components/Facerecognition/Facerecognition'
import Particles from 'react-particles-js';
import Register from './components/Register/Register'
import './App.css';

const particlesOption = {
  particles: {
    numbers: {
      value: 300,
      density: {
        enable: true,
        value_area: 800,
      }
    },
    interactivity: {
      events: {
        onhover: {
          enable: true,

        }
      }
    }
  }
}
const initialState = {
  input: '',
  iamgeUrl: '',
  box: {
  },
  route: 'signin',
  isSignIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  };

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocation = (data) => {
    const ClarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: ClarifaiFace.left_col * width,
      topRow: ClarifaiFace.top_row * height,
      rightCol: width - (ClarifaiFace.right_col * width),
      bottomRow: height - (ClarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    // console.log(box);
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }


  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
      // console.log(this.state)
    } else if (route === 'home') {
      this.setState({ isSignIn: true })
    }
    this.setState({ route: route })
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input })
    fetch('https://hedwig-facerecognition.herokuapp.com/imageUrl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://hedwig-facerecognition.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {
                entries: count
              }))
            })
            .catch(err => console.log(err))
        }

        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }
  render() {
    const { isSignIn, imageUrl, route, box } = this.state;
    return (
      <div className='App' >
        <Particles className='particles'
          params={particlesOption}
        />
        <Navigation isSignIn={isSignIn} onRouteChange={this.onRouteChange} />
        {route === 'home'
          ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit} />
            <Facerecognition box={box} imageUrl={imageUrl} />
          </div>
          : (route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />)
        }
      </div>
    )
  }
}
export default App; 