import TicTacToe from '@ktauchathuranga/tictactoe.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const game = new TicTacToe();

function play() {
  console.log('Board:\n', game.toString());
  console.log(`Turn: ${game.currentPlayer}`);
  rl.question('Enter move (e.g., a1) or "undo" to undo: ', (input) => {
    input = input.trim().toLowerCase();

    if (input === 'undo') {
      const result = game.undo();
      if (!result.success) {
        console.log('Error:', result.error);
      }
      return play();
    }

    const result = game.move(input);
    if (!result.success) {
      console.log('Error:', result.error);
      return play();
    }

    if (game.isGameOver) {
      console.log('Final Board:\n', game.toString());
      if (game.isDraw) {
        console.log('Game Over: Draw!');
      } else {
        console.log(`Game Over: ${game.winner} wins!`);
      }
      rl.close();
    } else {
      play();
    }
  });
}

console.log('Tic Tac Toe - Enter moves in algebraic notation (e.g., a1) or "undo"');
play();
