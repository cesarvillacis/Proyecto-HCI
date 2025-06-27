import React from 'react';
import { Music } from 'lucide-react';

interface CharacterProps {
  status: 'initial' | 'playing' | 'guessing' | 'feedback';
  feedback: 'correct' | 'incorrect' | null;
}

const Character: React.FC<CharacterProps> = ({ status, feedback }) => {
  let characterClass = "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center";
  let iconSize = 48;
  
  // Determine animation and color based on status
  switch (status) {
    case 'initial':
      characterClass += " bg-blue-100 text-blue-500";
      break;
    case 'playing':
      characterClass += " bg-indigo-100 text-indigo-600 animate-pulse";
      break;
    case 'guessing':
      characterClass += " bg-purple-100 text-purple-600";
      break;
    case 'feedback':
      if (feedback === 'correct') {
        characterClass += " bg-green-100 text-green-600";
      } else {
        characterClass += " bg-red-100 text-red-600";
      }
      break;
  }

  return (
    <div className="flex flex-col items-center">
      <div className={characterClass}>
        <Music size={iconSize} className={status === 'playing' ? 'animate-bounce' : ''} />
      </div>
      <div className="mt-3 text-center">
        <p className="text-lg font-medium">Maestro Musical</p>
      </div>
    </div>
  );
};

export default Character;