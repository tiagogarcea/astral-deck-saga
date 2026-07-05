// Áudio gerado via Web Audio API — sem arquivos externos
// Guard: só executa no browser (não quebra SSR/build do Lovable)
const isBrowser = typeof window !== 'undefined';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!isBrowser) return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  return ctx;
}

function beep(freq: number, dur: number, vol = 0.3, type: OscillatorType = 'sine', delay = 0) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    const t = c.currentTime + delay;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  } catch { /* noop */ }
}

function noise(dur: number, vol = 0.15, delay = 0) {
  const c = getCtx();
  if (!c) return;
  try {
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    src.connect(gain); gain.connect(c.destination);
    const t = c.currentTime + delay;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.start(t); src.stop(t + dur + 0.01);
  } catch { /* noop */ }
}

export const sfx = {
  click()    { beep(440, 0.04, 0.2, 'sine', 0); beep(660, 0.05, 0.2, 'sine', 0.05); },
  card() {
    // impacto surdo de carta (thud grave + ruído de papel)
    noise(0.06, 0.28, 0);        // burst de ruído inicial (papel)
    beep(180, 0.12, 0.3, 'sine', 0);   // grave surdo
    beep(320, 0.06, 0.15, 'sine', 0.01); // harmônico leve
    noise(0.08, 0.12, 0.06);     // cauda de papel
  },
  win()      { beep(523, 0.12, 0.35, 'sine', 0); beep(659, 0.12, 0.35, 'sine', 0.14); beep(784, 0.28, 0.4, 'sine', 0.28); },
  lose()     { beep(392, 0.14, 0.3, 'sine', 0); beep(330, 0.14, 0.3, 'sine', 0.16); beep(262, 0.3, 0.35, 'sine', 0.32); },
  turnLose() { beep(220, 0.18, 0.35, 'square', 0); beep(110, 0.18, 0.2, 'sawtooth', 0); },
  initGlobalClickSfx() {
    if (!isBrowser) return;
    document.addEventListener('click', (e) => {
      const el = e.target as HTMLElement;
      if (el.closest('button') || el.closest('[role="button"]')) sfx.click();
    }, { passive: true });
  },
};
