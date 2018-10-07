class MonteCarloNode {
  constructor(parent, move, state, unexpandedPlays) {
    this.move = move;
    this.state = state;

    // Monte Carlo stuff
    this.n_plays = 0;
    this.n_wins = 0;

    // Tree stuff
    this.parent = parent;
    this.children = new Map();
    for (const move of unexpandedPlays) {
      this.children.set(move.hash(), { move, node: null });
    }
  }
  /**
   * Whether this node is fully expanded.
   * @return {boolean} Whether this node is fully expanded.
   */
  isFullyExpanded() {
    for (const child of this.children.values()) {
      if (child.node === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all unexpanded legal moves from this node.
   * @return {Move[]} All unexpanded moves.
   */
  unexpandedMoves() {
    const ret = [];
    for (const child of this.children.values()) {
      if (child.node === null) {
        ret.push(child.move);
      }
    }
    return ret;
  }

  /**
   * Expand the specified child move and return the new child node.
   * Add the node to the array of children nodes.
   * Remove the move from the array of unexpanded moves.
   * @param {Move} nextMove - The move to expand.
   * @param {State} childState - The child state corresponding to the given play.
   * @param {Move[]} unexpandedMoves - The given child's unexpanded child moves; typically all of them.
   * @return {MonteCarloNode} The new child node.
   */
  expand(nextMove, childState, unexpandedMoves) {
    if (!this.children.has(nextMove.hash())) {
      throw new Error('No such move!');
    }
    const childNode = new MonteCarloNode(this, nextMove, childState, unexpandedMoves);
    this.children.set(nextMove.hash(), { move: nextMove, node: childNode });
    return childNode;
  }

  /**
   * Get the MonteCarloNode corresponding to the given play.
   * @param {number} play - The play leading to the child node.
   * @return {MonteCarloNode} The child node corresponding to the play given.
   */
  childNode(play) {
    const child = this.children.get(play.hash());
    if (child === undefined) {
      throw new Error('No such move!');
    }
    else if (child.node === null) {
      throw new Error('Child is not expanded!');
    }
    return child.node;
  }

  /**
   * Get the UCB1 value for this node.
   * @param {number} biasParam - The square of the bias parameter in the UCB1 algorithm, defaults to 2.
   * @return {number} The UCB1 value of this node.
   */
  getUCB1(biasParam) {
    return (this.n_wins / this.n_plays) + Math.sqrt(biasParam * Math.log(this.parent.n_plays) / this.n_plays);
  }
}

module.exports = MonteCarloNode;
