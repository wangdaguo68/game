import React, { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel, GameState, Board as BoardType } from './types';
import { DIFFICULTY_CONFIGS } from './constants';
import { createEmptyBoard, placeMines, revealCell, toggleFlag, checkWin, revealAllMines } from './utils/gameLogic';
import { getAiHint } from './services/geminiService';
import { playClick, playFlag, playExplosion, playWin, toggleMute, getMuteState } from './utils/sound';
import Header from './components/Header';
import Board from './components/Board';
import { AlertCircle, Trophy, Frown } from 'lucide-react';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  
  // Initialize with a valid board to prevent render crashes before useEffect runs
  const [board, setBoard] = useState<BoardType>(() => {
    const config = DIFFICULTY_CONFIGS[DifficultyLevel.BEGINNER];
    return createEmptyBoard(config.rows, config.cols);
  });
  
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  
  // Initialize mines left based on default difficulty
  const [minesLeft, setMinesLeft] = useState(() => {
    return DIFFICULTY_CONFIGS[DifficultyLevel.BEGINNER].mines;
  });

  const [timer, setTimer] = useState(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  // Initialize Game
  const initGame = useCallback(() => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const newBoard = createEmptyBoard(config.rows, config.cols);
    setBoard(newBoard);
    setMinesLeft(config.mines);
    setGameState(GameState.IDLE);
    setTimer(0);
    setHintMessage(null);
  }, [difficulty]);

  // Effect: Init game on mount or difficulty change
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Effect: Timer
  useEffect(() => {
    let interval: number;
    if (gameState === GameState.PLAYING) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleToggleSound = () => {
    const newState = toggleMute();
    setIsMuted(newState);
  };

  // Handlers
  const handleCellClick = (x: number, y: number) => {
    if (gameState === GameState.WON || gameState === GameState.LOST) return;
    if (board[y][x].isFlagged) return;

    let currentBoard = board;
    let currentGameState = gameState;

    // First click logic: generate mines ensuring safety
    if (currentGameState === GameState.IDLE) {
      const config = DIFFICULTY_CONFIGS[difficulty];
      currentBoard = placeMines(board, config.rows, config.cols, config.mines, x, y);
      currentGameState = GameState.PLAYING;
      setGameState(GameState.PLAYING);
    }

    const { board: nextBoard, hitMine } = revealCell(currentBoard, x, y);

    if (hitMine) {
      playExplosion(); // Squish sound
      setBoard(revealAllMines(nextBoard));
      setGameState(GameState.LOST);
    } else {
      setBoard(nextBoard);
      const config = DIFFICULTY_CONFIGS[difficulty];
      if (checkWin(nextBoard, config.mines)) {
        playWin();
        setGameState(GameState.WON);
        setMinesLeft(0); // visual cleanup
      } else {
        playClick();
      }
    }
  };

  const handleCellContext = (e: React.MouseEvent, x: number, y: number) => {
    if (gameState === GameState.WON || gameState === GameState.LOST) return;
    // Start game if right clicking on idle
    if (gameState === GameState.IDLE) {
        setGameState(GameState.PLAYING);
    }

    const newBoard = toggleFlag(board, x, y);
    
    // Only play sound if something actually changed (cell wasn't revealed)
    if (!board[y][x].isRevealed) {
        playFlag();
        setBoard(newBoard);
        // Update mines left counter
        const cell = newBoard[y][x];
        setMinesLeft(prev => cell.isFlagged ? prev - 1 : prev + 1);
    }
  };

  const handleGetHint = async () => {
    if (gameState === GameState.WON || gameState === GameState.LOST) return;
    if (isHintLoading) return;

    playClick(); // Feedback for clicking button
    setIsHintLoading(true);
    setHintMessage(null);

    // First move hint
    if (gameState === GameState.IDLE) {
      setHintMessage("Start anywhere you like! The middle is usually a sweet spot.");
      setIsHintLoading(false);
      return;
    }

    const hint = await getAiHint(board, minesLeft);
    setHintMessage(hint);
    setIsHintLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-rose-100 text-slate-900 p-4 md:p-8 font-sans flex flex-col items-center selection:bg-rose-200">
      
      <Header 
        difficulty={difficulty} 
        setDifficulty={setDifficulty}
        minesLeft={minesLeft}
        timer={timer}
        resetGame={() => { playClick(); initGame(); }}
        onGetHint={handleGetHint}
        isHintLoading={isHintLoading}
        isMuted={isMuted}
        toggleSound={handleToggleSound}
      />

      {/* Hint Display */}
      {hintMessage && (
        <div className="mb-6 p-4 bg-white/90 backdrop-blur-md border border-purple-200 rounded-2xl shadow-lg flex items-start gap-3 max-w-2xl w-full animate-fade-in">
          <div className="bg-purple-100 p-1.5 rounded-full shrink-0">
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wide">Gemini AI Tip</h3>
            <p className="text-purple-900 text-base mt-0.5 leading-relaxed">{hintMessage}</p>
          </div>
          <button onClick={() => setHintMessage(null)} className="text-purple-300 hover:text-purple-600 transition-colors">
             &times;
          </button>
        </div>
      )}

      {/* Game Over / Win Banner */}
      {gameState === GameState.LOST && (
        <div className="mb-8 px-8 py-4 bg-rose-100 border-2 border-rose-200 text-rose-800 rounded-full flex items-center gap-3 font-bold animate-bounce-short shadow-lg shadow-rose-100 text-lg">
          <Frown className="w-6 h-6" /> Oh no! You squashed a peach!
        </div>
      )}
      {gameState === GameState.WON && (
        <div className="mb-8 px-8 py-4 bg-emerald-100 border-2 border-emerald-200 text-emerald-800 rounded-full flex items-center gap-3 font-bold animate-bounce-short shadow-lg shadow-emerald-100 text-lg">
          <Trophy className="w-6 h-6" /> Delicious! You found every peach!
        </div>
      )}

      <main className="w-full flex-1 flex flex-col items-center justify-start overflow-hidden pb-8">
         {/* Container for board */}
        <div className="p-1">
            <Board 
                board={board} 
                onCellClick={handleCellClick} 
                onCellContext={handleCellContext}
                gameEnded={gameState === GameState.WON || gameState === GameState.LOST}
            />
        </div>
      </main>

      <footer className="mt-auto py-6 text-rose-300 text-xs text-center font-semibold tracking-wider uppercase">
        <p>Made with 🍑 by React + Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;