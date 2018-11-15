import React, {Component} from 'react';

class Game extends Component {

  constructor(props) {
    super(props)

    this.state = {
      gridSize: {
        x: 15,
        y: 15
      },
      traps: []
    }
  }

  onClickCell(x, y) {
    let traps = this.state.traps;
    let trap = {x: x, y: y};
    let trap_index = traps.findIndex(t => t.x == x && t.y == y)
    if (trap_index < 0) {
      traps.push(trap);
    }
    this.setState({traps: traps})
  }

  render() {
    return (
      <div>
        <div>
          {this.renderTable()}
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
    let traps = this.state.traps;
    let rows_cell = [];

    for (let i=0; i<=gridSize.y; i++) {
      let cols_cell = [];
      for (let j=0; j<=gridSize.x; j++) {

        let trap_index = traps.findIndex(t => t.x == j && t.y ==i)

        let trap_class = ''
        if (trap_index > -1) {
          trap_class = 'trap-cell'
        }

        let c = (
          <td key={j} data-x={j} data-y={i} className={`game-cell ${trap_class} c-pointer`} onClick={() => this.onClickCell(j, i) }></td>
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
}


export default Game;
