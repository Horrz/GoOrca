/** Class representing a state transition. */
class Move {
  constructor(row, col) {
    if (row === 'pass') {
      this.isPass = true;
    } else {
      this.vertex = [row, col];
    }
  }

  hash() {
    return this.isPass ? 'pass' : `${this.vertex.row.toString()},${this.col.toString()}`;
  }
}

module.exports = Move;
