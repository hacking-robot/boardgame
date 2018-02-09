const MiniChess = require('./MiniChess.js');

let minichess = new MiniChess();

// clear the board and states
minichess.newGame();

// load from a min-fen position
let fen = "rn1qk/p1b1p/1p2p/5/1PPP1/KQBNR w 5";
console.log("start from fen: ", fen);
minichess.load(fen);

// make a deadly move
console.log('valid move: ',minichess.board.move(4, 5, 4, 0) != false); // e1-e6

// fen after the move
console.log('fen after move: ',minichess.toFen());

// is end of game?
console.log('isEnd: ',minichess.isEnd());

// is a draw?
console.log('isDraw: ',minichess.isDraw());
