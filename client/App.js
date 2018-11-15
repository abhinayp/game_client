import React, {Component} from 'react';
import axios from 'axios';

class App extends Component {

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      data: []
    }
  }

  connectBackend() {
    axios.get(`http://localhost:5000`)
      .then(res => {
        const persons = res.data;
        this.setState({data: persons});
      })
  }

  render() {
    this.connectBackend()
    return (
      <div>
        <div>
          I'm Abhinay, how are you. {this.state.data}
        </div>
      </div>
    )
  }
}


export default App;
