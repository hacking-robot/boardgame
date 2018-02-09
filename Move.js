class Move {
  constructor(fromSquare, toSquare, flags) {
    this.fromSquare = fromSquare;
    this.toSquare = toSquare;
    this.flags = flags;
  }

  exists(moves) {
    if(typeof moves === "object" ) {
      for(let i=0;i<moves.length;i++) {
        if(moves[i].fromSquare.x === this.fromSquare.x && moves[i].fromSquare.y === this.fromSquare.y &&
          moves[i].toSquare.x === this.toSquare.x && moves[i].toSquare.y === this.toSquare.y
        ) {
          return moves[i];
        } else {
          continue;
        }
      }
    }
    return false;
  }
}

module.exports = Move;
