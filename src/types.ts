export type GameState = 'welcome' | 'playing' | 'scores' | 'highScores';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Note = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface ScoreEntry {
  playerName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  difficulty: string;
  date: string;
  timestamp?: number; // Add optional timestamp to prevent duplicates
}

export interface AudioContextRef {
  audioContext: AudioContext | null;
  oscillator: OscillatorNode | null;
  gainNode: GainNode | null;
}

export interface ArduinoConnection {
  isConnected: boolean;
  port: any | null;
  error: string | null;
}