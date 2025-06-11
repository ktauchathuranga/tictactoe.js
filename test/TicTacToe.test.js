import TicTacToe, { TicTacToeError, ConfigurationError, InvalidMoveError, GameStateError } from '../TicTacToe.js';

describe('TicTacToe', () => {
  let game;

  beforeEach(() => {
    game = new TicTacToe();
  });

  describe('Initialization', () => {
    test('should initialize 3x3 board by default', () => {
      expect(game.board.length).toBe(3);
      expect(game.board[0].length).toBe(3);
      expect(game.currentPlayer).toBe('X');
      expect(game.gameStatus).toBe('ongoing');
    });

    test('should initialize with custom configuration', () => {
      const customGame = new TicTacToe({ 
        boardSize: 4, 
        winLength: 4, 
        players: ['A', 'B'], 
        startingPlayer: 'B' 
      });
      expect(customGame.board.length).toBe(4);
      expect(customGame.currentPlayer).toBe('B');
      expect(customGame.config.winLength).toBe(4);
    });

    test('should throw ConfigurationError for invalid board size', () => {
      expect(() => new TicTacToe({ boardSize: 2 })).toThrow(ConfigurationError);
      expect(() => new TicTacToe({ boardSize: 11 })).toThrow(ConfigurationError);
    });

    test('should throw ConfigurationError for invalid win length', () => {
      expect(() => new TicTacToe({ winLength: 2 })).toThrow(ConfigurationError);
      expect(() => new TicTacToe({ winLength: 5, boardSize: 3 })).toThrow(ConfigurationError);
    });
  });

  describe('Game Moves', () => {
    test('should allow valid move with coordinates', () => {
      const result = game.move(0, 0);
      expect(result.success).toBe(true);
      expect(result.move.player).toBe('X');
      expect(result.move.row).toBe(0);
      expect(result.move.col).toBe(0);
      expect(game.board[0][0]).toBe('X');
      expect(game.currentPlayer).toBe('O');
    });

    test('should allow valid move with algebraic notation', () => {
      const result = game.move('a1');
      expect(result.success).toBe(true);
      expect(game.board[0][0]).toBe('X');
    });

    test('should allow valid move with object notation', () => {
      const result = game.move({ row: 0, col: 0 });
      expect(result.success).toBe(true);
      expect(game.board[0][0]).toBe('X');
    });

    test('should reject invalid move - out of bounds', () => {
      const result = game.move(3, 3);
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('InvalidMoveError');
    });

    test('should reject invalid move - cell already occupied', () => {
      game.move(0, 0);
      const result = game.move(0, 0);
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('InvalidMoveError');
    });

    test('should reject moves when game is over', () => {
      // Create a winning scenario
      game.move(0, 0); // X
      game.move(1, 0); // O
      game.move(0, 1); // X
      game.move(1, 1); // O
      game.move(0, 2); // X wins
      
      const result = game.move(2, 2);
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('GameStateError');
    });
  });

  describe('Win Detection', () => {
    test('should detect horizontal win', () => {
      game.move(0, 0); // X
      game.move(1, 0); // O
      game.move(0, 1); // X
      game.move(1, 1); // O
      game.move(0, 2); // X wins
      
      expect(game.winner).toBe('X');
      expect(game.isGameOver).toBe(true);
      expect(game.gameStatus).toBe('finished');
      expect(game.winningLine).toHaveLength(3);
    });

    test('should detect vertical win', () => {
      game.move(0, 0); // X
      game.move(0, 1); // O
      game.move(1, 0); // X
      game.move(0, 2); // O
      game.move(2, 0); // X wins
      
      expect(game.winner).toBe('X');
      expect(game.isGameOver).toBe(true);
    });

    test('should detect diagonal win', () => {
      game.move(0, 0); // X
      game.move(0, 1); // O
      game.move(1, 1); // X
      game.move(0, 2); // O
      game.move(2, 2); // X wins
      
      expect(game.winner).toBe('X');
      expect(game.isGameOver).toBe(true);
    });

    test('should detect draw', () => {
      // Create a draw scenario
      game.move(0, 0); // X
      game.move(0, 1); // O
      game.move(0, 2); // X
      game.move(1, 1); // O
      game.move(1, 0); // X
      game.move(2, 0); // O
      game.move(1, 2); // X
      game.move(2, 2); // O
      game.move(2, 1); // X
      
      expect(game.isDraw).toBe(true);
      expect(game.gameStatus).toBe('draw');
      expect(game.winner).toBe(null);
    });
  });

  describe('Undo/Redo Functionality', () => {
    test('should undo move', () => {
      game.move(0, 0);
      expect(game.board[0][0]).toBe('X');
      
      const undoResult = game.undo();
      expect(undoResult.success).toBe(true);
      expect(game.board[0][0]).toBe(null);
      expect(game.currentPlayer).toBe('X');
    });

    test('should redo move', () => {
      game.move(0, 0);
      game.undo();
      
      const redoResult = game.redo();
      expect(redoResult.success).toBe(true);
      expect(game.board[0][0]).toBe('X');
      expect(game.currentPlayer).toBe('O');
    });

    test('should fail to undo when no moves available', () => {
      const result = game.undo();
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('GameStateError');
    });

    test('should fail to redo when no moves available', () => {
      const result = game.redo();
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('GameStateError');
    });
  });

  describe('Game State Management', () => {
    test('should get legal moves', () => {
      const legalMoves = game.getLegalMoves();
      expect(legalMoves).toHaveLength(9);
      expect(legalMoves[0]).toHaveProperty('row');
      expect(legalMoves[0]).toHaveProperty('col');
      expect(legalMoves[0]).toHaveProperty('algebraic');
      expect(legalMoves[0]).toHaveProperty('player');
    });

    test('should validate legal moves', () => {
      expect(game.isLegalMove(0, 0)).toBe(true);
      expect(game.isLegalMove(3, 3)).toBe(false);
      
      game.move(0, 0);
      expect(game.isLegalMove(0, 0)).toBe(false);
    });

    test('should provide game statistics', () => {
      const stats = game.stats;
      expect(stats).toHaveProperty('moveCount');
      expect(stats).toHaveProperty('emptyCells');
      expect(stats).toHaveProperty('playerCounts');
      expect(stats).toHaveProperty('gameStatus');
      expect(stats).toHaveProperty('canUndo');
      expect(stats).toHaveProperty('canRedo');
      expect(stats.emptyCells).toBe(9);
      expect(stats.moveCount).toBe(0);
    });

    test('should reset game', () => {
      game.move(0, 0);
      game.move(1, 1);
      
      game.reset();
      
      expect(game.board[0][0]).toBe(null);
      expect(game.board[1][1]).toBe(null);
      expect(game.currentPlayer).toBe('X');
      expect(game.gameStatus).toBe('ongoing');
      expect(game.history).toHaveLength(0);
    });

    test('should export and import game state', () => {
      game.move(0, 0);
      game.move(1, 1);
      
      const exportedState = game.exportState();
      expect(exportedState).toHaveProperty('board');
      expect(exportedState).toHaveProperty('currentPlayer');
      expect(exportedState).toHaveProperty('moveHistory');
      
      const newGame = new TicTacToe();
      newGame.importState(exportedState);
      
      expect(newGame.board[0][0]).toBe('X');
      expect(newGame.board[1][1]).toBe('O');
      expect(newGame.currentPlayer).toBe('X');
      expect(newGame.history).toHaveLength(2);
    });
  });

  describe('String Representation', () => {
    test('should provide string representation of board', () => {
      game.move(0, 0); // X
      game.move(1, 1); // O
      
      const boardString = game.toString();
      expect(boardString).toContain('a b c');
      expect(boardString).toContain('X');
      expect(boardString).toContain('O');
      expect(boardString).toContain('.');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid algebraic notation', () => {
      const result = game.move('z9');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('InvalidMoveError');
    });

    test('should handle invalid move format', () => {
      const result = game.move('invalid');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('InvalidMoveError');
    });

    test('should throw error for invalid state import', () => {
      expect(() => game.importState(null)).toThrow(ConfigurationError);
      expect(() => game.importState({})).toThrow(ConfigurationError);
    });
  });

  describe('Custom Game Configurations', () => {
    test('should work with larger board', () => {
      const bigGame = new TicTacToe({ boardSize: 5, winLength: 4 });
      expect(bigGame.board.length).toBe(5);
      expect(bigGame.getLegalMoves()).toHaveLength(25);
    });

    test('should work with more players', () => {
      const multiGame = new TicTacToe({ 
        players: ['X', 'O', 'Z'], 
        startingPlayer: 'Z' 
      });
      expect(multiGame.currentPlayer).toBe('Z');
      
      multiGame.move(0, 0); // Z
      expect(multiGame.currentPlayer).toBe('X');
      
      multiGame.move(0, 1); // X
      expect(multiGame.currentPlayer).toBe('O');
      
      multiGame.move(0, 2); // O
      expect(multiGame.currentPlayer).toBe('Z');
    });
  });
});
