import React, {Component} from 'react';
import axios from 'axios';

class App extends Component {

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      users: []
    }
  }

  createUser() {
    axios.post(`http://localhost:5000/create_user`, {name: 'abhinay', role: 'hero'})
      .then(res => {
        const persons = res.data;
        // this.setState({data: persons});
      })
  }

  getUsers() {
    axios.get(`http://localhost:5000/users`)
      .then(res => {
        const users = res.data;
        this.setState({users: users});
      })
  }

  render() {
    // this.createUser()
    let user = this.state.users || [];
    let user_view = [];

    user_view = user.map((user, index) => {
      return (
        <div key={index} className="col-md-3">
          <div className="bg-light p-3 text-center shadow-sm mt-2 mb-2">
            <div className="row">
              <div className="col-md-6">
                <div>
                  <b>Username</b>
                </div>
                <div>
                  {user['name']}
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <b>Role</b>
                </div>
                <div>
                  {user['role']}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    })

    return (
      <div>
        <div className="px-3 py-1">
          <button className="btn btn-primary btn-sm" onClick={this.getUsers.bind(this)}>Get Users</button>
          <div className="row mt-2">
            {user_view}
          </div>
        </div>
      </div>
    )
  }
}


export default App;
