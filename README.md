# Connect Four

My Connect Four AI project for CPSC-481 at CSUF.

Uses Minimaxing with Alpha-Beta Pruning (max depth: 4) to find optimal play.

# App.tsx

All of the logic is contained in this file. The logic can be broken up into groups of functions and constants.

## Game Board

`numColumns` and `numRows` are used in conjunction to represent the size of the game board.
`gameBoard` is used to represent the borard itself, which is an array of arrays. These arrays represent each column of the board and contain numbers which stand for an empty space, the player's piece, or the AI's piece.

## Pieces, Current Player, and Winner

`empty`, `human`, and `ai` are integers representing what they are named as. `currentPlayer` keeps track of which player's turn it is, and `gameWonBy` keeps track of whether the game has been won by either the player or the AI.

## Constants

`positiveInfinity` and `negativeInfinity` are used in the Minimax algorithm, as is `maxSearchDepth`.

## AI Functions

There are several functions which are used by the AI to determine where to place the next piece, many of which are self-descriptive. These include `isUnfilled`, `getValidColumns`, `getEmptySpace`, and `placePiece`.

`evaluateWindow` is used to determine the utility of placing a piece in a given "window" of the board while `scorePosition` uses this function to evaluate all possible "windows" of the board given the current state and whether it is analyzing for the player or for the AI.

`isWinningMove` and `isTerminalNode` are used together to determine whether a possible path leads to a winning move for either player or ends in a draw.

Finally, `minimax` is an implementation of the Minimax algorithm with Alpha-Beta Pruning, utilizing all of the above functions when evaluating utility.

## Miscellaneous

The rest of the functions, including `checkWin`, `placeAi`, `handleClick`, are used in the functionality of the game.

Following this is the HTML of the game.
