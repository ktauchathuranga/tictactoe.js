# @ktauchathuranga/tictactoe.js

A professional Tic Tac Toe game library for Node.js and browsers, inspired by chess.js. This library provides a robust and flexible implementation of Tic Tac Toe, supporting customizable board sizes, win conditions, and features like move history, undo/redo, and algebraic notation.

[![npm version](https://img.shields.io/npm/v/@ktauchathuranga/tictactoe.js.svg)](https://www.npmjs.com/package/@ktauchathuranga/tictactoe.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/ktauchathuranga/tictactoe.js)](https://github.com/ktauchathuranga/tictactoe.js/issues)

## Features
- Configurable board size (3x3 to 10x10) and win length
- Support for multiple players with custom symbols
- Move history with algebraic notation (e.g., `a1`, `b2`)
- Undo and redo functionality with full state management
- Game state export and import for saving/loading games
- Comprehensive error handling with custom error types
- Move validation and legal move generation
- Works in both Node.js and browser environments
- Lightweight and dependency-free
- Professional API design with immutable data structures

## Installation

Install the package via npm:

```bash
npm install @ktauchathuranga/tictactoe.js
```

For browser usage, you can include the library via a CDN or use it as an ES module.

## Usage

### Node.js

Using ES Modules:

```javascript
import TicTacToe from '@ktauchathuranga/tictactoe.js';

const game = new TicTacToe();
const result = game.move(0, 0); // X moves to top-left (a1)
console.log(result);
// { success: true, move: { row: 0, col: 0, player: 'X', algebraic: 'a1', ... }, ... }

console.log(game.board);
// [
//   ['X', null, null],
//   [null, null, null],
//   [null, null, null]
// ]

console.log(game.stats);
// { moveCount: 1, emptyCells: 8, playerCounts: { X: 1, O: 0 }, ... }
```

Using CommonJS:

```javascript
const TicTacToe = require('@ktauchathuranga/tictactoe.js');

const game = new TicTacToe();
const result = game.move('a1'); // X moves to top-left using algebraic notation
console.log(game.currentPlayer); // 'O'
```

### Browser Usage (ES Modules)

```html
<script type="module">
  import TicTacToe from './path/to/TicTacToe.js';
  
  const game = new TicTacToe();
  const result = game.move(0, 0);
  console.log(game.board);
</script>
```

### Browser Usage (Script Tag)

```html
<script src="https://unpkg.com/@ktauchathuranga/tictactoe.js"></script>
<script>
  const game = new window.TicTacToe();
  game.move(0, 0);
  console.log(game.board);
</script>
```

## API Reference

### Constructor

#### `new TicTacToe(config)`

Creates a new Tic Tac Toe game instance.

**Parameters:**
- **config**: Object (optional)
  - `boardSize`: Number (default: 3) - Board size (3 to 10)
  - `winLength`: Number (default: 3) - Number of marks needed to win
  - `players`: Array of strings (default: `['X', 'O']`) - Player symbols
  - `startingPlayer`: String (default: `'X'`) - Starting player symbol

**Example:**
```javascript
const game = new TicTacToe({ 
  boardSize: 4, 
  winLength: 4, 
  players: ['A', 'B'], 
  startingPlayer: 'A' 
});
```

### Methods

#### `move(row, col | algebraic | {row, col})`
Makes a move on the board.

**Parameters:**
- `row, col`: Numbers - Row and column indices (0-based)
- `algebraic`: String - Algebraic notation (e.g., 'a1', 'b2')
- `{row, col}`: Object - Move object with row and col properties

**Returns:** `{success, error, move, gameStatus, winner, winningLine, isGameOver}`

**Example:**
```javascript
game.move(0, 0);        // Using coordinates
game.move('a1');        // Using algebraic notation
game.move({row: 0, col: 0}); // Using object
```

#### `getLegalMoves()`
Returns an array of all legal moves.

**Returns:** Array of `{row, col, algebraic, player}` objects

#### `undo()`
Undoes the last move.

**Returns:** `{success, error, move, gameStatus, currentPlayer}`

#### `redo()`
Redoes the last undone move.

**Returns:** `{success, error, move, gameStatus, winner, winningLine}`

#### `reset()`
Resets the game to initial state.

**Returns:** TicTacToe instance (for method chaining)

#### `isLegalMove(row, col | algebraic | {row, col})`
Validates if a move is legal without executing it.

**Returns:** Boolean

#### `exportState()`
Exports the complete game state.

**Returns:** Serializable game state object

#### `importState(state)`
Imports a game state from an exported state object.

**Parameters:**
- `state`: Object - Game state from `exportState()`

**Returns:** TicTacToe instance (for method chaining)

#### `toString()`
Returns a string representation of the board.

**Returns:** String - Formatted board with coordinates

### Properties (Getters)

#### `gameStatus`
Returns the current game status.

**Returns:** String - `'ongoing'`, `'finished'`, or `'draw'`

#### `isGameOver`
Returns whether the game is over.

**Returns:** Boolean

#### `winner`
Returns the winner's symbol or null.

**Returns:** String | null

#### `isDraw`
Returns whether the game is a draw.

**Returns:** Boolean

#### `currentPlayer`
Returns the current player's symbol.

**Returns:** String

#### `history`
Returns the move history (immutable copy).

**Returns:** Array of `{row, col, player, algebraic, moveNumber, timestamp}` objects

#### `board`
Returns the current board state (immutable copy).

**Returns:** 2D Array

#### `config`
Returns the game configuration (immutable copy).

**Returns:** Object with `{boardSize, winLength, players, startingPlayer}`

#### `stats`
Returns comprehensive game statistics.

**Returns:** Object with `{moveCount, emptyCells, playerCounts, gameStatus, winner, currentPlayer, boardSize, winLength, canUndo, canRedo, legalMovesCount}`

#### `winningLine`
Returns the winning line positions, if any.

**Returns:** Array of `{row, col}` objects | null

## Error Handling

The library includes comprehensive error handling with custom error types:

- `TicTacToeError` - Base error class
- `ConfigurationError` - Invalid configuration
- `InvalidMoveError` - Invalid move attempted
- `GameStateError` - Invalid game state operation

```javascript
const result = game.move(0, 0);
if (!result.success) {
  console.error(`${result.errorType}: ${result.error}`);
}
```

## Complete Example

```javascript
import TicTacToe from '@ktauchathuranga/tictactoe.js';

const game = new TicTacToe();

// Make moves
let result = game.move(0, 0); // X to a1
console.log(result.success); // true

result = game.move(1, 0); // O to a2
result = game.move(0, 1); // X to b1
result = game.move(1, 1); // O to b2
result = game.move(0, 2); // X to c1 - winning move

// Check game state
console.log(game.isGameOver); // true
console.log(game.winner); // 'X'
console.log(game.winningLine); // [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}]

// View game statistics
console.log(game.stats);
// {
//   moveCount: 5,
//   emptyCells: 4,
//   playerCounts: { X: 3, O: 2 },
//   gameStatus: 'finished',
//   winner: 'X',
//   ...
// }

// Undo and redo
const undoResult = game.undo();
console.log(game.winner); // null (no longer winning)

const redoResult = game.redo();
console.log(game.winner); // 'X' (back to winning state)

// Export and import game state
const gameState = game.exportState();
const newGame = new TicTacToe();
newGame.importState(gameState);
```

## Advanced Configuration

```javascript
// Custom 5x5 board with 4-in-a-row to win
const customGame = new TicTacToe({
  boardSize: 5,
  winLength: 4,
  players: ['🔴', '🔵', '🟢'], // Three players
  startingPlayer: '🔴'
});

// Make moves using different notation styles
customGame.move('c3');              // Algebraic notation
customGame.move(2, 2);              // Coordinate notation
customGame.move({row: 1, col: 1});  // Object notation

console.log(customGame.toString());
// Displays formatted board with coordinates
```

## Browser Integration Example

See the complete interactive example in your HTML file. Here's a minimal integration:

```html
<!DOCTYPE html>
<html>
<head>
  <title>TicTacToe.js Demo</title>
</head>
<body>
  <div id="board"></div>
  <button onclick="makeMove(0, 0)">Top Left</button>
  <button onclick="undoMove()">Undo</button>
  <button onclick="resetGame()">Reset</button>
  
  <script type="module">
    import TicTacToe from './TicTacToe.js';
    
    const game = new TicTacToe();
    
    window.makeMove = (row, col) => {
      const result = game.move(row, col);
      if (result.success) {
        updateDisplay();
      } else {
        alert(result.error);
      }
    };
    
    window.undoMove = () => {
      game.undo();
      updateDisplay();
    };
    
    window.resetGame = () => {
      game.reset();
      updateDisplay();
    };
    
    function updateDisplay() {
      document.getElementById('board').innerHTML = 
        game.toString().replace(/\n/g, '<br>');
    }
    
    updateDisplay();
  </script>
</body>
</html>
```

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/ktauchathuranga/tictactoe.js).

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## Testing

Run the test suite:

```bash
npm test
```

## Issues

Report bugs or feature requests at [GitHub Issues](https://github.com/ktauchathuranga/tictactoe.js/issues).

## License

This project is licensed under the [MIT License](LICENSE).

