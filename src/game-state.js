const Move = require('./move');

/** Class representing the game board. */
class GameState {
  /** Generate and return the initial game state. */
  constructor(stones = [], history = []) {
    this.boardSize = 9;
    this.komi = 6.5;
    this.color = 1; // black is positive, white is negative
    this.ko = null;
    this.finished = false;
    this.stones = stones.slice(0); // aka clone
    for (let y = 0; y < this.boardSize; y += 1) {
      this.stones[y] = y in stones ? [...stones[y]] : Array(this.boardSize).fill(0);
    }
    this.history = history.slice(0); // aka clone
  }

  clone() {
    return new GameState(this.stones, this.history);
  }

  /** Return the current player’s legal moves from given state. */
  legalMoves() {
    const allMoves = [new Move('pass')].concat();

    for (let y = 0; y < this.boardSize; y += 1) {
      for (let x = 0; x < this.boardSize; x += 1) {
        if (this.stones[y][x] === 0) {
          allMoves.push(new Move(x,y));
        }
      }
    }
    return allMoves;

  }

  /** Advance the given state and return it. */
  nextState(move) {
    const newState = this.clone(this.stone, this.history);
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

  /**
   * Checks if the coordinates are part of the board
   */
  hasVertex([x, y]) {
    return 0 <= x && x < this.width && 0 <= y && y < this.height
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
      for (let y = 0; y < this.boardSize; y += 1) {
        for (let x = 0; x < this.boardSize; x += 1) {
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
