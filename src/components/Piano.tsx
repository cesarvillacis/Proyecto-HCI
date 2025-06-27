import React, { useState, useEffect, useRef } from 'react';
import { Note, AudioContextRef } from '../types';
import { playNote } from '../utils/audio';

interface PianoProps {
  availableNotes: Note[];
  onNoteClick: (note: Note) => void;
  audioContextRef: React.MutableRefObject<AudioContextRef>;
  disabled?: boolean;
  showLabels?: boolean; // New prop to control label visibility
}

const Piano: React.FC<PianoProps> = ({ 
  availableNotes, 
  onNoteClick, 
  audioContextRef,
  disabled = false,
  showLabels = true // Default to showing labels
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<Note>>(new Set());
  const pressTimeoutRef = useRef<{ [key in Note]?: NodeJS.Timeout }>({});

  const noteNames: { [key in Note]: string } = {
    'C': 'Do',
    'D': 'Re',
    'E': 'Mi',
    'F': 'Fa',
    'G': 'Sol',
    'A': 'La',
    'B': 'Si'
  };

  const allNotes: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  // Black keys positions (sharps/flats) - these are decorative only
  const blackKeyPositions = [
    { after: 'C', name: 'C#' }, // Between C and D
    { after: 'D', name: 'D#' }, // Between D and E
    // No black key between E and F
    { after: 'F', name: 'F#' }, // Between F and G
    { after: 'G', name: 'G#' }, // Between G and A
    { after: 'A', name: 'A#' }, // Between A and B
    // No black key between B and C
  ];

  const handleKeyPress = (note: Note) => {
    if (disabled || !availableNotes.includes(note)) return;

    // Visual feedback
    setPressedKeys(prev => new Set(prev).add(note));
    
    // Clear any existing timeout for this key
    if (pressTimeoutRef.current[note]) {
      clearTimeout(pressTimeoutRef.current[note]);
    }
    
    // Set timeout to release key
    pressTimeoutRef.current[note] = setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 200);

    // Play sound
    playNote(audioContextRef.current, note, 0.3);
    
    // Trigger game logic
    onNoteClick(note);
  };

  // Handle Arduino input for visual feedback
  useEffect(() => {
    const handleArduinoData = (event: any) => {
      const { pin } = event.detail;
      const pinToNote: { [key: number]: Note } = {
        2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'A', 8: 'B'
      };
      
      const note = pinToNote[pin];
      if (note && availableNotes.includes(note)) {
        // Visual feedback for Arduino input
        setPressedKeys(prev => new Set(prev).add(note));
        
        if (pressTimeoutRef.current[note]) {
          clearTimeout(pressTimeoutRef.current[note]);
        }
        
        pressTimeoutRef.current[note] = setTimeout(() => {
          setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(note);
            return newSet;
          });
        }, 200);
      }
    };

    window.addEventListener('arduinoData', handleArduinoData);
    return () => {
      window.removeEventListener('arduinoData', handleArduinoData);
      // Clear all timeouts
      Object.values(pressTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [availableNotes]);

  const getWhiteKeyStyle = (note: Note) => {
    const isPressed = pressedKeys.has(note);
    const isAvailable = availableNotes.includes(note);
    const isDisabled = disabled || !isAvailable;

    let baseClasses = "relative transition-all duration-150 transform select-none ";
    
    if (isDisabled) {
      baseClasses += "opacity-40 cursor-not-allowed ";
    } else {
      baseClasses += "cursor-pointer ";
    }

    // White key styling
    baseClasses += `
      bg-gradient-to-b from-white via-gray-50 to-gray-100 
      border-2 border-gray-300 
      rounded-b-lg 
      shadow-lg 
      hover:shadow-xl
      active:shadow-md
      flex flex-col items-center justify-end
      font-semibold text-gray-700
      min-h-[120px] md:min-h-[160px]
      px-2 py-3
      z-10
    `;

    if (isPressed && !isDisabled) {
      baseClasses += `
        bg-gradient-to-b from-gray-200 to-gray-300 
        transform translate-y-1 
        shadow-md
        border-gray-400
      `;
    } else if (!isDisabled) {
      baseClasses += "hover:bg-gradient-to-b hover:from-gray-50 hover:to-gray-200 ";
    }

    return baseClasses;
  };

  const getBlackKeyStyle = () => {
    return `
      absolute 
      bg-gradient-to-b from-gray-900 via-gray-800 to-black
      border border-gray-700
      rounded-b-md
      shadow-xl
      w-8 md:w-10
      h-16 md:h-20
      -translate-x-1/2
      z-20
      top-0
      cursor-default
      transition-all duration-150
    `;
  };

  const keyWidth = availableNotes.length <= 3 ? 80 : 
                  availableNotes.length <= 4 ? 70 : 60;

  return (
    <div className="flex justify-center items-end bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl">
      <div className="flex gap-1 relative">
        {allNotes.map((note, index) => {
          const isAvailable = availableNotes.includes(note);
          const isPressed = pressedKeys.has(note);
          const blackKeyAfter = blackKeyPositions.find(bk => bk.after === note);
          
          return (
            <div key={note} className="relative">
              {/* White Key */}
              <div
                className={getWhiteKeyStyle(note)}
                onClick={() => handleKeyPress(note)}
                style={{ width: `${keyWidth}px` }}
              >
                {/* Key highlight when pressed */}
                {isPressed && isAvailable && (
                  <div className="absolute inset-0 bg-blue-200 opacity-50 rounded-b-lg animate-pulse z-5" />
                )}
                
                {/* Note name - only show if showLabels is true */}
                {showLabels && (
                  <div className="relative z-10 text-center">
                    <div className={`text-lg md:text-xl font-bold ${
                      isAvailable ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {noteNames[note]}
                    </div>
                    <div className={`text-xs md:text-sm ${
                      isAvailable ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {note}
                    </div>
                  </div>
                )}

                {/* Availability indicator */}
                {isAvailable && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse z-10" />
                )}
              </div>

              {/* Black Key (decorative only) */}
              {blackKeyAfter && (
                <div
                  className={getBlackKeyStyle()}
                  style={{ 
                    right: `-${keyWidth/2 + 2}px`,
                  }}
                  title={`${blackKeyAfter.name} (decorativo)`}
                >
                  {/* Subtle highlight on black key */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gray-600 rounded-sm opacity-30" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Piano brand/label */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="text-white text-xs font-semibold opacity-70 tracking-wider">
          🎹 MUSICAL TRAINER PIANO
        </div>
      </div>

      {/* Piano reflection effect */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-900 to-transparent opacity-30 rounded-b-xl" />
    </div>
  );
};

export default Piano;