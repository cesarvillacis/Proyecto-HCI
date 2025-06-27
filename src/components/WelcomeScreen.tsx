import React, { useState } from 'react';
import { Music, Trophy } from 'lucide-react';
import ArduinoConnect from './ArduinoConnect';

interface WelcomeScreenProps {
  onStartGame: (name: string, difficulty: string, arduinoPort: any | null) => void;
  onShowHighScores: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame, onShowHighScores }) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [error, setError] = useState('');
  const [arduinoPort, setArduinoPort] = useState<any | null>(null);
  const [isArduinoConnected, setIsArduinoConnected] = useState(false);

  const handleArduinoConnection = (isConnected: boolean, port: any | null) => {
    setIsArduinoConnected(isConnected);
    setArduinoPort(port);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, introduce tu nombre');
      return;
    }
    onStartGame(name, difficulty, arduinoPort);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Music size={64} className="text-indigo-600" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Music size={12} className="text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          EarTrainer
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ¡Entrena tu oído y mejora tu percepción musical!
        </p>
        
        <ArduinoConnect onConnectionChange={handleArduinoConnection} />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Introduce tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Dificultad
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>¡Jugar!</span>
            </button>
            
            <button
              type="button"
              onClick={onShowHighScores}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Trophy size={18} />
              <span>Ver Puntuaciones</span>
            </button>
          </div>
        </form>
        
        {isArduinoConnected && (
          <div className="mt-4 text-center text-sm text-green-600">
            ✓ Arduino conectado - Puedes usar los botones físicos
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;