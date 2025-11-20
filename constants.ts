import { DifficultyLevel, DifficultyConfig } from './types';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.BEGINNER]: { rows: 9, cols: 9, mines: 10, label: 'Beginner' },
  [DifficultyLevel.INTERMEDIATE]: { rows: 16, cols: 16, mines: 40, label: 'Intermediate' },
  [DifficultyLevel.EXPERT]: { rows: 16, cols: 30, mines: 99, label: 'Expert' },
};

// Colors for numbers 1-8
export const NUMBER_COLORS = [
  'text-transparent', // 0
  'text-blue-500',    // 1
  'text-green-600',   // 2
  'text-red-500',     // 3
  'text-purple-600',  // 4
  'text-orange-600',  // 5
  'text-teal-600',    // 6
  'text-gray-800',    // 7
  'text-gray-500',    // 8
];
