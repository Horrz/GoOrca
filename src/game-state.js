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
    this.stones = [];
    for (let y = 0; y < this.boardSize; y += 1) {
      this.stones[y] = y in stones ? [...stones[y].slice(0)] : Array(this.boardSize).fill(0);
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
          allMoves.push(new Move(x, y, this.color));
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
      newState.set(move.vertex, move.color);
      // check for capture dead stones
      const deadNeighbors = newState.getNeighbors(move.vertex)
        .filter(vertex => !newState.hasLiberties(vertex));
      deadNeighbors
        .filter(vertex => newState.get(vertex) !== 0)
        .forEach(vertex => newState.getChain(vertex).forEach(v => newState.set(v, 0)));
    }
    return newState;
  }

  /**
   *  Places or removes a stone on the board with the given coordinates.
   */
  set([x, y], color) {
    this.stones[y][x] = color;
    return this;
  }

  get([x, y]) {
    return this.stones[y][x];
  }

  hasLiberties(vertex, visited = {}) {
    const sign = this.get(vertex);
    if (!this.hasVertex(vertex) || sign === 0) {
      return false;
    }
    if (vertex in visited) {
      return false;
    }
    const neighbors = this.getNeighbors(vertex);
    if (neighbors.some(n => this.get(n) === 0)) {
      return true;
    }

    const newlyVisited = Object.assign({}, visited);
    newlyVisited[vertex] = true;
    return neighbors
      .filter(n => this.get(n) === sign)
      .some(n => this.hasLiberties(n, newlyVisited));
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
    return this.boardSize > x && x >= 0 && this.boardSize > y && y >= 0;
  }

  getConnectedComponent(vertex, func, result = null) {
    if (func instanceof Array) {
      const signs = func;
      func = v => signs.includes(this.get(v));
    } else if (typeof func === 'number') {
      const sign = func;
      func = v => this.get(v) === sign;
    }
    if (!this.hasVertex(vertex)) {
      return [];
    }
    if (!result) {
      result = [vertex];
    }

    // Recursive depth-first search
    this.getNeighbors(vertex).forEach((v) => {
      if (func(v) && !(result.some(w => GameState.vertexEquals(v, w)))) {
        result.push(v);
        this.getConnectedComponent(v, func, result);
      }
    });

    return result;
  }

  static vertexEquals([a, b], [c, d]) {
    return a === c && b === d;
  }

  getChain(vertex) {
    return this.getConnectedComponent(vertex, this.get(vertex));
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
