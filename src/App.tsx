import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import ScoreScreen from './components/ScoreScreen';
import HighScoresScreen from './components/HighScoresScreen';
import Footer from './components/Footer';
import { GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [arduinoPort, setArduinoPort] = useState<any | null>(null);

  const startGame = (name: string, selectedDifficulty: string, port: any | null) => {
    setPlayerName(name);
    setDifficulty(selectedDifficulty);
    setArduinoPort(port);
    setScore(0);
    setTotalQuestions(0);
    setGameState('playing');
  };

  const endGame = (finalScore: number, finalTotalQuestions: number) => {
    setScore(finalScore);
    setTotalQuestions(finalTotalQuestions);
    setGameState('scores');
  };

  const returnToWelcome = () => {
    setGameState('welcome');
  };

  const showHighScores = () => {
    setGameState('highScores');
  };

  const exitGame = () => {
    setGameState('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 text-gray-800 font-sans flex flex-col">
      <div className="flex-1">
        {gameState === 'welcome' && (
          <WelcomeScreen onStartGame={startGame} onShowHighScores={showHighScores} />
        )}
        {gameState === 'playing' && (
          <GameScreen 
            playerName={playerName} 
            difficulty={difficulty} 
            arduinoPort={arduinoPort}
            onEndGame={endGame}
            onExitGame={exitGame}
          />
        )}
        {gameState === 'scores' && (
          <ScoreScreen 
            playerName={playerName} 
            score={score} 
            totalQuestions={totalQuestions}
            difficulty={difficulty}
            onPlayAgain={returnToWelcome}
          />
        )}
        {gameState === 'highScores' && (
          <HighScoresScreen onBack={returnToWelcome} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default App;