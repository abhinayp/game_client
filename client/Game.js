import React, {Component} from 'react';
import axios from 'axios';
import * as $ from 'jquery';
import Modal from 'react-awesome-modal';

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
      riddle: null,
      followDetrapCells: [],
      user: {},
      showtraps: false,
      win: false,
      instructions: '',
      messages: [],
      messageNumber: 0,
      hideAll: false,
      winModal: false,
      bigNotification: false,
      riddleModal: true,
      hint: {},
      solvedRiddles: {},
      answerNE: '',
      moveText: '',
      intro: false,

      health: 10,
      points: 0,
      wood: 0,
      boatWood: 80,

      userLocation: {}
    }
  }

  componentDidMount() {
    this.setUser()
  }

  increaseHealthTimer() {
    setTimeout(
      function() {
          let health = this.state.health
          health = health + 10
          this.setState({health: health}, () => {
            this.updateGame()
            this.increaseHealthTimer();
          });
      }
      .bind(this),
      120000
  );
  }

  answerNE(event) {
    let value = event.target.value;
    this.setState({answerNE: value});
  }

  hideAll() {
    let hideAll = this.state.hideAll || false;
    this.setState({hideAll: !hideAll});
  }

  winModal(status) {
    status = status || false
    this.setState({winModal: status})
    if (!status) {
      alert("Game finished")
      this.logout()
    }
  }

  bigNotification(status) {
    status = status || false
    this.setState({bigNotification: status})
  }

  riddleModal(status) {
    status = status || false
    // this.setState({riddleModal: status})
    this.setState({riddle: null})
  }

  solvedRiddles(direction) {
    let solvedRiddles = this.state.solvedRiddles;
    solvedRiddles[direction] = true
    this.setState({solvedRiddles: solvedRiddles}, () => {
      this.findHints()
    })
  }

  submitAnswerRiddle() {
    let answerNE = this.state.answerNE;
    let riddle = this.state.riddle;

    answerNE = answerNE.toLowerCase()
    riddle['answer'] = riddle['answer'].toLowerCase()
    if (answerNE == riddle['answer']) {
      this.solvedRiddles('ne');
    }
  }

  setMessages() {
    if (!this.state.intro) {
      return;
    }
    let messages = [
      {message: "Hi, I'm Felicity Smoak. You can call me Overwatch", interval: 4000, fullscreen: true},
      {message: 'You are here to save the soldiers', interval: 2000, fullscreen: true},
      {message: "I'm gonna help you build a boat, follow my instructions and help the injured soldiers cross the island using the boat", interval: 10000, fullscreen: true},
      {message: `Collect points hidden in locations that are glowing green, to buy wood`, interval: 6000, fullscreen: true},
      {message: `Every step you make consume your 1 of your Health Points(HP)`, interval: 6000, fullscreen: true},
      {message: `You can buy medicine to impore your health`, interval: 6000, fullscreen: true},
      {message: `It cost 25 points for 8 health`, interval: 6000, fullscreen: true},
      {message: `You can buy 10 wood for 25 points`, interval: 6000, fullscreen: true},
      {message: `Once you reached 80 wood, you can build boat and save the soilders`, interval: 6000, fullscreen: true},
      {message: `Go, save them`, interval: 2000, fullscreen: true},
      {message: null, interval: 100, fullscreen: false},
    ]
    this.setState({messages: messages}, () => {
      this.botMessages()
    })
  }

  nextMessage() {
    if (this.state.intro) {
      let messageNumber = this.state.messageNumber || 0;
      messageNumber++;
      this.setState({messageNumber: messageNumber}, () => {
        if (this.state.messages.length > messageNumber) {
          this.setMessages()
        }
        else {
          this.skipIntro()
        }
      });
    }
  }

  botMessages(m, b, noNext=false, interval_m) {
    let messageNumber = this.state.messageNumber;
    let messages = this.state.messages;
    m = m
    b = b
    interval_m = interval_m
    if (messages && typeof(messageNumber) == 'number' && messages[messageNumber]) {
      m = m || messages[messageNumber]['message']
      if (b == undefined || b == null) {
        b = messages[messageNumber]['fullscreen']
      }
      if (interval_m == undefined || interval_m == null) {
        interval_m =  messages[messageNumber]['interval']
      }
    }

    this.setState({instructions: m, bigNotification: b}, () => {
      if (!noNext) {
        setTimeout(() => {
          this.nextMessage()
        }, interval_m);
      }
    })

  }

  findHints() {
    let traps = this.state.traps;
    let deTraps = this.state.deTraps;
    let solvedRiddles = this.state.solvedRiddles;
    let riddle = null;

    let direction = {
      nw: 0,
      ne: 0,
      sw: 0,
      se: 0
    }
    let maxTraps = {direction: '', value: 0}
    let untraps = traps.filter(t => deTraps.filter(dt => dt.x == t.x && dt.y == t.y).length <= 0)

    untraps.map((ut) => {
      if (ut.x > 8 && ut.y <= 8) {
        direction.ne = direction.ne + ut['points']
      }
      else if (ut.x > 8) {
        direction.se = direction.se + ut['points']
      }
      else if (ut.x < 8 && ut.y < 8) {
        direction.nw = direction.nw + ut['points']
      }
      else if (ut.x < 8) {
        direction.sw = direction.sw + ut['points']
      }
    })


    for (let key in direction) {
      let value = direction[key];
      if (value > maxTraps['value']) {
        maxTraps['direction'] = key
        maxTraps['value'] = value
      }
    }
    let m = `Items in ${maxTraps['direction'].toUpperCase()} direction have more points, there are ${maxTraps['value']} points, get them`
    this.botMessages(m, false, true)
    // this.setState({instructions: ``, bigNotification: false})
  }

  setUser() {
    try {
      this.getUser(() => {
        // this.gettraps()
        this.loadTraps();
        this.getDetraps();
        this.getGame()
        this.increaseHealthTimer();
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

  moveUp() {
    let userLocation = this.state.userLocation;
    let health = this.state.health;
    userLocation['y'] = userLocation['y'] || 0
    if (userLocation['y'] > 0 && health > 0) {
      health = health - 1;
      userLocation['y'] = userLocation['y'] - 1
      this.setState({userLocation: userLocation, health: health}, () => {
        this.moveToUserLocation()
      })
    }
  }

  moveDown() {
    let userLocation = this.state.userLocation;
    let gridSize = this.state.gridSize
    let health = this.state.health;
    userLocation['y'] = userLocation['y'] || 0
    if (userLocation['y'] < gridSize.y && health > 0) {
      userLocation['y'] = userLocation['y'] + 1
      health = health - 1;
      this.setState({userLocation: userLocation, health: health}, () => {
        this.moveToUserLocation()
      })
    }
  }

  moveLeft() {
    let userLocation = this.state.userLocation;
    let health = this.state.health;
    userLocation['x'] = userLocation['x'] || 0
    if (userLocation['x'] > 0 && health > 0) {
      userLocation['x'] = userLocation['x'] - 1
      health = health - 1;
      this.setState({userLocation: userLocation, health: health}, () => {
        this.moveToUserLocation()
      })
    }
  }

  moveRight() {
    let userLocation = this.state.userLocation;
    let gridSize = this.state.gridSize
    let health = this.state.health;
    userLocation['x'] = userLocation['x'] || 0
    if (userLocation['x'] < gridSize.x && health > 0) {
      userLocation['x'] = userLocation['x'] + 1
      health = health - 1;
      this.setState({userLocation: userLocation, health: health}, () => {
        this.moveToUserLocation()
      })
    }
  }

  onChangeMoveText(event) {
    let value = event.target.value;
    this.setState({moveText: value});
  }

  onKeyPressMT(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13') {
      this.moveText()
    }
  }

  moveText() {
    let moveText = this.state.moveText || '';
    if (moveText.toLowerCase().includes('up')) {
      this.moveUp();
    }
    else if (moveText.toLowerCase().includes('down')) {
      this.moveDown();
    }
    else if (moveText.toLowerCase().includes('left')) {
      this.moveLeft();
    }
    else if (moveText.toLowerCase().includes('right')) {
      this.moveRight();
    }
    this.setState({moveText: ''})
  }

  moveToUserLocation() {
    let userLocation = this.state.userLocation;
    let x = userLocation['x'] || 0
    let y = userLocation['y'] || 0
    this.onClickDetrap(null, x, y)
    this.updateGame()
    this.updateCurrentLocation()
  }

  onClickDetrap(event, x, y) {
    if (this.state.showTraps) {
      alert("Game finished")
      this.logout()
      return;
    }
    this.findHints()
    let followDetrapCells = this.state.followDetrapCells
    let trap = {x: x, y: y};
    let t = this.trapExist(trap);
    if (t) {
      let points = this.state.points;
      points = parseInt(points) + parseInt(t['points'])
      this.setState({points: points}, () => {
        this.updateGame();
      })
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
            try {
              this.generateGame().bind(this)
            }
            catch (e) {

            }
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
    let traps = this.state.traps || [];
    let deTraps = this.state.deTraps || [];
    let findTrap = traps.findIndex(t => t.x == trap.x && t.y == trap.y)
    let findDetrap = deTraps.findIndex(d => d.x == trap.x && d.y == trap.y);
    if (findTrap < 0 || findDetrap > -1) {
      return false;
    }

    return traps[findTrap];
  }


  getDetraps() {
    let user = JSON.parse(localStorage['user']);
    axios.get(`http://localhost:5000/detraps/${user['role']}`)
      .then(res => {
        const traps = res.data;
        if (traps) {
          let state = {deTraps: traps}
          this.setState(state, () => {
            // this.checkWin();
          });
        }
      })
  }

  createDetrap(trap) {
    let deTrap = this.state.deTraps || [];
    let findDetrap = deTrap.findIndex(d => d.x == trap.x && d.y == trap.y);
    if (!this.trapExist(trap) || findDetrap > -1) {
      return;
    }
    axios.post(`http://localhost:5000/create_detrap`, trap)
      .then(res => {
        const traps = res.data;
        this.getDetraps()
      })
  }

  finishGame() {
    this.showTraps();
    this.logout();
  }

  showTraps(status) {
    axios.post(`http://localhost:5000/finish_game`, {})
      .then(res => {
        const traps = res.data;
      })
  }

  generateGame() {
    axios.post(`http://localhost:5000/generate_game`, {})
      .then(res => {
        const game = res.data;
        if (game) {
          this.getGame()
          // this.setState({health: game['health'], points: game['points']})
        }
        this.loadTraps()
      })
  }

  updateGame() {
    axios.post(`http://localhost:5000/update_game`, {health: this.state.health, points: this.state.points})
      .then(res => {
        const game = res.data;
        if (game) {
          this.getGame()
        }
      })
  }

  updateCurrentLocation() {
    let userLocation = this.state.userLocation
    axios.post(`http://localhost:5000/update_current_location`, {x: userLocation['x'], y: userLocation['y']})
      .then(res => {
        const game = res.data;
        if (game) {
          this.getGame()
        }
      })
  }

  skipIntro() {
    axios.post(`http://localhost:5000/skip_intro`, {})
      .then(res => {
        const game = res.data;
        if (game) {
          this.getGame()
        }
      })
  }

  getGame() {
    axios.get(`http://localhost:5000/get_game`)
      .then(res => {
        const game = res.data;
        if (game) {
          this.setState({health: game['health'], points: game['points'], wood: game['wood'], userLocation: game['current_location'], intro: game['intro']}, () => {
            this.setMessages()
          })
        }
      })
  }

  buyHealth() {
    axios.post(`http://localhost:5000/buy_health`, {})
      .then(res => {
        const game = res.data;
        if (game) {
          this.getGame()
        }
      })
  }

  buyWood() {
    axios.post(`http://localhost:5000/buy_wood`, {})
      .then(res => {
        const game = res.data;
        if (game) {
          this.getGame()
        }
      })
  }

  buildBoat() {
    let wood = this.state.wood;
    let boatWood = this.state.boatWood;
    if (wood >= boatWood) {
      this.setState({win: true, winModal: true}, () => {
        this.showTraps(true)
      })
    }
  }

  checkWin() {
    let traps = this.state.traps;
    let deTraps = this.state.deTraps;
    if (Array.isArray(traps) && Array.isArray(deTraps) && traps.length != 0 && traps.length == deTraps.length) {
        this.setState({win: true, showTraps: true, winModal: true})
    }
  }

  render() {

    return (
      <div>
        <div>
          {this.renderTable()}
          {this.state.hideAll ? '' : (
            <div>
              {this.renderUserDetails()}
              {this.state.showTraps ? '' : this.renderFinish()}
              {this.renderNotifications()}
              {this.renderStats()}
            </div>
          )}
          {this.renderWin()}
          {this.renderBigNotification()}
          {this.renderHideAll()}
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
    let userLocation = this.state.userLocation;
    let rows_cell = [];

    for (let i=0; i<=gridSize.y; i++) {
      let cols_cell = [];
      for (let j=0; j<=gridSize.x; j++) {

        let detrap_index = deTraps.findIndex(t => t.x == j && t.y ==i)
        let trap_index = traps.findIndex(t => t.x == j && t.y ==i)

        let trap_class = ''

        if (this.state.showTraps && trap_index > -1) {
          trap_class = `${trap_class} trap-cell`
        }
        if (trap_index > -1 && detrap_index < 0) {
          trap_class = 'trap-cell-success'
        }
        if (j == userLocation.x && i == userLocation.y) {
          trap_class = 'bg-dark'
        }

        let c = (
          <td key={j} data-x={j} data-y={i} className={`game-cell ${trap_class}`}></td>
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
        <div className="bg-light m-4 rounded shadow-lg">
          <div className="px-3 py-2">
            <div><span className="text-primary">#{user['name']}</span></div>
            <div className="py-1 px-2 bg-primary text-white shadow rounded my-1 mt-2">
              <small>
                <div>
                  <small>Password</small>
                </div>
                <small>{user['api_token']}</small>
              </small>
            </div>
            <div className="py-1 px-2 text-light bg-secondary rounded mt-2 shadow">
              <small>
                <div>Buy 8 HP for 25 points</div>
                <div>Buy 10 wood for 25 points</div>
                <div>Build a boat with 80 wood</div>
              </small>
            </div>
            <div className="bg-primary rounded py-1 px-2 text-white shadow my-1 mt-2">
              <div className="row text-center">
                <div className="col-md-4">
                  <small>HP</small>
                  <div>
                    {this.state.health}
                  </div>
                </div>
                <div className="col-md-4">
                  <small>Points</small>
                  <div>
                    {this.state.points}
                  </div>
                </div>
                <div className="col-md-4">
                  <small>Wood</small>
                  <div>
                    {this.state.wood}
                  </div>
                </div>
              </div>
            </div>

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
    let wood = this.state.wood;
    let boatWood = this.state.boatWood;
    return (
      <div style={styles}>
        {/* <div className="btn-primary rounded px-4 py-2 m-4 h2 shadow c-pointer font-weight-light" onClick={() => this.showTraps(true)}>
          Finish
        </div> */}
        <div className="m-4">
          <button className="btn btn-primary" onClick={this.buyHealth.bind(this)}>Buy Health</button>
          <button className="btn btn-primary ml-3" onClick={this.buyWood.bind(this)}>Buy Wood</button>
          <button className="btn btn-success ml-3" onClick={this.buildBoat.bind(this)} disabled={wood < boatWood}>Build Boat</button>
          <button className="btn btn-danger ml-3" onClick={() => this.finishGame()}>End Game</button>
        </div>
      </div>
    )
  }

  renderStats() {
    let styles = {
      position: 'fixed',
      bottom: 0,
      left: 0,
    }
    let traps = this.state.traps.length;
    let detraps = this.state.deTraps.length;
    return (
      <div style={styles}>
        <div className="btn-light rounded p-2 m-4 shadow c-pointer">
          <small>
            <button className="btn btn-primary" onClick={this.moveUp.bind(this)}>Move Up</button>
            <button className="btn btn-primary ml-2" onClick={this.moveDown.bind(this)}>Move Down</button>
            <button className="btn btn-primary ml-2" onClick={this.moveLeft.bind(this)}>Move Left</button>
            <button className="btn btn-primary ml-2" onClick={this.moveRight.bind(this)}>Move Right</button>
          </small>
          {/* <div className="mt-1 mx-2 mb-2">
            Enter which direction you want to move
          </div>
          <div className="mb-1">
            <input type="text" placeholder="Up, Go Down, Move Right, Try Left ..." className="form-control" onChange={this.onChangeMoveText.bind(this)} value={this.state.moveText} onKeyPress={(event) => this.onKeyPressMT(event)} />
          </div> */}
        </div>
      </div>
    )
  }

  renderNotifications() {
    let styles = {
      position: 'fixed',
      top: 0,
      right: 0,
      maxWidth: '300px'
    }
    let instructions = this.state.instructions
    if (!instructions || this.state.bigNotification) {
      return '';
    }

    return (
      <div style={styles}>
        <div className="bg-light rounded px-4 py-2 m-4 shadow c-pointer fade-in" onClick={this.findHints.bind(this)}>
          <div>
            <small className="text-secondary">Felicity:</small>
          </div>
          {this.state.instructions}
        </div>
      </div>
    )
  }

  renderHideAll() {
    let text = 'Hide Everything'
    if (this.state.hideAll) {
      text = 'Show All'
    }
    let styles = {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0
    }

    return (
        <div className="text-center my-3" style={styles}>
          <small><a className="text-dark c-pointer" onClick={this.hideAll.bind(this)}>{text}</a></small>
        </div>
    )

  }

  renderWin() {
      return (
        <Modal visible={this.state.winModal} effect="fadeInDown" onClickAway={() => this.winModal(false)}>
          <div className="modal-dialog">
            <div>
              <h1 className="p-5 text-center text-primary">
                You Won!
              </h1>
              <div className="text-center">
                <button className="btn btn-primary" onClick={() => this.winModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </Modal>
      )
  }

  renderBigNotification() {
      let instructions = this.state.instructions;

      if (!instructions) {
        return '';
      }

      return (
        <Modal visible={this.state.bigNotification} effect="fadeInDown" onClickAway={() => this.bigNotification(true)}>
          <div className="modal-dialog">
            <div>
              <div className="px-4">
                <small className="text-secondary">Felicity:</small>
                <div>
                  {this.state.instructions}
                </div>
              </div>
              {/*<div className="text-center mt-3">
                <button className="btn btn-default" onClick={() => this.bigNotification(false)}>Close</button>
              </div>*/}
            </div>
          </div>
        </Modal>
      )
  }


}


export default Game;
