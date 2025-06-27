import { Note, AudioContextRef } from '../types';

// Piano sample URLs from Freesound or similar free sources
// Using high-quality piano samples
const pianoSamples: { [key in Note]: string } = {
  'C': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // We'll use better samples
  'D': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'E': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'F': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'G': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'A': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'B': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
};

// Better approach: Use Web Audio API to create realistic piano tones
const noteFrequencies: { [key in Note]: number } = {
  'C': 261.63,  // Middle C
  'D': 293.66,
  'E': 329.63,
  'F': 349.23,
  'G': 392.00,
  'A': 440.00,
  'B': 493.88
};

// Store active audio sources to be able to stop them
let activeAudioSources: (OscillatorNode | AudioBufferSourceNode)[] = [];
let audioBuffers: { [key in Note]?: AudioBuffer } = {};

// Function to stop all active audio
export const stopAllAudio = () => {
  activeAudioSources.forEach(source => {
    try {
      source.stop();
    } catch (e) {
      // Source might already be stopped
    }
  });
  activeAudioSources = [];
};

// Create a more realistic piano sound using multiple harmonics
const createPianoTone = (
  audioContext: AudioContext,
  frequency: number,
  duration: number
): OscillatorNode[] => {
  const oscillators: OscillatorNode[] = [];
  const gainNode = audioContext.createGain();
  
  // Create multiple harmonics for a richer piano sound
  const harmonics = [
    { freq: frequency, gain: 0.8 },           // Fundamental
    { freq: frequency * 2, gain: 0.3 },       // 2nd harmonic
    { freq: frequency * 3, gain: 0.15 },      // 3rd harmonic
    { freq: frequency * 4, gain: 0.08 },      // 4th harmonic
    { freq: frequency * 5, gain: 0.04 },      // 5th harmonic
  ];
  
  harmonics.forEach(({ freq, gain }) => {
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    
    osc.type = 'triangle'; // Triangle wave for warmer sound
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    oscGain.gain.setValueAtTime(gain, audioContext.currentTime);
    
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    
    oscillators.push(osc);
  });
  
  gainNode.connect(audioContext.destination);
  
  // Piano-like envelope (quick attack, gradual decay)
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // Very quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.1); // Quick decay
  gainNode.gain.exponentialRampToValueAtTime(0.05, now + duration * 0.7); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release
  
  return oscillators;
};

// Play a single note with realistic piano sound
export const playNote = (
  audioContextRef: AudioContextRef, 
  note: Note, 
  duration: number = 1
) => {
  if (!audioContextRef.audioContext) return;
  
  const frequency = noteFrequencies[note];
  const oscillators = createPianoTone(audioContextRef.audioContext, frequency, duration);
  
  // Add all oscillators to active sources
  activeAudioSources.push(...oscillators);
  
  const now = audioContextRef.audioContext.currentTime;
  
  // Start all oscillators
  oscillators.forEach(osc => {
    osc.start(now);
    osc.stop(now + duration);
    
    // Remove from active sources when they stop
    osc.onended = () => {
      const index = activeAudioSources.indexOf(osc);
      if (index > -1) {
        activeAudioSources.splice(index, 1);
      }
    };
  });
};

// Play the C major scale
export const playScale = (
  audioContextRef: AudioContextRef,
  onComplete: () => void
) => {
  const notes: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  let index = 0;
  let timeoutId: NodeJS.Timeout;
  
  const playNextNote = () => {
    if (index < notes.length) {
      playNote(audioContextRef, notes[index], 0.6);
      index++;
      timeoutId = setTimeout(playNextNote, 700); // Slightly longer for piano sound
    } else {
      timeoutId = setTimeout(onComplete, 600);
    }
  };
  
  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
  
  playNextNote();
  return cleanup;
};

// Play the C major triad (Do-Mi-Sol-Mi-Do)
export const playTriad = (
  audioContextRef: AudioContextRef,
  onComplete: () => void
) => {
  const triadSequence: Note[] = ['C', 'E', 'G', 'E', 'C'];
  let index = 0;
  let timeoutId: NodeJS.Timeout;
  
  const playNextNote = () => {
    if (index < triadSequence.length) {
      playNote(audioContextRef, triadSequence[index], 0.6);
      index++;
      timeoutId = setTimeout(playNextNote, 700);
    } else {
      timeoutId = setTimeout(onComplete, 600);
    }
  };
  
  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
  
  playNextNote();
  return cleanup;
};