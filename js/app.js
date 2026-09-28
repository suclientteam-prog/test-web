/* Little Star English – pages & games */
(() => {
  "use strict";
  const L = window.LS;
  const { $, $$, wait, shuffle, pick, img, restart, W, WORDS, NOUNS, SUPPLIES, I, say, hush, praise, sfx, addStar, celebrate } = L;
  const view = $("#view");
  const sWord = en => en[0] === "s" ? `<span class="s-first">s</span>${en.slice(1)}` : en;
  const head = (en, vi) => `
    <div class="page-head">
      <a class="back" href="#home" aria-label="Back to home">${I.back}</a>
      <h1 class="page-title">${en}<small>${vi}</small></h1>
    </div>`;

  /* Each page can register clean-up work (timers, listeners, animation loops). */
  let cleaners = [];
  const onLeave = fn => cleaners.push(fn);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); onLeave(() => clearTimeout(t)); return t; };
  const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); onLeave(() => target.removeEventListener(ev, fn, opt)); };
  let pageId = 0; // guards async work after leaving a page
  const alive = id => id === pageId;

  /* ---------- home ---------- */
  const LITTLE = [
    { r: "taphear", en: "Tap & hear",   vi: "Chạm và nghe", im: "book",      tint: "#ffe28a" },
    { r: "bubbles", en: "Bubble pop",   vi: "Bắn bong bóng", im: "snake",    tint: "#c9e8ff" },
    { r: "peekaboo", en: "Peekaboo",    vi: "Ú òa",          im: "crayon",    tint: "#ffd0dd" },
    { r: "shadow",  en: "Shadow match", vi: "Tìm cái bóng",  im: "scissors",  tint: "#e3d7ff" },
    { r: "memory",  en: "Find the same", vi: "Lật thẻ",      im: "pencil",    tint: "#c7f0b5" },
    { r: "pack",    en: "Pack my bag",  vi: "Xếp ba lô",     im: "backpack",  tint: "#ffe0b8" },
  ];
  const BIG = [
    { r: "words",  en: "Words",         vi: "Học từ vựng",  im: "school",    tint: "#ffe28a" },
    { r: "letter", en: "Letter S",      vi: "Chữ S",        im: "snake",     tint: "#c7f0b5" },
    { r: "find",   en: "Listen & find", vi: "Nghe và chọn", im: "gluestick", tint: "#ffd0dd" },
    { r: "talk",   en: "Ask & answer",  vi: "Hỏi và đáp",   im: "chair",     tint: "#c9e8ff" },
    { r: "tidy",   en: "Tidy up",       vi: "Dọn dẹp",      im: "tidyup",    tint: "#ffe0b8" },
  ];
  const doorHTML = d => `
    <a class="door" href="#${d.r}" style="--tint:${d.tint}">
      <span class="door-pic"><img src="${img(d.im)}" alt=""></span>
      <b>${d.en}</b><span>${d.vi}</span>
    </a>`;

  function home() {
    const title = "Let's play!".split("").map((c, i) => `<span style="animation-delay:${i * 45}ms">${c === " " ? "&nbsp;" : c}</span>`).join("");
    view.innerHTML = `
      <section class="hello">
        <h1 aria-label="Let's play!">${title}</h1>
        <p>Chọn một trò chơi nhé!</p>
      </section>
      <section class="shelf">
        <h2 class="shelf-title">Play & listen <small>Cho bé từ 3 tuổi</small></h2>
        <nav class="doors" aria-label="Games for 3 year olds">${LITTLE.map(doorHTML).join("")}</nav>
      </section>
      <section class="shelf">
        <h2 class="shelf-title">Learn & practise <small>Cho bé từ 4 tuổi</small></h2>
        <nav class="doors" aria-label="Lesson activities">${BIG.map(doorHTML).join("")}</nav>
      </section>`;
  }

  /* ---------- sticker book ---------- */
  function stickers() {
    const s = L.save;
    const fresh = new Set(s.fresh);
    const need = L.nextStickerIn();
    const pct = need ? ((L.STARS_PER_STICKER - need) / L.STARS_PER_STICKER) * 100 : 100;
    view.innerHTML = `
      ${head("My stickers", "Sổ sticker của bé")}
      <div class="panel sticker-head">
        <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${L.STARS_PER_STICKER}" aria-valuenow="${L.STARS_PER_STICKER - need}">
          <div class="meter-fill" style="width:${pct}%"></div>
          <span>${need ? `Còn ${need} ⭐ nữa là có sticker mới` : "Bé đã có đủ sticker!"}</span>
        </div>
        <b class="sticker-total">${s.stickers.length} / ${L.STICKERS.length}</b>
      </div>
      <div class="sticker-book">
        ${L.STICKERS.map(st => {
          const has = s.stickers.includes(st.id);
          const label = st.en || (W[st.id] ? W[st.id].en : st.id);
          return has
            ? `<button class="sticker-slot has ${fresh.has(st.id) ? "new" : ""}" data-id="${st.id}" aria-label="${label}"><span class="sticker-art">${L.stickerArt(st)}</span></button>`
            : `<div class="sticker-slot locked" aria-label="Locked sticker"><span class="sticker-art">${L.stickerArt(st)}</span><span class="lock">?</span></div>`;
        }).join("")}
      </div>`;
    $$(".sticker-slot.has").forEach(b => b.onclick = () => {
      restart(b, "jiggle"); sfx("boing");
      const id = b.dataset.id;
      if (L.TEXT["w_" + id] || id === "tidyup") say(id === "tidyup" ? "w_tidyup" : "w_" + id);
    });
    s.fresh = []; L.persist(); L.renderStars();
  }

  /* ================= GAMES FOR 3 YEAR OLDS ================= */

  /* Tap & hear: every picture talks */
  function taphear() {
    const heard = new Set();
    view.innerHTML = `
      ${head("Tap & hear", "Chạm vào hình để nghe")}
      <div class="board">
        ${shuffle(WORDS).map(w => `<button class="talk-tile" data-id="${w.id}" aria-label="${w.en}" style="--edge:${w.edge}">
          <img src="${img(w.id)}" alt=""><b>${sWord(w.en)}</b></button>`).join("")}
      </div>`;
    say("tap_hear");
    $$(".talk-tile").forEach(t => t.onclick = () => {
      const id = t.dataset.id;
      restart(t, "boing"); sfx("pop");
      say(id === "tidyup" ? "w_tidyup" : "w_" + id);
      if (!heard.has(id)) {
        heard.add(id); t.classList.add("heard");
        if (heard.size % 3 === 0) addStar(1, t);
        if (heard.size === WORDS.length) later(() => { addStar(2); celebrate({ again: taphear }); }, 1300);
      }
    });
  }

  /* Bubble pop: tap bubbles, hear the word */
  function bubbles() {
    const id = pageId, GOAL = 12;
    let popped = 0, last = 0, raf = 0, spawnAt = 0;
    view.innerHTML = `
      ${head("Bubble pop", "Chạm để làm vỡ bong bóng")}
      <div class="stage sky" id="stage">
        <div class="pop-meter" aria-label="Bubbles popped"><span id="popBar"></span></div>
        <p class="pop-word" id="popWord" aria-live="polite"></p>
      </div>`;
    const stage = $("#stage"), bar = $("#popBar"), word = $("#popWord");
    const live = [];
    say("pop_bubbles");

    function spawn() {
      const w = pick(NOUNS);
      const r = stage.getBoundingClientRect();
      const size = Math.max(92, Math.min(r.width * 0.26, r.height * 0.3, 170));
      const el = document.createElement("button");
      el.className = "bubble-b"; el.setAttribute("aria-label", w.en);
      el.style.width = el.style.height = size + "px";
      el.innerHTML = `<img src="${img(w.id)}" alt="">`;
      const b = { el, w, x: Math.random() * (r.width - size), y: r.height + 10, size, speed: (r.height / 7) * (0.8 + Math.random() * 0.5), phase: Math.random() * 6, dead: false };
      el.addEventListener("pointerdown", e => { e.preventDefault(); pop(b); });
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pop(b); } });
      stage.appendChild(el); live.push(b);
    }
    function pop(b) {
      if (b.dead) return; b.dead = true;
      sfx("pop"); b.el.classList.add("popped");
      const ring = document.createElement("span"); ring.className = "pop-ring";
      ring.style.left = b.x + b.size / 2 + "px"; ring.style.top = b.y + b.size / 2 + "px";
      stage.appendChild(ring); setTimeout(() => ring.remove(), 600);
      setTimeout(() => b.el.remove(), 320);
      word.innerHTML = sWord(b.w.en); restart(word, "show");
      say("w_" + b.w.id);
      popped++; bar.style.width = (popped / GOAL) * 100 + "%";
      if (popped % 3 === 0) addStar(1, b.el);
      if (popped === GOAL) {
        later(() => { if (!alive(id)) return; live.forEach(x => { x.dead = true; x.el.remove(); }); addStar(2); celebrate({ again: bubbles }); }, 900);
      }
    }
    function tick(now) {
      if (!alive(id)) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (!L.isCelebrating() && popped < GOAL && !document.hidden) {
        if (now > spawnAt && live.filter(b => !b.dead).length < 6) { spawn(); spawnAt = now + 900 + Math.random() * 600; }
        for (const b of live) {
          if (b.dead) continue;
          b.y -= b.speed * dt;
          const sway = Math.sin(now / 700 + b.phase) * 14;
          b.el.style.transform = `translate(${b.x + sway}px, ${b.y}px)`;
          if (b.y < -b.size - 20) { b.dead = true; b.el.remove(); }
        }
      }
      for (let i = live.length - 1; i >= 0; i--) if (live[i].dead && !live[i].el.isConnected) live.splice(i, 1);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    onLeave(() => cancelAnimationFrame(raf));
  }

  /* Peekaboo: open the boxes */
  function peekaboo() {
    const id = pageId, ROUNDS = 4;
    let round = 0;
    view.innerHTML = `
      ${head("Peekaboo", "Ú òa! Mở hộp xem có gì")}
      <div class="round-dots" id="rd">${Array.from({ length: ROUNDS }, () => "<i></i>").join("")}</div>
      <div class="boxes" id="boxes"></div>
      <p class="peek-line" id="peekLine" aria-live="polite">&nbsp;</p>`;
    const wrap = $("#boxes"), line = $("#peekLine");
    const colors = [["#ff5c8a", "#ffc53d"], ["#3aa0e8", "#ff5c8a"], ["#5dbb63", "#ffc53d"]];
    function deal() {
      const items = shuffle(NOUNS).slice(0, 3);
      let opened = 0;
      line.innerHTML = "&nbsp;";
      wrap.innerHTML = items.map((w, k) => `
        <button class="gift" data-id="${w.id}" aria-label="Open box ${k + 1}" style="--box:${colors[k][0]};--ribbon:${colors[k][1]}">
          <img class="gift-toy" src="${img(w.id)}" alt="">
          <span class="gift-lid"></span><span class="gift-body"></span>
        </button>`).join("");
      $$(".gift", wrap).forEach(g => g.onclick = async () => {
        if (g.classList.contains("open")) { say("this_" + g.dataset.id); return; }
        g.classList.add("open"); sfx("whoosh"); setTimeout(() => sfx("pop"), 180);
        const w = W[g.dataset.id];
        line.textContent = w.id === "scissors" ? "These are scissors." : `This is ${w.a}.`;
        opened++;
        const last = opened === 3;
        await say("peekaboo", "this_" + w.id);
        if (!alive(id)) return;
        if (last) {
          $$("#rd i")[round].classList.add("on"); addStar(1, wrap); round++;
          if (round >= ROUNDS) later(() => { addStar(1); celebrate({ again: peekaboo }); }, 400);
          else later(deal, 700);
        }
      });
    }
    deal();
  }

  /* Shadow match: two shadows, one is right */
  function shadow() {
    const id = pageId, ROUNDS = 6;
    const order = shuffle(NOUNS).slice(0, ROUNDS);
    let n = 0;
    view.innerHTML = `
      ${head("Shadow match", "Tìm cái bóng đúng")}
      <div class="round-dots" id="rd">${Array.from({ length: ROUNDS }, () => "<i></i>").join("")}</div>
      <div class="shadow-game">
        <div class="shadow-hero" id="hero"></div>
        <div class="shadow-opts" id="opts"></div>
      </div>`;
    const hero = $("#hero"), opts = $("#opts");
    function next(first) {
      if (n >= ROUNDS) { addStar(2); celebrate({ again: shadow }); return; }
      const w = order[n];
      const other = pick(NOUNS.filter(x => x.id !== w.id));
      hero.innerHTML = `<button class="hero-card" aria-label="${w.en}"><img src="${img(w.id)}" alt=""></button>`;
      $(".hero-card", hero).onclick = () => say("w_" + w.id);
      opts.innerHTML = shuffle([w, other]).map(o => `<button class="shade" data-id="${o.id}" aria-label="Shadow"><img src="${img(o.id)}" alt=""></button>`).join("");
      let done = false;
      $$(".shade", opts).forEach(b => b.onclick = async () => {
        if (done) return;
        if (b.dataset.id === w.id) {
          done = true; b.classList.add("lit"); sfx("good"); addStar(1, b);
          $$("#rd i")[n].classList.add("on");
          await say("w_" + w.id, praise());
          if (!alive(id)) return;
          n++; later(() => next(false), 300);
        } else { restart(b, "wiggle"); sfx("bad"); }
      });
      if (first) say("find_shadow");
    }
    next(true);
  }

  /* Find the same: memory cards */
  function memory() {
    const id = pageId, LEVELS = [2, 3, 3];
    let level = 0;
    view.innerHTML = `
      ${head("Find the same", "Lật thẻ tìm hai hình giống nhau")}
      <div class="round-dots" id="rd">${LEVELS.map(() => "<i></i>").join("")}</div>
      <div class="mem" id="mem"></div>`;
    const grid = $("#mem");
    function deal(first) {
      const pairs = LEVELS[level];
      const picks = shuffle(NOUNS).slice(0, pairs);
      const cards = shuffle([...picks, ...picks]);
      grid.dataset.n = cards.length;
      grid.innerHTML = cards.map((w, k) => `
        <button class="mcard" data-id="${w.id}" data-k="${k}" aria-label="Card ${k + 1}">
          <span class="mface mback">${I.star}</span>
          <span class="mface mfront"><img src="${img(w.id)}" alt=""></span>
        </button>`).join("");
      let open = [], lock = false, found = 0;
      $$(".mcard", grid).forEach(c => c.onclick = async () => {
        if (lock || c.classList.contains("up")) return;
        c.classList.add("up"); c.setAttribute("aria-label", W[c.dataset.id].en); sfx("flip");
        say("w_" + c.dataset.id);
        open.push(c);
        if (open.length < 2) return;
        lock = true;
        const [a, b] = open; open = [];
        await wait(700);
        if (!alive(id)) return;
        if (a.dataset.id === b.dataset.id) {
          a.classList.add("match"); b.classList.add("match"); sfx("good"); addStar(1, b); found++;
          if (found === pairs) {
            $$("#rd i")[level].classList.add("on"); level++;
            await say(praise());
            if (!alive(id)) return;
            if (level >= LEVELS.length) { addStar(1); celebrate({ again: memory }); }
            else later(() => deal(false), 400);
          }
        } else {
          sfx("boing"); await wait(350);
          a.classList.remove("up"); b.classList.remove("up");
          a.setAttribute("aria-label", "Card"); b.setAttribute("aria-label", "Card");
        }
        lock = false;
      });
      if (first) say("find_same");
    }
    deal(true);
  }

  /* Pack my bag: tap things to put them in the backpack */
  function pack() {
    const id = pageId;
    const things = shuffle(["book", "crayon", "pencil", "gluestick", "scissors"]);
    let left = things.length;
    view.innerHTML = `
      ${head("Pack my bag", "Chạm đồ dùng để cất vào ba lô")}
      <div class="pack">
        <div class="pack-row">${things.slice(0, 3).map(t => `<button class="pack-item" data-id="${t}" aria-label="${W[t].en}"><img src="${img(t)}" alt=""></button>`).join("")}</div>
        <div class="pack-bag" id="bag"><img src="${img("backpack")}" alt="Backpack"><p class="pack-say" id="packSay" aria-live="polite">&nbsp;</p></div>
        <div class="pack-row">${things.slice(3).map(t => `<button class="pack-item" data-id="${t}" aria-label="${W[t].en}"><img src="${img(t)}" alt=""></button>`).join("")}</div>
      </div>`;
    const bag = $("#bag"), bagImg = $("#bag img"), line = $("#packSay");
    say("pack_bag");
    $$(".pack-item").forEach(b => b.onclick = async () => {
      if (b.classList.contains("in")) return;
      const r = b.getBoundingClientRect(), g = bagImg.getBoundingClientRect();
      b.style.setProperty("--tx", g.left + g.width / 2 - (r.left + r.width / 2) + "px");
      b.style.setProperty("--ty", g.top + g.height * 0.45 - (r.top + r.height / 2) + "px");
      b.classList.add("in"); sfx("whoosh");
      setTimeout(() => { restart(bag, "gulp"); sfx("pop"); }, 420);
      line.textContent = `I have ${W[b.dataset.id].a}.`;
      addStar(1, bag);
      left--;
      const finished = left === 0;
      await say("have_" + b.dataset.id);
      if (!alive(id)) return;
      if (finished) {
        sfx("zip"); restart(bag, "hop"); line.textContent = "Let's go to school!";
        await say("go_school");
        if (alive(id)) celebrate({ again: pack, voice: ["hooray"] });
      }
    });
  }

  /* ================= LESSON ACTIVITIES (4+) ================= */

  const GROUPS = [
    { id: "all",   en: "All words",    vi: "Tất cả" },
    { id: "s",     en: "Letter S",     vi: "28, 29/9" },
    { id: "tidy",  en: "Tidy up",      vi: "30/9 – 02/10" },
    { id: "class", en: "My classroom", vi: "01, 02/10" },
  ];
  function words(state = { group: "all", i: 0 }) {
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
    const key = w => w.id === "tidyup" ? "w_tidyup" : "w_" + w.id;
    const go = d => { state.i = (state.i + d + list.length) % list.length; sfx("flip"); render(() => words(state)); say(key(list[state.i])); };
    card.onclick = () => { restart(card, "pop"); say(key(w)); };
    $(".prev").onclick = () => go(-1);
    $(".next").onclick = () => go(1);
    $$(".chip").forEach(c => c.onclick = () => { state.group = c.dataset.g; state.i = 0; render(() => words(state)); });
    let sx = null;
    card.addEventListener("pointerdown", e => { sx = e.clientX; });
    card.addEventListener("pointerup", e => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 60) { card.onclick = null; go(dx < 0 ? 1 : -1); }
    });
    listen(document, "keydown", e => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
  }

  function letter() {
    const sw = ["school", "scissors", "snake"];
    view.innerHTML = `
      ${head("Letter S", "Chữ S – âm /s/")}
      <div class="letter-grid">
        <section class="panel">
          <button class="big-s" aria-label="Letter S">Ss</button>
          <div class="qa">
            <div class="qa-row">
              <button class="btn green" data-q="letter">${I.sound}<span>What letter is it?</span></button>
              <span class="bubble" id="ansLetter">?</span>
            </div>
            <div class="qa-row">
              <button class="btn pink" data-q="sound">${I.sound}<span>What sound is it?</span></button>
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
    bigS.onclick = () => { restart(bigS, "wiggle"); say("a_letter", "s_hiss"); };
    let askedL = false, askedS = false;
    $$("[data-q]").forEach(b => b.onclick = async () => {
      const isL = b.dataset.q === "letter";
      const el = $(isL ? "#ansLetter" : "#ansSound");
      el.classList.remove("show"); el.textContent = "?";
      if (!(await say(isL ? "q_letter" : "q_sound"))) return;
      el.textContent = isL ? "Letter “S”" : "Sound /s/"; el.classList.add("show"); restart(bigS, "wiggle"); sfx("good");
      await say(...(isL ? ["a_letter"] : ["a_sound", "s_hiss"]));
      if (isL && !askedL) { askedL = true; addStar(1, el); }
      if (!isL && !askedS) { askedS = true; addStar(1, el); }
    });
    $$(".mini").forEach(b => b.onclick = () => say("w_" + b.dataset.w));

    const cv = $("#trace"), ctx = cv.getContext("2d");
    let drawn = 0, last = null;
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = r.width;
      ctx.clearRect(0, 0, w, w);
      ctx.font = `700 ${w * 0.92}px Andika, "Baloo 2", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(93,187,99,.22)"; ctx.fillText("S", w / 2, w * 0.54);
      ctx.setLineDash([10, 12]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(58,42,31,.45)";
      ctx.strokeText("S", w / 2, w * 0.54); ctx.setLineDash([]);
      drawn = 0;
    };
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
      if (drawn < cv.getBoundingClientRect().width * 0.8) { sfx("bad"); say("no1"); return; }
      sfx("good"); addStar(1, e.currentTarget); say(praise(), "a_letter"); later(size, 1400);
    };
    const myId = pageId;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => alive(myId) && size());
    let rw = innerWidth;
    listen(window, "resize", () => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; size(); } });
  }

  function find() {
    const id = pageId, ROUNDS = 8;
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
    const hear = async (...pre) => { ear.classList.add("playing"); await say(...pre, "w_" + order[n].id); ear.classList.remove("playing"); };
    ear.onclick = () => hear();
    function round(first) {
      if (n >= ROUNDS) { celebrate({ title: `${got} / ${ROUNDS}`, sub: got >= ROUNDS - 2 ? "Bé giỏi quá!" : "Cố lên nhé!", again: find }); return; }
      locked = false; missed = false; word.textContent = "";
      const ans = order[n];
      const opts = shuffle([ans, ...shuffle(NOUNS.filter(w => w.id !== ans.id)).slice(0, 2)]);
      wrap.innerHTML = opts.map(o => `<button class="choice" data-id="${o.id}" aria-label="${o.en}"><img src="${img(o.id)}" alt=""></button>`).join("");
      $$(".choice", wrap).forEach(c => c.onclick = async () => {
        if (locked) return;
        if (c.dataset.id === ans.id) {
          locked = true; c.classList.add("right"); word.innerHTML = sWord(ans.en); sfx("good");
          if (!missed) { got++; $$(".progress i")[n].classList.add("got"); addStar(1, c); }
          await say(praise());
          if (!alive(id)) return;
          n++; later(() => round(false), 300);
        } else {
          missed = true; restart(c, "wrong"); sfx("bad"); hear("no1");
        }
      });
      first ? hear("listen") : hear();
    }
    round(true);
  }

  function talk(mode = "this") {
    view.innerHTML = `
      ${head("Ask & answer", "Hỏi và đáp")}
      <div class="chips" role="group" aria-label="Question">
        <button class="chip" data-m="this" aria-pressed="${mode === "this"}">What is this?<small>Đây là gì?</small></button>
        <button class="chip" data-m="have" aria-pressed="${mode === "have"}">What do you have?<small>Bạn có gì?</small></button>
      </div>
      <div class="talk" id="talk"></div>`;
    $$("[data-m]").forEach(b => b.onclick = () => render(() => talk(b.dataset.m)));
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
          <div class="line answer"><span class="who" aria-hidden="true">🧒</span><span class="say" id="ans">${w.id === "scissors" ? "These are" : "This is"} <span class="blank"></span></span></div>
          <p class="hint">Chạm vào hình để xem đáp án.</p>
          <div><button class="btn blue" id="nextQ">Next ${I.next}</button></div>
        </div>`;
      const m = $(".mystery", box);
      let open = false;
      m.onclick = async () => {
        if (open) { say("this_" + w.id); return; }
        open = true; m.classList.remove("hidden");
        $("#ans").innerHTML = w.id === "scissors" ? 'These are <b class="hl">scissors</b>.' : `This is a <b class="hl">${w.en}</b>.`;
        sfx("good"); addStar(1, m);
        await say("this_" + w.id);
      };
      $("#askQ").onclick = () => say("q_this");
      $("#nextQ").onclick = () => { i++; sfx("flip"); show(); say("q_this"); };
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
        <div class="line answer"><span class="who" aria-hidden="true">🧒</span><span class="say" id="ansH">I have <span class="blank"></span></span></div>
        <p class="hint">Chạm vào ba lô để lấy đồ ra.</p>
      </div>`;
    const bag = $(".bag"), out = $(".out", bag);
    $("#askH").onclick = () => say("q_have");
    bag.onclick = async () => {
      const id = pick(SUPPLIES.filter(s => s !== "backpack" && s !== last));
      last = id;
      out.classList.remove("up"); void out.offsetWidth;
      restart(bag, "shake"); out.src = img(id); out.classList.add("up"); sfx("whoosh");
      $("#ansH").innerHTML = `I have ${W[id].a.startsWith("a ") ? "a " : ""}<b class="hl">${W[id].en}</b>.`;
      addStar(1, bag);
      await say("q_have", "have_" + id);
    };
  }

  function tidy() {
    const id = pageId;
    const items = shuffle(SUPPLIES);
    const queue = shuffle(SUPPLIES);
    // [desktop x, y, phone x, y] in % of the room
    const spots = shuffle([[4, 6, 4, 4], [40, 4, 38, 3], [76, 8, 70, 6], [5, 56, 4, 40], [78, 58, 70, 40], [24, 30, 37, 22]]);
    view.innerHTML = `
      ${head("Tidy up", "Dọn dẹp – kéo hoặc chạm đồ vật để cất vào hộp")}
      <div class="task">
        <button class="btn round pink" id="again" aria-label="Hear again">${I.sound}</button>
        <span class="say" id="task" aria-live="polite">Let's tidy up!</span>
      </div>
      <div class="room" id="room">
        <div class="toybox" id="box">Toy box</div>
        ${items.map((t, k) => { const [x, y, mx, my] = spots[k]; return `<button class="toy" data-id="${t}" aria-label="${W[t].en}" style="--x:${x}%;--y:${y}%;--mx:${mx}%;--my:${my}%;--rot:${Math.round(Math.random() * 36 - 18)}deg"><img src="${img(t)}" alt=""></button>`; }).join("")}
      </div>`;
    const box = $("#box"), task = $("#task");
    const current = () => queue[0];
    const ask = async (...pre) => { if (!current()) return; task.textContent = `Put away the ${W[current()].en}.`; await say(...pre, "put_" + current()); };
    $("#again").onclick = () => ask();
    const overBox = (x, y) => { const b = box.getBoundingClientRect(); return x > b.left - 10 && x < b.right + 10 && y > b.top - 40 && y < b.bottom; };

    function tryPut(el) {
      if (el.dataset.id !== current()) {
        sfx("bad"); el.style.translate = ""; restart(el, "wrong"); ask("no1"); return;
      }
      const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      const tx = parseFloat(el.dataset.tx) || 0, ty = parseFloat(el.dataset.ty) || 0;
      el.classList.remove("dragging");
      el.style.translate = `${b.left + b.width / 2 - (r.left + r.width / 2) + tx}px ${b.top + b.height / 3 - (r.top + r.height / 2) + ty}px`;
      el.style.scale = ".3"; el.classList.add("gone");
      restart(box, "gulp"); sfx("whoosh"); setTimeout(() => sfx("pop"), 380);
      addStar(1, box);
      queue.shift();
      if (queue.length) later(() => ask(praise()), 350);
      else later(async () => { task.textContent = "All tidy!"; await say("done"); if (alive(id)) celebrate({ again: tidy, voice: ["w_tidyup"] }); }, 600);
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
        if (Math.hypot(dx, dy) > 10) moved = true;
        el.dataset.tx = dx; el.dataset.ty = dy;
        el.style.translate = `${dx}px ${dy}px`;
        box.classList.toggle("hot", overBox(e.clientX, e.clientY));
      });
      el.addEventListener("pointerup", e => {
        if (!start) return;
        start = null; el.classList.remove("dragging"); box.classList.remove("hot");
        if (!moved) { el.style.translate = ""; el.dataset.tx = 0; el.dataset.ty = 0; tryPut(el); }
        else if (overBox(e.clientX, e.clientY)) tryPut(el);
        else { el.style.translate = ""; sfx("boing"); }
      });
      el.addEventListener("pointercancel", () => { start = null; el.style.translate = ""; el.classList.remove("dragging"); });
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tryPut(el); } });
    });
    later(() => ask("tidy_intro"), 300);
  }

  /* ---------- router ---------- */
  function render(fn) {
    cleaners.forEach(f => { try { f(); } catch (e) { /* */ } });
    cleaners = []; pageId++;
    fn();
  }
  const ROUTES = {
    home, stickers, taphear, bubbles, peekaboo, shadow, memory, pack,
    words: () => words(), letter, find, talk: () => talk(), tidy,
  };
  function route() {
    hush(); L.closeCelebrate(); L.startSession();
    const r = (location.hash || "#home").slice(1);
    document.body.dataset.page = ROUTES[r] ? r : "home";
    render(ROUTES[r] || home);
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
  L.mountHeader();
  addEventListener("hashchange", route);
  route();
})();
