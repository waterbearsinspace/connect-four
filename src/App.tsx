import { useState } from "react";
import "./App.css";
import confetti from "canvas-confetti";

type board = number[][];

function App() {
  // game board
  const numColumns = 7;
  const numRows = 6;
  const [gameBoard, setGameBoard] = useState<board>([
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ]);

  // pieces, current player, and winner
  const empty = 0;
  const human = 1;
  const ai = 2;
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [gameWonBy, setGameWonBy] = useState<number | null>(null);

  // constants
  const positiveInfinity = 9999999;
  const negativeInfinity = -9999999;
  const maxSearchDepth = 4;

  // =================================
  // START AI SECTION
  // =================================

  // check if a column is unfilled
  function isUnfilled(column: number[]) {
    return column[numRows - 1] == empty;
  }

  // get all unfilled columns
  function getValidColumns(board: board) {
    let validColumns = [];

    if (!board) return [];

    for (let i = 0; i < numColumns; i++) {
      if (isUnfilled(board[i])) {
        validColumns.push(i);
      }
    }
    return validColumns;
  }

  // get the lowest empty space of a column
  function getEmptySpace(column: number[]) {
    return column.findIndex((space) => {
      return space == empty;
    });
  }

  // place a given player's piece in a given column
  function placePiece(board: board, player: number, pieceColIndex: number) {
    if (isUnfilled(board[pieceColIndex])) {
      board = board.map((column, colIndex) => {
        return colIndex == pieceColIndex
          ? column.map((row, rowIndex) => {
              return rowIndex == getEmptySpace(column) ? player : row;
            })
          : column;
      });
    }
    return board;
  }

  // evaluate possible moves of window
  function evaluateWindow(window: number[], player: number) {
    let score = 0;

    // switch scoring based on turn
    let opponent = human;
    if (player == human) {
      opponent = ai;
    }

    // winning move
    if (
      window.filter((piece) => {
        return piece == player;
      }).length == 4
    ) {
      score = score + 100;
    }

    // three in a row
    else if (
      window.filter((piece) => {
        return piece == player;
      }).length == 3 &&
      window.filter((piece) => {
        return piece == empty;
      }).length == 1
    ) {
      score = score + 5;
    }

    // two in a row
    else if (
      window.filter((piece) => {
        return piece == player;
      }).length == 2 &&
      window.filter((piece) => {
        return piece == empty;
      }).length == 2
    ) {
      score = score + 2;
    }

    // block opponent's winning move
    if (
      window.filter((piece) => {
        return piece == opponent;
      }).length == 3 &&
      window.filter((piece) => {
        return piece == empty;
      }).length == 1
    ) {
      score = score - 4;
    }

    return score;
  }

  // score the current position for the player
  function scorePosition(board: board, player: number) {
    // evaluated score
    let score = 0;

    // score the center column
    const centerColumn = board[Math.floor(numColumns / 2)];
    let centerPieces = centerColumn.filter((piece) => {
      return piece == player;
    }).length;
    score = score + centerPieces * 3;

    // score horizontal positions
    // for each row
    for (let i = 0; i < numRows; i++) {
      // get the row
      let row = board.map((column) => {
        return column[i];
      });
      // check possible windows in the row and add to score
      for (let j = 0; j < numColumns - 3; j++) {
        let window = [row[j], row[j + 1], row[j + 2], row[j + 3]];
        score = score + evaluateWindow(window, player);
      }
    }

    // score vertical positions
    // for each column
    for (let i = 0; i < numColumns; i++) {
      // get the column
      let column = board[i];
      // check possible windows in the column and add to score
      for (let j = 0; j < numRows - 3; j++) {
        let window = [column[j], column[j + 1], column[j + 2], column[j + 3]];
        score = score + evaluateWindow(window, player);
      }
    }

    // score upward diagonals
    // for each row
    for (let i = 0; i < numColumns - 3; i++) {
      for (let j = 0; j < numRows - 3; j++) {
        let window = [
          board[i][j],
          board[i + 1][j + 1],
          board[i + 2][j + 2],
          board[i + 3][j + 3],
        ];
        score = score + evaluateWindow(window, player);
      }
    }

    // score downward diagonals
    // for each row
    for (let i = 0; i < numColumns - 3; i++) {
      for (let j = 3; j < numRows; j++) {
        let window = [
          board[i][j],
          board[i + 1][j - 1],
          board[i + 2][j - 2],
          board[i + 3][j - 3],
        ];
        score = score + evaluateWindow(window, player);
      }
    }

    return score;
  }

  // check if a move leads to a win for the player
  function isWinningMove(board: board, player: number) {
    // check horizontal positions
    // for each row
    for (let i = 0; i < numRows; i++) {
      // get the row
      let row = board.map((column) => {
        return column[i];
      });
      // check possible windows in the row and add to score
      for (let j = 0; j < numColumns - 3; j++) {
        let window = [row[j], row[j + 1], row[j + 2], row[j + 3]];
        if (
          window.filter((piece) => {
            return piece == player;
          }).length == 4
        ) {
          return true;
        }
      }
    }

    // check vertical positions
    // for each column
    for (let i = 0; i < numColumns; i++) {
      // get the column
      let column = board[i];
      // check possible windows in the column and add to score
      for (let j = 0; j < numRows - 3; j++) {
        let window = [column[j], column[j + 1], column[j + 2], column[j + 3]];
        if (
          window.filter((piece) => {
            return piece == player;
          }).length == 4
        ) {
          return true;
        }
      }
    }

    // check upward diagonals
    // for each row
    for (let i = 0; i < numColumns - 3; i++) {
      for (let j = 0; j < numRows - 3; j++) {
        let window = [
          board[i][j],
          board[i + 1][j + 1],
          board[i + 2][j + 2],
          board[i + 3][j + 3],
        ];
        if (
          window.filter((piece) => {
            return piece == player;
          }).length == 4
        ) {
          return true;
        }
      }
    }

    // check downward diagonals
    // for each row
    for (let i = 0; i < numColumns - 3; i++) {
      for (let j = 3; j < numRows; j++) {
        let window = [
          board[i][j],
          board[i + 1][j - 1],
          board[i + 2][j - 2],
          board[i + 3][j - 3],
        ];
        if (
          window.filter((piece) => {
            return piece == player;
          }).length == 4
        ) {
          return true;
        }
      }
    }

    // no winning move
    return false;
  }

  // check if a move leads to the end of the game or there are no more moves left
  function isTerminalNode(board: board) {
    return (
      isWinningMove(board, human) ||
      isWinningMove(board, ai) ||
      getValidColumns(board).length == 0
    );
  }

  // minimax algorithm
  function minimax(
    board: board,
    depth: number,
    alpha: number,
    beta: number,
    isMaxPlayer: boolean
  ) {
    let validColumns = getValidColumns(board);

    let isTerminal = isTerminalNode(board);

    // done searching due to depth limit or end of game
    if (depth == 0 || isTerminal) {
      if (isTerminal) {
        // ai win
        if (isWinningMove(board, ai)) {
          return [null, positiveInfinity];
        } // human win
        else if (isWinningMove(board, human)) {
          return [null, negativeInfinity];
        } // no more moves
        else {
          return [null, 0];
        }
      }
      // return ai's score
      else {
        return [null, scorePosition(board, ai)];
      }
    }

    // maximizing player
    if (isMaxPlayer) {
      let value = negativeInfinity;

      // random column start
      let column =
        validColumns[Math.floor(Math.random() * validColumns.length)];
      for (let i = 0; i < validColumns.length; i++) {
        let boardCopy = [...board];
        boardCopy = placePiece(boardCopy, ai, validColumns[i]);
        let newScore = minimax(boardCopy, depth - 1, alpha, beta, false)![1];
        if (newScore! > value) {
          value = newScore!;
          column = validColumns[i];
        }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) {
          break;
        }
      }
      return [column, value];
    }

    // minimizing player
    else {
      let value = positiveInfinity;

      // random column start
      let column =
        validColumns[Math.floor(Math.random() * validColumns.length)];
      for (let i = 0; i < validColumns.length; i++) {
        let boardCopy = [...board];
        boardCopy = placePiece(boardCopy, human, validColumns[i])!;
        let newScore = minimax(boardCopy, depth - 1, alpha, beta, true)![1];
        if (newScore! < value) {
          value = newScore!;
          column = validColumns[i];
        }
        beta = Math.max(beta, value);
        if (alpha >= beta) {
          break;
        }
      }
      return [column, value];
    }
  }

  // =================================
  // END AI SECTION
  // =================================

  // check if anyone won, or if there was a draw
  function checkWin() {
    if (getValidColumns(gameBoard).length == 0) setGameWonBy(empty);
    else if (isWinningMove(gameBoard, human)) setGameWonBy(human);
    else if (isWinningMove(gameBoard, ai)) setGameWonBy(ai);

    if (
      getValidColumns(gameBoard).length == 0 ||
      isWinningMove(gameBoard, human) ||
      isWinningMove(gameBoard, ai)
    ) {
      confetti();
    }
  }

  // place the ai's calculated piece
  function placeAi() {
    setGameBoard(
      placePiece(
        gameBoard,
        ai,
        minimax(
          gameBoard,
          maxSearchDepth,
          negativeInfinity,
          positiveInfinity,
          true
        )[0]!
      )!
    );
  }

  // place the player's piece
  function handleClick(column: number) {
    if (!gameWonBy && isUnfilled(gameBoard[column]) && currentPlayer == human) {
      setGameBoard(
        placePiece(gameBoard, currentPlayer, column)
          ? placePiece(gameBoard, currentPlayer, column)!
          : gameBoard
      );
      setCurrentPlayer(ai);
    }
  }

  // calculate the ai's move
  if (currentPlayer == ai) {
    setTimeout(() => {
      placeAi();
      setCurrentPlayer(human);
    }, 600);
  }

  // display the current turn, or who won
  function getDisplayText() {
    if (gameWonBy == human) return "You Win!";
    else if (gameWonBy == ai) return "AI Wins!";
    else if (gameWonBy == empty) return "Draw!";
    else return currentPlayer == human ? "Your Turn" : "AI's Turn...";
  }

  // check if anyone has won yet
  if (!gameWonBy) {
    checkWin();
  }

  return (
    <div
      className={`game-wrapper ${
        gameWonBy == human ? "human-won" : gameWonBy == ai ? "ai-won" : ""
      }`}
    >
      <div className="background-wrapper">
        <div className="background"></div>
      </div>
      <div className="game">
        <p
          className={`display-text ${currentPlayer == human ? "human" : "ai"}`}
        >
          {getDisplayText()}
        </p>
        <div className="board">
          {gameBoard.map((column, index) => {
            return (
              <div
                className={`column ${isUnfilled(column) ? "" : "filled"} ${
                  gameWonBy || currentPlayer == ai ? "game-over" : ""
                }`}
                key={index}
                onClick={() => {
                  handleClick(index);
                }}
              >
                {column.map((space, index) => {
                  return (
                    <div className="space-wrapper" key={index}>
                      <div
                        className={`space ${
                          space == human ? "human" : space == ai ? "ai" : ""
                        }
                      ${
                        index == getEmptySpace(column) && !gameWonBy
                          ? "valid"
                          : ""
                      }
                      `}
                        key={index}
                      ></div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p>{}</p>
      </div>
    </div>
  );
}

export default App;
