const board = document.getElementById('board');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const winnerEl = document.getElementById('winner');
const resetBtn = document.getElementById('resetBtn');
const size = 8;
let currentPlayer = 'blue';
let boardState = [];
const AI = require('../scripts/ai')

function initializeBoard() {
    board.innerHTML = '';
    winnerEl.textContent = '';
    resetBtn.style.display = 'none';
    for (let i = 0; i < size; i++) {
        boardState[i] = [];
        for (let j = 0; j < size; j++) {
            const block = document.createElement('div');
            block.className = 'block';
            block.dataset.row = i;
            block.dataset.col = j;
            block.dataset.points = 0;
            block.onclick = () => colorBlock(i, j);
            board.appendChild(block);
            boardState[i][j] = { player: null, points: 0 };
        }
    }
    setBlock(0, 0, 'red', 5);
    setBlock(size - 1, size - 1, 'red', 5);
    setBlock(0, size - 1, 'blue', 5);
    setBlock(size - 1, 0, 'blue', 5);
    updateScores();
    if (currentPlayer === 'red') {
        const [aiRow, aiCol] = AI.minimaxDecision(boardState, 'red');
        colorBlock(aiRow, aiCol);
    }
}

function setBlock(row, col, player, points) {
    const block = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    block.className = `blockcolored ${player}`;
    block.dataset.points = points;
    block.textContent = points;
    boardState[row][col] = { player, points };
}

function colorBlock(row, col) {
    const block = boardState[row][col];
    if (winnerEl.textContent) return;
    if (AI.neighbourCount(boardState,row,col) == 8) return; //need to implement another check for the blocks on the sides, if there isn't a colored block in their neighbours the game rules shouldn't allow the player to color that block.
    if (block.player && block.player !== currentPlayer) return;
    if (!block.player) {
        setBlock(row, col, currentPlayer, block.points + 1);
        updateAdjacentBlocks(row, col);
        switchPlayer();
        updateScores();
        if (currentPlayer === 'red') {
            const [aiRow, aiCol] = AI.minimaxDecision(boardState, 'red');
            colorBlock(aiRow, aiCol);
        }
    }
}

function updateAdjacentBlocks(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
            const adjBlock = boardState[newRow][newCol];
            if (adjBlock.player) {
                setBlock(newRow, newCol, currentPlayer, adjBlock.points + 1);
            }
        }
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
}

function updateScores() {
    let scoreRed = 0;
    let scoreBlue = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (boardState[i][j].player === 'red') {
                scoreRed += boardState[i][j].points;
            } else if (boardState[i][j].player === 'blue') {
                scoreBlue += boardState[i][j].points;
            }
        }
    }
    score1El.textContent = scoreRed;
    score2El.textContent = scoreBlue;
    let counter = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (boardState[i][j].player != null) {
                counter++;
                if (counter == 64){
                    checkWinner();
                    resetBtn.style.display = 'block';
                }
            }
        }
    }
}

function checkWinner() {
    const scoreRed = parseInt(score1El.textContent);
    const scoreBlue = parseInt(score2El.textContent);

    if (scoreRed === scoreBlue) {
        winnerEl.textContent = "It's a Draw!";
    } else {
        const winner = scoreRed > scoreBlue ? "AI" : "Human";
        winnerEl.textContent = `${winner} Wins!`;
    }
}

initializeBoard();