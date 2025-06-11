/**
 * TicTacToe.js - A professional Tic Tac Toe game library (ESM)
 * @version 1.0.2
 * @author Ashen Chathurnaga
 * @license MIT
 */

/**
 * Custom error classes for better error handling
 */
export class TicTacToeError extends Error {
    constructor(message, code = 'GENERIC_ERROR') {
        super(message);
        this.name = 'TicTacToeError';
        this.code = code;
    }
}

export class ConfigurationError extends TicTacToeError {
    constructor(message) {
        super(message, 'CONFIGURATION_ERROR');
        this.name = 'ConfigurationError';
    }
}

export class InvalidMoveError extends TicTacToeError {
    constructor(message) {
        super(message, 'INVALID_MOVE_ERROR');
        this.name = 'InvalidMoveError';
    }
}

export class GameStateError extends TicTacToeError {
    constructor(message) {
        super(message, 'GAME_STATE_ERROR');
        this.name = 'GameStateError';
    }
}

/**
 * Professional Tic Tac Toe game implementation
 */
export default class TicTacToe {
    // Private field declarations
    #board;
    #currentPlayer;
    #moveHistory;
    #gameStatus;
    #winner;
    #winningLine;
    #moveCount;
    #undoStack;
    #redoStack;
    #config;

    // Constants
    static GAME_STATUSES = Object.freeze({
        ONGOING: 'ongoing',
        FINISHED: 'finished',
        DRAW: 'draw'
    });

    static DEFAULT_CONFIG = Object.freeze({
        boardSize: 3,
        winLength: 3,
        players: ['X', 'O'],
        startingPlayer: 'X'
    });

    static DIRECTIONS = Object.freeze([
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal down-right
        [1, -1]   // diagonal down-left
    ]);

    /**
     * Creates a new TicTacToe game instance
     * @param {Object} [config={}] - Configuration options
     * @param {number} [config.boardSize=3] - Size of the board (3-10)
     * @param {number} [config.winLength=3] - Number of marks needed to win
     * @param {string[]} [config.players=['X', 'O']] - Player symbols
     * @param {string} [config.startingPlayer='X'] - Starting player symbol
     * @throws {ConfigurationError} When configuration is invalid
     */
    constructor(config = {}) {
        this.#config = Object.freeze({
            ...TicTacToe.DEFAULT_CONFIG,
            ...config
        });
        
        this.#validateConfig();
        this.reset();
    }

    /**
     * Resets the game to initial state
     * @returns {TicTacToe} This instance for method chaining
     */
    reset() {
        const size = this.#config.boardSize;
        this.#board = Array.from({ length: size }, () => Array(size).fill(null));
        this.#currentPlayer = this.#config.startingPlayer;
        this.#moveHistory = [];
        this.#gameStatus = TicTacToe.GAME_STATUSES.ONGOING;
        this.#winner = null;
        this.#winningLine = null;
        this.#moveCount = 0;
        this.#undoStack = [];
        this.#redoStack = [];
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
            const move = this.#parseMove(row, col);
            this.#validateMove(move);
            return this.#executeMove(move);
        } catch (error) {
            return {
                success: false,
                error: error.message,
                errorType: error.constructor.name,
                move: null,
                gameStatus: this.#gameStatus,
                winner: this.#winner,
                winningLine: this.#winningLine ? [...this.#winningLine] : null
            };
        }
    }

    /**
     * Gets all legal moves
     * @returns {Object[]} Array of possible moves {row, col, algebraic, player}
     */
    getLegalMoves() {
        if (this.#gameStatus !== TicTacToe.GAME_STATUSES.ONGOING) {
            return [];
        }

        const legalMoves = [];
        const size = this.#config.boardSize;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.#board[row][col] === null) {
                    legalMoves.push({
                        row,
                        col,
                        algebraic: this.#toAlgebraic(row, col),
                        player: this.#currentPlayer
                    });
                }
            }
        }
        
        return legalMoves;
    }

    /**
     * Undoes the last move
     * @returns {Object} Result {success, error, move, gameStatus}
     * @throws {GameStateError} When no moves to undo
     */
    undo() {
        try {
            if (this.#moveHistory.length === 0) {
                throw new GameStateError('No moves to undo');
            }

            const lastMove = this.#moveHistory.pop();
            this.#board[lastMove.row][lastMove.col] = null;
            this.#currentPlayer = lastMove.player;
            this.#moveCount--;
            this.#updateGameStatus();
            this.#redoStack.push(lastMove);

            return {
                success: true,
                move: { ...lastMove },
                gameStatus: this.#gameStatus,
                currentPlayer: this.#currentPlayer
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                errorType: error.constructor.name
            };
        }
    }

    /**
     * Redoes the last undone move
     * @returns {Object} Result {success, error, move, gameStatus, winner, winningLine}
     * @throws {GameStateError} When no moves to redo
     */
    redo() {
        try {
            if (this.#redoStack.length === 0) {
                throw new GameStateError('No moves to redo');
            }

            const moveToRedo = this.#redoStack.pop();
            return this.move(moveToRedo.row, moveToRedo.col);
        } catch (error) {
            return {
                success: false,
                error: error.message,
                errorType: error.constructor.name
            };
        }
    }

    /**
     * Gets current game status
     * @returns {string} One of TicTacToe.GAME_STATUSES
     */
    get gameStatus() {
        return this.#gameStatus;
    }

    /**
     * Checks if the game is over
     * @returns {boolean}
     */
    get isGameOver() {
        return this.#gameStatus !== TicTacToe.GAME_STATUSES.ONGOING;
    }

    /**
     * Gets the winner, if any
     * @returns {string|null}
     */
    get winner() {
        return this.#winner;
    }

    /**
     * Checks if the game is a draw
     * @returns {boolean}
     */
    get isDraw() {
        return this.#gameStatus === TicTacToe.GAME_STATUSES.DRAW;
    }

    /**
     * Gets the current player's symbol
     * @returns {string}
     */
    get currentPlayer() {
        return this.#currentPlayer;
    }

    /**
     * Gets move history (immutable copy)
     * @returns {Object[]} Array of moves
     */
    get history() {
        return this.#moveHistory.map(move => ({ ...move }));
    }

    /**
     * Gets the current board state (immutable copy)
     * @returns {Array[][]} Board state
     */
    get board() {
        return this.#board.map(row => [...row]);
    }

    /**
     * Gets game configuration (immutable copy)
     * @returns {Object} Configuration object
     */
    get config() {
        return { ...this.#config };
    }

    /**
     * Gets comprehensive game statistics
     * @returns {Object} Stats object with all game metrics
     */
    get stats() {
        const emptyCells = this.#countEmptyCells();
        const playerCounts = this.#getPlayerCounts();
        
        return Object.freeze({
            moveCount: this.#moveCount,
            emptyCells,
            playerCounts: Object.freeze(playerCounts),
            gameStatus: this.#gameStatus,
            winner: this.#winner,
            currentPlayer: this.#currentPlayer,
            boardSize: this.#config.boardSize,
            winLength: this.#config.winLength,
            canUndo: this.#moveHistory.length > 0,
            canRedo: this.#redoStack.length > 0,
            legalMovesCount: this.getLegalMoves().length
        });
    }

    /**
     * Gets the winning line, if any (immutable copy)
     * @returns {Object[]|null} Array of {row, col} positions
     */
    get winningLine() {
        return this.#winningLine ? this.#winningLine.map(pos => ({ ...pos })) : null;
    }

    /**
     * Exports the complete game state
     * @returns {Object} Serializable game state object
     */
    exportState() {
        return Object.freeze({
            board: this.board,
            currentPlayer: this.#currentPlayer,
            moveHistory: this.history,
            gameStatus: this.#gameStatus,
            winner: this.#winner,
            winningLine: this.winningLine,
            moveCount: this.#moveCount,
            config: this.config,
            timestamp: Date.now(),
            version: '1.0.0'
        });
    }

    /**
     * Imports a game state
     * @param {Object} state - Game state object from exportState()
     * @returns {TicTacToe} This instance for method chaining
     * @throws {ConfigurationError} When state is invalid
     */
    importState(state) {
        try {
            if (!state || typeof state !== 'object') {
                throw new ConfigurationError('Invalid state object');
            }

            // Validate required properties
            const requiredProps = ['board', 'currentPlayer', 'moveHistory', 'gameStatus', 'config'];
            for (const prop of requiredProps) {
                if (!(prop in state)) {
                    throw new ConfigurationError(`Missing required property: ${prop}`);
                }
            }

            // Update configuration and validate
            this.#config = Object.freeze({ ...this.#config, ...state.config });
            this.#validateConfig();

            // Import state
            this.#board = state.board.map(row => [...row]);
            this.#currentPlayer = state.currentPlayer;
            this.#moveHistory = state.moveHistory.map(move => ({ ...move }));
            this.#gameStatus = state.gameStatus;
            this.#winner = state.winner || null;
            this.#winningLine = state.winningLine ? state.winningLine.map(pos => ({ ...pos })) : null;
            this.#moveCount = state.moveCount || 0;
            this.#undoStack = [];
            this.#redoStack = [];

            // Validate imported state
            this.#validateImportedState();

            return this;
        } catch (error) {
            throw new ConfigurationError(`Failed to import state: ${error.message}`);
        }
    }

    /**
     * Validates if a move is legal without executing it
     * @param {number|string|Object} row - Row specification
     * @param {number} [col] - Column specification
     * @returns {boolean} True if move is legal
     */
    isLegalMove(row, col) {
        try {
            const move = this.#parseMove(row, col);
            this.#validateMove(move);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Gets a string representation of the board
     * @returns {string} Formatted board string
     */
    toString() {
        const size = this.#config.boardSize;
        const lines = [];
        
        // Header with column letters
        const header = '   ' + Array.from({ length: size }, (_, i) => String.fromCharCode(97 + i)).join(' ');
        lines.push(header);
        
        // Board rows
        for (let row = 0; row < size; row++) {
            const rowNum = (row + 1).toString().padStart(2);
            const cells = this.#board[row].map(cell => cell || '.').join(' ');
            lines.push(`${rowNum} ${cells}`);
        }
        
        return lines.join('\n');
    }

    // Private methods
    #validateConfig() {
        const { boardSize, winLength, players, startingPlayer } = this.#config;

        if (!Number.isInteger(boardSize) || boardSize < 3 || boardSize > 10) {
            throw new ConfigurationError('Board size must be an integer between 3 and 10');
        }

        if (!Number.isInteger(winLength) || winLength < 3 || winLength > boardSize) {
            throw new ConfigurationError(`Win length must be an integer between 3 and ${boardSize}`);
        }

        if (!Array.isArray(players) || players.length < 2) {
            throw new ConfigurationError('Must have at least 2 players');
        }

        if (new Set(players).size !== players.length) {
            throw new ConfigurationError('Player symbols must be unique');
        }

        if (!players.every(p => typeof p === 'string' && p.length > 0)) {
            throw new ConfigurationError('Player symbols must be non-empty strings');
        }

        if (!players.includes(startingPlayer)) {
            throw new ConfigurationError('Starting player must be one of the configured players');
        }
    }

    #parseMove(row, col) {
        if (row && typeof row === 'object' && 'row' in row && 'col' in row) {
            return { row: row.row, col: row.col };
        }

        if (typeof row === 'string') {
            return this.#fromAlgebraic(row);
        }

        if (Number.isInteger(row) && Number.isInteger(col)) {
            return { row, col };
        }

        throw new InvalidMoveError('Invalid move format. Use (row, col), "algebraic", or {row, col}');
    }

    #validateMove(move) {
        const { row, col } = move;
        const size = this.#config.boardSize;

        if (!Number.isInteger(row) || !Number.isInteger(col)) {
            throw new InvalidMoveError('Row and column must be integers');
        }

        if (row < 0 || row >= size || col < 0 || col >= size) {
            throw new InvalidMoveError(`Move out of bounds. Board size is ${size}×${size}`);
        }

        if (this.#board[row][col] !== null) {
            throw new InvalidMoveError(`Square ${this.#toAlgebraic(row, col)} is already occupied by ${this.#board[row][col]}`);
        }

        if (this.#gameStatus !== TicTacToe.GAME_STATUSES.ONGOING) {
            throw new GameStateError(`Game is ${this.#gameStatus}. Cannot make moves.`);
        }
    }

    #executeMove(move) {
        const { row, col } = move;
        
        // Clear redo stack on new move
        this.#redoStack.length = 0;
        
        // Execute move
        this.#board[row][col] = this.#currentPlayer;
        
        const moveRecord = Object.freeze({
            row,
            col,
            player: this.#currentPlayer,
            algebraic: this.#toAlgebraic(row, col),
            moveNumber: this.#moveCount + 1,
            timestamp: Date.now()
        });
        
        this.#moveHistory.push(moveRecord);
        this.#moveCount++;
        
        // Update game status
        this.#updateGameStatus();
        
        // Switch player if game continues
        if (this.#gameStatus === TicTacToe.GAME_STATUSES.ONGOING) {
            this.#switchPlayer();
        }
        
        return {
            success: true,
            move: { ...moveRecord },
            gameStatus: this.#gameStatus,
            winner: this.#winner,
            winningLine: this.winningLine,
            isGameOver: this.isGameOver
        };
    }

    #updateGameStatus() {
        const winResult = this.#checkWin();
        
        if (winResult.hasWin) {
            this.#gameStatus = TicTacToe.GAME_STATUSES.FINISHED;
            this.#winner = winResult.winner;
            this.#winningLine = winResult.line;
            return;
        }
        
        if (this.#countEmptyCells() === 0) {
            this.#gameStatus = TicTacToe.GAME_STATUSES.DRAW;
            this.#winner = null;
            this.#winningLine = null;
            return;
        }
        
        this.#gameStatus = TicTacToe.GAME_STATUSES.ONGOING;
        this.#winner = null;
        this.#winningLine = null;
    }

    #checkWin() {
        const size = this.#config.boardSize;
        const winLength = this.#config.winLength;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const player = this.#board[row][col];
                if (!player) continue;

                for (const [dRow, dCol] of TicTacToe.DIRECTIONS) {
                    const line = this.#getLine(row, col, dRow, dCol, winLength);
                    if (line.length === winLength && 
                        line.every(pos => this.#board[pos.row][pos.col] === player)) {
                        return { hasWin: true, winner: player, line };
                    }
                }
            }
        }
        
        return { hasWin: false };
    }

    #getLine(startRow, startCol, dRow, dCol, length) {
        const line = [];
        const size = this.#config.boardSize;
        
        for (let i = 0; i < length; i++) {
            const row = startRow + i * dRow;
            const col = startCol + i * dCol;
            
            if (row < 0 || row >= size || col < 0 || col >= size) {
                break;
            }
            
            line.push({ row, col });
        }
        
        return line;
    }

    #switchPlayer() {
        const currentIndex = this.#config.players.indexOf(this.#currentPlayer);
        const nextIndex = (currentIndex + 1) % this.#config.players.length;
        this.#currentPlayer = this.#config.players[nextIndex];
    }

    #toAlgebraic(row, col) {
        const colLetter = String.fromCharCode(97 + col);
        const rowNumber = row + 1;
        return `${colLetter}${rowNumber}`;
    }

    #fromAlgebraic(algebraic) {
        if (typeof algebraic !== 'string' || algebraic.length < 2) {
            throw new InvalidMoveError('Invalid algebraic notation format');
        }

        const colChar = algebraic.charAt(0).toLowerCase();
        const rowStr = algebraic.slice(1);

        if (colChar < 'a' || colChar > 'z') {
            throw new InvalidMoveError('Column must be a letter (a-z)');
        }

        const col = colChar.charCodeAt(0) - 97;
        const row = parseInt(rowStr, 10) - 1;

        if (!Number.isInteger(row) || row < 0) {
            throw new InvalidMoveError('Row must be a positive integer');
        }

        const size = this.#config.boardSize;
        if (col >= size || row >= size) {
            throw new InvalidMoveError(`Position ${algebraic} is outside ${size}×${size} board`);
        }

        return { row, col };
    }

    #countEmptyCells() {
        return this.#board.flat().filter(cell => cell === null).length;
    }

    #getPlayerCounts() {
        const counts = {};
        this.#config.players.forEach(player => {
            counts[player] = 0;
        });

        this.#board.flat().forEach(cell => {
            if (cell !== null && cell in counts) {
                counts[cell]++;
            }
        });

        return counts;
    }

    #validateImportedState() {
        const size = this.#config.boardSize;
        
        // Validate board dimensions
        if (!Array.isArray(this.#board) || this.#board.length !== size) {
            throw new ConfigurationError('Invalid board dimensions');
        }

        for (const row of this.#board) {
            if (!Array.isArray(row) || row.length !== size) {
                throw new ConfigurationError('Invalid board row dimensions');
            }
        }

        // Validate current player
        if (!this.#config.players.includes(this.#currentPlayer)) {
            throw new ConfigurationError('Invalid current player');
        }

        // Validate game status
        if (!Object.values(TicTacToe.GAME_STATUSES).includes(this.#gameStatus)) {
            throw new ConfigurationError('Invalid game status');
        }
    }
}
