class BoardSettings {
  constructor(settings) {
    this.settings = Object.assign({
      size: "8x8",
      numberPlayers: 2,
      position: [],
      pieces: {}
    },settings);

    let size = this.settings.size.split("x");
    if(!isNaN(parseInt(size[0])) && !isNaN(parseInt(size[1]))) {
      this.numberRank = parseInt(size[1]);
      this.numberFile = parseInt(size[0]);
      this.numberSquares = this.numberRank * this.numberFile;
    } else {
      throw Error ('Wrong board size');
    }
  }
}

module.exports = BoardSettings;
