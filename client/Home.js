import React, {Component} from 'react';
import axios from 'axios';

class Home extends Component {

  constructor(props) {
    super(props)

    this.state = {
      username: '',
      apiToken: '',
      showLogin: false
    }
  }

  componentDidMount() {
    this.setUser();
  }

  setUser() {
    try {
      let user = JSON.parse(localStorage['user']);
      // axios.defaults.headers.common['Authorization'] = user['api_token'];
      if (user && user['name']) {
        window.location.replace("/game");
      }
    }
    catch(e) {
      console.log(e);
    }
  }

  onChangeUsername(event) {
    let value = event.target.value;
    this.setState({username: value});
  }

  onChangeApiToken(event) {
    let value = event.target.value;
    this.setState({apiToken: value});
  }

  onClickLogin(status) {
    this.setState({showLogin: status})
  }

  createUser() {
    let username = this.state.username;
    axios.post(`http://localhost:5000/create_user`, {name: username, role: 'hero'})
      .then(res => {
        const user = res.data;
        if (user && user['name']) {
          localStorage['user'] = JSON.stringify(user)
          this.setUser();
        }
      })
  }

  loginApiToken() {
    let apiToken = this.state.apiToken;
    axios.post(`http://localhost:5000/login/api_token`, {api_token: apiToken})
      .then(res => {
        const user = res.data;
        console.log(user);
        if (user && user['name']) {
          console.log(user);
          localStorage['user'] = JSON.stringify(user);
          this.setUser();
        }
      })
  }

  render() {
    return (
      <div className="position-relative">
        <div className="text-center" style={{height: '100vh'}}>
          <div className="page-center">
            <div className="b-fluid shadow-lg p-5 rounded">
              <h1 className="text-primary mb-3">Adventure Game</h1>
              {this.state.showLogin ? this.renderLogin() : this.renderCreateUser()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderCreateUser() {
    return(
      <div>
        <input type="text" className="form-control" placeholder="Enter Username" value={this.state.username} onChange={(event) => this.onChangeUsername(event)} />
        <div className="mt-1">
          <small><a href="#" onClick={() => this.onClickLogin(true)}>Existing user? Login using password</a></small>
        </div>
        <div className="mt-3">
          <button className="btn b-transparent border border-primary text-primary btn-action btn-sm" onClick={this.createUser.bind(this)}>Start Game</button>
        </div>
      </div>
    )
  }

  renderLogin() {
    return (
      <div>
        <input type="text" className="form-control" placeholder="Enter Password" value={this.state.apiToken} onChange={(event) => this.onChangeApiToken(event)} />
        <div className="mt-1">
          <small><a href="#" onClick={() => this.onClickLogin(false)}>New user? Play game</a></small>
        </div>
        <div className="mt-3">
          <button className="btn b-transparent border border-primary text-primary btn-action btn-sm" onClick={this.loginApiToken.bind(this)}>Continue Game</button>
        </div>
      </div>
    )
  }
}


export default Home;
