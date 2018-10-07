const GameState = require('./game-state.js');
const MonteCarlo = require('./monte-carlo.js');

let gameState = new GameState();
const mcts = new MonteCarlo();

// From initial state, take turns to play game until someone wins
while (gameState.winner() === null) {
  mcts.runSearch(gameState, 1);
  const move = mcts.bestMove(gameState);
  gameState = gameState.nextState(move);
}
