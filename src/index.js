const GameState = require('./game-state.js');
const MonteCarlo = require('./monte-carlo.js');

let gameState = new GameState();
const mcts = new MonteCarlo(gameState);

// From initial state, take turns to play game until someone wins
while (gameState.winner() === null) {
  console.log(gameState);
  mcts.runSearch(gameState, 1);
  const move = mcts.bestMove(gameState);
  gameState = state.nextState(move);
}

console.log(state.moves);
