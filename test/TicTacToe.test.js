const TicTacToe = require('../TicTacToe');

describe('TicTacToe', () => {
  let game;

  beforeEach(() => {
    game = new TicTacToe();
  });

  test('should initialize 3x3 board', () => {
    expect(game.board().length).toBe(3);
    expect(game.board()[0].length).toBe(3);
  });

  test('should allow valid move', () => {
    const result = game.move(0, 0);
    expect(result.success).toBe(true);
    expect(game.board()[0][0]).toBe('X');
  });

  test('should detect win', () => {
    game.move(0, 0); // X
    game.move(1, 0); // O
    game.move(0, 1); // X
    game.move(1, 1); // O
    game.move(0, 2); // X
    expect(game.winner()).toBe('X');
    expect(game.isGameOver()).toBe(true);
  });

  test('should undo move', () => {
    game.move(0, 0);
    game.undo();
    expect(game.board()[0][0]).toBe(null);
  });
});
