import React, { useState, useEffect, useRef } from 'react';
import { Music, Check, X, LogOut } from 'lucide-react';
import Piano from './Piano';
import Character from './Character';
import { Note, AudioContextRef } from '../types';
import { playScale, playNote, playTriad, stopAllAudio } from '../utils/audio';

interface GameScreenProps {
  playerName: string;
  difficulty: string;
  arduinoPort: any | null;
  onEndGame: (score: number, totalQuestions: number) => void;
  onExitGame: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  playerName, 
  difficulty, 
  arduinoPort, 
  onEndGame, 
  onExitGame 
}) => {
  const [score, setScore] = useState(0);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [status, setStatus] = useState<'initial' | 'playing' | 'guessing' | 'feedback'>('initial');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [round, setRound] = useState(1);
  const totalRounds = difficulty === 'easy' ? 5 : 10; // Both medium and hard are now 10 rounds
  const [message, setMessage] = useState('');
  const [availableNotes, setAvailableNotes] = useState<Note[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const audioContextRef = useRef<AudioContextRef>({ 
    audioContext: null, 
    oscillator: null,
    gainNode: null 
  });
  
  // Store cleanup functions for audio sequences
  const audioCleanupRef = useRef<(() => void) | null>(null);

  const allNotes: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const noteNames: { [key in Note]: string } = {
    'C': 'Do',
    'D': 'Re',
    'E': 'Mi',
    'F': 'Fa',
    'G': 'Sol',
    'A': 'La',
    'B': 'Si'
  };

  // Arduino pin to note mapping
  const pinToNote: { [key: number]: Note } = {
    2: 'C',  // Do
    3: 'D',  // Re
    4: 'E',  // Mi
    5: 'F',  // Fa
    6: 'G',  // Sol
    7: 'A',  // La
    8: 'B'   // Si
  };

  // Get available notes based on difficulty
  const getAvailableNotes = (difficulty: string): Note[] => {
    switch (difficulty) {
      case 'easy':
        return ['C', 'E', 'G']; // Do, Mi, Sol (triada)
      case 'medium':
        return ['C', 'E', 'F', 'G']; // Do, Mi, Fa, Sol
      case 'hard':
        return ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Todas las notas
      default:
        return ['C', 'E', 'G'];
    }
  };

  const initializeAudioContext = () => {
    if (!audioContextRef.current.audioContext) {
      audioContextRef.current.audioContext = new AudioContext();
      audioContextRef.current.gainNode = audioContextRef.current.audioContext.createGain();
      audioContextRef.current.gainNode.gain.value = 0.5;
      audioContextRef.current.gainNode.connect(audioContextRef.current.audioContext.destination);
    }
  };

  const initializeGame = () => {
    // Initialize Audio Context
    initializeAudioContext();
    
    // Set available notes based on difficulty
    const notes = getAvailableNotes(difficulty);
    setAvailableNotes(notes);
    
    setStatus('playing');
    
    if (difficulty === 'easy') {
      setMessage('Escuchando la tríada de Do Mayor (Do-Mi-Sol)...');
      // Play triad: Do-Mi-Sol-Mi-Do
      audioCleanupRef.current = playTriad(audioContextRef.current, () => {
        selectRandomNote(notes);
      });
    } else {
      setMessage('Escuchando la escala de Do Mayor...');
      // Play full scale
      audioCleanupRef.current = playScale(audioContextRef.current, () => {
        selectRandomNote(notes);
      });
    }
  };

  const selectRandomNote = (notes: Note[]) => {
    const randomIndex = Math.floor(Math.random() * notes.length);
    const note = notes[randomIndex];
    setCurrentNote(note);
    setStatus('guessing');
    setMessage(`¿Qué nota acabo de tocar?`);

    // Play the random note
    playNote(audioContextRef.current, note, 1);
  };

  const handleNoteGuess = (guessedNote: Note) => {
    if (status !== 'guessing') return;

    const isCorrect = guessedNote === currentNote;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setMessage(
      isCorrect
        ? `¡Correcto! Era ${noteNames[currentNote!]}`
        : `¡Incorrecto! Era ${noteNames[currentNote!]}, tú elegiste ${noteNames[guessedNote]}`
    );

    setStatus('feedback');

    // Actualiza el score correctamente usando función de actualización
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (round >= totalRounds) {
        // Llama a endGame con el score actualizado (sin sumar de nuevo)
        // Usamos el score más reciente, pero como setScore es asíncrono, calculamos el valor correcto:
        // Si fue correcto, sumamos 1 al score actual, si no, usamos el score actual.
        endGame(isCorrect ? score + 1 : score);
      } else {
        setRound(round + 1);
        setFeedback(null);
        setStatus('initial');
        setMessage('¡Prepárate para la siguiente nota!');
        setTimeout(() => initializeGame(), 1500);
      }
    }, 2500);
  };

  const replayCurrentNote = () => {
    if (currentNote && status === 'guessing') {
      playNote(audioContextRef.current, currentNote, 1);
    }
  };

  const replayScale = () => {
    if (status === 'guessing') {
      setMessage('Reproduciendo de nuevo...');
      if (difficulty === 'easy') {
        audioCleanupRef.current = playTriad(audioContextRef.current, () => {
          setMessage('¿Qué nota acabo de tocar?');
        });
      } else {
        audioCleanupRef.current = playScale(audioContextRef.current, () => {
          setMessage('¿Qué nota acabo de tocar?');
        });
      }
    }
  };

  const endGame = (finalScore?: number) => {
    // Stop any playing audio when game ends
    stopAllAudio();
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
    }
    // Usa el score correcto (si se pasa como argumento, úsalo; si no, usa el estado actual)
    onEndGame(finalScore !== undefined ? finalScore : score, totalRounds);
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    // Stop all audio immediately when confirming exit
    stopAllAudio();
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
    }
    onExitGame();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  // Handle Arduino input with audio feedback
  useEffect(() => {
    const handleArduinoData = (event: any) => {
      const { pin } = event.detail;
      const note = pinToNote[pin];
      
      if (note) {
        // Always play the note sound when Arduino button is pressed
        playNote(audioContextRef.current, note, 0.3);
        
        // Only process as guess if we're in guessing state and note is available
        if (status === 'guessing' && availableNotes.includes(note)) {
          handleNoteGuess(note);
        }
      }
    };

    if (arduinoPort) {
      window.addEventListener('arduinoData', handleArduinoData);
    }

    return () => {
      window.removeEventListener('arduinoData', handleArduinoData);
    };
  }, [status, currentNote, score, round, arduinoPort, availableNotes]);

  useEffect(() => {
    // Start the first round after a delay
    const timer = setTimeout(() => {
      initializeGame();
    }, 2000);
    return () => {
      clearTimeout(timer);
      // Clean up audio when component unmounts
      stopAllAudio();
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
      }
    };
  }, []);

  const getDifficultyDescription = () => {
    switch (difficulty) {
      case 'easy':
        return 'Tríada (Do-Mi-Sol)';
      case 'medium':
        return 'Escala parcial (Do-Mi-Fa-Sol)';
      case 'hard':
        return 'Escala completa (Do-Re-Mi-Fa-Sol-La-Si)';
      default:
        return 'Fácil';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 animate-fadeIn bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-indigo-700">{playerName}</h2>
            <p className="text-gray-600">Dificultad: {getDifficultyDescription()}</p>
            {arduinoPort && (
              <p className="text-sm text-green-600">🔌 Piano conectado</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg font-semibold">Ronda: {round}/{totalRounds}</p>
              <p className="text-lg font-semibold">Puntuación: {score}</p>
            </div>
            <button
              onClick={handleExitClick}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow transition-colors duration-300 flex items-center gap-2"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <Character 
            status={status} 
            feedback={feedback}
          />
          
          <div className="mt-4 text-center">
            <p className="text-lg font-medium mb-4">{message}</p>
            
            {status === 'guessing' && (
              <div className="space-y-3">
                <div className="flex gap-3 justify-center flex-wrap">
                  <button 
                    onClick={replayCurrentNote}
                    className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors shadow-md hover:shadow-lg"
                  >
                    🎵 Repetir nota
                  </button>
                  <button 
                    onClick={replayScale}
                    className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors shadow-md hover:shadow-lg"
                  >
                    🎼 {difficulty === 'easy' ? 'Repetir tríada' : 'Repetir escala'}
                  </button>
                </div>
                {arduinoPort && (
                  <div className="text-sm text-gray-600 space-y-1 bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800">🎛️ Piano conectado</p>
                    <p>Usa los botones físicos o haz clic en el piano</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Piano Interface */}
        <div className="mb-6">
          <Piano
            availableNotes={availableNotes}
            onNoteClick={handleNoteGuess}
            audioContextRef={audioContextRef}
            disabled={status !== 'guessing'}
            showLabels={difficulty !== 'hard'} // Hide labels in hard difficulty
          />
        </div>
        
        {/* Instructions */}
        {status === 'guessing' && (
          <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Instrucciones:</p>
            <p>Presiona las teclas del piano para seleccionar la nota que escuchaste</p>
            {availableNotes.length < 7 && (
              <p className="text-indigo-600 mt-1">
                
              </p>
            )}
            {difficulty === 'hard' && (
              <p className="text-red-600 mt-1">
                ¡Modo difícil! Las etiquetas de las notas están ocultas
              </p>
            )}
          </div>
        )}
        
        {feedback && (
          <div className={`mt-6 p-4 rounded-lg flex items-center justify-center ${
            feedback === 'correct' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {feedback === 'correct' ? (
              <Check className="mr-2\" size={20} />
            ) : (
              <X className="mr-2" size={20} />
            )}
            <span className="font-medium">
              {feedback === 'correct' ? '¡Respuesta correcta!' : '¡Respuesta incorrecta!'}
            </span>
          </div>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Salir del juego?</h3>
            <p className="text-gray-600 mb-6">Se perderá el progreso actual del juego.</p>
            <div className="flex space-x-3">
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
              >
                Sí, salir
              </button>
              <button
                onClick={cancelExit}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;