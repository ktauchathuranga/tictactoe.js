# @ktauchathuranga/tictactoe.js

A professional Tic Tac Toe game library for Node.js and browsers, inspired by chess.js. This library provides a robust and flexible implementation of Tic Tac Toe, supporting customizable board sizes, win conditions, and features like move history, undo/redo, and algebraic notation.

[![npm version](https://img.shields.io/npm/v/@ktauchathuranga/tictactoe.js.svg)](https://www.npmjs.com/package/@ktauchathuranga/tictactoe.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/ktauchathuranga/tictactoe.js)](https://github.com/ktauchathuranga/tictactoe.js/issues)

## Features
- Configurable board size (3x3 to 10x10) and win length
- Support for multiple players with custom symbols
- Move history with algebraic notation (e.g., `a1`, `b2`)
- Undo and redo functionality
- Game state export and import
- Comprehensive error handling
- Works in both Node.js and browser environments
- Lightweight and dependency-free

## Installation

Install the package via npm:

```bash
npm install @ktauchathuranga/tictactoe.js
```

For browser usage, you can include the library via a CDN or a local file (see [Browser Usage](#browser-usage)).

## Usage

### Node.js

Using ES Modules:

```javascript
import TicTacToe from '@ktauchathuranga/tictactoe.js';

const game = new TicTacToe();
game.move(0, 0); // X moves to top-left (a1)
console.log(game.board());
// [
//   ['X', null, null],
//   [null, null, null],
//   [null, null, null]
// ]
console.log(game.stats());
// { moveCount: 1, emptyCells: 8, playerCounts: { X: 1, O: 0 }, ... }
```

Using CommonJS:

```javascript
const TicTacToe = require('@ktauchathuranga/tictactoe.js');

const game = new TicTacToe();
game.move('a1'); // X moves to top-left using algebraic notation
console.log(game.turn()); // 'O'
```

### Browser Usage

Include the library via a script tag:

```html
<script src="https://unpkg.com/@ktauchathuranga/tictactoe.js"></script>
<script>
  const game = new window.TicTacToe();
  game.move(0, 0);
  console.log(game.board());
</script>
```

Alternatively, bundle it with a tool like Webpack or Rollup, or use the minified version (if provided in future releases).

## API

### `new TicTacToe(config)`

Creates a new Tic Tac Toe game instance.

- **config**: Object (optional)
  - `boardSize`: Number (default: 3) - Board size (3 to 10).
  - `winLength`: Number (default: 3) - Number of marks needed to win.
  - `players`: Array of strings (default: `['X', 'O']`) - Player symbols.
  - `startingPlayer`: String (default: `'X'`) - Starting player symbol.

Example:
```javascript
const game = new TicTacToe({ boardSize: 4, winLength: 4, players: ['A', 'B'], startingPlayer: 'A' });
```

### Methods

- **move(row, col | algebraic | {row, col})**: Makes a move. Accepts row/col indices, algebraic notation (e.g., `a1`), or an object `{row, col}`. Returns `{success, error, move, gameStatus, winner, winningLine}`.
- **moves()**: Returns an array of legal moves `{row, col, algebraic, player}`.
- **undo()**: Undoes the last move. Returns `{success, error, move, gameStatus}`.
- **redo()**: Redoes the last undone move. Returns `{success, error, move, gameStatus, winner, winningLine}`.
- **gameStatus()**: Returns game status (`'ongoing'`, `'checkmate'`, or `'draw'`).
- **isGameOver()**: Returns `true` if the game is over.
- **winner()**: Returns the winner’s symbol or `null`.
- **isDraw()**: Returns `true` if the game is a draw.
- **turn()**: Returns the current player’s symbol.
- **history()**: Returns an array of past moves `{row, col, player, algebraic, moveNumber, timestamp}`.
- **board()**: Returns a 2D array of the board state.
- **stats()**: Returns game statistics `{moveCount, emptyCells, playerCounts, gameStatus, winner, currentPlayer, boardSize, winLength}`.
- **getWinningLine()**: Returns an array of `{row, col}` positions for the winning line, or `null`.
- **exportState()**: Exports the game state as an object.
- **importState(state)**: Imports a game state from an object.

### Example

```javascript
const game = new TicTacToe();

// Make moves
game.move(0, 0); // X to a1
game.move(1, 0); // O to a2
game.move(0, 1); // X to b1
game.move(1, 1); // O to b2
game.move(0, 2); // X to c1

// Check win
console.log(game.winner()); // 'X'
console.log(game.getWinningLine()); // [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}]

// Undo and redo
game.undo();
console.log(game.winner()); // null
game.redo();
console.log(game.winner()); // 'X'
```

## Browser Example

See the [example HTML file](https://github.com/ktauchathuranga/tictactoe.js/blob/main/examples/index.html) for a fully interactive Tic Tac Toe game using this library.

```html
<!DOCTYPE html>
<html>
<head>
  <title>TicTacToe.js Demo</title>
</head>
<body>
  <div id="board"></div>
  <script src="https://unpkg.com/@ktauchathuranga/tictactoe.js"></script>
  <script>
    const game = new window.TicTacToe();
    const boardElement = document.getElementById('board');
    // Add your UI logic here
  </script>
</body>
</html>
```

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/ktauchathuranga/tictactoe.js).

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## Issues

Report bugs or feature requests at [GitHub Issues](https://github.com/ktauchathuranga/tictactoe.js/issues).

## License

This project is licensed under the [MIT License](LICENSE).

