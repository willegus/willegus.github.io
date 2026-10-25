// Interaktiva gitarrsträngar: dra över dem så vibrerar de och spelar en ton.
// Ordningen följer tabulatur: ljusa E-strängen överst, tjocka E-strängen nederst.
(() => {
  const canvas = document.getElementById("strings");
  const ctx = canvas.getContext("2d");
  const soundBtn = document.getElementById("sound-toggle");

  const NOTES = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41]; // e B G D A E
  const strings = NOTES.map((freq, i) => ({ freq, width: 1 + i * 0.6, amp: 0, pos: 0.5, t: 0 }));

  let w = 0, h = 0, dpr = 1;
  let lastY = null;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const stringY = (i) => (h / (strings.length + 1)) * (i + 1);

  // --- Ljud (Karplus-Strong-syntes, låter som en knäppt sträng) ---
  let audio = null;
  let soundOn = true;
  const buffers = new Map();

  function ensureAudio() {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio = new AC();
    }
    if (audio.state === "suspended") audio.resume();
  }

  function pluckBuffer(freq) {
    if (buffers.has(freq)) return buffers.get(freq);
    const sr = audio.sampleRate;
    const len = Math.floor(sr * 3);
    const buf = audio.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const period = Math.round(sr / freq);
    for (let i = 0; i < period; i++) d[i] = Math.random() * 2 - 1;
    for (let i = period; i < len; i++) d[i] = 0.497 * (d[i - period] + d[i - period + 1]);
    buffers.set(freq, buf);
    return buf;
  }

  function playNote(freq, strength) {
    if (!soundOn || !audio || audio.state !== "running") return;
    const src = audio.createBufferSource();
    src.buffer = pluckBuffer(freq);
    const gain = audio.createGain();
    gain.gain.value = 0.15 + strength * 0.25;
    src.connect(gain).connect(audio.destination);
    src.start();
  }

  // --- Knäppa ---
  function pluck(i, x, strength, withSound = true) {
    const s = strings[i];
    s.amp = Math.min(14, 4 + strength * 10);
    s.pos = Math.min(0.9, Math.max(0.1, x / w));
    s.t = 0;
    if (withSound) playNote(s.freq, strength);
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (lastY !== null) {
      const speed = Math.min(1, Math.abs(y - lastY) / 30);
      strings.forEach((s, i) => {
        const sy = stringY(i);
        if ((lastY < sy && y >= sy) || (lastY > sy && y <= sy)) pluck(i, x, speed);
      });
    }
    lastY = y;
  }

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", (e) => {
    ensureAudio();
    lastY = e.clientY - canvas.getBoundingClientRect().top;
    // Ett klick nära en sträng knäpper den direkt
    strings.forEach((s, i) => {
      if (Math.abs(stringY(i) - lastY) < 10) pluck(i, e.clientX - canvas.getBoundingClientRect().left, 0.6);
    });
  });
  canvas.addEventListener("pointerleave", () => { lastY = null; });
  // Vilket klick som helst på sidan låser upp ljudet (webbläsare kräver det)
  document.addEventListener("pointerdown", ensureAudio, { once: true });

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊" : "🔇";
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    if (soundOn) ensureAudio();
  });

  // --- Rita ---
  function draw() {
    ctx.clearRect(0, 0, w, h);
    strings.forEach((s, i) => {
      const y = stringY(i);
      s.t += 1;
      s.amp *= 0.955;
      const wobble = s.amp > 0.05 ? s.amp * Math.sin(s.t * (0.6 + (5 - i) * 0.08)) : 0;
      const energy = Math.min(1, s.amp / 8);

      ctx.beginPath();
      ctx.moveTo(0, y);
      // Strängen böjs som en triangel med spetsen där den knäpptes
      ctx.quadraticCurveTo(s.pos * w, y + wobble * 2, w, y);
      ctx.lineWidth = s.width;
      ctx.strokeStyle = `rgba(${180 - energy * 120}, ${200 - energy * 60}, 255, ${0.35 + energy * 0.65})`;
      ctx.shadowColor = "rgba(59, 130, 246, 0.9)";
      ctx.shadowBlur = energy * 18;
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();

  // Ett tyst ackord-svep när sidan laddas, så man fattar att strängarna lever
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    strings.forEach((_, i) => setTimeout(() => pluck(i, w * 0.5, 0.7, false), 600 + i * 70));
  }
})();
