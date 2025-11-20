import { Board, CellData } from '../types';

// Directions for neighbors (N, NE, E, SE, S, SW, W, NW)
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export const createEmptyBoard = (rows: number, cols: number): Board => {
  const board: Board = [];
  for (let y = 0; y < rows; y++) {
    const row: CellData[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0,
      });
    }
    board.push(row);
  }
  return board;
};

export const placeMines = (
  board: Board, 
  rows: number, 
  cols: number, 
  mines: number, 
  safeX: number, 
  safeY: number
): Board => {
  const newBoard = JSON.parse(JSON.stringify(board));
  let minesPlaced = 0;

  while (minesPlaced < mines) {
    const randY = Math.floor(Math.random() * rows);
    const randX = Math.floor(Math.random() * cols);

    // Don't place mine on the first clicked cell or if there is already a mine
    if (
      !newBoard[randY][randX].isMine && 
      !(randX === safeX && randY === safeY)
    ) {
      newBoard[randY][randX].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor counts
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!newBoard[y][x].isMine) {
        let count = 0;
        DIRECTIONS.forEach(([dy, dx]) => {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && newBoard[ny][nx].isMine) {
            count++;
          }
        });
        newBoard[y][x].neighborCount = count;
      }
    }
  }

  return newBoard;
};

export const revealCell = (board: Board, x: number, y: number): { board: Board, hitMine: boolean } => {
  // Bounds check
  if (y < 0 || y >= board.length || x < 0 || x >= board[0].length) {
    return { board, hitMine: false };
  }

  const cell = board[y][x];

  // If already revealed or flagged, do nothing
  if (cell.isRevealed || cell.isFlagged) {
    return { board, hitMine: false };
  }

  // Deep copy board to treat immutable state
  const newBoard = [...board.map(row => [...row.map(c => ({...c}))])];
  const target = newBoard[y][x];
  
  target.isRevealed = true;

  if (target.isMine) {
    return { board: newBoard, hitMine: true };
  }

  // Flood fill if neighbor count is 0
  if (target.neighborCount === 0) {
    const queue = [[x, y]];
    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      
      DIRECTIONS.forEach(([dy, dx]) => {
        const ny = cy + dy;
        const nx = cx + dx;

        if (ny >= 0 && ny < newBoard.length && nx >= 0 && nx < newBoard[0].length) {
          const neighbor = newBoard[ny][nx];
          if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
            neighbor.isRevealed = true;
            // If this neighbor is also a 0, add to queue
            if (neighbor.neighborCount === 0) {
              queue.push([nx, ny]);
            }
          }
        }
      });
    }
  }

  return { board: newBoard, hitMine: false };
};

export const toggleFlag = (board: Board, x: number, y: number): Board => {
  const newBoard = [...board.map(row => [...row.map(c => ({...c}))])];
  const cell = newBoard[y][x];
  
  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }
  
  return newBoard;
};

export const checkWin = (board: Board, totalMines: number): boolean => {
  let revealedCount = 0;
  const rows = board.length;
  const cols = board[0].length;
  const totalCells = rows * cols;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x].isRevealed) {
        revealedCount++;
      }
    }
  }

  return revealedCount === (totalCells - totalMines);
};

// Reveal all mines when game is lost
export const revealAllMines = (board: Board): Board => {
  const newBoard = [...board.map(row => [...row.map(c => ({...c}))])];
  newBoard.forEach(row => {
    row.forEach(cell => {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    });
  });
  return newBoard;
};
