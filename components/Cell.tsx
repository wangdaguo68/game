import React from 'react';
import { Flag } from 'lucide-react';
import { CellData } from '../types';
import { NUMBER_COLORS } from '../constants';

interface CellProps {
  data: CellData;
  onClick: (x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, x: number, y: number) => void;
  gameEnded: boolean;
}

const Cell: React.FC<CellProps> = React.memo(({ data, onClick, onContextMenu, gameEnded }) => {
  const { isRevealed, isFlagged, isMine, neighborCount, x, y } = data;

  const handleClick = () => {
    if (!gameEnded) {
      onClick(x, y);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!gameEnded) {
      onContextMenu(e, x, y);
    }
  };

  // Base classes
  const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-bold select-none transition-all duration-200 rounded-lg m-[2px] shadow-sm";
  
  // Style determination
  let content = null;
  let className = baseClasses;

  if (isRevealed) {
    if (isMine) {
      // Squashed Peach: Darker pink/red background
      className += " bg-rose-300 border-2 border-rose-400 shadow-inner";
      content = <span className="text-xl sm:text-2xl animate-in zoom-in duration-300 filter drop-shadow-sm">🍑</span>;
    } else {
      // Revealed Soil: Light, clean background
      className += " bg-white/60 border border-rose-100/50";
      if (neighborCount > 0) {
        className += ` ${NUMBER_COLORS[neighborCount]}`;
        content = neighborCount;
      }
    }
  } else {
    // Unrevealed Soil: Pretty Rose/Pink buttons
    // Was: bg-slate-200
    // Now: Soft Pink gradient feel
    className += " cursor-pointer bg-rose-200 hover:bg-rose-100 active:bg-rose-300 border-b-4 border-rose-300 hover:border-rose-200 active:border-0 active:translate-y-1 transition-transform";
    
    if (isFlagged) {
      content = <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 fill-rose-600 drop-shadow-sm" />;
    }
  }

  return (
    <div
      className={className}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      role="button"
      aria-label={`Cell at ${x}, ${y}`}
    >
      {content}
    </div>
  );
});

export default Cell;