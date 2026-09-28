/* Little Star English – shared engine (data, sound, music, stars, stickers, celebrations) */
window.LS = (() => {
  "use strict";
  const A = window.ASSETS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const img = id => A.img[id];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- lesson content (from the class PDF) ---------- */
  const WORDS = [
    { id: "school",    en: "school",     vi: "trường học",  group: "s",     edge: "#ff4f9a", a: "a school" },
    { id: "scissors",  en: "scissors",   vi: "cái kéo",     group: "s",     edge: "#ff2d2d", a: "scissors" },
    { id: "snake",     en: "snake",      vi: "con rắn",     group: "s",     edge: "#a83232", a: "a snake" },
    { id: "tidyup",    en: "tidy up",    vi: "dọn dẹp",     group: "tidy",  edge: "#3aa0e8" },
    { id: "backpack",  en: "backpack",   vi: "cái ba lô",   group: "class", edge: "#ff4f9a", a: "a backpack" },
    { id: "book",      en: "book",       vi: "quyển sách",  group: "class", edge: "#ff2d2d", a: "a book" },
    { id: "chair",     en: "chair",      vi: "cái ghế",     group: "class", edge: "#a83232", a: "a chair" },
    { id: "crayon",    en: "crayon",     vi: "bút sáp màu", group: "class", edge: "#7a3a10", a: "a crayon" },
    { id: "gluestick", en: "glue stick", vi: "keo dán",     group: "class", edge: "#f07a10", a: "a glue stick" },
    { id: "pencil",    en: "pencil",     vi: "bút chì",     group: "class", edge: "#7cc02a", a: "a pencil" },
    { id: "table",     en: "table",      vi: "cái bàn",     group: "class", edge: "#1a8ac6", a: "a table" },
  ];
  const W = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const NOUNS = WORDS.filter(w => w.id !== "tidyup");
  const SUPPLIES = ["backpack", "book", "crayon", "gluestick", "pencil", "scissors"];

  const TEXT = {
    q_letter: "What letter is it?", a_letter: "Letter S.", q_sound: "What sound is it?", a_sound: "Sound", s_hiss: "sss",
    q_this: "What is this?", q_have: "What do you have?", tidy_intro: "Let's tidy up!", put_pens: "Put away the pens.",
    ok1: "Great job!", ok2: "Well done!", ok3: "Super!", no1: "Oops! Try again.", done: "All tidy! Good job!", listen: "Listen and find.",
    w_tidyup: "Tidy up!", pop_bubbles: "Pop the bubbles!", peekaboo: "Peekaboo!", find_shadow: "Find the shadow!",
    find_same: "Find the same picture!", pack_bag: "Pack your backpack!", go_school: "Let's go to school!",
    sticker: "You got a sticker!", hooray: "Hooray!", yay: "Yay!", tap_hear: "Tap and listen!",
  };
  NOUNS.forEach(w => {
    TEXT["w_" + w.id] = w.en;
    TEXT["this_" + w.id] = w.id === "scissors" ? "These are scissors." : `This is ${w.a}.`;
    TEXT["have_" + w.id] = `I have ${w.a}.`;
    TEXT["put_" + w.id] = `Put away the ${w.en}.`;
  });

  /* ---------- icons ---------- */
  const stroke = (d, w = 3.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    back: stroke('<path d="M15 5l-7 7 7 7"/>'),
    prev: stroke('<path d="M15 5l-7 7 7 7"/>'),
    next: stroke('<path d="M9 5l7 7-7 7"/>'),
    home: stroke('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>', 3),
    again: stroke('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/>', 3),
    erase: stroke('<path d="M6 6l12 12M18 6L6 18"/>', 3),
    check: stroke('<path d="M5 12.5l4.5 4.5L19 7"/>', 3.4),
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 17.5V6l11-2.5v11.8"/><circle fill="currentColor" cx="6.5" cy="17.5" r="3"/><circle fill="currentColor" cx="17.5" cy="15.3" r="3"/><path d="M9 6l11-2.5V8L9 10.5z" fill="currentColor"/></svg>',
    mute: stroke('<path d="M4 4l16 16"/>', 3),
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4.5A2.5 2.5 0 016.5 2H20v16H6.5a1.5 1.5 0 000 3H20v1H6.5A2.5 2.5 0 014 19.5z"/><path d="M12 5.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill="#ffc53d"/></svg>',
  };
  const MASCOT = `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 6l15 30 33 4-24 23 6 33-30-16-30 16 6-33L12 40l33-4z" fill="#ffc53d" stroke="#3a2a1f" stroke-width="5" stroke-linejoin="round"/><circle cx="48" cy="58" r="5" fill="#3a2a1f"/><circle cx="72" cy="58" r="5" fill="#3a2a1f"/><circle cx="40" cy="70" r="5" fill="#ff8fb0"/><circle cx="80" cy="70" r="5" fill="#ff8fb0"/><path d="M50 72q10 10 20 0" fill="none" stroke="#3a2a1f" stroke-width="4" stroke-linecap="round"/></svg>`;

  /* ---------- stickers ---------- */
  const SVGS = {
    sun: '<svg viewBox="0 0 100 100"><g stroke="#f0a500" stroke-width="7" stroke-linecap="round"><path d="M50 6v14M50 80v14M6 50h14M80 50h14M19 19l10 10M71 71l10 10M81 19L71 29M29 71L19 81"/></g><circle cx="50" cy="50" r="24" fill="#ffc53d" stroke="#3a2a1f" stroke-width="4"/><circle cx="42" cy="47" r="3" fill="#3a2a1f"/><circle cx="58" cy="47" r="3" fill="#3a2a1f"/><path d="M42 56q8 7 16 0" fill="none" stroke="#3a2a1f" stroke-width="3" stroke-linecap="round"/></svg>',
    rainbow: '<svg viewBox="0 0 100 70"><g fill="none" stroke-width="9"><path d="M8 62a42 42 0 0184 0" stroke="#ff5c5c"/><path d="M17 62a33 33 0 0166 0" stroke="#ffc53d"/><path d="M26 62a24 24 0 0148 0" stroke="#5dbb63"/><path d="M35 62a15 15 0 0130 0" stroke="#3aa0e8"/></g><circle cx="12" cy="60" r="9" fill="#fff" stroke="#3a2a1f" stroke-width="3"/><circle cx="88" cy="60" r="9" fill="#fff" stroke="#3a2a1f" stroke-width="3"/></svg>',
    heart: '<svg viewBox="0 0 100 100"><path d="M50 88S10 62 10 36a20 20 0 0140-6 20 20 0 0140 6c0 26-40 52-40 52z" fill="#ff5c8a" stroke="#3a2a1f" stroke-width="5"/><ellipse cx="32" cy="36" rx="7" ry="10" fill="#fff" opacity=".6"/></svg>',
    flower: '<svg viewBox="0 0 100 100"><g fill="#ffc53d" stroke="#3a2a1f" stroke-width="4"><circle cx="50" cy="24" r="16"/><circle cx="74" cy="42" r="16"/><circle cx="66" cy="70" r="16"/><circle cx="34" cy="70" r="16"/><circle cx="26" cy="42" r="16"/></g><circle cx="50" cy="50" r="15" fill="#8a5a2b" stroke="#3a2a1f" stroke-width="4"/></svg>',
    balloon: '<svg viewBox="0 0 100 110"><path d="M50 74q-4 18 6 34" fill="none" stroke="#3a2a1f" stroke-width="3"/><ellipse cx="50" cy="40" rx="30" ry="36" fill="#3aa0e8" stroke="#3a2a1f" stroke-width="4"/><path d="M44 76h12l-6-6z" fill="#3aa0e8" stroke="#3a2a1f" stroke-width="3"/><ellipse cx="38" cy="26" rx="7" ry="11" fill="#fff" opacity=".55"/></svg>',
  };
  const STICKERS = [
    { id: "snake" }, { id: "sun", svg: 1, en: "sun" }, { id: "school" }, { id: "rainbow", svg: 1, en: "rainbow" },
    { id: "scissors" }, { id: "heart", svg: 1, en: "heart" }, { id: "backpack" }, { id: "book" },
    { id: "flower", svg: 1, en: "flower" }, { id: "crayon" }, { id: "pencil" }, { id: "balloon", svg: 1, en: "balloon" },
    { id: "gluestick" }, { id: "chair" }, { id: "table" }, { id: "tidyup" },
  ];
  const STARS_PER_STICKER = 5;
  const stickerArt = s => s.svg ? SVGS[s.id] : `<img src="${img(s.id)}" alt="">`;

  /* ---------- saved progress ---------- */
  const KEY = "ls-nemo2-v2";
  let save = { stars: 0, stickers: [], fresh: [], music: true, sfx: true };
  try { Object.assign(save, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* storage off */ }
  try { const old = parseInt(localStorage.getItem("ls-nemo2-stars") || "0", 10); if (old > save.stars) save.stars = old; } catch (e) { /* */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* private mode */ } };

  /* ---------- Web Audio (sound effects + music) ---------- */
  let ctx = null, master = null, musicGain = null, musicBuf = null, musicSrc = null, musicLoading = null;
  function audioCtx() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(f, dur, { type = "sine", vol = 0.2, to = null, at = 0, attack = 0.01 } = {}) {
    const c = audioCtx(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(dur, { vol = 0.2, f = 1500, q = 1, to = null, at = 0, kind = "bandpass" } = {}) {
    const c = audioCtx(); if (!c) return;
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const t = c.currentTime + at, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; fl.type = kind; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t + dur + 0.02);
  }
  const SFX = {
    tap:     () => tone(620, 0.07, { type: "sine", vol: 0.12, to: 820 }),
    pop:     () => { noise(0.08, { vol: 0.35, f: 1800, q: 0.8 }); tone(900, 0.12, { type: "sine", vol: 0.25, to: 220 }); },
    good:    () => [660, 880, 1320].forEach((f, i) => tone(f, 0.28, { type: "triangle", vol: 0.18, at: i * 0.08 })),
    bad:     () => { tone(330, 0.32, { type: "sine", vol: 0.18, to: 180 }); tone(345, 0.32, { type: "sine", vol: 0.06, to: 190 }); },
    flip:    () => noise(0.12, { vol: 0.18, f: 3000, to: 900, q: 0.7 }),
    whoosh:  () => noise(0.35, { vol: 0.22, f: 400, to: 2600, q: 1.2 }),
    sparkle: () => [1568, 2093, 2637, 3136, 2637].forEach((f, i) => tone(f, 0.22, { type: "triangle", vol: 0.1, at: i * 0.06 })),
    fanfare: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: "square", vol: 0.07, at: i * 0.13 })); tone(1047, 0.8, { type: "square", vol: 0.08, at: 0.42 }); tone(784, 0.8, { type: "triangle", vol: 0.1, at: 0.42 }); },
    zip:     () => tone(180, 0.3, { type: "sawtooth", vol: 0.06, to: 1400 }),
    boing:   () => tone(200, 0.35, { type: "triangle", vol: 0.16, to: 520 }),
  };
  const sfx = name => { if (save.sfx && SFX[name]) try { SFX[name](); } catch (e) { /* */ } };

  function loadMusic() {
    if (musicBuf || musicLoading) return musicLoading;
    const c = audioCtx(); if (!c) return null;
    musicLoading = fetch(A.audio.bg_music).then(r => r.arrayBuffer())
      .then(b => new Promise((res, rej) => c.decodeAudioData(b, res, rej)))
      .then(buf => { musicBuf = buf; return buf; })
      .catch(() => { musicLoading = null; });
    return musicLoading;
  }
  const MUSIC_VOL = 0.16;
  let ducked = false;
  function musicLevel() { return save.music ? (ducked ? MUSIC_VOL * 0.3 : MUSIC_VOL) : 0; }
  let musicEl = null; // fallback when fetch is blocked (opening index.html from disk)
  function setMusicGain(v, time = 0.4) {
    if (musicEl) { musicEl.volume = Math.max(0, Math.min(1, v * 2.2)); if (v > 0 && musicEl.paused) musicEl.play().catch(() => {}); if (v === 0) musicEl.pause(); return; }
    if (!ctx || !musicGain) return;
    const t = ctx.currentTime; musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(musicGain.gain.value, t); musicGain.gain.linearRampToValueAtTime(v, t + time);
  }
  async function startMusic() {
    if (!save.music) return;
    const c = audioCtx(); if (!c) return;
    await loadMusic();
    if (!save.music) return;
    if (!musicBuf) {
      if (!musicEl) { musicEl = new Audio(A.audio.bg_music); musicEl.loop = true; musicEl.volume = 0; }
      setMusicGain(musicLevel(), 0);
      return;
    }
    if (musicSrc) return;
    musicSrc = c.createBufferSource(); musicSrc.buffer = musicBuf; musicSrc.loop = true;
    musicSrc.loopStart = 0; musicSrc.loopEnd = Math.min(musicBuf.duration, 17.1428);
    musicSrc.connect(musicGain); musicSrc.start();
    setMusicGain(musicLevel(), 1.2);
  }
  function toggleMusic() {
    save.music = !save.music; persist();
    if (save.music) { startMusic(); setMusicGain(musicLevel()); } else setMusicGain(0, 0.3);
    updateMusicBtn();
  }
  function updateMusicBtn() {
    const b = $("#musicBtn"); if (!b) return;
    b.setAttribute("aria-pressed", String(save.music));
    b.setAttribute("aria-label", save.music ? "Turn music off" : "Turn music on");
    b.innerHTML = I.music + (save.music ? "" : `<span class="slash">${I.mute}</span>`);
  }

  /* ---------- voice (mp3 per word/sentence) ---------- */
  const player = new Audio();
  player.preload = "auto";
  player.setAttribute("playsinline", "");
  let pendingResolve = null, seqToken = 0;

  function speak(text) {
    return new Promise(res => {
      if (!("speechSynthesis" in window) || !text) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.85; u.pitch = 1.1;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 4000);
    });
  }
  function playOne(key) {
    if (pendingResolve) { pendingResolve(); pendingResolve = null; }
    return new Promise(res => {
      pendingResolve = res;
      let settled = false;
      const done = () => { if (settled) return; settled = true; if (pendingResolve === res) pendingResolve = null; res(); };
      const src = A.audio[key];
      const fallback = () => { if (!settled) speak(TEXT[key]).then(done); };
      if (!src) return fallback();
      player.pause();
      player.src = src;
      player.onended = done;
      player.onerror = fallback;
      const p = player.play();
      if (p && p.catch) p.catch(fallback);
      setTimeout(done, 6000); // never hang a game
    });
  }
  async function say(...keys) {
    const t = ++seqToken;
    ducked = true; setMusicGain(musicLevel(), 0.2);
    for (const k of keys) {
      if (t !== seqToken) return false;
      await playOne(k);
      if (t !== seqToken) return false;
      await wait(110);
    }
    if (t === seqToken) { ducked = false; setMusicGain(musicLevel(), 0.8); }
    return t === seqToken;
  }
  function hush() { seqToken++; player.pause(); if (pendingResolve) { pendingResolve(); pendingResolve = null; } ducked = false; setMusicGain(musicLevel(), 0.5); }
  const praise = () => pick(["ok1", "ok2", "ok3", "yay"]);

  /* First touch anywhere unlocks sound on iPhone/iPad/Android. */
  let unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* */ }
    audioCtx();
    const blip = player.src;
    player.muted = true;
    const p = player.play(); if (p && p.catch) p.catch(() => {});
    setTimeout(() => { player.pause(); player.muted = false; if (blip) player.src = blip; }, 30);
    startMusic();
  }
  ["pointerdown", "keydown", "touchend"].forEach(ev => addEventListener(ev, unlock, { once: false, passive: true }));
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend(); player.pause(); } else ctx.resume();
  });
  // soft click on every button press
  addEventListener("pointerdown", e => {
    const b = e.target.closest(".btn, .chip, .back, .door, .hbtn, .mini, .sticker-slot");
    if (b && !b.disabled) sfx("tap");
  }, { passive: true });

  /* ---------- stars & stickers ---------- */
  let session = [];
  const startSession = () => { session = []; };

  function renderStars() {
    const n = $("#starNum"); if (n) n.textContent = save.stars;
    const dot = $("#stickerDot"); if (dot) dot.hidden = !save.fresh.length;
    const sc = $("#stickerNum"); if (sc) sc.textContent = save.stickers.length;
  }
  function addStar(n = 1, from) {
    save.stars += n;
    const shouldHave = Math.min(STICKERS.length, Math.floor(save.stars / STARS_PER_STICKER));
    const got = [];
    while (save.stickers.length < shouldHave) {
      const s = STICKERS[save.stickers.length];
      save.stickers.push(s.id); save.fresh.push(s.id); session.push(s.id); got.push(s);
    }
    persist(); renderStars();
    const badge = $("#starCount"); if (badge) restart(badge, "bump");
    burst(from);
    got.forEach((s, i) => setTimeout(() => toast(s), 700 + i * 2800));
  }
  const nextStickerIn = () => save.stickers.length >= STICKERS.length ? 0 : STARS_PER_STICKER - (save.stars % STARS_PER_STICKER);

  function toast(s) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span class="toast-art sticker-art">${stickerArt(s)}</span><span><b>New sticker!</b><small>Bé nhận sticker mới</small></span>`;
    document.body.appendChild(t);
    sfx("sparkle");
    const sb = $("#stickerBtn"); if (sb) restart(sb, "bump");
    setTimeout(() => t.classList.add("out"), 2400);
    setTimeout(() => t.remove(), 2900);
  }

  /* ---------- star burst ---------- */
  function burst(from, count = 12) {
    if (reduced()) return;
    const box = $("#burst"); if (!box) return;
    let x = innerWidth / 2, y = innerHeight / 2;
    if (from) { const r = from.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    const colors = ["#ffc53d", "#ff5c8a", "#5dbb63", "#3aa0e8"];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("i");
      const ang = (Math.PI * 2 * i) / count, dist = 80 + Math.random() * 70;
      el.style.left = x - 17 + "px"; el.style.top = y - 17 + "px";
      el.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      el.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      el.innerHTML = I.star.replace("<svg", `<svg fill="${colors[i % 4]}" stroke="#3a2a1f" stroke-width="1.2"`);
      box.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }
  }

  /* ---------- confetti + celebration screen ---------- */
  function confetti(canvas, ms = 3200) {
    if (reduced()) return () => {};
    const c = canvas.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const colors = ["#ffc53d", "#ff5c8a", "#5dbb63", "#3aa0e8", "#b07cff", "#ff8a3d"];
    const bits = Array.from({ length: Math.min(160, Math.round(innerWidth / 6)) }, () => ({
      x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6,
      w: 7 + Math.random() * 7, h: 10 + Math.random() * 8, r: Math.random() * 6,
      vr: (Math.random() - .5) * .3, vy: 2 + Math.random() * 3, vx: (Math.random() - .5) * 2,
      col: pick(colors), star: Math.random() < .25,
    }));
    let raf, t0 = performance.now();
    const drawStar = (x, y, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); };
    const frame = now => {
      const age = now - t0;
      c.clearRect(0, 0, innerWidth, innerHeight);
      c.globalAlpha = age > ms - 600 ? Math.max(0, (ms - age) / 600) : 1;
      bits.forEach(b => {
        b.y += b.vy; b.x += b.vx + Math.sin((now / 400) + b.r) * .6; b.r += b.vr;
        c.fillStyle = b.col;
        if (b.star) drawStar(b.x, b.y, b.w);
        else { c.save(); c.translate(b.x, b.y); c.rotate(b.r); c.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r * 2))); c.restore(); }
      });
      if (age < ms) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    addEventListener("resize", size);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }

  let celeOpen = false;
  const isCelebrating = () => celeOpen;
  function celebrate({ title = "Hooray!", sub = "Bé giỏi quá!", again, voice = ["hooray"] } = {}) {
    closeCelebrate();
    celeOpen = true;
    const earned = session.map(id => STICKERS.find(s => s.id === id)).filter(Boolean);
    const el = document.createElement("div");
    el.className = "celebrate"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", title);
    el.innerHTML = `
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="cele-card">
        <div class="mascot">${MASCOT}</div>
        <h2>${title}</h2>
        <p>${sub}</p>
        ${earned.length ? `<div class="cele-stickers" aria-label="New stickers">${earned.map((s, i) => `<span class="sticker-art" style="animation-delay:${400 + i * 200}ms">${stickerArt(s)}</span>`).join("")}</div><p class="cele-note">Sticker mới trong sổ sticker!</p>` : `<p class="cele-note">${nextStickerIn() ? `Còn ${nextStickerIn()} ⭐ nữa là có sticker mới` : "Bé đã có đủ sticker!"}</p>`}
        <div class="cele-actions">
          ${again ? `<button class="btn green" data-a="again">${I.again} Play again</button>` : ""}
          <a class="btn white" href="#home" data-a="home">${I.home} Home</a>
          ${earned.length ? `<a class="btn pink" href="#stickers" data-a="stickers">${I.book} Stickers</a>` : ""}
        </div>
      </div>`;
    document.body.appendChild(el);
    const stop = confetti($(".confetti", el));
    el._stop = stop;
    sfx("fanfare");
    setTimeout(() => say(...voice, ...(earned.length ? ["sticker"] : [])), 500);
    const againBtn = $('[data-a="again"]', el);
    if (againBtn) againBtn.onclick = () => { closeCelebrate(); again(); };
    $$("a[data-a]", el).forEach(a => a.addEventListener("click", closeCelebrate));
    (againBtn || $('[data-a="home"]', el)).focus({ preventScroll: true });
    startSession();
  }
  function closeCelebrate() {
    $$(".celebrate").forEach(el => { if (el._stop) el._stop(); el.remove(); });
    celeOpen = false;
  }

  function mountHeader() {
    const logo = $("#brandLogo"); if (logo) logo.src = img("logo");
    const mb = $("#musicBtn"); if (mb) mb.onclick = () => { unlock(); toggleMusic(); };
    updateMusicBtn(); renderStars();
  }

  return {
    $, $$, wait, shuffle, pick, img, reduced, restart,
    WORDS, W, NOUNS, SUPPLIES, TEXT, I, MASCOT,
    STICKERS, STARS_PER_STICKER, stickerArt, nextStickerIn, save, persist, renderStars,
    say, hush, praise, sfx, addStar, burst, celebrate, closeCelebrate, isCelebrating, startSession, mountHeader,
  };
})();
