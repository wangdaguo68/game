import React from 'react';
import { Sparkles, Timer, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { DifficultyLevel } from '../types';

interface HeaderProps {
  difficulty: DifficultyLevel;
  setDifficulty: (d: DifficultyLevel) => void;
  minesLeft: number;
  timer: number;
  resetGame: () => void;
  onGetHint: () => void;
  isHintLoading: boolean;
  isMuted: boolean;
  toggleSound: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  difficulty, 
  setDifficulty, 
  minesLeft, 
  timer, 
  resetGame,
  onGetHint,
  isHintLoading,
  isMuted,
  toggleSound
}) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-rose-100 mb-6 w-full max-w-4xl mx-auto sticky top-4 z-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Title & Difficulty */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold text-rose-900 leading-none flex items-center gap-2 tracking-tight">
              <span>Peach Sweeper</span>
            </h1>
            <span className="text-xs text-rose-400 mt-1 font-bold uppercase tracking-wider">Don't Squash 'Em!</span>
          </div>
          
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="bg-rose-50 text-rose-800 text-sm font-bold py-2 px-3 rounded-xl border-2 border-rose-100 outline-none focus:border-rose-300 cursor-pointer hover:bg-rose-100 transition-colors"
          >
            <option value={DifficultyLevel.BEGINNER}>Beginner</option>
            <option value={DifficultyLevel.INTERMEDIATE}>Intermediate</option>
            <option value={DifficultyLevel.EXPERT}>Expert</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 bg-rose-50 px-6 py-2 rounded-2xl border border-rose-100/50 shadow-inner">
          <div className="flex items-center gap-2 text-rose-800" title="Peaches remaining">
            <span className="text-xl drop-shadow-sm">🍑</span>
            <span className="font-mono text-xl font-bold">{minesLeft}</span>
          </div>
          <div className="w-0.5 h-8 bg-rose-200/50"></div>
          <div className="flex items-center gap-2 text-rose-800">
            <Timer className="w-5 h-5 text-rose-400" />
            <span className="font-mono text-xl font-bold">{formatTime(timer)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={onGetHint}
            disabled={isHintLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-rose-100 hover:from-purple-200 hover:to-rose-200 text-purple-700 rounded-xl font-bold transition-all shadow-sm border border-purple-100 disabled:opacity-50"
            title="Ask Gemini AI for a hint"
          >
            <Sparkles className={`w-4 h-4 ${isHintLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isHintLoading ? 'Asking...' : 'AI Hint'}</span>
            <span className="sm:hidden">Hint</span>
          </button>

           <button
            onClick={toggleSound}
            className="flex-none flex items-center justify-center px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl font-medium transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={resetGame}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg shadow-rose-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Header;