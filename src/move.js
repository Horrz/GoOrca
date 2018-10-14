/** Class representing a state transition. */
class Move {
  constructor(x, y, color) {
    if (x === 'pass') {
      this.isPass = true;
    } else {
      this.vertex = [x, y];
      this.color = color;
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
