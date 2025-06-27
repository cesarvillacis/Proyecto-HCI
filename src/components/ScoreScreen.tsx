import React, { useEffect, useState } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { ScoreEntry } from '../types';

interface ScoreScreenProps {
  playerName: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  onPlayAgain: () => void;
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({ 
  playerName, 
  score, 
  totalQuestions,
  difficulty,
  onPlayAgain 
}) => {
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
  const percentage = Math.round((score / totalQuestions) * 100);
  
  useEffect(() => {
    // Get existing scores from localStorage
    const existingScores = localStorage.getItem('musicalEarHighScores');
    let scores: ScoreEntry[] = existingScores ? JSON.parse(existingScores) : [];
    
    // Add current score with timestamp to avoid duplicates
    const newScore: ScoreEntry = {
      playerName,
      score,
      totalQuestions,
      percentage,
      difficulty,
      date: new Date().toLocaleString(),
      timestamp: Date.now() // Add unique timestamp
    };
    
    scores.push(newScore);
    
    // Sort by percentage (highest first), then by difficulty
    scores.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      // If same percentage, prioritize harder difficulties
      const difficultyOrder = { 'hard': 3, 'medium': 2, 'easy': 1 };
      return difficultyOrder[b.difficulty as keyof typeof difficultyOrder] - 
             difficultyOrder[a.difficulty as keyof typeof difficultyOrder];
    });
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('musicalEarHighScores', JSON.stringify(scores));
    
    // Update state
    setHighScores(scores);
  }, [playerName, score, totalQuestions, percentage, difficulty]);

  // Function to get appropriate message based on score percentage
  const getFeedbackMessage = () => {
    if (percentage === 100) return '¡Perfecto! Tienes un oído musical extraordinario.';
    if (percentage >= 90) return '¡Excelente! Tienes un oído musical extraordinario.';
    if (percentage >= 70) return '¡Muy bien! Tienes buen oído musical.';
    if (percentage >= 50) return 'Buen trabajo. Con más práctica mejorarás.';
    return 'Sigue practicando. El oído musical se desarrolla con tiempo.';
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Media';
      case 'hard': return 'Difícil';
      default: return diff;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Check if this is the current player's most recent score
  const isCurrentScore = (entry: ScoreEntry, index: number) => {
    return entry.playerName === playerName && 
           entry.score === score && 
           entry.difficulty === difficulty &&
           index === highScores.findIndex(s => 
             s.playerName === playerName && 
             s.score === score && 
             s.difficulty === difficulty &&
             s.date === entry.date
           );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex justify-center mb-6">
          <Trophy size={64} className="text-yellow-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          ¡Juego Terminado!
        </h1>
        
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 mb-6 text-center">
          <h2 className="text-xl font-semibold text-indigo-800 mb-1">Tu Puntuación</h2>
          <div className="text-4xl font-bold text-indigo-600 mb-2">{score}/{totalQuestions}</div>
          <div className="text-2xl font-bold mb-2">{percentage}%</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getDifficultyColor(difficulty)}`}>
            {getDifficultyLabel(difficulty)}
          </div>
          <p className="text-gray-700">{getFeedbackMessage()}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-indigo-800 mb-3">Mejores Puntuaciones</h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-indigo-800">#</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-indigo-800">Nombre</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-indigo-800">Dificultad</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-indigo-800">Puntuación</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-indigo-800">%</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((entry, index) => (
                  <tr 
                    key={`${entry.playerName}-${entry.timestamp || entry.date}-${index}`}
                    className={`border-t border-gray-200 ${
                      isCurrentScore(entry, index) ? 'bg-indigo-50 border-indigo-200' : ''
                    }`}
                  >
                    <td className="px-4 py-2 text-sm">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && (index + 1)}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">{entry.playerName}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(entry.difficulty)}`}>
                        {getDifficultyLabel(entry.difficulty)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">{entry.score}/{entry.totalQuestions}</td>
                    <td className="px-4 py-2 text-sm font-medium text-right">{entry.percentage}%</td>
                  </tr>
                ))}
                {highScores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-center text-gray-500">No hay puntuaciones todavía</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors duration-300"
          >
            <ArrowLeft size={18} className="mr-2" />
            Jugar Nuevamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreScreen;