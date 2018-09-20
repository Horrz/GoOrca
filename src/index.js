const Game = require('./game.js');
const MonteCarlo = require('./monte-carlo.js');

const game = new Game();
const mcts = new MonteCarlo(game);

let state = game.start();
let winner = game.winner(state);

// From initial state, take turns to play game until someone wins
while (winner === null) {
  mcts.runSearch(state, 1);
  const play = mcts.bestPlay(state);
  state = game.nextState(state, play);
  winner = game.winner(state);
}

console.log(winner);
