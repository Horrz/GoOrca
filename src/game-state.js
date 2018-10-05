const Move = require('./move');

/** Class representing the game board. */
class GameState {
  /** Generate and return the initial game state. */
  constructor(stones = [], history = []) {
    this.boardsize = 9;
    this.komi = 6.5;
    this.color = 1; // black is positive, white is negative
    this.ko = null;
    this.finished = false;
    this.stones = [];
    for (let y = 0; y < this.boardsize; y += 1) {
      this.stones[y] = y in stones ? [...stones[y]] : Array(this.boardsize).fill(0);
    }
    this.history = history;
  }

  clone() {
    return new GameState(this.stones, this.history);
  }

  /** Return the current player’s legal moves from given state. */
  legalMoves() {
    this.stones.forEach(row => row);
    return [new Move('pass')].concat();
  }

  /** Advance the given state and return it. */
  nextState(move) {
    const newState = this.clone();
    // add move to list
    newState.history.push(move);
    // change active color
    newState.color = -this.color;
    if (!move.isPass) {
      // check for capture dead stones
      const deadNeighbors = newState.getNeighbors(move.vertex)
        .filter(vertex => newState.get(vertex) === -sign && !newState.hasLiberties(vertex));

      for (const vertex of deadNeighbors) {
        if (move.get(vertex) === 0) {
          continue;
        }
        for (const vertex of newState.getChain(n)) {
          newState.set(vertex, 0);
        }
      }
      newState.set(move.vertex, move.color);
    }
    return newState;
  }

  set([x, y], color) {
    this.stones[y][x] = color;
    return this;
  }

  getNeighbors(vertex) {
    const [x, y] = vertex;
    const allNeighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    return allNeighbors.filter(v => this.hasVertex(v));
  }

  isFinished() {
    const { length } = this.history;
    return (length > 2
      && this.history[length - 1].isPass
      && this.history[length - 2].isPass
      && this.history[length - 3].isPass
    );
  }

  /** Return the winner of the game. */
  winner() {
    if (this.isFinished()) {
      let sum = -this.komi;
      for (let y = 0; y < this.boardsize; y += 1) {
        for (let x = 0; x < this.boardsize; x += 1) {
          sum += this.stones[y][x];
        }
      }
      return sum;
    }
    return null;
  }

  hash() {
    return this.history.reduce((accumulator, move) => accumulator + move.hash(), '');
  }
}

module.exports = GameState;
