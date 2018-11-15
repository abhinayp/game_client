import React, {Component} from 'react';
import axios from 'axios';

class Home extends Component {

  constructor(props) {
    super(props)

    this.state = {
      username: ''
    }
  }

  onChangeUsername(event) {
    let value = event.target.value;
    this.setState({username: value});
  }

  createUser() {
    let username = this.state.username;
    axios.post(`http://localhost:5000/create_user`, {name: username, role: 'hero'})
      .then(res => {
        const user = res.data;
        if (user) {

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
              <input type="text" className="form-control" placeholder="Enter Username" value={this.state.username} onChange={(event) => this.onChangeUsername(event)} />
              <div className="mt-4">
                <button className="btn b-transparent border border-primary text-primary btn-action btn-sm" onClick={this.createUser.bind(this)}>Start Game</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


export default Home;
