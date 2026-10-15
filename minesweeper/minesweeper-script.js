const BOARD_SIZE = 9;
const boardElement = document.getElementById("board");
let boardData = [];
const TOTAL_MINES = 10;
const boom = new Audio('../sfx/vine-boom.mp3');

function createBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        let currentRow = [];
        
        for (let col = 0; col < BOARD_SIZE; col++) {
            let cellData = {
                row: row,
                col: col,
                isMine: false,
                neighborMines: 0,
                isRevealed: false
            };
            currentRow.push(cellData);

            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;

            boardElement.appendChild(cellElement);
        }
        boardData.push(currentRow);
    }
}

function plantMines() {
    let minesPlanted = 0;

    while (minesPlanted < TOTAL_MINES) {
        let randomRow = Math.floor(Math.random() * BOARD_SIZE);
        let randomCol = Math.floor(Math.random() * BOARD_SIZE);

        let cell = boardData[randomRow][randomCol];
        if (!cell.isMine) {
            cell.isMine = true;
            minesPlanted++;
        }
    }
}

function calculateNeighborMines() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            let cell = boardData[row][col];
            
            if (cell.isMine) continue;

            let mineCount = 0;

            for (let rOffset = -1; rOffset <= 1; rOffset++) {
                for (let cOffset = -1; cOffset <= 1; cOffset++) {
                    let neighborRow = row + rOffset;
                    let neighborCol = col + cOffset;

                    if (
                        neighborRow >= 0 && neighborRow < BOARD_SIZE &&
                        neighborCol >= 0 && neighborCol < BOARD_SIZE &&
                        !(rOffset === 0 && cOffset === 0)
                    ) {
                        if (boardData[neighborRow][neighborCol].isMine) {
                            mineCount++;
                        }
                    }
                }
            }
            cell.neighborMines = mineCount;
        }
    }
}

function setupEventListeners() {
    document.querySelectorAll(".cell").forEach(cellElement => {
        let row = parseInt(cellElement.dataset.row);
        let col = parseInt(cellElement.dataset.col);

        // 1. Regular left-click to reveal
        cellElement.addEventListener("click", () => {
            revealCell(row, col);
        });

        // 2. Right-click to flag
        cellElement.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // Stops the browser's right-click menu from popping up!
            toggleFlag(row, col);
        });
    });
}

function revealCell(row, col) {
    let cell = boardData[row][col];

    if (cell.isRevealed) return;

    cell.isRevealed = true;

    const cellElement = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cellElement.classList.add("revealed");

    if (cell.isMine) {
        boom.play();
        cellElement.textContent = "🖕";
        cellElement.style.backgroundColor = "#ffcccc";
        // alert("Game Over! You hit a mine.");
    } else if (cell.neighborMines > 0) {
        cellElement.textContent = cell.neighborMines;
    } else {
        // if 0, we reuse the logic of calculate neighbor mines 
        for (let rOffset = -1; rOffset <= 1; rOffset++) {
            for (let cOffset = -1; cOffset <= 1; cOffset++) {
                let neighborRow = row + rOffset;
                let neighborCol = col + cOffset;

                // Make sure the neighbor is inside the board boundaries
                if (
                    neighborRow >= 0 && neighborRow < BOARD_SIZE &&
                    neighborCol >= 0 && neighborCol < BOARD_SIZE
                ) {
                    // Recursively reveal the neighbor
                    revealCell(neighborRow, neighborCol);
                }
            }
        }
    }
}

function toggleFlag(row, col) {
    let cell = boardData[row][col];
    const cellElement = document.querySelector(`[data-row='${row}'][data-col='${col}']`);

    if (!cell.isRevealed) {
        if (!cell.isFlagged) {
            cellElement.textContent = "🚩";
            cell.isFlagged = true;
        }

        else if (cell.isFlagged) {
            cellElement.textContent = "";
            cell.isFlagged = false;
        }
    }
}

const resetBtn = document.getElementById("reset-btn");
function resetGame() {
    // 1. Clear the visual board elements from the HTML container
    boardElement.innerHTML = "";

    // 2. Clear the data array completely
    boardData = [];

    // 3. Re-run your full setup sequence
    createBoard();
    plantMines();
    calculateNeighborMines();
    setupEventListeners();
}
resetBtn.addEventListener("click", resetGame);

// Initialization sequence
createBoard();
plantMines();
calculateNeighborMines();
setupEventListeners();
console.log(boardData);