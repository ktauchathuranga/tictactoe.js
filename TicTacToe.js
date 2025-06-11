/**
 * TicTacToe.js - A professional Tic Tac Toe game library
 * @version 1.0.0
 * @author [Your Name]
 * @license MIT
 */
class TicTacToe {
    /**
     * Creates a new TicTacToe game instance
     * @param {Object} [config={}] - Configuration options
     * @param {number} [config.boardSize=3] - Size of the board (3-10)
     * @param {number} [config.winLength=3] - Number of marks needed to win
     * @param {string[]} [config.players=['X', 'O']] - Player symbols
     * @param {string} [config.startingPlayer='X'] - Starting player symbol
     */
    constructor(config = {}) {
        this.config = {
            boardSize: config.boardSize || 3,
            winLength: config.winLength || 3,
            players: config.players || ['X', 'O'],
            startingPlayer: config.startingPlayer || 'X',
            ...config
        };
        this._validateConfig();
        this.reset();
    }

    /**
     * Resets the game to initial state
     * @returns {TicTacToe} This instance
     */
    reset() {
        const size = this.config.boardSize;
        this._board = Array(size).fill(null).map(() => Array(size).fill(null));
        this._currentPlayer = this.config.startingPlayer;
        this._moveHistory = [];
        this._gameStatus = 'ongoing';
        this._winner = null;
        this._winningLine = null;
        this._moveCount = 0;
        this._undoStack = [];
        this._redoStack = [];
        return this;
    }

    /**
     * Makes a move on the board
     * @param {number|string|Object} row - Row index, algebraic notation, or {row, col} object
     * @param {number} [col] - Column index (if row is a number)
     * @returns {Object} Result {success, error, move, gameStatus, winner, winningLine}
     */
    move(row, col) {
        try {
            const move = this._parseMove(row, col);
            this._validateMove(move);
            return this._executeMove(move);
        } catch (error) {
            return {
                success: false,
                error: error.message,
                move: null
            };
        }
    }

    /**
     * Gets all legal moves
     * @returns {Object[]} Array of possible moves {row, col, algebraic, player}
     */
    moves() {
        if (this._gameStatus !== 'ongoing') return [];
        const legalMoves = [];
        const size = this.config.boardSize;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this._board[row][col] === null) {
                    legalMoves.push({
                        row, col,
                        algebraic: this._toAlgebraic(row, col),
                        player: this._currentPlayer
                    });
                }
            }
        }
        return legalMoves;
    }

    /**
     * Undoes the last move
     * @returns {Object} Result {success, error, move, gameStatus}
     */
    undo() {
        if (this._moveHistory.length === 0) {
            return { success: false, error: 'No moves to undo' };
        }
        const lastMove = this._moveHistory.pop();
        this._board[lastMove.row][lastMove.col] = null;
        this._currentPlayer = lastMove.player;
        this._moveCount--;
        this._updateGameStatus();
        this._redoStack.push(lastMove);
        return { success: true, move: lastMove, gameStatus: this._gameStatus };
    }

    /**
     * Redoes the last undone move
     * @returns {Object} Result {success, error, move, gameStatus, winner, winningLine}
     */
    redo() {
        if (this._redoStack.length === 0) {
            return { success: false, error: 'No moves to redo' };
        }
        const moveToRedo = this._redoStack.pop();
        return this.move(moveToRedo.row, moveToRedo.col);
    }

    /**
     * Gets current game status
     * @returns {string} 'ongoing', 'checkmate', or 'draw'
     */
    gameStatus() { return this._gameStatus; }

    /**
     * Checks if the game is over
     * @returns {boolean}
     */
    isGameOver() { return this._gameStatus !== 'ongoing'; }

    /**
     * Gets the winner, if any
     * @returns {string|null}
     */
    winner() { return this._winner; }

    /**
     * Checks if the game is a draw
     * @returns {boolean}
     */
    isDraw() { return this._gameStatus === 'draw'; }

    /**
     * Gets the current player's symbol
     * @returns {string}
     */
    turn() { return this._currentPlayer; }

    /**
     * Gets move history
     * @returns {Object[]} Array of moves
     */
    history() { return [...this._moveHistory]; }

    /**
     * Gets the current board state
     * @param {string} [format='array'] - Format: 'array' (default)
     * @returns {Array[][]} Board state
     */
    board() {
        return this._board.map(row => row.slice());
    }

    /**
     * Gets game statistics
     * @returns {Object} Stats {moveCount, emptyCells, playerCounts, gameStatus, ...}
     */
    stats() {
        const emptyCells = this._countEmptyCells();
        const playerCounts = this._getPlayerCounts();
        return {
            moveCount: this._moveCount,
            emptyCells,
            playerCounts,
            gameStatus: this._gameStatus,
            winner: this._winner,
            currentPlayer: this._currentPlayer,
            boardSize: this.config.boardSize,
            winLength: this.config.winLength
        };
    }

    /**
     * Gets the winning line, if any
     * @returns {Object[]|null} Array of {row, col} positions
     */
    getWinningLine() { return this._winningLine ? this._winningLine.slice() : null; }

    /**
     * Exports the game state
     * @returns {Object} Game state object
     */
    exportState() {
        return {
            board: this.board(),
            currentPlayer: this._currentPlayer,
            moveHistory: this.history(),
            gameStatus: this._gameStatus,
            winner: this._winner,
            winningLine: this.getWinningLine(),
            moveCount: this._moveCount,
            config: { ...this.config }
        };
    }

    /**
     * Imports a game state
     * @param {Object} state - Game state object
     * @returns {TicTacToe} This instance
     */
    importState(state) {
        this.config = { ...this.config, ...state.config };
        this._validateConfig();
        this._board = state.board.map(row => row.slice());
        this._currentPlayer = state.currentPlayer;
        this._moveHistory = state.moveHistory.slice();
        this._gameStatus = state.gameStatus;
        this._winner = state.winner;
        this._winningLine = state.winningLine ? state.winningLine.slice() : null;
        this._moveCount = state.moveCount;
        this._undoStack = [];
        this._redoStack = [];
        return this;
    }

    // Private methods
    _validateConfig() {
        const { boardSize, winLength, players } = this.config;
        if (!Number.isInteger(boardSize) || boardSize < 3 || boardSize > 10) {
            throw new Error('Board size must be an integer between 3 and 10');
        }
        if (!Number.isInteger(winLength) || winLength < 3 || winLength > boardSize) {
            throw new Error('Win length must be an integer between 3 and board size');
        }
        if (!Array.isArray(players) || players.length < 2) {
            throw new Error('Must have at least 2 players');
        }
        if (!players.includes(this.config.startingPlayer)) {
            throw new Error('Starting player must be one of the configured players');
        }
    }

    _parseMove(row, col) {
        if (typeof row === 'object' && row !== null) {
            return { row: row.row, col: row.col };
        }
        if (typeof row === 'string') {
            return this._fromAlgebraic(row);
        }
        if (typeof row === 'number' && typeof col === 'number') {
            return { row, col };
        }
        throw new Error('Invalid move format');
    }

    _validateMove(move) {
        const { row, col } = move;
        const size = this.config.boardSize;
        if (!Number.isInteger(row) || !Number.isInteger(col)) {
            throw new Error('Row and column must be integers');
        }
        if (row < 0 || row >= size || col < 0 || col >= size) {
            throw new Error(`Move out of bounds. Board size is ${size}x${size}`);
        }
        if (this._board[row][col] !== null) {
            throw new Error('Square is already occupied');
        }
        if (this._gameStatus !== 'ongoing') {
            throw new Error(`Game is over. Status: ${this._gameStatus}`);
        }
    }

    _executeMove(move) {
        const { row, col } = move;
        this._redoStack = [];
        this._board[row][col] = this._currentPlayer;
        const moveRecord = {
            row, col,
            player: this._currentPlayer,
            algebraic: this._toAlgebraic(row, col),
            moveNumber: this._moveCount + 1,
            timestamp: Date.now()
        };
        this._moveHistory.push(moveRecord);
        this._moveCount++;
        this._updateGameStatus();
        if (this._gameStatus === 'ongoing') {
            this._switchPlayer();
        }
        return {
            success: true,
            move: moveRecord,
            gameStatus: this._gameStatus,
            winner: this._winner,
            winningLine: this._winningLine
        };
    }

    _updateGameStatus() {
        const winResult = this._checkWin();
        if (winResult.hasWin) {
            this._gameStatus = 'checkmate';
            this._winner = winResult.winner;
            this._winningLine = winResult.line;
            return;
        }
        if (this._countEmptyCells() === 0) {
            this._gameStatus = 'draw';
            this._winner = null;
            this._winningLine = null;
            return;
        }
        this._gameStatus = 'ongoing';
        this._winner = null;
        this._winningLine = null;
    }

    _checkWin() {
        const size = this.config.boardSize;
        const winLength = this.config.winLength;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const player = this._board[row][col];
                if (!player) continue;

                for (const [dRow, dCol] of directions) {
                    const line = this._getLine(row, col, dRow, dCol, winLength);
                    if (line.length === winLength && line.every(pos => this._board[pos.row][pos.col] === player)) {
                        return { hasWin: true, winner: player, line };
                    }
                }
            }
        }
        return { hasWin: false };
    }

    _getLine(startRow, startCol, dRow, dCol, length) {
        const line = [];
        const size = this.config.boardSize;
        for (let i = 0; i < length; i++) {
            const row = startRow + i * dRow;
            const col = startCol + i * dCol;
            if (row < 0 || row >= size || col < 0 || col >= size) break;
            line.push({ row, col });
        }
        return line;
    }

    _switchPlayer() {
        const currentIndex = this.config.players.indexOf(this._currentPlayer);
        const nextIndex = (currentIndex + 1) % this.config.players.length;
        this._currentPlayer = this.config.players[nextIndex];
    }

    _toAlgebraic(row, col) {
        const colLetter = String.fromCharCode(97 + col);
        const rowNumber = row + 1;
        return `${colLetter}${rowNumber}`;
    }

    _fromAlgebraic(algebraic) {
        if (typeof algebraic !== 'string' || algebraic.length < 2) {
            throw new Error('Invalid algebraic notation');
        }
        const col = algebraic.charCodeAt(0) - 97;
        const row = parseInt(algebraic.slice(1)) - 1;
        return { row, col };
    }

    _countEmptyCells() {
        return this._board.flat().filter(cell => cell === null).length;
    }

    _getPlayerCounts() {
        const counts = {};
        this.config.players.forEach(player => counts[player] = 0);
        this._board.flat().forEach(cell => {
            if (cell !== null) {
                counts[cell] = (counts[cell] || 0) + 1;
            }
        });
        return counts;
    }
}

// Export for Node.js (CommonJS), ESM, and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicTacToe;
    // Add ESM export for Node.js
    export { TicTacToe as default };
} else {
    window.TicTacToe = TicTacToe;
}
