import { GoogleGenAI } from "@google/genai";
import { Board } from "../types";

const initializeGenAI = () => {
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const boardToString = (board: Board): string => {
  return board.map(row => 
    row.map(cell => {
      if (cell.isRevealed) {
        return cell.isMine ? 'P' : cell.neighborCount.toString();
      }
      if (cell.isFlagged) return 'F';
      return '?';
    }).join(' ')
  ).join('\n');
};

export const getAiHint = async (board: Board, minesRemaining: number): Promise<string> => {
  const ai = initializeGenAI();
  if (!ai) return "Error: API Key not configured.";

  const boardStr = boardToString(board);
  
  const prompt = `
    You are a helpful AI assistant for a game called "Peach Sweeper" (a cuter version of Minesweeper). 
    Analyze the current board state below.
    
    Legend:
    '?' = Unrevealed soil
    'F' = Flagged spot (suspected hidden Peach)
    '0'-'8' = Revealed spot showing how many Peaches are neighbors
    'P' = A revealed Peach (Game Over state)

    Current Peaches Hidden: ${minesRemaining}

    Board Grid:
    ${boardStr}

    Task:
    Identify ONE safe spot to dig (reveal) next.
    If you are 100% sure where a hidden Peach is, tell the user to flag it.
    
    Coordinate system: Top-left is (0,0). x is column, y is row.
    Style: Be cute, encouraging, and concise. Use peach-related puns if appropriate.
    Example: "Dig at row 3, col 5, it looks safe!" or "I smell a peach at row 2, col 1! Flag it!"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble seeing the orchard right now. Trust your instincts!";
  }
};