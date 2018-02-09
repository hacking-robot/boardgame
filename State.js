const Move = require('./Move');
const Square = require('./Square');

class State {

  constructor(boardSettings, board, moveNumber, playerTurn, flags) {
    this.boardSettings = boardSettings;
    this.board = board ? board : Array(this.boardSettings.numberRank*this.boardSettings.numberFile);
    this.playerTurn = playerTurn ? playerTurn : 1;
    this.moveNumber = moveNumber ? moveNumber : 1;
    this.flags =  flags !== undefined ? flags:[];
    this.MOVE_EMPTY = 2;
    this.CAPTURE_OWN = 4;
    this.CAPTURE_OPPONENT = 8;
    this.JUMP_OWN = 16;
    this.JUMP_OPPONENT = 32;
    this.DESTINATION = 64;
  }

  setStartingPosition() {
    let position = this.boardSettings.settings.position;
    // put the pieces on the board
    for(let pos = 0;pos<position.length;pos++){
      let player, type;
      // is only letter? then 2 players with first player uppercase, second player lowercase and type is lowercase
      if(/^[a-zA-Z]+$/.test(position[pos])) {
        player = position[pos] === position[pos].toUpperCase() ? 1:2;
        type = position[pos].toLowerCase();
        this.boardSettings.settings.useCapitilizeSymbols = true;
      } else if(position[pos].match(/\d+[a-zA-Z]+\d*/g)) {
        // extract numbers and letters
        player = position[pos].match(/\d+/g).map(Number)[0];
        type = position[pos].match(/[a-zA-Z]+\d*/g).map(String)[0];
      } else {
        continue;
      }

      // put the piece on the board
      this.put(pos, player, type, this.boardSettings.settings.pieces[type]['flags']);
    }

  }

  put(position, player, pieceType, pieceFlags) {
    let coord = this.toCoord(position);
    this.board[position] = { player:player, pieceType:pieceType, pieceFlags:pieceFlags};
  }

  beforeMove(move) {
    if( typeof this.boardSettings.settings.pieces[move.fromSquare.pieceType].beforeMove == "function") {
      this.boardSettings.settings.pieces[move.fromSquare.pieceType].beforeMove(this, move);
    }  else if( typeof this.boardSettings.settings.beforeMove == "function") {
      this.boardSettings.settings.beforeMove(this, move);
    }
  }

  afterMove(move) {
    if( typeof this.boardSettings.settings.pieces[move.fromSquare.pieceType].afterMove == "function") {
      this.boardSettings.settings.pieces[move.fromSquare.pieceType].afterMove(this, move);
    }  else if( typeof this.boardSettings.settings.afterMove == "function") {
      this.boardSettings.settings.afterMove(this, move);
    }
  }

  move(move) {
    let clone = this.clone();

    //clone.moveNumber ++;
    //clone.playerTurn = clone.nextPlayer();

    clone.beforeMove(move);

    if( typeof this.boardSettings.settings.pieces[move.fromSquare.pieceType].move == "function") {
      this.boardSettings.settings.pieces[move.fromSquare.pieceType].move(clone, move);
      clone.afterMove(move);
      return clone;
    }  else if( typeof this.boardSettings.settings.move == "function") {
      this.boardSettings.settings.move(clone, move);
      clone.afterMove(move);
      return clone;
    } else {
      clone.setSquare(move.toSquare.x, move.toSquare.y, move.fromSquare);
      clone.emptySquare(move.fromSquare.x, move.fromSquare.y);
      clone.afterMove(move);
      return clone;
    }

    return false;
  }

  getSquare(x, y) {
    let square = this.board[y*this.boardSettings.numberFile+x];
    if(!square) {
      return new Square(x, y);
    } else {
      return new Square(x, y, square.player, square.pieceType, square.pieceFlags, square.squareFlags);
    }
  }

  setSquare(x, y, square) {
    this.board[y*this.boardSettings.numberFile+x] = {player:square.player, pieceType:square.pieceType, pieceFlags:square.pieceFlags, squareFlags:square.squareFlags};
  }

  emptySquare(x, y) {
    this.board[y*this.boardSettings.numberFile+x] = null;
  }

  toCoord(position) {
    let x = position % this.boardSettings.numberFile;
    let y = Math.floor(position / this.boardSettings.numberFile);

    return {x:x, y:y};
  }

  validate() {
    if(typeof this.boardSettings.settings.validateState == "function") {
      return this.boardSettings.settings.validateState(this);
    } else {
      return true;
    }
  }

  validateMove(move) {
    if(move.fromSquare.pieceType === undefined) {
      return false;
    }
    let possibleMoves = this.getPossibleMoves({square:move.fromSquare});
    let pmove = move.exists(possibleMoves);

    if(pmove) {
      move = pmove;
      return move;
    }
    return false;
  }

  clone() {
    return new State(this.boardSettings, JSON.parse(JSON.stringify(this.board)), this.moveNumber, this.playerTurn, this.flags);
  }

  getRankSquares(square, limit, canCapture) {
    let squares = [];

    squares = squares.concat(this.getESquares(square, limit, canCapture));
    squares = squares.concat(this.getWSquares(square, limit, canCapture));

    return squares;
  }

  getFileSquares(square, limit, canCapture) {
    let squares = [];

    squares = squares.concat(this.getSSquares(square, limit, canCapture));
    squares = squares.concat(this.getNSquares(square, limit, canCapture));

    return squares;
  }

  getDiagonalsSquares(square, limit, canCapture) {
   return this.getSquaresByCardinal(square, limit, 0, 1, 0, 1, 0, 1, 0, 1, canCapture);
  }

  getNSquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 1, 0, 0, 0, 0, 0, 0, 0, canCapture);
  }

  getNESquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 1, 0, 0, 0, 0, 0, 0, canCapture);
  }

  getESquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 0, 1, 0, 0, 0, 0, 0, canCapture);
  }

  getSESquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 0, 0, 1, 0, 0, 0, 0, canCapture);
  }

  getSSquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 0, 0, 0, 1, 0, 0, 0, canCapture);
  }

  getSWSquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 0, 0, 0, 0, 1, 0, 0, canCapture);
  }

  getWSquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 0, 0, 0, 0, 0, 1, 0, canCapture);
  }

  getNWSquares(square, limit, canCapture) {
    return this.getSquaresByCardinal(square, limit, 0, 0, 0, 0, 0, 0, 0, 1, canCapture);
  }

  getSquaresByCardinal(square, limit, N, NE, E, SE, S, SW, W, NW, canCapture) {
    let squares = [];
    let xIncrement = 1, yIncrement = 1;

    if(N) {
      xIncrement = 0;
      yIncrement = -1;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    if(NE) {
      xIncrement = 1;
      yIncrement = -1;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    if(E) {
      xIncrement = 1;
      yIncrement = 0;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));

    }

    if(SE) {
      xIncrement = 1;
      yIncrement = 1;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    if(S) {
      xIncrement = 0;
      yIncrement = 1;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    if(SW) {
      xIncrement = -1;
      yIncrement = 1;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    if(W) {
      xIncrement = -1;
      yIncrement = 0;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    if(NW) {
      xIncrement = -1;
      yIncrement = -1;
      squares = squares.concat(this.getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture));
    }

    return squares;
  }

  _getSquaresByIncrement(square, xIncrement, yIncrement, limit) {
    let squares = [];

    let distance = 0;
    let blockedX = null, blockedY = null;

    let x = square.x;
    let y = square.y;

    while((limit <= 0 || limit === undefined || limit === null || distance < limit)) {
      // out of board limit: return the square found so far
      if(x+xIncrement >= this.boardSettings.numberFile || y+yIncrement >= this.boardSettings.numberRank || x+xIncrement < 0 || y+yIncrement <0) {
        break;
      }

      distance++;
      x += xIncrement;
      y += yIncrement;

      squares.push(this.getSquare(x,y));
    }

    return squares;
  }

  getSquaresByIncrement(square, xIncrement, yIncrement, limit, canCapture) {

    let incSquares = this._getSquaresByIncrement(square, xIncrement, yIncrement, limit);
    let squares = this.getPathSquares(square, incSquares, canCapture);

    return squares;
  }

  getPathSquares(square, pathSquares, canCapture) {
    let squares = [];

    for (let i = 0; i < pathSquares.length; i++) {
      let _square = pathSquares[i];
      let canCaptureValue = typeof canCapture == 'function' ? canCapture(square, _square) : canCapture;

      if(_square.isEmpty()) {
        if(!(canCaptureValue & this.MOVE_EMPTY)) {
          break;
        }
      } else if(square.isOpponent(_square)) {
        if(!(canCaptureValue & this.CAPTURE_OPPONENT) || (canCapture & this.DESTINATION)) {
          if(canCaptureValue & this.JUMP_OPPONENT) {
            continue;
          } else {
            break;
          }
        }
      } else {
        if(!(canCaptureValue & this.CAPTURE_OWN) || (canCapture & this.DESTINATION)) {
          if(canCaptureValue & this.JUMP_OWN) {
            continue;
          } else {
            break;
          }
        }
      }

      if(!(canCapture & this.DESTINATION) || i+1 == pathSquares.length) {
        squares.push(_square);
      }

    }

    return squares;
  }

  getDirectionSquares(square, directions, canCapture) {
    let directionsSquares = [];

    // ["N1", "SW2", "W5"]
    // the moves number must match the result
    let totalDistance = 0;
    let squares = [];
    for(let i=0;i<directions.length;i++) {
      let element = directions[i];
      // each function has to tell if the way was free
      if(element.match(/[a-zA-Z]+\d+/g)) {
        // extract numbers and letters
        let distance = element.match(/\d+/g).map(Number)[0];
        let direction = element.match(/[a-zA-Z]+/g).map(String)[0];

        switch(direction.toUpperCase()) {
          case "N":
              squares = squares.concat(this._getSquaresByIncrement(square, 0, -1, distance));
              break;
            case "NE":
              squares = squares.concat(this._getSquaresByIncrement(square, 1, -1, distance));
              break;
            case "E":
              squares = squares.concat(this._getSquaresByIncrement(square, 1, 0, distance));
              break;
            case "SE":
              squares = squares.concat(this._getSquaresByIncrement(square, 1, 1, distance));
              break;
            case "S":
              squares = squares.concat(this._getSquaresByIncrement(square, 0, 1, distance));
              break;
            case "SW":
              squares = squares.concat(this._getSquaresByIncrement(square, -1, 1, distance));
              break;
            case "W":
              squares = squares.concat(this._getSquaresByIncrement(square, -1, 0, distance));
              break;
            case "NW":
              squares = squares.concat(this._getSquaresByIncrement(square, -1, -1, distance));
              break;
            default:
            break;
        }
        totalDistance += distance;

        if(squares.length) {
          square = squares[squares.length-1];
        } else {
          return [];
        }

      }

    }
    let pathSquares = this.getPathSquares(square, squares, canCapture | this.DESTINATION);

    // if totalDistance does not match the number of squares then the destination is impossible
    return pathSquares;
  }

  getDestinationSquares(square, directions, canCapture) {
    let squares = this.getDirectionSquares(square, directions, canCapture);

    if(squares.length === 0) {
      return [];
    }

    return squares;
  }

  nextPlayer() {
    return this.playerTurn === this.boardSettings.settings.numberPlayers ? 1 : this.playerTurn+1;
  }

  getPossibleMoves(params) {
    let squares = [], moves = [];
    if(params === undefined) {
      params = {};
    }
    let player = params.player;
    let square = params.square;

    if(square === undefined) {
      for(let i=0;i < this.board.length; i++) {
        let coord = this.toCoord(i);
        let _square = this.getSquare(coord.x, coord.y);
        if(!_square.isEmpty() && (_square.player == player || player === undefined)) {
          squares.push(_square);
        }
      }
    } else {
      if(!square.isEmpty() && (square.player == player || player === undefined)) {
        squares.push(square);
      }
    }

    for(let i=0;i<squares.length;i++) {
      let _square = squares[i];
      if(this.boardSettings.settings.pieces[_square.pieceType].possibleMoves !== undefined) {
        let possibleMoves = this.boardSettings.settings.pieces[_square.pieceType].possibleMoves(this.clone(), _square);
        moves = moves.concat(possibleMoves);
      }
    }

    return moves;
  }

  display() {
    let output = "";

    output += "M"+this.moveNumber+" P"+this.playerTurn+"\n";
    output += "  ";
    for(let x=0; x<this.boardSettings.numberFile; x++) {
      output += " " + x + " ";
    }
    output += "\n"+Array(this.boardSettings.numberFile*3+3).join("-")+"\n";
    for(let CoordY=0; CoordY<this.boardSettings.numberRank; CoordY++) {
      output += CoordY+" ";
      for(let CoordX=0; CoordX<this.boardSettings.numberFile; CoordX++) {
        let square = this.getSquare(CoordX,CoordY);

        let type = square.player === 1 && this.boardSettings.settings.useCapitilizeSymbols ? square.pieceType.toUpperCase() : square.pieceType;
        output += square.pieceType !== undefined ? " "+type+" ": " . ";
      }
      output += "\n";
    }
    output += Array(this.boardSettings.numberFile*3+3).join("-")+"\n";
    return output;
  }

  findPieces(pieceType) {
    let pieces = [];
    for(let i=0;i<this.board.length;i++) {
      let coord = this.toCoord(i);
      let square = this.getSquare(coord.x, coord.y);
      if(!square.isEmpty() && square.pieceType == pieceType) {
        pieces.push(square);
      }
    }
    return pieces;
  }

  addFlag(flag) {
    if(!this.hasFlag(flag)) {
      this.flags.push(flag);
    }
  }

  removeFlag(flag) {
    const index = this.flags.indexOf(flag);
    if (index !== -1) {
      this.flags.splice(index, 1);
    }
  }

  hasFlag(flag) {
    return this.flags.includes(flag);
  }

}

module.exports = State;
