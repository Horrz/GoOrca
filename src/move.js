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
    if (this.isPass) {
      return 'pass';
    }
    const [row, col] = this.vertex
    return `${row.toString()},${col.toString()}`;
  }
}

module.exports = Move;
