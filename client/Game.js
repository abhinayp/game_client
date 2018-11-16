import React, {Component} from 'react';
import axios from 'axios';

class Game extends Component {

  constructor(props) {
    super(props)

    this.state = {
      gridSize: {
        x: 15,
        y: 15
      },
      traps: [],
      deTraps: [],
      followDetrapCells: [],
      user: {},
      showtraps: false,
    }
  }

  componentDidMount() {
    this.setUser()
  }

  setUser() {
    try {
      this.getUser(() => {
        // this.gettraps()
        this.loadTraps();
        this.getDetraps();
      });
    }
    catch(e) {
      console.log(e);
      window.location.replace("/");
    }
  }

  onClickCell(x, y) {
    let traps = this.state.traps;
    let trap = {x: x, y: y};
    let trap_index = traps.findIndex(t => t.x == x && t.y == y)
    if (trap_index < 0) {
      traps.push(trap);
      this.createTrap(trap).bind(this);
    }
    // this.setState({traps: traps})
  }

  onClickDetrap(x, y) {
    if (this.state.showTraps) {
      alert("Game finished")
      this.logout()
      return;
    }
    let followDetrapCells = this.state.followDetrapCells
    let trap = {x: x, y: y};
    if (this.trapExist(trap)) {
      this.createDetrap(trap);
    }
    followDetrapCells.push(trap)
    this.setState({followDetrapCells: followDetrapCells})
  }

  getUser(callback) {
    let user = JSON.parse(localStorage['user']);
    axios.get(`http://localhost:5000/users/${user['id']}`)
      .then(res => {
        const u = res.data;
        if (u) {
          localStorage['user'] = JSON.stringify(u);
          axios.defaults.headers.common['Authorization'] = u['api_token'];
          this.setState({user: u});
        }
        if (callback) {
          callback()
        }
      })
  }

  logout() {
    localStorage['user'] = null;
    this.setUser()
  }

  gettraps() {
    let user = JSON.parse(localStorage['user']);
    axios.get(`http://localhost:5000/traps/${user['role']}`)
      .then(res => {
        const traps = res.data;
        if (traps) {
          this.setState({traps: traps});
        }
      })
  }

  loadTraps() {
    let user = JSON.parse(localStorage['user']);
    let role = 'hero';
    if (user['role'] == 'hero') {
      role = 'villian';
    }
    axios.get(`http://localhost:5000/traps/${role}`)
      .then(res => {
        const traps = res.data;
        if (traps) {
          if (Array.isArray(traps) && traps.length < 1) {
            this.generateGame().bind(this)
          }
          this.setState({traps: traps});
        }
        else {
          this.generateGame().bind(this)
        }
      })
  }

  createTrap(trap) {
    axios.post(`http://localhost:5000/create_trap`, trap)
      .then(res => {
        const traps = res.data;
        this.gettraps()
      })
  }

  trapExist(trap) {
    let traps = this.state.traps;
    let findTrap = traps.findIndex(t => t.x == trap.x && t.y == trap.y)
    if (findTrap < 0) {
      return false;
    }

    return true;
  }


  getDetraps() {
    let user = JSON.parse(localStorage['user']);
    axios.get(`http://localhost:5000/detraps/${user['role']}`)
      .then(res => {
        const traps = res.data;
        if (traps) {
          this.setState({deTraps: traps});
        }
      })
  }

  createDetrap(trap) {
    if (!this.trapExist(trap)) {
      return;
    }
    axios.post(`http://localhost:5000/create_detrap`, trap)
      .then(res => {
        const traps = res.data;
        this.getDetraps()
      })
  }

  showTraps(status) {
    this.setState({showTraps: true}, () => {
      axios.post(`http://localhost:5000/finish_game`, {})
        .then(res => {
          const traps = res.data;
        })
    })
  }

  generateGame() {
    axios.post(`http://localhost:5000/generate_game`, {})
      .then(res => {
        const traps = res.data;
        this.loadTraps()
      })
  }

  render() {
    return (
      <div>
        <div>
          {this.renderTable()}
          {this.renderUserDetails()}
          {this.state.showTraps ? '' : this.renderFinish()}
        </div>
      </div>
    )
  }

  renderTable() {
    return (
      <table className="game-table">
        {this.renderTableBody()}
      </table>
    )
  }

  renderTableBody() {
    let gridSize = this.state.gridSize;
    let deTraps = this.state.deTraps;
    let traps = this.state.traps;
    let rows_cell = [];

    for (let i=0; i<=gridSize.y; i++) {
      let cols_cell = [];
      for (let j=0; j<=gridSize.x; j++) {

        let detrap_index = deTraps.findIndex(t => t.x == j && t.y ==i)
        let trap_index = traps.findIndex(t => t.x == j && t.y ==i)

        let trap_class = ''
        if (!this.state.showTraps) {
          trap_class = `game-cell-hover c-pointer`
        }
        if (this.state.showTraps && trap_index > -1) {
          trap_class = `${trap_class} trap-cell`
        }
        if (detrap_index > -1) {
          trap_class = 'trap-cell-success'
        }

        let c = (
          <td key={j} data-x={j} data-y={i} className={`game-cell ${trap_class}`} onClick={() => this.onClickDetrap(j, i) }></td>
        )

        cols_cell.push(c);
      }
      let r = (
        <tr key={i} className="game-row">{cols_cell}</tr>
      );
      rows_cell.push(r)
    }

    return (
      <tbody className="game-body">
        {rows_cell}
      </tbody>
    )
  }

  renderUserDetails() {
    let user = this.state.user
    return (
      <div className="user-details">
        <div className="bg-light m-4 rounded shadow">
          <div className="px-3 py-2">
            <div><span className="text-primary">{user['name']}</span><small className="bg-secondary text-light px-2 py-1 rounded ml-1">{user['role']}</small></div>
            <div className="py-1 px-2 bg-primary text-white shadow rounded my-1 mt-2"><small>{user['api_token']}</small></div>
          </div>
          <div className="btn-danger text-center px-2 py-1 rounded-bottom c-pointer" onClick={this.logout.bind(this)}>
            Logout
          </div>
        </div>
      </div>
    )
  }

  renderFinish() {
    let styles = {
      position: 'fixed',
      bottom: 0,
      right: 0,
    }
    return (
      <div style={styles}>
        <div className="btn-light rounded px-4 py-2 m-4 h2 shadow c-pointer" onClick={() => this.showTraps(true)}>
          Finish
        </div>
      </div>
    )
  }
}


export default Game;
