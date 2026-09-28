/* Little Star English – NEMO 2, week 28/9 – 02/10 */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const view = $("#view");
  const A = window.ASSETS;

  /* ---------- lesson content (from the class PDF) ---------- */
  const WORDS = [
    { id: "school",    en: "school",     vi: "trường học",   group: "s",     edge: "#ff4f9a", a: "a school" },
    { id: "scissors",  en: "scissors",   vi: "cái kéo",      group: "s",     edge: "#ff2d2d", a: "scissors" },
    { id: "snake",     en: "snake",      vi: "con rắn",      group: "s",     edge: "#a83232", a: "a snake" },
    { id: "tidyup",    en: "tidy up",    vi: "dọn dẹp",      group: "tidy",  edge: "#3aa0e8" },
    { id: "backpack",  en: "backpack",   vi: "cái ba lô",    group: "class", edge: "#ff4f9a", a: "a backpack" },
    { id: "book",      en: "book",       vi: "quyển sách",   group: "class", edge: "#ff2d2d", a: "a book" },
    { id: "chair",     en: "chair",      vi: "cái ghế",      group: "class", edge: "#a83232", a: "a chair" },
    { id: "crayon",    en: "crayon",     vi: "bút sáp màu",  group: "class", edge: "#7a3a10", a: "a crayon" },
    { id: "gluestick", en: "glue stick", vi: "keo dán",      group: "class", edge: "#f07a10", a: "a glue stick" },
    { id: "pencil",    en: "pencil",     vi: "bút chì",      group: "class", edge: "#7cc02a", a: "a pencil" },
    { id: "table",     en: "table",      vi: "cái bàn",      group: "class", edge: "#1a8ac6", a: "a table" },
  ];
  const W = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const NOUNS = WORDS.filter(w => w.id !== "tidyup");
  const SUPPLIES = ["backpack", "book", "crayon", "gluestick", "pencil", "scissors"];
  const GROUPS = [
    { id: "all",   en: "All words",   vi: "Tất cả" },
    { id: "s",     en: "Letter S",    vi: "28, 29/9" },
    { id: "tidy",  en: "Tidy up",     vi: "30/9 – 02/10" },
    { id: "class", en: "My classroom", vi: "01, 02/10" },
  ];

  /* Text for each sound, used by the voice fallback if an mp3 cannot play. */
  const TEXT = {
    q_letter: "What letter is it?", a_letter: "Letter S.", q_sound: "What sound is it?", a_sound: "Sound", s_hiss: "sss",
    q_this: "What is this?", q_have: "What do you have?", tidy_intro: "Let's tidy up!", put_pens: "Put away the pens.",
    ok1: "Great job!", ok2: "Well done!", ok3: "Super!", no1: "Oops! Try again.", done: "All tidy! Good job!", listen: "Listen and find.",
    w_tidyup: "Tidy up!",
  };
  NOUNS.forEach(w => {
    TEXT["w_" + w.id] = w.en;
    TEXT["this_" + w.id] = w.id === "scissors" ? "These are scissors." : `This is ${w.a}.`;
    TEXT["have_" + w.id] = `I have ${w.a}.`;
    TEXT["put_" + w.id] = `Put away the ${w.en}.`;
  });

  /* ---------- tiny icon set ---------- */
  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    ear: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 1 .5 1.6 1.4 1.6S7.8 10 7.8 9a4.2 4.2 0 018.4 0c0 2-1.3 2.9-2.4 3.8-1.2 1-2.2 2-2.2 4.2a2 2 0 01-2 2c-.9 0-1.4.6-1.4 1.4S8.7 22 9.6 22A4.8 4.8 0 0014.4 17c0-1 .5-1.5 1.4-2.3C17.2 13.6 19 12.1 19 9a7 7 0 00-7-7z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z"/></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/></svg>',
    erase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  };

  /* ---------- audio ---------- */
  const player = new Audio();
  player.preload = "auto";
  let pendingResolve = null;
  let seqToken = 0;

  function speak(text) {
    return new Promise(res => {
      if (!("speechSynthesis" in window) || !text) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.85; u.pitch = 1.1;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
    });
  }

  function playOne(key) {
    if (pendingResolve) { pendingResolve(); pendingResolve = null; }
    return new Promise(res => {
      pendingResolve = res;
      const done = () => { if (pendingResolve === res) pendingResolve = null; res(); };
      const src = A.audio[key];
      const fallback = () => speak(TEXT[key]).then(done);
      if (!src) return fallback();
      player.pause();
      player.src = src;
      player.onended = done;
      player.onerror = fallback;
      const p = player.play();
      if (p && p.catch) p.catch(fallback);
    });
  }

  /* Play several sounds one after another. A new call cancels the old one. */
  async function say(...keys) {
    const t = ++seqToken;
    for (const k of keys) {
      if (t !== seqToken) return false;
      await playOne(k);
      if (t !== seqToken) return false;
      await wait(120);
    }
    return t === seqToken;
  }
  function hush() { seqToken++; player.pause(); if (pendingResolve) { pendingResolve(); pendingResolve = null; } }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // Little chime for correct answers (Web Audio, no file needed)
  let actx;
  function chime(good = true) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = good ? [660, 880, 1320] : [300, 220];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = good ? "triangle" : "sine"; o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.32);
      });
    } catch (e) { /* no audio context */ }
  }
  const praise = () => ["ok1", "ok2", "ok3"][Math.floor(Math.random() * 3)];

  /* ---------- stars ---------- */
  let stars = 0;
  try { stars = parseInt(localStorage.getItem("ls-nemo2-stars") || "0", 10) || 0; } catch (e) { stars = 0; }
  const starNum = $("#starNum");
  starNum.textContent = stars;
  function addStar(n = 1, from) {
    stars += n;
    starNum.textContent = stars;
    try { localStorage.setItem("ls-nemo2-stars", String(stars)); } catch (e) { /* private mode */ }
    const badge = $("#starCount");
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
    burst(from);
  }
  function burst(from) {
    const box = $("#burst");
    let x = innerWidth / 2, y = innerHeight / 2;
    if (from) { const r = from.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    const colors = ["#ffc53d", "#ff5c8a", "#5dbb63", "#3aa0e8"];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("i");
      const ang = (Math.PI * 2 * i) / 12, dist = 90 + Math.random() * 70;
      el.style.left = x - 17 + "px"; el.style.top = y - 17 + "px";
      el.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      el.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      el.innerHTML = I.star.replace("<svg", `<svg fill="${colors[i % 4]}" stroke="#3a2a1f" stroke-width="1.2"`);
      box.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }
  }

  /* ---------- helpers ---------- */
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const img = id => A.img[id];
  const sWord = en => en[0] === "s" ? `<span class="s-first">s</span>${en.slice(1)}` : en;
  const head = (en, vi) => `
    <div class="page-head">
      <a class="back" href="#home" aria-label="Back to home">${I.back}</a>
      <h1 class="page-title">${en}<small>${vi}</small></h1>
    </div>`;
  let cleanup = null;

  /* ---------- views ---------- */
  const DOORS = [
    { r: "words",  en: "Words",         vi: "Học từ vựng",  im: "book",     tint: "#ffe28a" },
    { r: "letter", en: "Letter S",      vi: "Chữ S",        im: "snake",    tint: "#c7f0b5" },
    { r: "find",   en: "Listen & find", vi: "Nghe và chọn", im: "crayon",   tint: "#ffd0dd" },
    { r: "talk",   en: "Ask & answer",  vi: "Hỏi và đáp",   im: "backpack", tint: "#c9e8ff" },
    { r: "tidy",   en: "Tidy up",       vi: "Dọn dẹp",      im: "tidyup",   tint: "#ffe0b8" },
  ];

  function home() {
    const title = "Let's learn!".split("").map((c, i) => `<span style="animation-delay:${i * 45}ms">${c === " " ? "&nbsp;" : c}</span>`).join("");
    view.innerHTML = `
      <section class="hello">
        <h1 aria-label="Let's learn!">${title}</h1>
        <p>Chọn một trò chơi nhé!</p>
      </section>
      <nav class="doors" aria-label="Activities">
        ${DOORS.map(d => `
          <a class="door" href="#${d.r}" style="--tint:${d.tint}">
            <img src="${img(d.im)}" alt="">
            <b>${d.en}</b><span>${d.vi}</span>
          </a>`).join("")}
      </nav>`;
  }

  /* Words: flashcards */
  function words(state = { group: "all", i: 0 }) {
    if (cleanup) { cleanup(); cleanup = null; }
    const list = state.group === "all" ? WORDS : WORDS.filter(w => w.group === state.group);
    const w = list[state.i];
    view.innerHTML = `
      ${head("Words", "Học từ vựng – chạm vào thẻ để nghe")}
      <div class="chips" role="group" aria-label="Word groups">
        ${GROUPS.map(g => `<button class="chip" data-g="${g.id}" aria-pressed="${g.id === state.group}">${g.en}<small>${g.vi}</small></button>`).join("")}
      </div>
      <div class="flash">
        <button class="btn round white prev" aria-label="Previous word">${I.prev}</button>
        <button class="card" style="--edge:${w.edge}" aria-label="Say ${w.en}">
          <span class="tap-hint" aria-hidden="true">${I.sound}</span>
          <img src="${img(w.id)}" alt="">
          <span class="word">${sWord(w.en)}</span>
          <span class="vi">${w.vi}</span>
        </button>
        <button class="btn round white next" aria-label="Next word">${I.next}</button>
      </div>
      <div class="dots" aria-hidden="true">${list.map((_, k) => `<i class="${k === state.i ? "on" : ""}"></i>`).join("")}</div>`;

    const card = $(".card");
    const go = d => { state.i = (state.i + d + list.length) % list.length; words(state); say("w_" + list[state.i].id); };
    card.onclick = () => { card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); say("w_" + w.id); };
    $(".prev").onclick = () => go(-1);
    $(".next").onclick = () => go(1);
    $$(".chip").forEach(c => c.onclick = () => { state.group = c.dataset.g; state.i = 0; words(state); });

    // swipe
    let sx = null;
    card.addEventListener("pointerdown", e => { sx = e.clientX; });
    card.addEventListener("pointerup", e => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 60) { e.preventDefault(); card.onclick = null; go(dx < 0 ? 1 : -1); }
    });
    const key = e => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", key);
    cleanup = () => document.removeEventListener("keydown", key);
  }

  /* Letter S: question & answer + tracing */
  function letter() {
    const sw = ["school", "scissors", "snake"];
    view.innerHTML = `
      ${head("Letter S", "Chữ S – âm /s/")}
      <div class="letter-grid">
        <section class="panel">
          <button class="big-s" aria-label="Letter S">Ss</button>
          <div class="qa">
            <div class="qa-row">
              <button class="btn green" data-q="letter">${I.sound} What letter is it?</button>
              <span class="bubble" id="ansLetter">?</span>
            </div>
            <div class="qa-row">
              <button class="btn pink" data-q="sound">${I.sound} What sound is it?</button>
              <span class="bubble" id="ansSound">?</span>
            </div>
          </div>
          <div class="s-words">
            ${sw.map(id => `<button class="mini" data-w="${id}" aria-label="Say ${W[id].en}"><img src="${img(id)}" alt=""><b>${sWord(W[id].en)}</b></button>`).join("")}
          </div>
        </section>
        <section class="panel">
          <h2>Trace the S<small>Bé tô chữ S bằng ngón tay</small></h2>
          <div class="trace-wrap"><canvas id="trace" aria-label="Tracing area"></canvas></div>
          <div class="trace-tools">
            <button class="btn white" id="clear">${I.erase} Clear</button>
            <button class="btn green" id="traced">${I.check} I did it!</button>
          </div>
        </section>
      </div>`;

    const bigS = $(".big-s");
    const wiggle = () => { bigS.classList.remove("wiggle"); void bigS.offsetWidth; bigS.classList.add("wiggle"); };
    bigS.onclick = () => { wiggle(); say("a_letter", "s_hiss"); };
    let askedL = false, askedS = false;
    $$("[data-q]").forEach(b => b.onclick = async () => {
      if (b.dataset.q === "letter") {
        const el = $("#ansLetter"); el.classList.remove("show"); el.textContent = "?";
        if (await say("q_letter")) { el.textContent = "Letter “S”"; el.classList.add("show"); wiggle(); await say("a_letter"); if (!askedL) { askedL = true; addStar(1, el); } }
      } else {
        const el = $("#ansSound"); el.classList.remove("show"); el.textContent = "?";
        if (await say("q_sound")) { el.textContent = "Sound /s/"; el.classList.add("show"); wiggle(); await say("a_sound", "s_hiss"); if (!askedS) { askedS = true; addStar(1, el); } }
      }
    });
    $$(".mini").forEach(b => b.onclick = () => say("w_" + b.dataset.w));

    // tracing canvas
    const cv = $("#trace"), ctx = cv.getContext("2d");
    let drawn = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      guide(r.width); drawn = 0;
    };
    function guide(w) {
      ctx.clearRect(0, 0, w, w);
      ctx.font = `700 ${w * 0.92}px Andika, "Baloo 2", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(93,187,99,.22)"; ctx.fillText("S", w / 2, w * 0.54);
      ctx.setLineDash([10, 12]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(58,42,31,.45)";
      ctx.strokeText("S", w / 2, w * 0.54); ctx.setLineDash([]);
    }
    let last = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); last = pt(e); });
    cv.addEventListener("pointermove", e => {
      if (!last) return;
      const p = pt(e);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 18; ctx.strokeStyle = "#ff5c8a";
      ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke();
      drawn += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
    });
    const up = () => { last = null; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    $("#clear").onclick = size;
    $("#traced").onclick = e => {
      if (drawn < cv.getBoundingClientRect().width * 0.8) { chime(false); say("no1"); return; }
      chime(); addStar(1, e.currentTarget); say(praise(), "a_letter"); setTimeout(size, 1400);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(size);
    addEventListener("resize", size);
    cleanup = () => removeEventListener("resize", size);
  }

  /* Listen & find: hear a word, tap the picture */
  function find() {
    const ROUNDS = 8;
    const order = shuffle(NOUNS).concat(shuffle(NOUNS)).slice(0, ROUNDS);
    let n = 0, got = 0, locked = false, missed = false;

    view.innerHTML = `
      ${head("Listen & find", "Nghe và chọn đúng hình")}
      <div class="find-top">
        <button class="ear" aria-label="Listen again">${I.sound}</button>
        <div class="progress" aria-label="Progress">${Array.from({ length: ROUNDS }, () => `<i>${I.star}</i>`).join("")}</div>
      </div>
      <div class="choices"></div>
      <p class="find-word" aria-live="polite"></p>`;
    const ear = $(".ear"), wrap = $(".choices"), word = $(".find-word");
    const listen = async (...pre) => { ear.classList.add("playing"); await say(...pre, "w_" + order[n].id); ear.classList.remove("playing"); };
    ear.onclick = () => listen();

    function round(first) {
      if (n >= ROUNDS) return finish();
      locked = false; missed = false; word.textContent = "";
      const ans = order[n];
      const opts = shuffle([ans, ...shuffle(NOUNS.filter(w => w.id !== ans.id)).slice(0, 2)]);
      wrap.innerHTML = opts.map(o => `<button class="choice" data-id="${o.id}" aria-label="${o.en}"><img src="${img(o.id)}" alt=""></button>`).join("");
      $$(".choice", wrap).forEach(c => c.onclick = async () => {
        if (locked) return;
        if (c.dataset.id === ans.id) {
          locked = true; c.classList.add("right"); word.innerHTML = sWord(ans.en); chime();
          if (!missed) { got++; $$(".progress i")[n].classList.add("got"); addStar(1, c); }
          await say(praise());
          n++; setTimeout(() => round(false), 350);
        } else {
          missed = true; c.classList.remove("wrong"); void c.offsetWidth; c.classList.add("wrong"); chime(false);
          listen("no1");
        }
      });
      first ? listen("listen") : listen();
    }
    function finish() {
      view.innerHTML = `
        ${head("Listen & find", "Nghe và chọn đúng hình")}
        <div class="panel win-card">
          <img src="${img("crayon")}" alt="">
          <h2>${got} / ${ROUNDS} ⭐</h2>
          <button class="btn pink">${I.again} Play again</button>
        </div>`;
      say(got >= ROUNDS - 2 ? "ok3" : "ok2");
      $(".win-card .btn").onclick = find;
    }
    // Start on a tap so browsers allow sound
    wrap.innerHTML = `<button class="btn pink" style="grid-column:1/-1;justify-self:center;font-size:28px;min-height:84px;padding:0 40px">${I.sound} Start</button>`;
    $(".btn", wrap).onclick = () => round(true);
  }

  /* Ask & answer: What is this? / What do you have? */
  function talk(mode = "this") {
    view.innerHTML = `
      ${head("Ask & answer", "Hỏi và đáp")}
      <div class="tabs" role="group" aria-label="Question">
        <button class="chip" data-m="this" aria-pressed="${mode === "this"}">What is this?<small>Đây là gì?</small></button>
        <button class="chip" data-m="have" aria-pressed="${mode === "have"}">What do you have?<small>Bạn có gì?</small></button>
      </div>
      <div class="talk" id="talk"></div>`;
    $$("[data-m]").forEach(b => b.onclick = () => { hush(); talk(b.dataset.m); });
    mode === "this" ? talkThis() : talkHave();
  }

  function talkThis() {
    const deck = shuffle(NOUNS);
    let i = 0;
    const box = $("#talk");
    function show() {
      const w = deck[i % deck.length];
      box.innerHTML = `
        <button class="mystery hidden" aria-label="Tap to see">
          <img src="${img(w.id)}" alt=""><span class="qmark" aria-hidden="true">?</span>
        </button>
        <div class="speech">
          <div class="line"><span class="who" aria-hidden="true">👩‍🏫</span><span class="say">What is this?</span><button class="btn round white" id="askQ" aria-label="Hear the question">${I.sound}</button></div>
          <div class="line answer"><span class="who" aria-hidden="true">🧒</span><span class="say" id="ans">${w.id === "scissors" ? "These are" : "This is"}<span class="blank"></span></span></div>
          <p style="margin:0;font-weight:700">Chạm vào hình để xem đáp án.</p>
          <div><button class="btn blue" id="nextQ">Next ${I.next}</button></div>
        </div>`;
      const m = $(".mystery", box);
      let open = false;
      m.onclick = async () => {
        if (open) { say("this_" + w.id); return; }
        open = true; m.classList.remove("hidden");
        $("#ans").innerHTML = w.id === "scissors" ? 'These are <b style="color:var(--berry-deep)">scissors</b>.' : `This is a <b style="color:var(--berry-deep)">${w.en}</b>.`;
        chime(); addStar(1, m);
        await say("this_" + w.id);
      };
      $("#askQ").onclick = () => say("q_this");
      $("#nextQ").onclick = () => { i++; show(); say("q_this"); };
    }
    show();
  }

  function talkHave() {
    const box = $("#talk");
    let last = null;
    box.innerHTML = `
      <button class="bag" aria-label="Open the backpack">
        <img class="out" alt="">
        <img src="${img("backpack")}" alt="">
      </button>
      <div class="speech">
        <div class="line"><span class="who" aria-hidden="true">👩‍🏫</span><span class="say">What do you have?</span><button class="btn round white" id="askH" aria-label="Hear the question">${I.sound}</button></div>
        <div class="line answer"><span class="who" aria-hidden="true">🧒</span><span class="say" id="ansH">I have<span class="blank"></span></span></div>
        <p style="margin:0;font-weight:700">Chạm vào ba lô để lấy đồ ra.</p>
      </div>`;
    const bag = $(".bag"), out = $(".out", bag);
    $("#askH").onclick = () => say("q_have");
    bag.onclick = async () => {
      const id = pick(SUPPLIES.filter(s => s !== "backpack" && s !== last));
      last = id;
      out.classList.remove("up"); bag.classList.remove("shake"); void out.offsetWidth;
      bag.classList.add("shake"); out.src = img(id); out.classList.add("up");
      $("#ansH").innerHTML = `I have ${W[id].a.startsWith("a ") ? "a " : ""}<b style="color:var(--berry-deep)">${W[id].en}</b>.`;
      chime(); addStar(1, bag);
      await say("q_have", "have_" + id);
    };
  }

  /* Tidy up: put the right thing in the toy box */
  function tidy() {
    const items = shuffle(SUPPLIES);
    let queue = shuffle(SUPPLIES), missed = 0;
    const slots = shuffle([[4, 6], [40, 3], [76, 8], [6, 58], [78, 60], [22, 32], [60, 30]]).slice(0, items.length);
    const mobileSlots = shuffle([[4, 4], [38, 2], [70, 5], [4, 42], [70, 42], [37, 30]]);

    view.innerHTML = `
      ${head("Tidy up", "Dọn dẹp – kéo hoặc chạm đồ vật để cất vào hộp")}
      <div class="task">
        <button class="btn round pink" id="again" aria-label="Hear again">${I.sound}</button>
        <span class="say" id="task" aria-live="polite">Let's tidy up!</span>
      </div>
      <div class="room" id="room">
                <div class="toybox" id="box">Toy box</div>
        ${items.map((id, k) => {
          const small = matchMedia("(max-width: 720px)").matches;
          const [x, y] = small ? mobileSlots[k] : slots[k];
          return `<button class="toy" data-id="${id}" aria-label="${W[id].en}" style="left:${x}%;top:${y}%;transform:rotate(${Math.round(Math.random() * 40 - 20)}deg)"><img src="${img(id)}" alt=""></button>`;
        }).join("")}
      </div>`;

    const box = $("#box"), task = $("#task");
    const current = () => queue[0];
    const ask = async (...pre) => { if (!current()) return; task.textContent = `Put away the ${W[current()].en}.`; await say(...pre, "put_" + current()); };
    $("#again").onclick = () => ask();

    function tryPut(el) {
      const id = el.dataset.id;
      if (id !== current()) {
        missed++; chime(false);
        el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong");
        el.style.translate = "";
        ask("no1");
        return;
      }
      const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      el.classList.remove("dragging");
      el.style.translate = `${b.left + b.width / 2 - (r.left + r.width / 2) + (parseFloat(el.dataset.tx) || 0)}px ${b.top + b.height / 3 - (r.top + r.height / 2) + (parseFloat(el.dataset.ty) || 0)}px`;
      el.style.scale = ".3";
      el.classList.add("gone");
      box.classList.remove("gulp"); void box.offsetWidth; box.classList.add("gulp");
      chime(); addStar(1, box);
      queue.shift();
      if (queue.length) setTimeout(() => ask(praise()), 300);
      else setTimeout(win, 600);
    }

    $$(".toy").forEach(el => {
      let start = null, moved = false;
      el.addEventListener("pointerdown", e => {
        start = [e.clientX, e.clientY]; moved = false; el.dataset.tx = 0; el.dataset.ty = 0;
        el.setPointerCapture(e.pointerId); el.classList.add("dragging");
      });
      el.addEventListener("pointermove", e => {
        if (!start) return;
        const dx = e.clientX - start[0], dy = e.clientY - start[1];
        if (Math.hypot(dx, dy) > 8) moved = true;
        el.dataset.tx = dx; el.dataset.ty = dy;
        el.style.translate = `${dx}px ${dy}px`;
        const b = box.getBoundingClientRect();
        box.classList.toggle("hot", e.clientX > b.left && e.clientX < b.right && e.clientY > b.top - 30 && e.clientY < b.bottom);
      });
      const end = e => {
        if (!start) return;
        start = null; el.classList.remove("dragging"); box.classList.remove("hot");
        const b = box.getBoundingClientRect();
        const overBox = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top - 30 && e.clientY < b.bottom;
        if (!moved) { el.style.translate = ""; el.dataset.tx = 0; el.dataset.ty = 0; tryPut(el); }
        else if (overBox) tryPut(el);
        else el.style.translate = "";
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", () => { start = null; el.style.translate = ""; el.classList.remove("dragging"); });
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tryPut(el); } });
    });

    function win() {
      view.innerHTML = `
        ${head("Tidy up", "Dọn dẹp")}
        <div class="panel win-card">
          <img src="${img("tidyup")}" alt="Children tidying up the classroom">
          <h2>All tidy! ⭐</h2>
          <button class="btn green">${I.again} Play again</button>
        </div>`;
      say("done", "w_tidyup");
      $(".win-card .btn").onclick = tidy;
    }

    // Start on a tap so sound is allowed
    task.innerHTML = `<button class="btn green" id="go">${I.sound} Start</button>`;
    $("#go").onclick = () => ask("tidy_intro");
  }

  /* ---------- router ---------- */
  const ROUTES = { home, words: () => words(), letter, find, talk: () => talk(), tidy };
  function route() {
    hush();
    if (cleanup) { cleanup(); cleanup = null; }
    const r = (location.hash || "#home").slice(1);
    (ROUTES[r] || home)();
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
  $("#brandLogo").src = img("logo");
  addEventListener("hashchange", route);
  route();
})();
