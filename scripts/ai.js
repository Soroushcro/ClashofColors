//const fs = require('fs');

const maxTime = 30;
let startTime;

function minimaxDecision(state, player) {   
    startTime = Date.now();
    let bestMove = null;
    let bestValue = player === 'red' ? -Infinity : Infinity;

    const successors = getSuccessors(state, player);

    // console.log(`Player: ${player}, Successors: ${successors.length}`);

    //fs.writeFileSync('successors.json', JSON.stringify(successors));

    for (const { move, newState } of successors){
        const value = minimax(newState, 0, -Infinity, Infinity, player === 'red' ? 'blue' : 'red');
        console.log(`Move: ${move}, Value: ${value}`);
        if ((player === 'red' && value > bestValue) || (player === 'blue' && value < bestValue)) {
            bestValue = value;
            bestMove = move;
        }
    }

    //console.log(`Best Move: ${bestMove}, Best Value: ${bestValue}`);
    return bestMove;
}

function minimax(state, depth, alpha, beta, player) {
    if (Date.now() - startTime >= maxTime || isTerminal(state)) {
        return evaluate(state, player);
    }

    const successors = getSuccessors(state, player);
    let bestValue = player === 'red' ? -Infinity : Infinity;

    for (const { newState } of successors) {
        const eval = minimax(newState, depth + 1, alpha, beta, player === 'red' ? 'blue' : 'red');
        if (player === 'red') {
            bestValue = Math.max(bestValue, eval);
            alpha = Math.max(alpha, eval);
        } else {
            bestValue = Math.min(bestValue, eval);
            beta = Math.min(beta, eval);
        }
        if (beta <= alpha) {
            break;
        }
    }

    return bestValue;
}

function getSuccessors(state, player) {
    const successors = [];
    for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
            if (!state[i][j].player) {
                const newState = JSON.parse(JSON.stringify(state));
                newState[i][j].player = player;
                newState[i][j].points = 1;
                updateAdjacentBlocks(newState, i, j, player);
                successors.push({ move: [i, j], newState });
            }
        }
    }
    return successors;
}

function isTerminal(state) {
    return state.every(row => row.every(cell => cell.player));
}

function evaluate(state, player) {
    const scores = { red: 0, blue: 0 };
    const pieceWeight = 1;
    const yourpieceWeight = 3;
    const opponentpieceWeight = 10;
    const lockWeight = 75;

    state.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell.player == 'red') {
                updateAdjacentBlocks(state, i, j, cell.player);
                scores[cell.player] += cell.points * pieceWeight;
                let nc = neighbourCount(state, i, j);
                scores[cell.player] += nc == 2 ? lockWeight*cell.points : 0;
                scores[cell.player] += nc == 0 ? lockWeight*cell.points : 0;
                let {yourpieceValue, opponentpieceValue} = neighbourValue(state, i, j, cell.player);
                scores[cell.player] += yourpieceValue * yourpieceWeight;
                scores[cell.player] += opponentpieceValue * opponentpieceWeight;
            }
            else if (cell.player == 'blue') {
                updateAdjacentBlocks(state, i, j, cell.player);
                scores[cell.player] += cell.points * pieceWeight;
                let nc = neighbourCount(state, i, j);
                scores[cell.player] += nc == 2 ? -lockWeight*cell.points : 0;
                scores[cell.player] += nc == 0 ? -lockWeight*cell.points : 0;
                let {yourpieceValue, opponentpieceValue} = neighbourValue(state, i, j, cell.player);
                scores[cell.player] += yourpieceValue * yourpieceWeight;
                scores[cell.player] += opponentpieceValue * opponentpieceWeight;
            }
        });
    });

    //console.log(`Evaluating State: Player: ${player}, ScoreRed: ${scores.red}, ScoreBlue: ${scores.blue}`);
    return (scores.red - scores.blue)
}

function neighbourCount(state, row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let emptyCount = 0;

    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < state.length && newCol >= 0 && newCol < state[0].length) {
            if (!state[newRow][newCol].player) {
                emptyCount++;
            }
        }
    }
    return emptyCount;
}

function neighbourValue(state, row, col, player) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let opponentpieceValue = 0;
    let yourpieceValue = 0;

    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < state.length && newCol >= 0 && newCol < state[0].length) {
            if (state[newRow][newCol].player == player) {
                yourpieceValue+= state[newRow][newCol].points;
            }
            else if(state[newRow][newCol].player != player && state[newRow][newCol].player){
                opponentpieceValue+= state[newRow][newCol].points;
            }
        }
    }
    return {yourpieceValue, opponentpieceValue};
}

module.exports = {
    minimaxDecision,
    minimax,
    getSuccessors,
    updateAdjacentBlocks,
    isTerminal,
    evaluate,
    maxTime,
    neighbourCount
};
