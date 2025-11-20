
// Web Audio API Context
let audioCtx: AudioContext | null = null;
let isMuted = false;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuteState = () => isMuted;

// Generic oscillator function
const playTone = (freq: number, type: OscillatorType, duration: number, startTime = 0) => {
  if (isMuted) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

// Generate white noise for explosion
const createNoiseBuffer = () => {
  const ctx = getContext();
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

let noiseBuffer: AudioBuffer | null = null;

export const playClick = () => {
  // Crisp "tick" sound
  playTone(800, 'sine', 0.05);
};

export const playFlag = () => {
  // Lower "thud" sound
  playTone(300, 'triangle', 0.1);
};

export const playWin = () => {
  if (isMuted) return;
  // Major arpeggio
  const now = 0;
  playTone(523.25, 'sine', 0.2, now);       // C5
  playTone(659.25, 'sine', 0.2, now + 0.1); // E5
  playTone(783.99, 'sine', 0.4, now + 0.2); // G5
  playTone(1046.50, 'sine', 0.6, now + 0.3); // C6
};

export const playExplosion = () => {
  if (isMuted) return;
  const ctx = getContext();
  
  if (!noiseBuffer) {
    noiseBuffer = createNoiseBuffer();
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1);

  noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  noise.start();
  noise.stop(ctx.currentTime + 1);
};
