/* Little Star English – shared engine: lesson data, audio, music, Bunny, stars, stickers, celebrations */
window.LS = (() => {
  "use strict";
  const A = window.ASSETS;
  const VT = window.VOICE_TEXT || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const img = id => A.img[id] || A.img["e_" + id];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const restart = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- lesson content (3 class PDFs) ---------- */
  const WEEKS = [
    { id: "w3", en: "School things", vi: "14 – 18/9" },
    { id: "w4", en: "Mid-Autumn",    vi: "21 – 25/9" },
    { id: "w5", en: "Letter S",      vi: "28/9 – 02/10" },
  ];
  const WORDS = [
    { id: "backpack",  en: "backpack",   vi: "cái ba lô",      week: "w3", edge: "#ff4f9a", a: "a backpack" },
    { id: "book",      en: "book",       vi: "quyển sách",     week: "w3", edge: "#ff2d2d", a: "a book" },
    { id: "chair",     en: "chair",      vi: "cái ghế",        week: "w3", edge: "#a83232", a: "a chair" },
    { id: "crayon",    en: "crayon",     vi: "bút sáp màu",    week: "w3", edge: "#7a3a10", a: "a crayon" },
    { id: "gluestick", en: "glue stick", vi: "keo dán",        week: "w3", edge: "#f07a10", a: "a glue stick" },
    { id: "pencil",    en: "pencil",     vi: "bút chì",        week: "w3", edge: "#7cc02a", a: "a pencil" },
    { id: "table",     en: "table",      vi: "cái bàn",        week: "w3", edge: "#1a8ac6", a: "a table" },
    { id: "moon",      en: "moon",       vi: "mặt trăng",      week: "w4", edge: "#6b3a1c", a: "the moon", mid: true },
    { id: "mooncake",  en: "moon cake",  vi: "bánh trung thu", week: "w4", edge: "#b0643a", a: "a moon cake", mid: true },
    { id: "lantern",   en: "lantern",    vi: "đèn lồng",       week: "w4", edge: "#f07a10", a: "a lantern", mid: true },
    { id: "moonlady",  en: "moon lady",  vi: "chị Hằng",       week: "w4", edge: "#e0b090", a: "the moon lady", mid: true },
    { id: "rabbit",    en: "rabbit",     vi: "con thỏ",        week: "w4", edge: "#f5c842", a: "a rabbit", mid: true },
    { id: "school",    en: "school",     vi: "trường học",     week: "w5", edge: "#ff4f9a", a: "a school" },
    { id: "scissors",  en: "scissors",   vi: "cái kéo",        week: "w5", edge: "#ff2d2d", a: "scissors" },
    { id: "snake",     en: "snake",      vi: "con rắn",        week: "w5", edge: "#a83232", a: "a snake" },
    { id: "tidyup",    en: "tidy up",    vi: "dọn dẹp",        week: "w5", edge: "#3aa0e8" },
  ];
  const W = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const NOUNS = WORDS.filter(w => w.id !== "tidyup");
  const SUPPLIES = ["backpack", "book", "crayon", "gluestick", "pencil", "scissors"];
  const wordKey = id => "w_" + id;
  /* the full sentence each picture "says" */
  const lineKey = id => id === "moonlady" ? "a_moonlady" : W[id] && W[id].mid ? "itis_" + id : "this_" + id;
  const lineText = id => VT[lineKey(id)] || W[id].en;
  const TEXT = VT;

  /* ---------- icons ---------- */
  const stroke = (d, w = 3.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    back: stroke('<path d="M15 5l-7 7 7 7"/>'), prev: stroke('<path d="M15 5l-7 7 7 7"/>'), next: stroke('<path d="M9 5l7 7-7 7"/>'),
    home: stroke('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>', 3),
    again: stroke('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/>', 3),
    erase: stroke('<path d="M6 6l12 12M18 6L6 18"/>', 3), check: stroke('<path d="M5 12.5l4.5 4.5L19 7"/>', 3.4),
    mute: stroke('<path d="M4 4l16 16"/>', 3), lock: stroke('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>', 2.6),
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 17.5V6l11-2.5v11.8"/><circle fill="currentColor" cx="6.5" cy="17.5" r="3"/><circle fill="currentColor" cx="17.5" cy="15.3" r="3"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4.5A2.5 2.5 0 016.5 2H20v16H6.5a1.5 1.5 0 000 3H20v1H6.5A2.5 2.5 0 014 19.5z"/><path d="M12 5.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill="#ffc53d"/></svg>',
  };

  /* ---------- stickers (care items are stickers too) ---------- */
  const STICKERS = [
    { id: "banana", art: "e_banana" }, { id: "moon", art: "moon" }, { id: "sponge", art: "e_sponge" }, { id: "hat", art: "e_hat" },
    { id: "rabbit", art: "rabbit" }, { id: "milk", art: "e_milk" }, { id: "book", art: "book" }, { id: "shoes", art: "e_shoes" },
    { id: "teddy", art: "e_teddy" }, { id: "mooncake", art: "mooncake" }, { id: "carrot", art: "e_carrot" }, { id: "socks", art: "e_socks" },
    { id: "lantern", art: "lantern" }, { id: "sunglasses", art: "e_sunglasses" }, { id: "cookie", art: "e_cookie" }, { id: "crown", art: "e_crown" },
    { id: "moonlady", art: "moonlady" }, { id: "heart", art: "e_heart" }, { id: "snake", art: "snake" }, { id: "rainbow", art: "e_rainbow" },
    { id: "school", art: "school" }, { id: "balloon", art: "e_balloon" }, { id: "pencil", art: "pencil" }, { id: "sun", art: "e_sun" },
  ];
  const STARS_PER_STICKER = 5;
  const STARTER = ["apple", "soap", "shower", "shirt", "pillow"]; // care items everyone has from the start
  const stickerArt = s => `<img src="${img(s.art)}" alt="">`;

  /* ---------- saved progress ---------- */
  const KEY = "ls-nemo2-v3";
  const save = { stars: 0, stickers: [], fresh: [], music: true, sfx: true, friend: null, skill: {} };
  try { Object.assign(save, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* storage off */ }
  try { const old = JSON.parse(localStorage.getItem("ls-nemo2-v2") || "{}"); if (old.stars > save.stars) { save.stars = old.stars; save.music = old.music !== false; } } catch (e) { /* */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* private mode */ } };
  let sessionGot = [];
  function syncStickers(session) {
    const should = Math.min(STICKERS.length, Math.floor(save.stars / STARS_PER_STICKER));
    const got = [];
    save.stickers = save.stickers.filter(id => STICKERS.some(s => s.id === id)).slice(0, should);
    while (save.stickers.length < should) {
      const s = STICKERS[save.stickers.length];
      save.stickers.push(s.id); got.push(s);
      if (session) { save.fresh.push(s.id); sessionGot.push(s.id); }
    }
    return got;
  }
  syncStickers(false); persist();
  const owns = id => STARTER.includes(id) || save.stickers.includes(id) || id === "goodnight";
  const nextStickerIn = () => save.stickers.length >= STICKERS.length ? 0 : STARS_PER_STICKER - (save.stars % STARS_PER_STICKER);

  /* adaptive difficulty: -3 (needs help) … +3 (knows it) */
  const skill = id => save.skill[id] || 0;
  function learn(id, ok) { save.skill[id] = Math.max(-3, Math.min(3, skill(id) + (ok ? 1 : -1))); persist(); }
  function pickWeighted(list, avoid) {
    const pool = list.filter(w => w.id !== avoid);
    const weights = pool.map(w => 1 + Math.max(0, 1 - skill(w.id)) * 1.4);
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[0];
  }

  /* ================= AUDIO: one Web Audio pipeline for voice, music and effects ================= */
  let ctx = null, master = null, musicGain = null, voiceGain = null;
  function audioCtx() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C({ latencyHint: "interactive" }); } catch (e) { ctx = new C(); }
      master = ctx.createGain(); master.gain.value = 0.95; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
      voiceGain = ctx.createGain(); voiceGain.gain.value = 1; voiceGain.connect(master);
      ctx.onstatechange = () => { if (ctx.state !== "running" && !document.hidden) ctx.resume().catch(() => {}); };
    }
    if (ctx.state !== "running" && !document.hidden) ctx.resume().catch(() => {});
    return ctx;
  }
  /* Embedded sounds are data: URIs — decode them directly (no fetch, so page security rules can't block them). */
  function srcToArrayBuffer(src) {
    if (src.startsWith("data:")) {
      const bin = atob(src.slice(src.indexOf(",") + 1));
      const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return Promise.resolve(u.buffer);
    }
    return fetch(src).then(r => { if (!r.ok) throw new Error("load"); return r.arrayBuffer(); });
  }
  const bufCache = {};
  let webAudioVoice = true;
  function getBuffer(key) {
    const c = audioCtx();
    if (!c || !A.audio[key]) return Promise.reject(new Error("no audio"));
    if (!bufCache[key]) {
      bufCache[key] = srcToArrayBuffer(A.audio[key])
        .then(ab => new Promise((res, rej) => c.decodeAudioData(ab, res, rej)))
        .catch(e => { delete bufCache[key]; throw e; });
    }
    return bufCache[key];
  }
  const preload = keys => keys.forEach(k => { if (ctx && A.audio[k]) getBuffer(k).catch(() => {}); });

  /* ---------- sound effects (synthesised) ---------- */
  function tone(f, dur, { type = "sine", vol = 0.2, to = null, at = 0, attack = 0.01 } = {}) {
    const c = audioCtx(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
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
    tap: () => tone(620, 0.07, { vol: 0.12, to: 820 }),
    pop: () => { noise(0.08, { vol: 0.35, f: 1800, q: 0.8 }); tone(900, 0.12, { vol: 0.25, to: 220 }); },
    good: () => [660, 880, 1320].forEach((f, i) => tone(f, 0.28, { type: "triangle", vol: 0.18, at: i * 0.08 })),
    bad: () => { tone(330, 0.32, { vol: 0.16, to: 180 }); tone(345, 0.32, { vol: 0.05, to: 190 }); },
    flip: () => noise(0.12, { vol: 0.18, f: 3000, to: 900, q: 0.7 }),
    whoosh: () => noise(0.35, { vol: 0.22, f: 400, to: 2600, q: 1.2 }),
    sparkle: () => [1568, 2093, 2637, 3136, 2637].forEach((f, i) => tone(f, 0.22, { type: "triangle", vol: 0.1, at: i * 0.06 })),
    fanfare: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: "square", vol: 0.07, at: i * 0.13 })); tone(1047, 0.8, { type: "square", vol: 0.08, at: 0.42 }); tone(784, 0.8, { type: "triangle", vol: 0.1, at: 0.42 }); },
    zip: () => tone(180, 0.3, { type: "sawtooth", vol: 0.06, to: 1400 }),
    boing: () => tone(200, 0.35, { type: "triangle", vol: 0.16, to: 520 }),
    munch: () => [0, 0.14, 0.28].forEach(at => noise(0.07, { vol: 0.3, f: 700, q: 1.5, at })),
    splash: () => { noise(0.6, { vol: 0.25, f: 2500, to: 600, q: 0.5 }); [0, .1, .2].forEach(at => tone(1400 + Math.random() * 800, 0.08, { vol: 0.06, at, to: 700 })); },
    scrub: () => [0, 0.12, 0.24, 0.36].forEach(at => noise(0.09, { vol: 0.22, f: 3500, q: 2, at })),
    lullaby: () => [784, 659, 523, 659, 784].forEach((f, i) => tone(f, 0.5, { vol: 0.09, at: i * 0.28 })),
    twinkle: () => [1047, 1319, 1568].forEach((f, i) => tone(f, 0.4, { vol: 0.08, at: i * 0.1 })),
  };
  function sfx(name) {
    if (name === "good") buddy.mood("happy", 1400);
    if (name === "bad") { buddy.mood("think", 1800); buddy.say("Hmm… try again!", 1800); }
    if (save.sfx && SFX[name]) try { SFX[name](); } catch (e) { /* */ }
  }

  /* ---------- background music ---------- */
  const MUSIC_VOL = 0.17;
  let musicSrc = null, musicEl = null, musicStarting = false, ducked = false, unlocked = false;
  const musicLevel = () => save.music ? (ducked ? MUSIC_VOL * 0.35 : MUSIC_VOL) : 0;
  function setMusicGain(v, time = 0.4) {
    if (musicEl) {
      musicEl.volume = Math.max(0, Math.min(1, v * 2.4));
      if (v > 0 && musicEl.paused) musicEl.play().catch(() => {});
      if (v === 0 && !musicEl.paused) musicEl.pause();
      return;
    }
    if (!ctx || !musicGain) return;
    const t = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(musicGain.gain.value, t);
    musicGain.gain.linearRampToValueAtTime(v, t + time);
  }
  async function startMusic() {
    if (!save.music || musicSrc || musicEl || musicStarting) return;
    const c = audioCtx(); if (!c) return;
    musicStarting = true;
    try {
      const buf = await getBuffer("bg_music");
      if (!musicSrc && save.music) {
        musicSrc = c.createBufferSource(); musicSrc.buffer = buf; musicSrc.loop = true;
        musicSrc.loopStart = 0; musicSrc.loopEnd = Math.min(buf.duration, 17.1428);
        musicSrc.connect(musicGain); musicSrc.start();
        const me = musicSrc;
        me.onended = () => { if (musicSrc === me) musicSrc = null; }; // the watchdog restarts it
        setMusicGain(musicLevel(), 1.2);
      }
    } catch (e) {
      musicEl = new Audio(A.audio.bg_music); musicEl.loop = true; musicEl.volume = 0;
      setMusicGain(musicLevel(), 0);
    }
    musicStarting = false;
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
  // Watchdog: keeps music alive (phones pause audio after calls, alarms, tab switches…)
  setInterval(() => {
    if (!unlocked || document.hidden) return;
    if (ctx && ctx.state !== "running") ctx.resume().catch(() => {});
    if (save.music) {
      if (!musicSrc && !musicEl) startMusic();
      if (musicEl && musicEl.paused) musicEl.play().catch(() => {});
    }
  }, 2500);

  /* ---------- voice ---------- */
  const player = new Audio(); player.preload = "auto"; player.setAttribute("playsinline", "");
  let current = null, seqToken = 0;
  function stopVoice() { if (current) { const c = current; current = null; try { c.stop(); } catch (e) { /* */ } c.finish(); } }
  function speak(text) {
    return new Promise(res => {
      if (!("speechSynthesis" in window) || !text) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.78; u.pitch = 1.1;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u); setTimeout(res, 4500);
    });
  }
  function playOne(key) {
    stopVoice();
    return new Promise(res => {
      let finished = false;
      const handle = { stop() {}, finish() { if (!finished) { finished = true; res(); } } };
      current = handle;
      const done = () => { if (current === handle) current = null; handle.finish(); };
      if (!A.audio[key]) { speak(VT[key]).then(done); return; }
      const viaElement = () => {
        if (finished) return;
        player.pause(); player.src = A.audio[key];
        handle.stop = () => player.pause();
        player.onended = done; player.onerror = () => speak(VT[key]).then(done);
        const p = player.play(); if (p && p.catch) p.catch(() => speak(VT[key]).then(done));
        setTimeout(done, 7000);
      };
      if (webAudioVoice && audioCtx()) {
        getBuffer(key).then(buf => {
          if (finished) return;
          const s = ctx.createBufferSource(); s.buffer = buf; s.connect(voiceGain);
          handle.stop = () => { try { s.stop(); } catch (e) { /* */ } };
          s.onended = done; s.start();
          setTimeout(done, buf.duration * 1000 + 900); // never hang a game
        }).catch(() => { webAudioVoice = false; viaElement(); });
      } else viaElement();
    });
  }
  async function say(...keys) {
    const t = ++seqToken;
    ducked = true; setMusicGain(musicLevel(), 0.2);
    buddy.talk(true);
    for (const k of keys) {
      if (t !== seqToken) return false;
      await playOne(k);
      if (t !== seqToken) return false;
      await wait(150);
    }
    if (t === seqToken) { ducked = false; setMusicGain(musicLevel(), 0.8); buddy.talk(false); }
    return t === seqToken;
  }
  function hush() { seqToken++; stopVoice(); player.pause(); ducked = false; setMusicGain(musicLevel(), 0.5); buddy.talk(false); }
  const praise = () => pick(["ok1", "ok2", "ok3", "yay"]);

  /* First touch unlocks sound on iPhone/iPad/Android */
  function unlock() {
    const c = audioCtx();
    if (!unlocked && c) {
      unlocked = true;
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* */ }
      try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) { /* */ }
      preload(["ok1", "ok2", "ok3", "yay", "hooray", "sticker", "giggle", "bye"]);
    }
  }
  ["pointerdown", "keydown", "touchend"].forEach(ev => addEventListener(ev, () => { unlock(); if (ctx && ctx.state !== "running") ctx.resume().catch(() => {}); }, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { buddy.mood("sleep", 0); if (ctx) ctx.suspend().catch(() => {}); player.pause(); }
    else { if (ctx) ctx.resume().catch(() => {}); setTimeout(() => { buddy.mood("wave", 1800); buddy.say("Welcome back!", 1800); }, 300); }
  });
  addEventListener("pointerdown", e => {
    const b = e.target.closest(".btn, .chip, .back, .door, .hbtn, .mini, .sticker-slot, .room-tab");
    if (b && !b.disabled) sfx("tap");
  }, { passive: true });

  /* ================= BUNNY – the play buddy ================= */
  const buddyHTML = (size = "sm") => `
    <div class="buddy buddy-${size}">
      <div class="buddy-bubble" role="status" aria-live="polite"></div>
      <button class="buddy-body" aria-label="Bunny">${window.ART.friend("bunny", { mascot: true })}</button>
    </div>`;
  let moodTimer = 0, bubbleTimer = 0, lastMood = "idle", lastTouch = Date.now();
  const MOODS = ["mood-idle", "mood-happy", "mood-think", "mood-sleep", "mood-eat", "mood-dance", "mood-wave"];
  const setSvgMood = (s, m) => { s.classList.remove(...MOODS); void s.getBoundingClientRect(); s.classList.add("mood-" + m); };
  const buddy = {
    mood(m, ms = 1500) {
      clearTimeout(moodTimer); lastMood = m;
      $$(".buddy .friend").forEach(s => setSvgMood(s, m));
      if (ms) moodTimer = setTimeout(() => this.mood("idle", 0), ms);
    },
    say(text, ms = 2200) {
      clearTimeout(bubbleTimer);
      $$(".buddy-bubble").forEach(b => { b.textContent = text; b.classList.remove("show"); void b.offsetWidth; b.classList.add("show"); });
      if (ms) bubbleTimer = setTimeout(() => $$(".buddy-bubble").forEach(b => b.classList.remove("show")), ms);
    },
    talk(on) { $$(".buddy").forEach(b => b.classList.toggle("talking", on)); },
    bind(root = document) {
      $$(".buddy-body", root).forEach(b => b.onclick = () => {
        if (lastMood === "sleep") { buddy.mood("wave", 1600); buddy.say("Good morning!", 1600); say("good_morning"); return; }
        buddy.mood("happy", 1200); buddy.say("Hee hee!", 1200); sfx("boing"); say("giggle");
      });
    },
    get current() { return lastMood; },
  };
  // Bunny naps when nobody plays for a while, and wakes when touched
  addEventListener("pointerdown", e => {
    if (lastMood === "sleep" && !e.target.closest(".buddy-body") && Date.now() - lastTouch > 20000) { buddy.mood("wave", 1400); buddy.say("I'm awake!", 1400); }
    lastTouch = Date.now();
  }, { passive: true });
  setInterval(() => { if (Date.now() - lastTouch > 45000 && lastMood !== "sleep" && !celeOpen && !gateOpen) { buddy.mood("sleep", 0); buddy.say("Zzz…", 2500); } }, 5000);

  /* ---------- welcome: wake Bunny up ---------- */
  let gateOpen = false;
  function showGate(onDone) {
    gateOpen = true;
    const g = document.createElement("div");
    g.className = "gate";
    g.innerHTML = `
      <div class="gate-sky" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="gate-card">
        <div class="gate-bubble" id="gateBubble">Zzz…</div>
        <button class="gate-bunny" id="gateBunny" aria-label="Wake Bunny up">${window.ART.friend("bunny", { mascot: true }).replace("mood-idle", "mood-sleep")}</button>
        <p class="gate-hint" id="gateHint"><span class="hand" aria-hidden="true">👆</span> Chạm vào Bunny để đánh thức bạn ấy nhé!</p>
        <button class="btn green gate-yes" id="gateYes" hidden>YES!</button>
      </div>`;
    document.body.appendChild(g);
    const svg = $(".friend", g), bubble = $("#gateBubble"), yes = $("#gateYes"), hint = $("#gateHint");
    let woke = false;
    const wake = async () => {
      if (woke) return; woke = true;
      unlock(); sfx("sparkle"); setSvgMood(svg, "wave");
      bubble.textContent = "Hello! Are you ready?"; restart(bubble, "pop");
      hint.hidden = true; g.classList.add("awake");
      preload(["hello_ready", "lets_play"]);
      startMusic();
      await say("hello_ready");
      yes.hidden = false; restart(yes, "pop"); yes.focus({ preventScroll: true });
      setSvgMood(svg, "idle");
    };
    g.addEventListener("click", e => { if (!e.target.closest("#gateYes")) wake(); });
    yes.onclick = async () => {
      yes.disabled = true;
      sfx("fanfare"); setSvgMood(svg, "dance");
      bubble.textContent = "Yes! Let's play!"; restart(bubble, "pop");
      startMusic(); setMusicGain(musicLevel(), 1);
      say("lets_play");
      await wait(1300);
      g.classList.add("out");
      setTimeout(() => { g.remove(); gateOpen = false; onDone && onDone(); }, 450);
    };
  }

  /* ---------- stars & stickers ---------- */
  function renderStars() {
    const n = $("#starNum"); if (n) n.textContent = save.stars;
    const dot = $("#stickerDot"); if (dot) dot.hidden = !save.fresh.length;
    const sc = $("#stickerNum"); if (sc) sc.textContent = save.stickers.length;
  }
  function addStar(n = 1, from) {
    save.stars += n;
    const got = syncStickers(true);
    persist(); renderStars();
    restart($("#starCount"), "bump");
    burst(from);
    buddy.mood("happy", 1300);
    got.forEach((s, i) => setTimeout(() => toast(s), 700 + i * 2800));
    return got;
  }
  function toast(s) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span class="toast-art sticker-art">${stickerArt(s)}</span><span><b>New sticker!</b><small>Bé nhận sticker mới</small></span>`;
    document.body.appendChild(t);
    sfx("sparkle"); restart($("#stickerBtn"), "bump");
    document.dispatchEvent(new CustomEvent("sticker", { detail: s.id }));
    setTimeout(() => t.classList.add("out"), 2400);
    setTimeout(() => t.remove(), 2900);
  }
  function burst(from, count = 12) {
    if (reduced()) return;
    const box = $("#burst"); if (!box) return;
    let x = innerWidth / 2, y = innerHeight / 2;
    if (from && from.getBoundingClientRect) { const r = from.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    const colors = ["#ffc53d", "#ff5c8a", "#5dbb63", "#3aa0e8"];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("i");
      const ang = (Math.PI * 2 * i) / count, dist = 80 + Math.random() * 70;
      el.style.left = x - 17 + "px"; el.style.top = y - 17 + "px";
      el.style.setProperty("--dx", Math.cos(ang) * dist + "px"); el.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      el.innerHTML = I.star.replace("<svg", `<svg fill="${colors[i % 4]}" stroke="#3a2a1f" stroke-width="1.2"`);
      box.appendChild(el); setTimeout(() => el.remove(), 1100);
    }
  }
  /* little floating pictures: hearts, bubbles, sparkles, water drops… */
  function floaters(from, art, count = 5, kind = "up") {
    if (reduced() || !from) return;
    const r = from.getBoundingClientRect(), box = $("#burst"); if (!box) return;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("img");
      el.className = "floater " + kind; el.src = img(art); el.alt = "";
      el.style.left = r.left + r.width * (0.15 + Math.random() * 0.7) + "px";
      el.style.top = (kind === "rain" ? r.top : r.top + r.height * (0.2 + Math.random() * 0.5)) + "px";
      el.style.animationDelay = i * (kind === "rain" ? 70 : 110) + "ms";
      el.style.setProperty("--dx", (Math.random() - 0.5) * 90 + "px");
      el.style.setProperty("--fall", r.height * 0.8 + "px");
      box.appendChild(el); setTimeout(() => el.remove(), 2200);
    }
  }

  /* ---------- confetti + celebration ---------- */
  function confetti(canvas, ms = 3400) {
    if (reduced()) return () => {};
    const c = canvas.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const colors = ["#ffc53d", "#ff5c8a", "#5dbb63", "#3aa0e8", "#b07cff", "#ff8a3d"];
    const bits = Array.from({ length: Math.min(170, Math.round(innerWidth / 5.5)) }, () => ({
      x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6, w: 7 + Math.random() * 7, h: 10 + Math.random() * 8,
      r: Math.random() * 6, vr: (Math.random() - .5) * .3, vy: 2 + Math.random() * 3, vx: (Math.random() - .5) * 2, col: pick(colors), star: Math.random() < .3,
    }));
    let raf; const t0 = performance.now();
    const drawStar = (x, y, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); };
    const frame = now => {
      const age = now - t0;
      c.clearRect(0, 0, innerWidth, innerHeight);
      c.globalAlpha = age > ms - 600 ? Math.max(0, (ms - age) / 600) : 1;
      bits.forEach(b => {
        b.y += b.vy; b.x += b.vx + Math.sin((now / 400) + b.r) * .6; b.r += b.vr; c.fillStyle = b.col;
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
    const earned = sessionGot.map(id => STICKERS.find(s => s.id === id)).filter(Boolean);
    const next = nextStickerIn();
    const el = document.createElement("div");
    el.className = "celebrate"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", title);
    el.innerHTML = `
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="cele-card">
        <div class="mascot">${window.ART.friend("bunny", { mascot: true }).replace("mood-idle", "mood-dance")}</div>
        <h2>${title}</h2><p>${sub}</p>
        ${earned.length
          ? `<div class="cele-stickers" aria-label="New stickers">${earned.map((s, i) => `<span class="sticker-art" style="animation-delay:${400 + i * 200}ms">${stickerArt(s)}</span>`).join("")}</div><p class="cele-note">Sticker mới trong sổ sticker!</p>`
          : `<p class="cele-note">${next ? `Còn ${next} ⭐ nữa là có sticker mới` : "Bé đã có đủ sticker!"}</p>`}
        <div class="cele-actions">
          ${again ? `<button class="btn green" data-a="again">${I.again} Play again</button>` : ""}
          <a class="btn white" href="#home" data-a="home">${I.home} Home</a>
          ${earned.length ? `<a class="btn pink" href="#stickers" data-a="stickers">${I.book} Stickers</a>` : ""}
        </div>
      </div>`;
    document.body.appendChild(el);
    el._stop = confetti($(".confetti", el));
    sfx("fanfare"); buddy.mood("dance", 3000);
    setTimeout(() => say(...voice, ...(earned.length ? ["sticker"] : [])), 500);
    const againBtn = $('[data-a="again"]', el);
    if (againBtn) againBtn.onclick = () => { closeCelebrate(); again(); };
    $$("a[data-a]", el).forEach(a => a.addEventListener("click", closeCelebrate));
    (againBtn || $('[data-a="home"]', el)).focus({ preventScroll: true });
    sessionGot = [];
  }
  function closeCelebrate() { $$(".celebrate").forEach(el => { if (el._stop) el._stop(); el.remove(); }); celeOpen = false; }
  const startSession = () => { sessionGot = []; };

  function mountHeader() {
    const logo = $("#brandLogo"); if (logo) logo.src = img("logo");
    const mb = $("#musicBtn"); if (mb) mb.onclick = () => { unlock(); toggleMusic(); };
    updateMusicBtn(); renderStars();
  }

  return {
    $, $$, wait, shuffle, pick, img, reduced, restart,
    WEEKS, WORDS, W, NOUNS, SUPPLIES, TEXT, I, lineKey, lineText, wordKey,
    STICKERS, STARS_PER_STICKER, STARTER, stickerArt, nextStickerIn, owns, save, persist, renderStars,
    skill, learn, pickWeighted,
    say, hush, praise, sfx, preload, addStar, burst, floaters, celebrate, closeCelebrate, isCelebrating, startSession,
    buddy, buddyHTML, setSvgMood, showGate, mountHeader,
    pauseMusic: () => setMusicGain(0, 0.3), resumeMusic: () => setMusicGain(musicLevel(), 0.8),
  };
})();
