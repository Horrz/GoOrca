const MonteCarloNode = require('./monte-carlo-node.js');

/** Class representing the Monte Carlo search tree. */
class MonteCarlo {
  constructor() {
    this.nodes = new Map(); // map: State.hash() => MonteCarloNode
  }

  /** If given state does not exist, create dangling node. */
  makeNode(state) {
    if (!this.nodes.has(state.hash())) {
      const unexpandedPlays = state.legalMoves();
      const node = new MonteCarloNode(null, null, state, unexpandedPlays);
      this.nodes.set(state.hash(), node);
    }
  }

  /** From given state, repeatedly run MCTS to build statistics. */
  runSearch(state, timeout) {
    this.makeNode(state);
    const end = Date.now() + timeout * 1000;
    while (Date.now() < end) {
      let node = this.select(state);
      let winner = state.winner();

      if (winner === null) {
        node = this.expand(node);
        winner = this.simulate(node);
      }
      this.backpropagate(node, winner);
    }
  }

  /** Get the best move from available statistics. */
  bestPlay(state) {
    // TODO
    // return play
  }

  /** Phase 1, Selection: Select until not fully expanded OR leaf */
  select(state) {
    let node = this.nodes.get(state.hash());
    while (node.isFullyExpanded()) {
      const moves = node.state.legalMoves();
      let bestMove;
      let bestUCB1 = -Infinity;
      for (const move of moves) {
        const childUCB1 = node.childNode(move).getUCB1(this.UCB1ExploreParam);
        if (childUCB1 > bestUCB1) {
          bestMove = move;
          bestUCB1 = childUCB1;
        }
      }
      node = node.childNode(bestMove);
    }
    return node;
  }

  /**
   * Phase 2: Expansion
   * Of the given node, expand a random unexpanded child node
   * @param {MonteCarloNode} node - The node to expand from. Assume not leaf.
   * @return {MonteCarloNode} The new expanded child node.
   */
  expand(node) {
    const moves = node.unexpandedMoves();
    const index = Math.floor(Math.random() * moves.length);
    const move = moves[index];

    const childState = node.state.nextState(move);
    const childUnexpandedMoves = childState.legalMoves();
    const childNode = node.expand(move, childState, childUnexpandedMoves);
    this.nodes.set(childState.hash(), childNode);
    return childNode;
  }

  /**
   * Phase 3: Simulation
   * From given node, play the game until a terminal state, then return winner
   * @param {MonteCarloNode} node - The node to simulate from.
   * @return {number} The winner of the terminal game state.
   */
 simulate(node) {
   let state = node.state;
   let winner = state.winner();

   while (winner === null) {
     let moves = state.legalMoves();
     let move = moves[Math.floor(Math.random() * moves.length)];
     state = state.nextState(move);
     winner = state.winner();
   }

   return winner;
 }

  /**
   * Phase 4: Backpropagation
   * From given node, propagate plays and winner to ancestors' statistics
   * @param {MonteCarloNode} node - The node to backpropagate from. Typically leaf.
   * @param {number} winner - The winner to propagate.
   */
  backpropagate(node, winner) {

    while (node !== null) {
      node.n_plays += 1;
      // Parent's choice
      if (node.state.color === (-winner)) {
        node.n_wins += 1;
      }
      node = node.parent;
    }
  }
}

module.exports = MonteCarlo;
