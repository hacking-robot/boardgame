const {Board, State, Square, Move} = require('../Board');

const WHITE_CAPTURE = 1;
const BLACK_CAPTURE = 2;
const DRAW = 3;

class MiniChess {
  constructor() {
    this.boardSettings = {
          //position: ["1f","1e","1c","1b","1d","1a","1a","1a","1a","1a","","","","","","","","","","","2a","2a","2a","2a","2a","2d","2b","2c","2e","2f"],
          //position: ["1k","1q","1b","1n","1r","1p","1p","1p","1p","1p","","","","","","","","","","","2p","2p","2p","2p","2p","2r","2n","2b","2q","2k"],
          position: ["r","n","b","q","k","p","p","p","p","p","","","","","","","","","","","P","P","P","P","P","K","Q","B","N","R"],
          size: "5x6",
          playerTurn: 1,
          pieces: {
            "p": {
              possibleMoves: function(state, square) {
                let moves = [], squares = [];
                if(state.playerTurn == 1) {
                  squares = squares.concat(state.getNSquares(square, 1, state.MOVE_EMPTY));
                  squares = squares.concat(state.getNESquares(square, 1, state.CAPTURE_OPPONENT));
                  squares = squares.concat(state.getNWSquares(square, 1, state.CAPTURE_OPPONENT));
                } else {
                  squares = squares.concat(state.getSSquares(square, 1, state.MOVE_EMPTY));
                  squares = squares.concat(state.getSESquares(square, 1, state.CAPTURE_OPPONENT));
                  squares = squares.concat(state.getSWSquares(square, 1, state.CAPTURE_OPPONENT));
                }
                for (let i = 0; i < squares.length; i++) {
                  let toSquare = squares[i];
                  moves.push(new Move(square, toSquare));
                }
                return moves;
              }
            },
            "b": {
              possibleMoves: function(state, fromSquare) {
                let moves = [], squares = [];
                squares = squares.concat(state.getDiagonalsSquares(fromSquare,0,state.CAPTURE_OPPONENT | state.MOVE_EMPTY));
                squares = squares.concat(state.getRankSquares(fromSquare,1,state.MOVE_EMPTY));
                squares = squares.concat(state.getFileSquares(fromSquare,1,state.MOVE_EMPTY));

                for (let i = 0; i < squares.length; i++) {
                  let toSquare = squares[i];
                  moves.push(new Move(fromSquare, toSquare));
                }
                return moves;
              }
            },
            "n": {
              possibleMoves: function(state, fromSquare) {
                let moves = [], squares = [], directions = [];
                let destinations = [["E1","S2"],["W1","S2"],["E2","S1"],["W2","S1"], ["E1","N2"],["W1","N2"],["E2","N1"],["W2","N1"]];
                destinations.forEach(function(destination) {
                  squares = squares.concat(state.getDestinationSquares(fromSquare, destination, state.JUMP_OWN | state.JUMP_OPPONENT | state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                });
                for (let i = 0; i < squares.length; i++) {
                  let toSquare = squares[i];
                  moves.push(new Move(fromSquare, toSquare));
                }
                return moves;
              }
            },
            "r": {
              possibleMoves: function(state, fromSquare) {
                let moves = [], squares = [];
                squares = squares.concat(state.getRankSquares(fromSquare,0,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                squares = squares.concat(state.getFileSquares(fromSquare,0,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));

                for (let i = 0; i < squares.length; i++) {
                  let toSquare = squares[i];
                  moves.push(new Move(fromSquare, toSquare));
                }

                return moves;
              }
            },
            "q": {
              possibleMoves: function(state, fromSquare) {
                let moves = [], squares = [];

                squares = squares.concat(state.getRankSquares(fromSquare,0,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                squares = squares.concat(state.getFileSquares(fromSquare,0,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                squares = squares.concat(state.getDiagonalsSquares(fromSquare,0,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));

                for (let i = 0; i < squares.length; i++) {
                  let toSquare = squares[i];
                  moves.push(new Move(fromSquare, toSquare));
                }
                return moves;
              }
            },
            "k": {
              possibleMoves: function(state, fromSquare) {
                let moves = [], squares = [];
                squares = squares.concat(state.getRankSquares(fromSquare, 1,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                squares = squares.concat(state.getFileSquares(fromSquare, 1,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                squares = squares.concat(state.getDiagonalsSquares(fromSquare,1,state.MOVE_EMPTY | state.CAPTURE_OPPONENT));
                for (let i = 0; i < squares.length; i++) {
                  let toSquare = squares[i];
                  moves.push(new Move(fromSquare, toSquare));
                }
                return moves;
              }
            }
          },
          validateState: function(state) {

            return true;
          },
          beforeMove: function(state, move) {

          },
          afterMove: function(state, move) {
            // was the move a promotion
            if(move.fromSquare.pieceType == "p" && ( move.fromSquare.player ==1 && move.toSquare.y == 0 || move.fromSquare.player == 2 && move.toSquare.y ==  state.boardSettings.numberRank - 1)) {
              let sq = state.getSquare(move.toSquare.x, move.toSquare.y);
              sq.pieceType = "q";
              state.setSquare(move.toSquare.x, move.toSquare.y, sq);
            }
            state.playerTurn = state.nextPlayer();
            if(state.playerTurn == 1) {
              state.moveNumber++;
            }

            // two kings must exist on the board
            let kings = state.findPieces("k");
            if(kings.length == 1) {
              if(kings[0].player == 1) {
                  state.addFlag(BLACK_CAPTURE);
              } else{
                  state.addFlag(WHITE_CAPTURE);
              }
            }
          },
          moveGenerator: function(state) {


          }
    }
    this.board = new Board(this.boardSettings);
  }

  newGame() {
    this.board.clear();
    this.board.addStartState();
  }

  generateMove() {
    let moves = [];
    // get all available moves for the pieces
    let state = this.board.getCurrentState();
    let possibleMoves = this.shuffle(state.getPossibleMoves({player:state.playerTurn})); // shuffle or it will take always the first move when there is no best move

    // try all moves, validate the state, and find best state
    let bestMove = {score:null, move: false};
    for(let i=0;i<possibleMoves.length;i++) {
      let move = possibleMoves[i];
      let newState = state.move(move);// possibleMoves() then move(move)

      if(newState != false && newState.validate()) {  // check win, lose, draw, errors
        // evaluazte the state and add it if it is good
        let score = this.evaluate(state, newState);

        if(score > bestMove.score || bestMove.score === null) {
          bestMove = {score: score, move: move};
        }
      }
    }

    return bestMove.move;
  }

  evaluate(oldState, newState) {
    let score = 0;
    let oldCountMaterial = this.countMaterial(oldState);
    let newCountMaterial = this.countMaterial(newState);

    let wDiff = newCountMaterial.white - oldCountMaterial.white;
    let bDiff = newCountMaterial.black - oldCountMaterial.black;

    if(oldState.playerTurn == 1) {
      score =   wDiff + bDiff * -1;
      if(newState.hasFlag(WHITE_CAPTURE)) {
        score -= 9999;
      }
      if(newState.hasFlag(BLACK_CAPTURE)) {
        score += 9999;
      }
    } else {
      score =  bDiff + wDiff * -1;
      if(newState.hasFlag(BLACK_CAPTURE)) {
        score -= 9999;
      }
      if(newState.hasFlag(WHITE_CAPTURE)) {
        score += 9999;
      }

    }

    return score;
  }

  shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
  }

  countMaterial(state) {
    let wMaterialScore = 0, bMaterialScore = 0, score = 0;
    // count white and black material
    for(let i=0;i<state.board.length;i++) {
      if(state.board[i] === null || state.board[i] === undefined) {
        continue;
      }
      //P: 10 L:30 B:30 R:50 Q:90: K: 900
      switch(state.board[i].pieceType) {
        case 'p':
          score = 10;
        break;
        case 'b':
        case 'n':
          score = 30;
        break;
        case 'r':
          score = 50;
        break;
        case 'q':
          score = 90;
        break;
        case 'k':
          score = 900;
        break;
        default:
          score = 0;
          break;
      }

      if(state.board[i].player == 1) {
        wMaterialScore += score;
      }
      if(state.board[i].player == 2) {
        bMaterialScore += score;
      }
    }

    return {white: wMaterialScore, black: bMaterialScore};
  }

  isEnd() {
    if(this.board.getCurrentState().hasFlag(WHITE_CAPTURE)) {
      return 2;
    } else if(this.board.getCurrentState().hasFlag(BLACK_CAPTURE)) {
      return 1;
    } else {
      return false;
    }

  }

  isDraw() {
    return this.board.getCurrentState().hasFlag(DRAW);
  }

  load(fen) {
    this.board.clear();
    /*
        A FEN record contains six fields. The separator between fields is a space. The fields are:

        1. Piece placement (from white's perspective). Each rank is described, starting with rank 8 and ending with rank 1; within each rank, the contents of each square are described from file "a" through file "h". Following the Standard Algebraic Notation (SAN), each piece is identified by a single letter taken from the standard English names (pawn = "P", knight = "N", bishop = "B", rook = "R", queen = "Q" and king = "K").[1] White pieces are designated using upper-case letters ("PNBRQK") while black pieces use lowercase ("pnbrqk"). Empty squares are noted using digits 1 through 8 (the number of empty squares), and "/" separates ranks.
        2. Active colour. "w" means White moves next, "b" means Black.
        3. Fullmove number: The number of the full move. It starts at 1, and is incremented after Black's move.

        The start pos is rnbqk/ppppp/5/5/PPPPP/KQBNR w 1
    */
    //
    let tokens = fen.split(/\s+/);
    let position = tokens[0];
    let square = 0;

    let playerTurn = tokens[1].toLowerCase() === "w" ? 1:2;
    let moveNumber = parseInt(tokens[2], 10);

    let state = new State(this.board.boardSettings, undefined, moveNumber, playerTurn);

    for (let i = 0; i < position.length; i++) {
      let piece = position.charAt(i);

      if (piece === '/') {

      } else if ('0123456789'.indexOf(piece) !== -1) {
        square += parseInt(piece, 10);
      } else {
        let player = (piece < 'a') ? 1 : 2;
        state.put(square, player, piece.toLowerCase())
        square++;
      }
    }

    this.board.addState(state);

    return true;
  }

  toFen(state) {
    if(state === undefined) {
      state = this.board.getCurrentState();
    }

    let fen = "";

    for(let rank=0;rank<state.boardSettings.numberRank;rank++) {
      let empty = 0;
      for(let file=0;file<state.boardSettings.numberFile;file++) {
        let square = state.getSquare(file, rank);
        if(square.isEmpty()) {
          empty++;
        } else {
          if(empty > 0) {
            fen += empty;
            empty = 0;
            let piece = square.player == 1 ? square.pieceType.toUpperCase() : square.pieceType.toLowerCase();
            fen += piece;
          } else {
            let piece = square.player == 1 ? square.pieceType.toUpperCase() : square.pieceType.toLowerCase();
            fen += piece;
          }
        }
      }

      if(empty > 0) {
        fen += empty;
      }

      if(rank+1 < state.boardSettings.numberRank) {
        fen += "/";
      }
    }

    fen += " "+(state.playerTurn == 1 ? "w":"b");
    fen += " "+state.moveNumber;

    return fen;
  }

  toAlgebraic(move){
    if(move instanceof Move === false) {
      return "";
    }
    return 'abcde'.substring(move.fromSquare.x,move.fromSquare.x+1).concat(
      this.board.boardSettings.numberRank-move.fromSquare.y,
      'abcdef'.substring(move.toSquare.x,move.toSquare.x+1),
      this.board.boardSettings.numberRank-move.toSquare.y);
  }

}

module.exports = MiniChess;
