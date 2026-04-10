export const BOARD_SIZE = 10;
export const TOTAL_CELLS = 100;

export interface SnakeOrLadder {
  start: number;
  end: number;
  type: 'snake' | 'ladder';
}

export const SNAKES_AND_LADDERS: SnakeOrLadder[] = [
  // De-congested layout
  { start: 3, end: 15, type: 'ladder' },
  { start: 8, end: 29, type: 'ladder' },
  { start: 20, end: 42, type: 'ladder' },
  { start: 28, end: 77, type: 'ladder' },
  { start: 40, end: 60, type: 'ladder' },
  { start: 51, end: 67, type: 'ladder' },
  { start: 63, end: 81, type: 'ladder' },
  { start: 71, end: 91, type: 'ladder' },
  
  // Balanced Snakes
  { start: 17, end: 7, type: 'snake' },
  { start: 45, end: 25, type: 'snake' },
  { start: 54, end: 36, type: 'snake' },
  { start: 62, end: 19, type: 'snake' },
  { start: 87, end: 44, type: 'snake' },
  { start: 93, end: 73, type: 'snake' },
  { start: 95, end: 75, type: 'snake' },
  { start: 99, end: 78, type: 'snake' },
];

export const getCellCoords = (cellNumber: number) => {
  const zeroBasedIndex = cellNumber - 1;
  const row = Math.floor(zeroBasedIndex / 10);
  const isRowOdd = row % 2 !== 0;
  
  let col;
  if (isRowOdd) {
    col = 9 - (zeroBasedIndex % 10);
  } else {
    col = zeroBasedIndex % 10;
  }
  
  return { row, col };
};

export const getCellColor = (cellNumber: number) => {
  const { row, col } = getCellCoords(cellNumber);
  return (row + col) % 2 === 0 ? 'cell-gradient-even' : 'cell-gradient-odd';
};

export const findSnakeOrLadder = (cell: number) => {
  return SNAKES_AND_LADDERS.find(sl => sl.start === cell);
};