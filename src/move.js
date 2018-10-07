/** Class representing a state transition. */
class Move {
  constructor(x, y) {
    if (row === 'pass') {
      this.isPass = true;
    } else {
      this.vertex = [x, y];
    }
  }

  hash() {
    if (this.isPass) {
      return 'pass';
    }
    const [x, y] = this.vertex
    return `${x.toString()},${y.toString()}`;
  }
}

module.exports = Move;
