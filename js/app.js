/* Little Star English – pages & games */
(() => {
  "use strict";
  const L = window.LS, ART = window.ART;
  const { $, $$, wait, shuffle, pick, img, restart, W, WORDS, NOUNS, SUPPLIES, I, say, hush, praise, sfx, addStar, celebrate, buddy } = L;
  const view = $("#view");
  const sWord = en => en[0] === "s" ? `<span class="s-first">s</span>${en.slice(1)}` : en;
  const head = (en, vi) => `
    <div class="page-head">
      <a class="back" href="#home" aria-label="Back to home">${I.back}</a>
      <h1 class="page-title">${en}<small>${vi}</small></h1>
      ${L.buddyHTML("sm")}
    </div>`;
  const SONG = "https://youtu.be/tyxhkJau1O0?si=nCEM7StysrX0Qn9J";

  let cleaners = [];
  const onLeave = fn => cleaners.push(fn);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); onLeave(() => clearTimeout(t)); return t; };
  const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); onLeave(() => target.removeEventListener(ev, fn, opt)); };
  let pageId = 0;
  const alive = id => id === pageId;

  /* fly a picture from one element to a point on another (used by Pack my bag and My friend) */
  function fly(fromEl, toEl, fx, fy, src, ms = 620) {
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const el = document.createElement("img");
    el.src = src; el.alt = ""; el.className = "flyer";
    const size = Math.min(a.width, a.height) * 0.8;
    Object.assign(el.style, { left: a.left + a.width / 2 - size / 2 + "px", top: a.top + a.height / 2 - size / 2 + "px", width: size + "px", height: size + "px" });
    document.body.appendChild(el);
    const dx = b.left + b.width * fx - (a.left + a.width / 2), dy = b.top + b.height * fy - (a.top + a.height / 2);
    if (L.reduced() || !el.animate) { el.remove(); return Promise.resolve(); }
    return el.animate([
      { transform: "translate(0,0) scale(1) rotate(0)" },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(1.15) rotate(-12deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.45) rotate(8deg)`, opacity: 0.9 },
    ], { duration: ms, easing: "cubic-bezier(.4,0,.3,1)" }).finished.then(() => el.remove(), () => el.remove());
  }

  /* ---------- home ---------- */
  const FEATURED = [
    { r: "care", en: "My friend", vi: "Chăm sóc bạn nhỏ", art: `<span class="feat-friend">${ART.friend("cat").replace("mood-idle", "mood-happy wear-hat")}</span>`, tint: "#ffd6e5" },
    { r: "moon", en: "Moon night", vi: "Đêm Trung thu", art: `<img src="${img("lanternbunny")}" alt="">`, tint: "#2b3a6b", dark: true },
  ];
  const LITTLE = [
    { r: "taphear",  en: "Tap & hear",    vi: "Chạm và nghe",  im: "book",     tint: "#ffe28a" },
    { r: "bubbles",  en: "Bubble pop",    vi: "Bắn bong bóng", im: "e_bubbles", tint: "#c9e8ff" },
    { r: "peekaboo", en: "Peekaboo",      vi: "Ú òa",          im: "e_gift",   tint: "#ffd0dd" },
    { r: "shadow",   en: "Shadow match",  vi: "Tìm cái bóng",  im: "scissors", tint: "#e3d7ff" },
    { r: "memory",   en: "Find the same", vi: "Lật thẻ",       im: "mooncake", tint: "#c7f0b5" },
    { r: "pack",     en: "Pack my bag",   vi: "Xếp ba lô",     im: "backpack", tint: "#ffe0b8" },
  ];
  const BIG = [
    { r: "words",  en: "Words",         vi: "Học từ vựng",  im: "school",    tint: "#ffe28a" },
    { r: "letter", en: "Letter S",      vi: "Chữ S",        im: "snake",     tint: "#c7f0b5" },
    { r: "find",   en: "Listen & find", vi: "Nghe và chọn", im: "gluestick", tint: "#ffd0dd" },
    { r: "talk",   en: "Ask & answer",  vi: "Hỏi và đáp",   im: "moonlady",  tint: "#c9e8ff" },
    { r: "tidy",   en: "Tidy up",       vi: "Dọn dẹp",      im: "tidyup",    tint: "#ffe0b8" },
  ];
  const doorHTML = d => `
    <a class="door" href="#${d.r}" style="--tint:${d.tint}">
      <span class="door-pic"><img src="${img(d.im)}" alt=""></span>
      <b>${d.en}</b><span>${d.vi}</span>
    </a>`;

  function home() {
    view.innerHTML = `
      <section class="hero">
        ${L.buddyHTML("lg")}
        <div class="hero-text">
          <h1 aria-label="Let's play!">${"Let's play!".split("").map((c, i) => `<span style="animation-delay:${i * 45}ms">${c === " " ? "&nbsp;" : c}</span>`).join("")}</h1>
          <p>Bunny muốn chơi cùng bé. Chọn một trò nhé!</p>
        </div>
      </section>
      <nav class="featured" aria-label="New games">
        ${FEATURED.map(f => `
          <a class="feat ${f.dark ? "dark" : ""}" href="#${f.r}" style="--tint:${f.tint}">
            <span class="feat-art">${f.art}</span>
            <span class="feat-text"><b>${f.en}</b><span>${f.vi}</span></span>
            <span class="feat-new">NEW</span>
          </a>`).join("")}
      </nav>
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
    const s = L.save, fresh = new Set(s.fresh), need = L.nextStickerIn();
    const pct = need ? ((L.STARS_PER_STICKER - need) / L.STARS_PER_STICKER) * 100 : 100;
    view.innerHTML = `
      ${head("My stickers", "Sổ sticker – dùng sticker để chăm sóc bạn nhỏ")}
      <div class="panel sticker-head">
        <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${L.STARS_PER_STICKER}" aria-valuenow="${L.STARS_PER_STICKER - need}">
          <div class="meter-fill" style="width:${pct}%"></div>
          <span>${need ? `Còn ${need} ⭐ nữa là có sticker mới` : "Bé đã có đủ sticker!"}</span>
        </div>
        <b class="sticker-total">${s.stickers.length} / ${L.STICKERS.length}</b>
      </div>
      <div class="sticker-book">
        ${L.STICKERS.map(st => s.stickers.includes(st.id)
          ? `<button class="sticker-slot has ${fresh.has(st.id) ? "new" : ""}" data-id="${st.id}" aria-label="${st.id}"><span class="sticker-art">${L.stickerArt(st)}</span></button>`
          : `<div class="sticker-slot locked" aria-label="Locked sticker"><span class="sticker-art">${L.stickerArt(st)}</span><span class="lock">?</span></div>`).join("")}
      </div>`;
    $$(".sticker-slot.has").forEach(b => b.onclick = () => { restart(b, "jiggle"); sfx("boing"); say("w_" + b.dataset.id); });
    s.fresh = []; L.persist(); L.renderStars();
  }

  /* ================= GAMES FOR 3 YEAR OLDS ================= */
  function taphear() {
    const heard = new Set();
    view.innerHTML = `
      ${head("Tap & hear", "Chạm vào hình để nghe")}
      <div class="board">
        ${WORDS.map(w => `<button class="talk-tile" data-id="${w.id}" aria-label="${w.en}" style="--edge:${w.edge}"><img src="${img(w.id)}" alt=""><b>${sWord(w.en)}</b></button>`).join("")}
      </div>`;
    say("tap_hear");
    $$(".talk-tile").forEach(t => t.onclick = () => {
      const id = t.dataset.id;
      restart(t, "boing"); sfx("pop");
      say("w_" + id);
      if (!heard.has(id)) {
        heard.add(id); t.classList.add("heard");
        if (heard.size % 3 === 0) addStar(1, t);
        if (heard.size === WORDS.length) later(() => { addStar(2); celebrate({ again: taphear }); }, 1300);
      }
    });
  }

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
      const w = L.pickWeighted(NOUNS);
      const r = stage.getBoundingClientRect();
      const size = Math.max(96, Math.min(r.width * 0.27, r.height * 0.3, 176));
      const el = document.createElement("button");
      el.className = "bubble-b"; el.setAttribute("aria-label", w.en);
      el.style.width = el.style.height = size + "px";
      el.innerHTML = `<img src="${img(w.id)}" alt=""><span class="bubble-shine" aria-hidden="true"></span>`;
      const b = { el, w, x: Math.random() * (r.width - size), y: r.height + 10, size, speed: (r.height / 7.5) * (0.8 + Math.random() * 0.45), phase: Math.random() * 6, dead: false };
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
      if (popped === GOAL) later(() => { if (!alive(id)) return; live.forEach(x => { x.dead = true; x.el.remove(); }); addStar(2); celebrate({ again: bubbles }); }, 1000);
    }
    function tick(now) {
      if (!alive(id)) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (!L.isCelebrating() && popped < GOAL && !document.hidden) {
        if (now > spawnAt && live.filter(b => !b.dead).length < 6) { spawn(); spawnAt = now + 950 + Math.random() * 600; }
        for (const b of live) {
          if (b.dead) continue;
          b.y -= b.speed * dt;
          b.el.style.transform = `translate(${b.x + Math.sin(now / 700 + b.phase) * 14}px, ${b.y}px)`;
          if (b.y < -b.size - 20) { b.dead = true; b.el.remove(); }
        }
      }
      for (let i = live.length - 1; i >= 0; i--) if (live[i].dead && !live[i].el.isConnected) live.splice(i, 1);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    onLeave(() => cancelAnimationFrame(raf));
  }

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
        const wid = g.dataset.id;
        if (g.classList.contains("open")) { say(L.lineKey(wid)); return; }
        g.classList.add("open"); sfx("whoosh"); setTimeout(() => sfx("pop"), 180);
        line.textContent = L.lineText(wid);
        opened++;
        const last = opened === 3;
        await say("peekaboo", L.lineKey(wid));
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

  function shadow() {
    const id = pageId, ROUNDS = 6;
    let n = 0, prev = null;
    view.innerHTML = `
      ${head("Shadow match", "Tìm cái bóng đúng")}
      <div class="round-dots" id="rd">${Array.from({ length: ROUNDS }, () => "<i></i>").join("")}</div>
      <div class="shadow-game"><div class="shadow-hero" id="hero"></div><div class="shadow-opts" id="opts"></div></div>`;
    const hero = $("#hero"), opts = $("#opts");
    function next(first) {
      if (n >= ROUNDS) { addStar(2); celebrate({ again: shadow }); return; }
      const w = L.pickWeighted(NOUNS, prev); prev = w.id;
      const other = pick(NOUNS.filter(x => x.id !== w.id));
      hero.innerHTML = `<button class="hero-card" aria-label="${w.en}"><img src="${img(w.id)}" alt=""></button>`;
      $(".hero-card", hero).onclick = () => say("w_" + w.id);
      opts.innerHTML = shuffle([w, other]).map(o => `<button class="shade" data-id="${o.id}" aria-label="Shadow"><img src="${img(o.id)}" alt=""></button>`).join("");
      let done = false, missed = false;
      $$(".shade", opts).forEach(b => b.onclick = async () => {
        if (done) return;
        if (b.dataset.id === w.id) {
          done = true; b.classList.remove("hint"); b.classList.add("lit"); sfx("good"); addStar(1, b); L.learn(w.id, !missed);
          $$("#rd i")[n].classList.add("on");
          await say("w_" + w.id, praise());
          if (!alive(id)) return;
          n++; later(() => next(false), 300);
        } else {
          missed = true; restart(b, "wiggle"); sfx("bad");
          $$(".shade", opts).find(x => x.dataset.id === w.id).classList.add("hint");
          say("w_" + w.id);
        }
      });
      if (first) say("find_shadow");
    }
    next(true);
  }

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
        <button class="mcard" data-id="${w.id}" aria-label="Card ${k + 1}">
          <span class="mface mback">${I.star}</span><span class="mface mfront"><img src="${img(w.id)}" alt=""></span>
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
        await wait(750);
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
        }
        lock = false;
      });
      if (first) say("find_same");
    }
    deal(true);
  }

  function pack() {
    const id = pageId;
    const things = shuffle(["book", "crayon", "pencil", "gluestick", "scissors"]);
    let left = things.length;
    const btn = t => `<button class="pack-item" data-id="${t}" aria-label="${W[t].en}"><img src="${img(t)}" alt=""></button>`;
    view.innerHTML = `
      ${head("Pack my bag", "Chạm đồ dùng để cất vào ba lô")}
      <div class="pack">
        <div class="pack-row">${things.slice(0, 3).map(btn).join("")}</div>
        <div class="pack-bag" id="bag"><img src="${img("backpack")}" alt="Backpack"><p class="pack-say" id="packSay" aria-live="polite">&nbsp;</p></div>
        <div class="pack-row">${things.slice(3).map(btn).join("")}</div>
      </div>`;
    const bag = $("#bag"), bagImg = $("#bag img"), line = $("#packSay");
    say("pack_bag");
    $$(".pack-item").forEach(b => b.onclick = async () => {
      if (b.classList.contains("in")) return;
      b.classList.add("in"); sfx("whoosh");
      fly(b, bagImg, 0.5, 0.45, img(b.dataset.id)).then(() => { restart(bag, "gulp"); sfx("pop"); });
      line.textContent = `I have ${W[b.dataset.id].a}.`;
      addStar(1, bag);
      left--;
      const finished = left === 0;
      await say("have_" + b.dataset.id);
      if (!alive(id)) return;
      if (finished) {
        sfx("zip"); restart(bag, "hop"); line.textContent = "Let's go to school!";
        await say("go_school");
        if (alive(id)) celebrate({ again: pack });
      }
    });
  }

  /* ================= TAKE CARE OF MY FRIEND ================= */
  const FRIENDS = [
    { id: "bunny", en: "Bunny", vi: "Thỏ" },
    { id: "cat",   en: "Cat",   vi: "Mèo" },
    { id: "bear",  en: "Bear",  vi: "Gấu" },
  ];
  const ROOMS = {
    eat:   { en: "Eat",   vi: "Ăn",     icon: "e_apple",   intro: "hungry",    items: ["apple", "banana", "milk", "carrot", "cookie", "mooncake"] },
    bath:  { en: "Bath",  vi: "Tắm",    icon: "e_bathtub", intro: "bath_time", items: ["soap", "sponge", "shower"] },
    dress: { en: "Dress", vi: "Mặc đồ", icon: "e_shirt",   intro: "dress_up",  items: ["shirt", "shoes", "hat", "socks", "sunglasses", "crown"] },
    sleep: { en: "Sleep", vi: "Ngủ",    icon: "e_bed",     intro: "bed_time",  items: ["pillow", "teddy", "goodnight"] },
  };
  const ITEM = {
    apple: { en: "apple", art: "e_apple", voice: "eat_apple" }, banana: { en: "banana", art: "e_banana", voice: "eat_banana" },
    milk: { en: "milk", art: "e_milk", voice: "drink_milk" }, carrot: { en: "carrot", art: "e_carrot", voice: "eat_carrot" },
    cookie: { en: "cookie", art: "e_cookie", voice: "eat_cookie" }, mooncake: { en: "moon cake", art: "mooncake", voice: "eat_mooncake" },
    soap: { en: "soap", art: "e_soap", voice: "use_soap" }, sponge: { en: "wash", art: "e_sponge", voice: "use_sponge" },
    shower: { en: "water", art: "e_shower", voice: "use_shower" },
    shirt: { en: "shirt", art: "e_shirt", voice: "put_shirt", wear: "shirt", at: [0.5, 0.72] },
    shoes: { en: "shoes", art: "e_shoes", voice: "put_shoes", wear: "shoes", at: [0.5, 0.94] },
    hat: { en: "hat", art: "e_hat", voice: "put_hat", wear: "hat", at: [0.5, 0.1] },
    socks: { en: "socks", art: "e_socks", voice: "put_socks", wear: "socks", at: [0.5, 0.9] },
    sunglasses: { en: "sunglasses", art: "e_sunglasses", voice: "put_sunglasses", wear: "sunglasses", at: [0.5, 0.37] },
    crown: { en: "crown", art: "e_crown", voice: "put_crown", wear: "crown", at: [0.5, 0.08] },
    pillow: { en: "pillow", art: "pillow", voice: "use_pillow" }, teddy: { en: "teddy bear", art: "e_teddy", voice: "use_teddy" },
    goodnight: { en: "good night", art: "e_crescent", voice: "good_night" },
  };
  const itemArt = id => id === "pillow"
    ? `<span class="svg-art">${ART.PILLOW}</span>`
    : `<img src="${img(ITEM[id].art)}" alt="">`;
  const itemSrc = id => id === "pillow" ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ART.PILLOW) : img(ITEM[id].art);
  const starsFor = id => { const i = L.STICKERS.findIndex(s => s.id === id); return i < 0 ? 0 : Math.max(0, (i + 1) * L.STARS_PER_STICKER - L.save.stars); };

  function care(roomId = "eat") {
    if (!L.save.friend) return pickFriend();
    const id = pageId, kind = L.save.friend;
    const used = new Set(); // first use of each item this visit gives a star
    let done = {};
    view.innerHTML = `
      ${head("My friend", "Chăm sóc bạn nhỏ – chạm đồ vật để dùng")}
      <div class="care">
        <div class="rooms" role="tablist" aria-label="Rooms">
          ${Object.entries(ROOMS).map(([k, r]) => `<button class="room-tab" role="tab" data-room="${k}" aria-selected="${k === roomId}"><img src="${img(r.icon)}" alt=""><span>${r.en}<small>${r.vi}</small></span></button>`).join("")}
          <button class="room-tab swap" id="swapFriend" aria-label="Change friend"><span class="mini-face">${ART.friend(kind)}</span><span>Friend<small>Đổi bạn</small></span></button>
        </div>
        <div class="care-stage" id="cstage">
          <div class="care-deco" id="deco" aria-hidden="true"></div>
          <button class="friend-wrap" id="fw" aria-label="${kind}">${ART.friend(kind)}<img class="teddy-hold" id="teddyHold" src="${img("e_teddy")}" alt="" hidden></button>
          <img class="tub" id="tub" src="${img("e_bathtub")}" alt="" hidden>
          <div class="night-layer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        </div>
        <div class="tray" id="tray" role="toolbar" aria-label="Things"></div>
      </div>`;
    const stage = $("#cstage"), fw = $("#fw"), svg = $(".friend", fw), tray = $("#tray"), deco = $("#deco"), tub = $("#tub"), teddy = $("#teddyHold");
    const wear = new Set(L.save.wear || []);
    const applyWear = () => { ["shirt", "shoes", "hat", "socks", "sunglasses", "crown"].forEach(w => svg.classList.toggle("wear-" + w, wear.has(w))); };
    applyWear();
    let moodT = 0;
    const fmood = (m, ms = 1600) => { clearTimeout(moodT); L.setSvgMood(svg, m); if (ms) moodT = setTimeout(() => { if (alive(id)) L.setSvgMood(svg, night ? "sleep" : "idle"); }, ms); };
    let night = false, mud = false, foam = false, fed = 0;
    const firstUse = (key, el) => { if (!used.has(key)) { used.add(key); addStar(1, el); } };
    const bonus = (key, el) => { if (!done[key]) { done[key] = true; addStar(1, el); } };

    function setRoom(k) {
      roomId = k; hush();
      $$(".room-tab[data-room]").forEach(t => t.setAttribute("aria-selected", String(t.dataset.room === k)));
      stage.className = "care-stage room-" + k;
      tub.hidden = k !== "bath"; teddy.hidden = true;
      night = false; svg.classList.remove("show-blanket", "show-pillow", "show-bubbles");
      mud = k === "bath"; foam = false; svg.classList.toggle("show-mud", mud);
      fed = 0;
      deco.innerHTML = {
        eat: `<div class="win"><img src="${img("e_sun")}" alt=""></div><img class="deco-chair" src="${img("chair")}" alt=""><img class="deco-table" src="${img("table")}" alt="">`,
        bath: `<img class="deco-duck" src="${img("e_bubbles")}" alt=""><img class="deco-drop" src="${img("e_droplet")}" alt="">`,
        dress: `<div class="bunting"></div><img class="deco-bag" src="${img("backpack")}" alt=""><img class="deco-rain" src="${img("e_rainbow")}" alt="">`,
        sleep: `<div class="win night"><img src="${img("e_crescent")}" alt=""></div><div class="headboard"></div><img class="deco-lantern" src="${img("lantern")}" alt="">`,
      }[k];
      renderTray();
      fmood("wave", 1400);
      later(() => say(ROOMS[k].intro), 250);
    }
    function renderTray() {
      tray.innerHTML = ROOMS[roomId].items.map(it => {
        const own = L.owns(it);
        const label = it === "goodnight" && night ? "good morning" : ITEM[it].en;
        const art = it === "goodnight" && night ? `<img src="${img("e_sun")}" alt="">` : itemArt(it);
        return `<button class="care-item ${own ? "" : "locked"} ${ITEM[it].wear && wear.has(ITEM[it].wear) ? "on" : ""}" data-it="${it}" aria-label="${label}${own ? "" : " (locked)"}">
          ${art}<b>${label}</b>${own ? "" : `<span class="lock-badge">${I.lock}</span>`}</button>`;
      }).join("");
      $$(".care-item", tray).forEach(b => b.onclick = () => use(b));
    }
    async function use(b) {
      const it = b.dataset.it, info = ITEM[it];
      if (!L.owns(it)) {
        restart(b, "wiggle"); sfx("boing");
        buddy.mood("think", 1800); buddy.say(`Còn ${starsFor(it)} ⭐ nữa!`, 2200);
        say("locked"); return;
      }
      restart(b, "pressed");
      if (roomId === "eat") {
        sfx("whoosh");
        await fly(b, fw, 0.5, 0.49, itemSrc(it));
        if (!alive(id)) return;
        fmood("eat", 1500); sfx("munch");
        firstUse(it, fw); fed++;
        await say(info.voice, "yummy");
        if (!alive(id)) return;
        fmood("happy", 1500); L.floaters(fw, "e_heart", 4);
        if (fed === 3) { bonus("full", fw); say("full"); }
      } else if (roomId === "bath") {
        sfx("whoosh");
        await fly(b, fw, 0.5, it === "shower" ? 0.02 : 0.55, itemSrc(it));
        if (!alive(id)) return;
        if (it === "soap") { foam = true; svg.classList.add("show-bubbles"); sfx("pop"); L.floaters(fw, "e_bubbles", 6); fmood("happy"); }
        if (it === "sponge") { mud = false; svg.classList.remove("show-mud"); sfx("scrub"); restart(fw, "wiggle"); fmood("happy"); }
        if (it === "shower") { mud = false; foam = false; svg.classList.remove("show-mud", "show-bubbles"); sfx("splash"); L.floaters(fw, "e_droplet", 10, "rain"); fmood("happy"); }
        firstUse(it, fw);
        await say(info.voice);
        if (!alive(id)) return;
        if (!mud && !foam && used.has("shower")) { L.floaters(fw, "e_sparkles", 5); sfx("sparkle"); bonus("clean", fw); say("all_clean"); fmood("dance", 1800); }
      } else if (roomId === "dress") {
        const w = info.wear;
        if (wear.has(w)) { wear.delete(w); sfx("whoosh"); applyWear(); }
        else {
          sfx("whoosh");
          await fly(b, fw, info.at[0], info.at[1], itemSrc(it));
          if (!alive(id)) return;
          if (w === "hat") wear.delete("crown");
          if (w === "crown") wear.delete("hat");
          wear.add(w); applyWear(); sfx("pop"); fmood("happy"); L.floaters(fw, "e_sparkles", 3);
          firstUse(it, fw);
          await say(info.voice);
          if (!alive(id)) return;
          if (wear.size >= 3) { bonus("look", fw); fmood("dance", 1800); say("look_great"); }
        }
        L.save.wear = [...wear]; L.persist(); renderTray();
      } else if (roomId === "sleep") {
        if (it === "pillow") { sfx("whoosh"); await fly(b, fw, 0.5, 0.25, itemSrc(it)); svg.classList.add("show-pillow"); sfx("pop"); fmood("happy"); firstUse(it, fw); say(info.voice); }
        if (it === "teddy") { sfx("whoosh"); await fly(b, fw, 0.3, 0.72, itemSrc(it)); teddy.hidden = false; restart(teddy, "pop"); fmood("happy"); firstUse(it, fw); say(info.voice); }
        if (it === "goodnight") {
          night = !night;
          stage.classList.toggle("is-night", night);
          if (night) {
            svg.classList.add("show-blanket", "show-pillow"); fmood("sleep", 0); sfx("lullaby"); L.pauseMusic();
            firstUse(it, fw); bonus("night", fw);
            await say("good_night");
          } else {
            svg.classList.remove("show-blanket"); fmood("wave", 1600); sfx("twinkle"); L.resumeMusic();
            await say("good_morning");
          }
          renderTray();
        }
      }
    }
    fw.onclick = () => {
      if (night) { sfx("twinkle"); buddy.say("Shh… Zzz", 1500); return; }
      fmood("happy", 1200); sfx("boing"); restart(fw, "boing"); say("giggle");
    };
    $$(".room-tab[data-room]").forEach(t => t.onclick = () => { if (t.dataset.room !== roomId) setRoom(t.dataset.room); });
    $("#swapFriend").onclick = () => { L.save.friend = null; L.persist(); render(pickFriend); };
    onLeave(() => { if (night) L.resumeMusic(); });
    // new sticker earned while playing → refresh the tray so the new thing appears
    listen(document, "sticker", () => { if (alive(id)) renderTray(); });
    setRoom(roomId);
  }

  function pickFriend() {
    view.innerHTML = `
      ${head("My friend", "Chọn một người bạn để chăm sóc")}
      <div class="pick-friends">
        ${FRIENDS.map(f => `<button class="pick-card" data-k="${f.id}" aria-label="${f.en}"><span class="pick-art">${ART.friend(f.id)}</span><b>${f.en}</b><small>${f.vi}</small></button>`).join("")}
      </div>`;
    say("pick_friend");
    $$(".pick-card").forEach(c => c.onclick = async () => {
      $$(".pick-card").forEach(x => x.disabled = true);
      const s = $(".friend", c); L.setSvgMood(s, "dance"); c.classList.add("chosen"); sfx("sparkle");
      L.save.friend = c.dataset.k; L.persist();
      await say("w_" + c.dataset.k, "care_hi");
      render(() => care("eat"));
    });
  }

  /* ================= MOON NIGHT (Mid-Autumn) ================= */
  function moon() {
    const id = pageId;
    const found = new Set();
    const NEED = ["moon", "moonlady", "rabbit", "mooncake", "lan0", "lan1", "lan2"];
    view.innerHTML = `
      ${head("Moon night", "Đêm Trung thu – chạm để khám phá")}
      <div class="stage night-sky" id="sky">
        <div class="twinkles" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="left:${(i * 53) % 100}%;top:${(i * 29) % 55}%;animation-delay:${(i % 6) * 0.4}s"></i>`).join("")}</div>
        <div class="string" aria-hidden="true"></div>
        ${[0, 1, 2].map(k => `<button class="lan" data-k="lan${k}" style="--x:${[14, 36, 58][k]}%" aria-label="Lantern"><img src="${img(k === 1 ? "e_redlantern" : "lantern")}" alt=""></button>`).join("")}
        <button class="mn-moon" data-k="moon" aria-label="Moon"><img src="${img("moon")}" alt=""></button>
        <button class="mn-lady" data-k="moonlady" aria-label="Moon lady"><img src="${img("moonlady")}" alt=""></button>
        <div class="mn-hill" aria-hidden="true"></div>
        <button class="mn-rabbit" data-k="rabbit" aria-label="Rabbit"><img src="${img("rabbit")}" alt=""></button>
        <button class="mn-cake" data-k="mooncake" aria-label="Moon cake"><img src="${img("mooncake")}" alt=""></button>
        <p class="mn-say" id="mnSay" aria-live="polite"></p>
      </div>
      <div class="night-bar">
        <a class="btn pink" id="sing" href="${SONG}" target="_blank" rel="noopener">${I.music} Sing along <small>Tập hát</small></a>
      </div>`;
    const sky = $("#sky"), line = $("#mnSay");
    const show = t => { line.textContent = t; restart(line, "show"); };
    later(() => say("light_lanterns"), 300);
    const ACT = {
      moon: el => { restart(el, "glow"); sfx("twinkle"); show("What is it? It's the moon."); return say("q_whatisit", "itis_moon"); },
      moonlady: el => { restart(el, "float"); sfx("sparkle"); show("Who is this? Moon lady."); return say("q_who", "a_moonlady"); },
      rabbit: el => { restart(el, "hop"); sfx("boing"); show("It's a rabbit."); return say("q_whatisit", "itis_rabbit"); },
      mooncake: el => { restart(el, "munchy"); sfx("munch"); show("It's a moon cake. Yummy!"); return say("q_whatisit", "itis_mooncake", "yummy"); },
    };
    $$("[data-k]", sky).forEach(el => el.onclick = async () => {
      const k = el.dataset.k;
      const first = !found.has(k);
      found.add(k);
      if (k.startsWith("lan")) {
        el.classList.add("lit"); restart(el, "swing");
        sfx("twinkle"); show("It's a lantern."); L.floaters(el, "e_sparkles", 3);
        await say("itis_lantern");
      } else await ACT[k](el);
      if (first) addStar(1, el);
      if (!alive(id)) return;
      if (NEED.every(x => found.has(x)) && !found.has("done")) {
        found.add("done"); sky.classList.add("festive"); L.floaters(sky, "e_firework", 6);
        later(() => { addStar(2); celebrate({ title: "Happy Mid-Autumn!", sub: "Trung thu vui vẻ!", again: moon, voice: ["mid_happy"] }); }, 600);
      }
    });
    $("#sing").addEventListener("click", () => { L.pauseMusic(); hush(); });
  }

  /* ================= LESSON ACTIVITIES (4+) ================= */
  function words(state = { group: "all", i: 0 }) {
    const list = state.group === "all" ? WORDS : WORDS.filter(w => w.week === state.group);
    const w = list[state.i];
    view.innerHTML = `
      ${head("Words", "Học từ vựng – chạm vào thẻ để nghe")}
      <div class="chips" role="group" aria-label="Weeks">
        <button class="chip" data-g="all" aria-pressed="${state.group === "all"}">All words<small>Tất cả</small></button>
        ${L.WEEKS.map(g => `<button class="chip" data-g="${g.id}" aria-pressed="${g.id === state.group}">${g.en}<small>${g.vi}</small></button>`).join("")}
      </div>
      <div class="flash">
        <button class="btn round white prev" aria-label="Previous word">${I.prev}</button>
        <button class="card" style="--edge:${w.edge}" aria-label="Say ${w.en}">
          <span class="tap-hint" aria-hidden="true">${I.sound}</span>
          <img src="${img(w.id)}" alt="">
          <span class="word">${sWord(w.en)}</span><span class="vi">${w.vi}</span>
        </button>
        <button class="btn round white next" aria-label="Next word">${I.next}</button>
      </div>
      <div class="dots" aria-hidden="true">${list.map((_, k) => `<i class="${k === state.i ? "on" : ""}"></i>`).join("")}</div>`;
    const card = $(".card");
    const go = d => { state.i = (state.i + d + list.length) % list.length; sfx("flip"); render(() => words(state)); say("w_" + list[state.i].id); };
    card.onclick = () => { restart(card, "pop"); say("w_" + w.id); };
    $(".prev").onclick = () => go(-1);
    $(".next").onclick = () => go(1);
    $$(".chip").forEach(c => c.onclick = () => { state.group = c.dataset.g; state.i = 0; render(() => words(state)); });
    let sx = null;
    card.addEventListener("pointerdown", e => { sx = e.clientX; });
    card.addEventListener("pointerup", e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60) { card.onclick = null; go(dx < 0 ? 1 : -1); } });
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
            <div class="qa-row"><button class="btn green" data-q="letter">${I.sound}<span>What letter is it?</span></button><span class="bubble" id="ansLetter">?</span></div>
            <div class="qa-row"><button class="btn pink" data-q="sound">${I.sound}<span>What sound is it?</span></button><span class="bubble" id="ansSound">?</span></div>
          </div>
          <div class="s-words">${sw.map(id => `<button class="mini" data-w="${id}" aria-label="Say ${W[id].en}"><img src="${img(id)}" alt=""><b>${sWord(W[id].en)}</b></button>`).join("")}</div>
        </section>
        <section class="panel">
          <h2>Trace the S<small>Bé tô chữ S bằng ngón tay</small></h2>
          <div class="trace-wrap"><canvas id="trace" aria-label="Tracing area"></canvas></div>
          <div class="trace-tools"><button class="btn white" id="clear">${I.erase} Clear</button><button class="btn green" id="traced">${I.check} I did it!</button></div>
        </section>
      </div>`;
    const bigS = $(".big-s");
    bigS.onclick = () => { restart(bigS, "wiggle"); say("a_letter", "s_hiss"); };
    let askedL = false, askedS = false;
    $$("[data-q]").forEach(b => b.onclick = async () => {
      const isL = b.dataset.q === "letter", el = $(isL ? "#ansLetter" : "#ansSound");
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
      ctx.font = `700 ${w * 0.92}px Andika, "Baloo 2", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(93,187,99,.22)"; ctx.fillText("S", w / 2, w * 0.54);
      ctx.setLineDash([10, 12]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(58,42,31,.45)"; ctx.strokeText("S", w / 2, w * 0.54); ctx.setLineDash([]);
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

  /* Listen & find – adapts to the child:
     misses → fewer pictures, the word is repeated, wrong pictures fade away, then the right one glows.
     strong streak → up to 4 pictures on big screens. */
  function find() {
    const id = pageId, ROUNDS = 8;
    let n = 0, got = 0, streak = 0, lastMiss = false, prev = null;
    view.innerHTML = `
      ${head("Listen & find", "Nghe và chọn đúng hình")}
      <div class="find-top">
        <button class="ear" aria-label="Listen again">${I.sound}</button>
        <div class="progress" aria-label="Progress">${Array.from({ length: ROUNDS }, () => `<i>${I.star}</i>`).join("")}</div>
      </div>
      <div class="choices"></div>
      <p class="find-word" aria-live="polite"></p>`;
    const ear = $(".ear"), wrap = $(".choices"), word = $(".find-word");
    let ans = null;
    const hear = async (...keys) => { ear.classList.add("playing"); await say(...keys); ear.classList.remove("playing"); };
    ear.onclick = () => hear("w_" + ans.id);
    function round(first) {
      if (n >= ROUNDS) { celebrate({ title: `${got} / ${ROUNDS}`, sub: got >= ROUNDS - 2 ? "Bé giỏi quá!" : "Cố lên nhé!", again: find }); return; }
      ans = L.pickWeighted(NOUNS, prev); prev = ans.id;
      const easy = lastMiss || L.skill(ans.id) < 0;
      const count = easy ? 2 : streak >= 3 && innerWidth >= 700 ? 4 : 3;
      let misses = 0, locked = false;
      word.textContent = "";
      const opts = shuffle([ans, ...shuffle(NOUNS.filter(w => w.id !== ans.id)).slice(0, count - 1)]);
      wrap.dataset.n = count; wrap.dataset.a = ans.id;
      wrap.innerHTML = opts.map(o => `<button class="choice" data-id="${o.id}" aria-label="${o.en}"><img src="${img(o.id)}" alt=""></button>`).join("");
      $$(".choice", wrap).forEach(c => c.onclick = async () => {
        if (locked || c.disabled) return;
        if (c.dataset.id === ans.id) {
          locked = true; c.classList.remove("hint"); c.classList.add("right"); word.innerHTML = sWord(ans.en); sfx("good");
          L.learn(ans.id, misses === 0);
          if (misses === 0) { got++; streak++; $$(".progress i")[n].classList.add("got"); addStar(1, c); } else streak = 0;
          lastMiss = misses > 0;
          await say(praise());
          if (!alive(id)) return;
          n++; later(() => round(false), 300);
        } else {
          misses++; sfx("bad"); restart(c, "wrong");
          c.disabled = true; setTimeout(() => c.classList.add("gone"), 350);
          if (misses >= 2 || count === 2) $$(".choice", wrap).find(x => x.dataset.id === ans.id).classList.add("hint");
          hear("think", "find_" + ans.id, ...(ans.id === "snake" ? ["s_hiss"] : []));
        }
      });
      first ? hear("listen", "find_" + ans.id) : hear("find_" + ans.id);
    }
    round(true);
  }

  function talk(mode = "this") {
    view.innerHTML = `
      ${head("Ask & answer", "Hỏi và đáp")}
      <div class="chips" role="group" aria-label="Question">
        <button class="chip" data-m="this" aria-pressed="${mode === "this"}">What is this?<small>Đây là gì?</small></button>
        <button class="chip" data-m="it" aria-pressed="${mode === "it"}">What is it?<small>Trung thu</small></button>
        <button class="chip" data-m="have" aria-pressed="${mode === "have"}">What do you have?<small>Bạn có gì?</small></button>
      </div>
      <div class="talk" id="talk"></div>`;
    $$("[data-m]").forEach(b => b.onclick = () => render(() => talk(b.dataset.m)));
    mode === "have" ? talkHave() : talkThis(mode);
  }
  function talkThis(mode) {
    const deck = shuffle(NOUNS.filter(w => mode === "it" ? w.mid : !w.mid));
    let i = 0;
    const box = $("#talk");
    const qKey = w => mode === "it" ? (w.id === "moonlady" ? "q_who" : "q_whatisit") : "q_this";
    const qText = w => mode === "it" ? (w.id === "moonlady" ? "Who is this?" : "What is it?") : "What is this?";
    const blankLine = w => mode === "it" ? (w.id === "moonlady" ? "" : "It's") : (w.id === "scissors" ? "These are" : "This is");
    const answer = w => {
      const b = t => `<b class="hl">${t}</b>`;
      if (w.id === "moonlady") return `${b("Moon lady")}.`;
      if (mode === "it") return w.id === "moon" ? `It's the ${b("moon")}.` : `It's a ${b(w.en)}.`;
      return w.id === "scissors" ? `These are ${b("scissors")}.` : `This is a ${b(w.en)}.`;
    };
    function show() {
      const w = deck[i % deck.length];
      box.innerHTML = `
        <button class="mystery hidden" aria-label="Tap to see"><img src="${img(w.id)}" alt=""><span class="qmark" aria-hidden="true">?</span></button>
        <div class="speech">
          <div class="line"><span class="who" aria-hidden="true">👩‍🏫</span><span class="say">${qText(w)}</span><button class="btn round white" id="askQ" aria-label="Hear the question">${I.sound}</button></div>
          <div class="line answer"><span class="who" aria-hidden="true">🧒</span><span class="say" id="ans">${blankLine(w)} <span class="blank"></span></span></div>
          <p class="hint">Chạm vào hình để xem đáp án.</p>
          <div><button class="btn blue" id="nextQ">Next ${I.next}</button></div>
        </div>`;
      const m = $(".mystery", box);
      let open = false;
      m.onclick = async () => {
        if (open) { say(L.lineKey(w.id)); return; }
        open = true; m.classList.remove("hidden");
        $("#ans").innerHTML = answer(w);
        sfx("good"); addStar(1, m);
        await say(L.lineKey(w.id));
      };
      $("#askQ").onclick = () => say(qKey(w));
      $("#nextQ").onclick = () => { i++; sfx("flip"); show(); say(qKey(deck[i % deck.length])); };
    }
    show();
  }
  function talkHave() {
    const box = $("#talk");
    let last = null;
    box.innerHTML = `
      <button class="bag" aria-label="Open the backpack"><img class="out" alt=""><img src="${img("backpack")}" alt=""></button>
      <div class="speech">
        <div class="line"><span class="who" aria-hidden="true">👩‍🏫</span><span class="say">What do you have?</span><button class="btn round white" id="askH" aria-label="Hear the question">${I.sound}</button></div>
        <div class="line answer"><span class="who" aria-hidden="true">🧒</span><span class="say" id="ansH">I have <span class="blank"></span></span></div>
        <p class="hint">Chạm vào ba lô để lấy đồ ra.</p>
      </div>`;
    const bag = $(".bag"), out = $(".out", bag);
    $("#askH").onclick = () => say("q_have");
    bag.onclick = async () => {
      const id = pick(SUPPLIES.filter(s => s !== "backpack" && s !== last)); last = id;
      out.classList.remove("up"); void out.offsetWidth;
      restart(bag, "shake"); out.src = img(id); out.classList.add("up"); sfx("whoosh");
      $("#ansH").innerHTML = `I have ${W[id].a.startsWith("a ") ? "a " : ""}<b class="hl">${W[id].en}</b>.`;
      addStar(1, bag);
      await say("q_have", "have_" + id);
    };
  }

  function tidy() {
    const id = pageId, items = shuffle(SUPPLIES), queue = shuffle(SUPPLIES);
    const spots = shuffle([[4, 6, 4, 4], [40, 4, 38, 3], [76, 8, 70, 6], [5, 56, 4, 40], [78, 58, 70, 40], [24, 30, 37, 22]]);
    view.innerHTML = `
      ${head("Tidy up", "Dọn dẹp – kéo hoặc chạm đồ vật để cất vào hộp")}
      <div class="task"><button class="btn round pink" id="again" aria-label="Hear again">${I.sound}</button><span class="say" id="task" aria-live="polite">Let's tidy up!</span></div>
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
      if (el.dataset.id !== current()) { sfx("bad"); el.style.translate = ""; restart(el, "wrong"); ask("think"); return; }
      const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      const tx = parseFloat(el.dataset.tx) || 0, ty = parseFloat(el.dataset.ty) || 0;
      el.classList.remove("dragging");
      el.style.translate = `${b.left + b.width / 2 - (r.left + r.width / 2) + tx}px ${b.top + b.height / 3 - (r.top + r.height / 2) + ty}px`;
      el.style.scale = ".3"; el.classList.add("gone");
      restart(box, "gulp"); sfx("whoosh"); setTimeout(() => sfx("pop"), 380);
      addStar(1, box); queue.shift();
      if (queue.length) later(() => ask(praise()), 350);
      else later(async () => { task.textContent = "All tidy!"; await say("done"); if (alive(id)) celebrate({ again: tidy, voice: ["w_tidyup"] }); }, 600);
    }
    $$(".toy").forEach(el => {
      let start = null, moved = false;
      el.addEventListener("pointerdown", e => { start = [e.clientX, e.clientY]; moved = false; el.dataset.tx = 0; el.dataset.ty = 0; el.setPointerCapture(e.pointerId); el.classList.add("dragging"); });
      el.addEventListener("pointermove", e => {
        if (!start) return;
        const dx = e.clientX - start[0], dy = e.clientY - start[1];
        if (Math.hypot(dx, dy) > 10) moved = true;
        el.dataset.tx = dx; el.dataset.ty = dy; el.style.translate = `${dx}px ${dy}px`;
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
    buddy.bind(view);
  }
  const ROUTES = {
    home, stickers, taphear, bubbles, peekaboo, shadow, memory, pack, care: () => care(), moon,
    words: () => words(), letter, find, talk: () => talk(), tidy,
  };
  let leaving = false;
  function route() {
    leaving = false;
    hush(); L.closeCelebrate(); L.startSession();
    const r = (location.hash || "#home").slice(1);
    document.body.dataset.page = ROUTES[r] ? r : "home";
    render(ROUTES[r] || home);
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
  // Leaving a game: Bunny says bye and naps
  document.addEventListener("click", e => {
    const back = e.target.closest(".back");
    if (!back) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    buddy.mood("sleep", 0); buddy.say("Bye bye!", 900); say("bye");
    setTimeout(() => { location.hash = "home"; }, 800);
  });
  L.mountHeader();
  addEventListener("hashchange", route);
  route();
  L.showGate(() => {
    buddy.mood("wave", 2000); buddy.say("What shall we play?", 2600);
    if ((location.hash || "#home") === "#home") say("what_play");
  });
})();
