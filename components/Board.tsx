import React from 'react';
import { Board as BoardType } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: BoardType;
  onCellClick: (x: number, y: number) => void;
  onCellContext: (e: React.MouseEvent, x: number, y: number) => void;
  gameEnded: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, onCellContext, gameEnded }) => {
  if (!board || board.length === 0) {
    return null;
  }

  const rows = board.length;
  const cols = board[0].length;

  return (
    <div className="flex justify-center overflow-hidden w-full">
        <div className="overflow-auto custom-scrollbar max-w-full p-3 border border-slate-200 rounded-2xl bg-white shadow-xl">
            <div 
                className="grid"
                style={{ 
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
            {board.map((row) => 
                row.map((cell) => (
                <Cell 
                    key={`${cell.x}-${cell.y}`} 
                    data={cell} 
                    onClick={onCellClick} 
                    onContextMenu={onCellContext}
                    gameEnded={gameEnded}
                />
                ))
            )}
            </div>
        </div>
    </div>
  );
};

export default Board;