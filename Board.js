const BoardSettings = require('./BoardSettings');
const Move = require('./Move');
const Square = require('./Square');
const State = require('./State');

class Board {
  constructor(settings) {
    this.boardSettings = settings instanceof BoardSettings ? settings : new BoardSettings(settings);

    // clear the board first
    this.clear();

    // set the start position
    this.addStartState();
  }

  clear() {
    this.states = [];
  }

  addStartState() {
    // create the starting state
    let state = new State(this.boardSettings);
    state.setStartingPosition();
    this.addState(state);
  }

  addState(State) {
    this.states.push(State);
  }

  // function get the last/current state
  getCurrentState() {
    // the current state is read-only
    return this.states.length ? this.states[this.states.length - 1].clone() : null;
  }

  // move a piece in the current state
  move(fromX, fromY, toX, toY) {
    let current = this.getCurrentState();
    if(!current) {
      return false;
    }

    let move = new Move(current.getSquare(fromX,fromY), current.getSquare(toX,toY));

    // validate move - (beforeMove,afterMove) then return state if valid or false
    if(!current.validateMove(move)) { // possibleMoves() then move(move)
      return false;
    }

    current.beforeMove(move);
    let newState = current.move(move);
    current.afterMove(move);
    if(!newState) {
      return false;
    }

    // validate state - return modified state if valid or false
    if(newState) {
      // validate the state
      if(newState.validate()) { // check win, lose, draw, errors
        // end turn

        // add the state to the board
        this.addState(newState);

        return newState;
      }
    }
    return false;
  }


}

module.exports = {
  Board: Board,
  BoardSettings: BoardSettings,
  State: State,
  Square: Square,
  Move: Move
}
