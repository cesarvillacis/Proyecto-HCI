import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Trash2 } from 'lucide-react';
import { ScoreEntry } from '../types';

interface HighScoresScreenProps {
  onBack: () => void;
}

const HighScoresScreen: React.FC<HighScoresScreenProps> = ({ onBack }) => {
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    // Get existing scores from localStorage
    const existingScores = localStorage.getItem('musicalEarHighScores');
    let scores: ScoreEntry[] = existingScores ? JSON.parse(existingScores) : [];
    
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
    
    setHighScores(scores);
  }, []);

  const clearHighScores = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todas las puntuaciones?')) {
      localStorage.removeItem('musicalEarHighScores');
      setHighScores([]);
    }
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Trophy size={32} className="text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-indigo-700">Mejores Puntuaciones</h1>
          </div>
          <div className="flex space-x-3">
            {highScores.length > 0 && (
              <button
                onClick={clearHighScores}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow transition-colors duration-300 flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span>Limpiar</span>
              </button>
            )}
            <button
              onClick={onBack}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow transition-colors duration-300 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              <span>Volver</span>
            </button>
          </div>
        </div>
        
        {highScores.length > 0 ? (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800">Nombre</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-indigo-800">Dificultad</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-indigo-800">Puntuación</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-indigo-800">%</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-indigo-800">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((entry, index) => (
                  <tr 
                    key={`${entry.playerName}-${entry.timestamp || entry.date}-${index}`}
                    className={`border-t border-gray-200 ${
                      index < 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && (index + 1)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{entry.playerName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(entry.difficulty)}`}>
                        {getDifficultyLabel(entry.difficulty)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{entry.score}/{entry.totalQuestions}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">{entry.percentage}%</td>
                    <td className="px-4 py-3 text-xs text-right text-gray-500">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay puntuaciones todavía</h3>
            <p className="text-gray-500">¡Juega tu primera partida para aparecer aquí!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighScoresScreen;