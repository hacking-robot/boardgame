class Square {
  constructor(x, y, player, pieceType, pieceFlags, squareFlags) {
    this.x = x;
    this.y = y;
    this.pieceFlags = pieceFlags;
    this.pieceType = pieceType;
    this.squareFlags = squareFlags;
    this.player = player;
  }

  in_array(squares) {
    if(typeof squares === "object" ) {
      for(let i=0;i<squares.length;i++) {
        if(squares[i].x === this.x && squares[i].y === this.y) {
          return true;
        } else {
          continue;
        }
      }
    }
    return false;
  }

  isEmpty() {
    return this.pieceType === null || this.pieceType === undefined || this.pieceType === "";
  }

  isOpponent(square) {
    return !square.isEmpty() && this.player != square.player;
  }

  isSamePlayer(square) {
    return !square.isEmpty() && this.player == square.player;
  }
}

module.exports = Square;
