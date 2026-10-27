/* Learning English with Mây – pages & games.
   Lessons follow the school calendar: Home → month → week → activity.
   Every activity plays with the words of its "context" (one week, one month, or the review mix). */
(() => {
  "use strict";
  const L = window.LS, ART = window.ART;
  const { $, $$, wait, shuffle, pick, img, restart, W, WEEKS, MONTHS, LETTERS, SUPPLIES, I, say, hush, praise, sfx, addStar, buddy } = L;
  const view = $("#view");
  const slug = L.slug;

  /* ---------- context: which words and structures an activity uses ---------- */
  let ctx = null;
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const TODAY = ymd(new Date());
  const plusDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); };
  /* this week = the class week we are in (the weekend still belongs to it), else the last one taught */
  function currentWeek() {
    const now = WEEKS.find(wk => wk.from <= TODAY && TODAY <= plusDays(wk.to, 2));
    if (now) return now;
    const past = WEEKS.filter(wk => wk.from <= TODAY);
    return past.length ? past[past.length - 1] : WEEKS[0];
  }
  const uniqEn = list => { const seen = new Set(); return list.filter(w => { const k = w.en.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); };
  const monthOf = id => MONTHS.find(m => m.id === id);
  function weekCtx(wk) {
    return { scope: wk.id, wk, letter: wk.letter, back: "#w/" + wk.id, backLabel: "Week",
      fresh: wk.fresh.map(id => W[id]), words: wk.all.map(id => W[id]), qa: wk.qa };
  }
  function monthCtx(m) {
    const wks = WEEKS.filter(wk => wk.month === m.id);
    const fresh = uniqEn(wks.flatMap(wk => wk.fresh).map(id => W[id]));
    return { scope: "m" + m.id, month: m, back: "#m/" + m.id, backLabel: "Month", fresh, words: fresh, qa: wks.flatMap(wk => wk.qa) };
  }
  /* review: everything taught so far, the weakest words come up most */
  function reviewCtx() {
    const wks = WEEKS.filter(wk => wk.from <= TODAY);
    const use = wks.length ? wks : WEEKS;
    const fresh = uniqEn(use.flatMap(wk => wk.fresh).map(id => W[id]));
    return { scope: "review", back: "#home", backLabel: "Home", fresh, words: fresh, qa: use.flatMap(wk => wk.qa) };
  }
  const playCtx = () => ({ ...monthCtx(monthOf(currentWeek().month)), scope: "play", back: "#home", backLabel: "Home" });
  const quizWords = () => ctx.words.filter(w => !w.noQuiz);
  const sameAs = (a, b) => a.id === b.id || a.en === b.en;

  /* the class structures that can be asked as a question */
  const askable = () => ctx.qa.filter(q => q.type !== "say");
  function qaFor(id) {
    const qa = ctx.qa.find(q => q.type === "ask" && q.items.includes(id)) || WEEKS.flatMap(wk => wk.qa).find(q => q.type === "ask" && q.items.includes(id));
    return qa ? L.qaLines(qa, id) : null;
  }

  /* ---------- small helpers ---------- */
  const wordHTML = w => {
    const lt = ctx && ctx.letter && LETTERS[ctx.letter];
    return lt && w.en[0].toLowerCase() === lt.low ? `<span class="first-letter" style="color:${lt.color}">${w.en[0]}</span>${w.en.slice(1)}` : w.en;
  };
  const head = (en, vi) => `
    <div class="page-head">
      <a class="back" href="${ctx ? ctx.back : "#home"}" aria-label="Back">${I.back}</a>
      <h1 class="page-title">${en}<small>${vi}</small></h1>
      ${L.buddyHTML("sm")}
    </div>`;
  const celebrate = opts => L.celebrate({ home: ctx.back, homeLabel: ctx.backLabel, ...opts });
  const finish = act => L.markDone(ctx.scope, act);
  const STEPS = ["words", "find", "qa"];
  const starsHTML = scope => `<span class="wstars" aria-label="Stars">${STEPS.map(s => `<i class="${L.isDone(scope, s) ? "on" : ""}">${I.star}</i>`).join("")}</span>`;
  const TINT = { camp: "#c7f0b5", picnic: "#ffe0b8", vietnam: "#ffd2cc", school: "#ffe28a", moon: "#ddd6ff", face: "#ffd6e5", family: "#c9e8ff", halloween: "#ffd7a8" };

  let cleaners = [];
  const onLeave = fn => cleaners.push(fn);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); onLeave(() => clearTimeout(t)); return t; };
  const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); onLeave(() => target.removeEventListener(ev, fn, opt)); };
  let pageId = 0;
  const alive = id => id === pageId;

  /* fly a picture from one element to a point on another (Pack my bag, My friend) */
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

  /* ================= HOME: this week, months, play corner ================= */
  const CLOUD = `<svg class="cloud" viewBox="0 0 64 44" aria-hidden="true"><path d="M16 40h34a12 12 0 0 0 1-24 16 16 0 0 0-30-4A13 13 0 0 0 16 40z" fill="#fff" stroke="#3a2a1f" stroke-width="3.5" stroke-linejoin="round"/><circle cx="27" cy="25" r="2.6" fill="#3a2a1f"/><circle cx="41" cy="25" r="2.6" fill="#3a2a1f"/><path d="M30 31q4 4 8 0" fill="none" stroke="#3a2a1f" stroke-width="2.6" stroke-linecap="round"/><circle cx="23" cy="30" r="3" fill="#ffb8cc"/><circle cx="45" cy="30" r="3" fill="#ffb8cc"/></svg>`;
  const weekCard = (wk, now) => `
    <a class="wcard ${now ? "now" : ""}" href="#w/${wk.id}" style="--tint:${TINT[wk.theme]}">
      ${now ? `<span class="wcard-now">Tuần này</span>` : ""}
      <span class="wcard-n">Tuần ${wk.n}</span>
      <span class="wcard-pic"><img src="${img(wk.cover)}" alt=""></span>
      <b>${wk.en}</b><span class="wcard-vi">${wk.vi}</span>
      <span class="wcard-date">${wk.dates}</span>
      ${starsHTML(wk.id)}
    </a>`;
  const PLAY = [
    { r: "care",          en: "My friend",     vi: "Chăm sóc bạn nhỏ", im: "e_teddy",    tint: "#ffd6e5" },
    { r: "stickers",      en: "Stickers",      vi: "Sổ sticker",       im: "e_star",     tint: "#fff0b3" },
    { r: "play/bubbles",  en: "Bubble pop",    vi: "Bắn bong bóng",    im: "e_bubbles",  tint: "#c9e8ff" },
    { r: "play/memory",   en: "Find the same", vi: "Lật thẻ",          im: "e_gift",     tint: "#c7f0b5" },
    { r: "play/peekaboo", en: "Peekaboo",      vi: "Ú òa",             im: "e_party",    tint: "#ffd0dd" },
    { r: "play/shadow",   en: "Shadow match",  vi: "Tìm cái bóng",     im: "e_sparkles", tint: "#e3d7ff" },
  ];
  const doorHTML = d => `
    <a class="door" href="#${d.r}" style="--tint:${d.tint}">
      <span class="door-pic"><img src="${img(d.im)}" alt=""></span>
      <b>${d.en}</b><span>${d.vi}</span>
    </a>`;

  function home() {
    const now = currentWeek();
    const month = L.save.month && monthOf(L.save.month) ? L.save.month : now.month;
    view.innerHTML = `
      <section class="hero">
        ${L.buddyHTML("lg")}
        <div class="hero-text">
          <h1 class="may-title" aria-label="Learning English with Mây"><span class="t1">Learning English</span><span class="t2">with Mây ${CLOUD}</span></h1>
          <p>Chào Mây! Hôm nay mình học gì nào?</p>
        </div>
      </section>
      <section class="today">
        <a class="this-week" href="#w/${now.id}" style="--tint:${TINT[now.theme]}">
          <span class="tw-badge">Tuần này · ${now.dates}</span>
          <span class="tw-pics">${now.fresh.slice(0, 3).map((id, k) => `<img src="${img(id)}" alt="" style="--k:${k}">`).join("")}</span>
          <span class="tw-text"><b>${now.en}</b><span>${now.vi}</span>${starsHTML(now.id)}</span>
          <span class="tw-go" aria-hidden="true">${I.next}</span>
        </a>
        <a class="review-card" href="#review">
          <span class="rv-icon" aria-hidden="true">${I.again}</span>
          <b>Ôn bài</b><span>Review · 2 phút</span>
        </a>
      </section>
      <section class="months">
        <div class="month-tabs" role="tablist" aria-label="Months">
          ${MONTHS.map(m => `<button class="mtab" role="tab" data-m="${m.id}" aria-selected="${m.id === month}"><img src="${img(m.art)}" alt=""><span>${m.vi}<small>${m.en}</small></span></button>`).join("")}
        </div>
        <div class="week-grid" id="weekGrid"></div>
      </section>
      <section class="shelf">
        <h2 class="shelf-title">Góc vui chơi <small>Play corner · từ vựng ${monthOf(now.month).vi.toLowerCase()}</small></h2>
        <nav class="doors" aria-label="Play corner">${PLAY.map(doorHTML).join("")}</nav>
      </section>`;
    const grid = $("#weekGrid");
    const showMonth = m => {
      grid.innerHTML = WEEKS.filter(wk => wk.month === m).map(wk => weekCard(wk, wk === now)).join("") + `
        <a class="wcard month-review" href="#m/${m}">
          <span class="wcard-pic"><img src="${img("e_glowstar")}" alt=""></span>
          <b>Ôn cả tháng</b><span class="wcard-vi">Month review</span><span class="wcard-date">${monthOf(m).vi}</span>
        </a>`;
      $$(".mtab").forEach(t => t.setAttribute("aria-selected", String(+t.dataset.m === m)));
    };
    $$(".mtab").forEach(t => t.onclick = () => { L.save.month = +t.dataset.m; L.persist(); sfx("flip"); showMonth(+t.dataset.m); });
    showMonth(month);
  }

  /* ================= WEEK PAGE: learn step by step ================= */
  const EXTRA = {
    letter:      wk => ({ en: `Letter ${wk.letter}`, vi: `Chữ ${wk.letter} – tô chữ`, art: `<span class="tile-letter" style="color:${LETTERS[wk.letter].color}">${wk.letter}${LETTERS[wk.letter].low}</span>` }),
    tidy:        () => ({ en: "Tidy up", vi: "Dọn dẹp", im: "tidyup" }),
    pack:        () => ({ en: "Pack my bag", vi: "Xếp ba lô", im: "backpack" }),
    moon:        () => ({ en: "Moon night", vi: "Đêm Trung thu", im: "lanternbunny" }),
    explore:     wk => ({ en: "Explore", vi: { camp: "Đêm cắm trại", picnic: "Đi dã ngoại", vietnam: "Mừng Quốc khánh", halloween: "Đêm Halloween" }[wk.theme] || "Khám phá", im: wk.cover }),
    gingerbread: () => ({ en: "Catch me!", vi: "Bắt người bánh gừng", im: "gingerbread" }),
  };
  const tile = (href, n, en, vi, art, done, cls = "") => `
    <a class="step ${cls} ${done ? "done" : ""}" href="${href}">
      ${n ? `<span class="step-n">${n}</span>` : ""}
      <span class="step-art">${art}</span>
      <span class="step-text"><b>${en}</b><span>${vi}</span></span>
      ${done ? `<span class="step-done" aria-label="Done">${I.check}</span>` : ""}
    </a>`;
  const emojiArt = e => `<span class="emoji-art" aria-hidden="true">${e}</span>`;
  const gameDoors = (base, pics) => [
    { r: base + "/bubbles",  en: "Bubble pop",    vi: "Bắn bong bóng", im: "e_bubbles", tint: "#c9e8ff" },
    { r: base + "/memory",   en: "Find the same", vi: "Lật thẻ",       im: pics[1],     tint: "#c7f0b5" },
    { r: base + "/shadow",   en: "Shadow match",  vi: "Tìm cái bóng",  im: pics[2],     tint: "#e3d7ff" },
    { r: base + "/peekaboo", en: "Peekaboo",      vi: "Ú òa",          im: "e_gift",    tint: "#ffd0dd" },
    { r: base + "/taphear",  en: "Tap & hear",    vi: "Chạm và nghe",  im: pics[0],     tint: "#ffe28a" },
  ].map(doorHTML).join("");

  function weekPage(wk) {
    const base = "#w/" + wk.id;
    const hasSay = wk.qa.some(q => q.type === "say");
    const m = monthOf(wk.month);
    const pics = [0, 1, 2].map(i => wk.fresh[i] || wk.cover);
    view.innerHTML = `
      ${head(wk.en, `${m.vi} · Tuần ${wk.n} · ${wk.dates}`)}
      <section class="week-hero" style="--tint:${TINT[wk.theme]}">
        <div class="wh-pics">${wk.fresh.slice(0, 8).map(id => `<button class="wh-pic" data-id="${id}" aria-label="${W[id].en}"><img src="${img(id)}" alt=""></button>`).join("")}</div>
        <p class="wh-vi"><b>${wk.vi}</b> · ${wk.fresh.length} từ mới${wk.review.length ? ` · ${wk.review.length} từ ôn tập` : ""} ${starsHTML(wk.id)}</p>
      </section>
      <h2 class="step-title">Học từng bước <small>Learn step by step</small></h2>
      <nav class="steps">
        ${tile(base + "/words", 1, "New words", "Từ mới – chạm để nghe", emojiArt("📖"), L.isDone(wk.id, "words"))}
        ${tile(base + "/find", 2, "Listen & find", "Nghe và chọn hình", emojiArt("👂"), L.isDone(wk.id, "find"))}
        ${tile(base + "/qa", 3, "Ask & answer", "Nghe câu hỏi, chọn câu trả lời", emojiArt("💬"), L.isDone(wk.id, "qa"))}
        ${hasSay ? tile(base + "/say", 4, "Say it", "Nói theo cô", emojiArt("🗣️"), L.isDone(wk.id, "say")) : ""}
      </nav>
      ${wk.extra.length || wk.song ? `
      <h2 class="step-title">Hoạt động của tuần <small>This week's fun</small></h2>
      <nav class="steps extras">
        ${wk.extra.map(x => { const e = EXTRA[x](wk); return tile(`${base}/${x}`, 0, e.en, e.vi, e.art || `<img src="${img(e.im)}" alt="">`, L.isDone(wk.id, x), "extra"); }).join("")}
        ${wk.song ? `<a class="step extra song" href="${wk.song}" target="_blank" rel="noopener"><span class="step-art">${emojiArt("🎵")}</span><span class="step-text"><b>Sing along</b><span>Tập hát bài của lớp</span></span></a>` : ""}
      </nav>` : ""}
      <h2 class="step-title">Chơi với từ của tuần <small>Games</small></h2>
      <nav class="doors">${gameDoors(base.slice(1), pics)}</nav>
      ${wk.review.length ? `
      <section class="panel review-strip">
        <h2>Ôn tập <small>Review words – chạm để nghe</small></h2>
        <div class="rv-pics">${wk.review.map(id => `<button class="mini" data-w="${id}" aria-label="${W[id].en}"><img src="${img(id)}" alt=""><b>${W[id].en}</b></button>`).join("")}</div>
      </section>` : ""}`;
    $$(".wh-pic, .mini[data-w]").forEach(b => b.onclick = () => { const id = b.dataset.id || b.dataset.w; restart(b, "boing"); sfx("pop"); say("w_" + id); });
    $$(".step.song").forEach(a => a.addEventListener("click", () => { L.pauseMusic(); hush(); }));
  }

  /* ================= MONTH PAGE: review the whole month ================= */
  function monthPage(m) {
    const wks = WEEKS.filter(wk => wk.month === m.id), base = "#m/" + m.id;
    const pics = shuffle(ctx.fresh).map(w => w.id);
    view.innerHTML = `
      ${head(m.vi, `${m.en} · ôn cả tháng`)}
      <div class="week-grid">${wks.map(wk => weekCard(wk, wk === currentWeek())).join("")}</div>
      <h2 class="step-title">Ôn cả tháng <small>${ctx.fresh.length} từ · Month review</small></h2>
      <nav class="steps">
        ${tile(base + "/words", 1, "Words", "Xem lại từ của tháng", emojiArt("📖"), L.isDone(ctx.scope, "words"))}
        ${tile(base + "/find", 2, "Listen & find", "Nghe và chọn hình", emojiArt("👂"), L.isDone(ctx.scope, "find"))}
        ${tile(base + "/qa", 3, "Ask & answer", "Hỏi và đáp", emojiArt("💬"), L.isDone(ctx.scope, "qa"))}
        ${tile(base + "/mix", 4, "Big quiz", "Đố vui cả tháng", emojiArt("🏆"), L.isDone(ctx.scope, "mix"))}
      </nav>
      <h2 class="step-title">Trò chơi <small>Games</small></h2>
      <nav class="doors">${gameDoors(base.slice(1), pics)}</nav>`;
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
          <span>${need ? `Còn ${need} ⭐ nữa là có sticker mới` : "Mây đã có đủ sticker!"}</span>
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

  /* ================= STEP 1: NEW WORDS (flashcards, grouped by school day) ================= */
  function words(state) {
    const groups = ctx.wk
      ? ctx.wk.days.map(d => ({ en: d.review ? "Review " + d.d : "Day " + d.d, vi: d.review ? "Ôn tập" : "Ngày học", ids: d.words, rv: d.review }))
      : [];
    state = state || { g: -1, i: 0, seen: new Set() };
    const list = (state.g < 0 ? ctx.fresh.map(w => w.id) : groups[state.g].ids).map(id => W[id]);
    const w = list[state.i];
    state.seen.add(w.id);
    view.innerHTML = `
      ${head("New words", "Từ mới – chạm vào thẻ để nghe")}
      ${groups.length > 1 ? `<div class="chips" role="group" aria-label="School days">
        <button class="chip" data-g="-1" aria-pressed="${state.g < 0}">All new words<small>Tất cả từ mới</small></button>
        ${groups.map((g, k) => `<button class="chip ${g.rv ? "rv" : ""}" data-g="${k}" aria-pressed="${k === state.g}">${g.en}<small>${g.vi}</small></button>`).join("")}
      </div>` : ""}
      <div class="flash">
        <button class="btn round white prev" aria-label="Previous word">${I.prev}</button>
        <button class="card" style="--edge:${w.edge}" aria-label="Say ${w.en}">
          <span class="tap-hint" aria-hidden="true">${I.sound}</span>
          <img src="${img(w.id)}" alt="">
          <span class="word">${wordHTML(w)}</span><span class="vi">${w.vi}</span>
        </button>
        <button class="btn round white next" aria-label="Next word">${I.next}</button>
      </div>
      <div class="dots" aria-hidden="true">${list.map((x, k) => `<i class="${k === state.i ? "on" : state.seen.has(x.id) ? "seen" : ""}"></i>`).join("")}</div>`;
    const card = $(".card");
    const go = d => { state.i = (state.i + d + list.length) % list.length; sfx("flip"); render(() => words(state)); say("w_" + list[state.i].id); };
    card.onclick = () => { restart(card, "pop"); say("w_" + w.id); };
    $(".prev").onclick = () => go(-1);
    $(".next").onclick = () => go(1);
    $$(".chip").forEach(c => c.onclick = () => { state.g = +c.dataset.g; state.i = 0; render(() => words(state)); say("w_" + (state.g < 0 ? ctx.fresh[0].id : groups[state.g].ids[0])); });
    let sx = null;
    card.addEventListener("pointerdown", e => { sx = e.clientX; });
    card.addEventListener("pointerup", e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60) { card.onclick = null; go(dx < 0 ? 1 : -1); } });
    listen(document, "keydown", e => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); });
    // every new word seen → the step is done
    // (a quick tap to the next card cancels the timer; the next render schedules it again)
    if (!state.cheered && ctx.fresh.every(x => state.seen.has(x.id))) {
      if (state.first === undefined) state.first = !L.isDone(ctx.scope, "words");
      finish("words");
      if (!state.first) state.cheered = true;
      else later(() => { state.cheered = true; addStar(2, card); celebrate({ title: "Great!", sub: "Mây đã xem hết từ mới!", again: () => render(() => words()) }); }, 1500);
    }
  }

  /* ================= STEP 2 + 3: LISTEN & FIND / ASK & ANSWER (one quiz engine) =================
     find  – hear a word, tap its picture (adapts: misses → fewer pictures, a glow on the right one)
     ask   – see a picture, hear the question, choose the answer sentence
     yesno – look at the bag / the wish bubble, choose "Yes, …" or "No, …"
     point – "Where are your ears? Point to the ears." → tap the picture */
  function buildRounds(mode, n) {
    const qas = askable();
    const pairs = [];
    const queues = qas.map(qa => shuffle(qa.items));
    let guard = 0;
    while (pairs.length < n && qas.length && guard++ < 200) {
      qas.forEach((qa, k) => {
        if (pairs.length >= n) return;
        if (!queues[k].length) queues[k] = shuffle(qa.items);
        const id = queues[k].shift();
        const last = pairs[pairs.length - 1];
        if (last && last.id === id) queues[k].push(id); else pairs.push({ t: qa.type, qa, id });
      });
    }
    if (mode === "find" || !pairs.length) return Array.from({ length: n }, () => ({ t: "find" }));
    if (mode === "qa") return shuffle(pairs);
    return Array.from({ length: n }, (_, i) => i % 2 ? pairs[(i - 1) / 2] : { t: "find" });
  }
  const TITLES = {
    find: ["Listen & find", "Nghe và chọn đúng hình"],
    qa: ["Ask & answer", "Nghe câu hỏi – chọn câu trả lời đúng"],
    mix: ["Big quiz", "Đố vui – nghe và chọn"],
  };
  function quiz(mode) {
    const id = pageId, N = 8, pool = quizWords();
    const rounds = buildRounds(mode, N);
    let n = 0, got = 0, streak = 0, lastMiss = false, prev = null;
    const [en, vi] = ctx.scope === "review" ? ["Review", "Ôn bài – nghe và chọn"] : TITLES[mode];
    view.innerHTML = `
      ${head(en, vi)}
      <div class="find-top">
        <button class="ear" aria-label="Listen again">${I.sound}</button>
        <div class="progress" aria-label="Progress">${rounds.map(() => `<i>${I.star}</i>`).join("")}</div>
      </div>
      <div id="qz" class="qz"></div>`;
    const ear = $(".ear"), box = $("#qz");
    let replay = () => {};
    const hear = async (...keys) => { ear.classList.add("playing"); await say(...keys); if (alive(id)) ear.classList.remove("playing"); };
    ear.onclick = () => replay();

    /* a correct choice: stars, learning record, then the next round */
    async function right(el, wid, misses, ...voice) {
      sfx("good");
      if (wid) L.learn(wid, misses === 0);
      if (misses === 0) { got++; streak++; $$(".progress i")[n].classList.add("got"); addStar(1, el); } else streak = 0;
      lastMiss = misses > 0;
      await say(...voice, praise());
      if (!alive(id)) return;
      n++; later(() => next(false), 300);
    }
    function next(first) {
      if (n >= rounds.length) {
        finish(mode);
        celebrate({ title: `${got} / ${rounds.length}`, sub: got >= rounds.length - 2 ? "Mây giỏi quá!" : "Cố lên nhé Mây!", again: () => render(() => quiz(mode)) });
        return;
      }
      const r = rounds[n];
      if (r.t === "find") findRound(first);
      else if (r.t === "point") pointRound(r, first);
      else if (r.t === "yesno") yesnoRound(r, first);
      else askRound(r, first);
    }

    function pictureChoices(ans, others, count) {
      const rest = uniqEn(shuffle(others.filter(w => !sameAs(w, ans))));
      const opts = shuffle([ans, ...rest.slice(0, count - 1)]);
      box.innerHTML = `<div class="choices" data-n="${opts.length}">${opts.map(o => `<button class="choice" data-id="${o.id}" aria-label="${o.en}"><img src="${img(o.id)}" alt=""></button>`).join("")}</div><p class="find-word" aria-live="polite"></p>`;
    }
    function findRound(first) {
      const ans = L.pickWeighted(pool, prev); prev = ans.id;
      const easy = lastMiss || L.skill(ans.id) < 0;
      const count = easy ? 2 : streak >= 3 && innerWidth >= 700 ? 4 : 3;
      pictureChoices(ans, pool, count);
      const word = $(".find-word", box);
      let misses = 0, locked = false;
      replay = () => hear("find_" + ans.id);
      $$(".choice", box).forEach(c => c.onclick = () => {
        if (locked || c.disabled) return;
        if (c.dataset.id === ans.id) {
          locked = true; c.classList.remove("hint"); c.classList.add("right"); word.innerHTML = wordHTML(ans);
          right(c, ans.id, misses, "w_" + ans.id);
        } else {
          misses++; sfx("bad"); restart(c, "wrong");
          c.disabled = true; setTimeout(() => c.classList.add("gone"), 350);
          if (misses >= 2 || $$(".choice:not(:disabled)", box).length <= 2) $$(".choice", box).find(x => x.dataset.id === ans.id).classList.add("hint");
          hear("think", "find_" + ans.id);
        }
      });
      first ? hear("listen", "find_" + ans.id) : hear("find_" + ans.id);
    }
    function pointRound(r, first) {
      const ans = W[r.id], lines = L.qaLines(r.qa, r.id);
      pictureChoices(ans, r.qa.items.map(x => W[x]), lastMiss ? 3 : 4);
      const word = $(".find-word", box);
      word.innerHTML = `<span class="q-line">${lines.q} ${lines.a}</span>`;
      let misses = 0, locked = false;
      replay = () => hear(slug(lines.q), slug(lines.a));
      $$(".choice", box).forEach(c => c.onclick = () => {
        if (locked || c.disabled) return;
        if (c.dataset.id === ans.id) { locked = true; c.classList.remove("hint"); c.classList.add("right"); right(c, ans.id, misses, "w_" + ans.id); }
        else {
          misses++; sfx("bad"); restart(c, "wrong"); c.disabled = true; setTimeout(() => c.classList.add("gone"), 350);
          if (misses >= 2) $$(".choice", box).find(x => x.dataset.id === ans.id).classList.add("hint");
          hear("think", slug(lines.a));
        }
      });
      first ? hear("choose_answer", slug(lines.q), slug(lines.a)) : replay();
    }
    /* answer sentences: the right one + others built the same way (or from the week's other questions) */
    function answerOptions(r, count) {
      const ok = L.qaLines(r.qa, r.id).a;
      const cands = [];
      shuffle(r.qa.items).forEach(x => { if (x !== r.id && W[x].en !== W[r.id].en) cands.push({ id: x, a: L.qaLines(r.qa, x).a }); });
      shuffle(askable().filter(q => q !== r.qa && q.type === "ask")).forEach(q => shuffle(q.items).forEach(x => cands.push({ id: x, a: L.qaLines(q, x).a })));
      const seen = new Set([ok]), opts = [{ id: r.id, a: ok, ok: true }];
      for (const c of cands) { if (opts.length >= count) break; if (!seen.has(c.a) && W[c.id].en !== W[r.id].en) { seen.add(c.a); opts.push(c); } }
      return shuffle(opts);
    }
    function askRound(r, first) {
      const w = W[r.id], lines = L.qaLines(r.qa, r.id);
      const opts = answerOptions(r, lastMiss ? 2 : 3);
      box.innerHTML = `
        <div class="ask">
          <div class="ask-pic" style="--edge:${w.edge}"><img src="${img(w.id)}" alt="${w.en}"></div>
          <div class="ask-side">
            <button class="q-bubble" id="qb"><span class="who" aria-hidden="true">👩‍🏫</span><span class="q-text">${lines.q}</span>${I.sound}</button>
            <div class="answers">${opts.map(o => `
              <button class="answer" data-ok="${o.ok ? 1 : 0}"><span class="who" aria-hidden="true">🧒</span><img src="${img(o.id)}" alt=""><span>${o.a}</span></button>`).join("")}
            </div>
          </div>
        </div>`;
      let misses = 0, locked = false;
      replay = () => hear(slug(lines.q));
      $("#qb", box).onclick = replay;
      $$(".answer", box).forEach(b => b.onclick = () => {
        if (locked || b.disabled) return;
        if (b.dataset.ok === "1") { locked = true; b.classList.remove("hint"); b.classList.add("right"); right(b, w.id, misses, slug(lines.a)); }
        else {
          misses++; sfx("bad"); restart(b, "wrong"); b.disabled = true; setTimeout(() => b.classList.add("gone"), 350);
          if ($$(".answer:not(:disabled)", box).length <= 2) $$(".answer", box).find(x => x.dataset.ok === "1").classList.add("hint");
          hear("think", slug(lines.q));
        }
      });
      first ? hear("choose_answer", slug(lines.q)) : replay();
    }
    function yesnoRound(r, first) {
      const w = W[r.id], lines = L.qaLines(r.qa, r.id);
      const others = shuffle(r.qa.items.filter(x => x !== r.id && W[x].en !== w.en));
      const yes = Math.random() < 0.5;
      const lookKey = r.qa.scene === "want" ? "look_want" : "look_bag";
      let scene;
      if (r.qa.scene === "want") {
        const wish = yes ? r.id : others[0];
        scene = `<div class="yn-scene want"><span class="wish"><img src="${img(wish)}" alt=""></span><span class="kid" aria-hidden="true">🧒</span><small>Mây muốn món này</small></div>`;
      } else {
        const inBag = yes ? [r.id, others[0]] : others.slice(0, 2);
        scene = `<div class="yn-scene bag"><img class="yn-bag" src="${img("campbag")}" alt="Backpack">${shuffle(inBag).map((x, k) => `<img class="in-bag k${k}" src="${img(x)}" alt="">`).join("")}<small>Ba lô của Mây có gì?</small></div>`;
      }
      box.innerHTML = `
        <div class="ask">
          ${scene}
          <div class="ask-side">
            <button class="q-bubble" id="qb"><span class="who" aria-hidden="true">👩‍🏫</span><img src="${img(w.id)}" alt=""><span class="q-text">${lines.q}</span>${I.sound}</button>
            <div class="answers yn">
              <button class="answer yes" data-ok="${yes ? 1 : 0}"><span class="thumb" aria-hidden="true">👍</span><span>${lines.yes}</span></button>
              <button class="answer no" data-ok="${yes ? 0 : 1}"><span class="thumb" aria-hidden="true">👎</span><span>${lines.no}</span></button>
            </div>
          </div>
        </div>`;
      let misses = 0, locked = false;
      replay = () => hear(slug(lines.q));
      $("#qb", box).onclick = replay;
      $$(".answer", box).forEach(b => b.onclick = () => {
        if (locked) return;
        if (b.dataset.ok === "1") { locked = true; b.classList.remove("hint"); b.classList.add("right"); right(b, w.id, misses, slug(yes ? lines.yes : lines.no)); }
        else { misses++; sfx("bad"); restart(b, "wrong"); $$(".answer", box).find(x => x.dataset.ok === "1").classList.add("hint"); hear("think", lookKey, slug(lines.q)); }
      });
      first ? hear(lookKey, slug(lines.q)) : replay();
    }
    next(true);
  }

  /* ================= STEP 4: SAY IT (listen, then say it together) ================= */
  function sayIt() {
    const id = pageId;
    const items = ctx.qa.filter(q => q.type === "say").flatMap(q => q.lines.map(t => ({ t, pic: q.pic })));
    const done = new Set();
    view.innerHTML = `
      ${head("Say it", "Nghe rồi nói theo nhé")}
      <div class="say-list">${items.map((x, k) => `
        <div class="say-card panel" data-k="${k}">
          <button class="say-pic" aria-label="Listen"><img src="${img(x.pic)}" alt=""></button>
          <p class="say-text">${x.t}</p>
          <div class="say-actions">
            <button class="btn blue listen">${I.sound} Nghe</button>
            <button class="btn green said">${I.check} Mây nói rồi!</button>
          </div>
        </div>`).join("")}</div>`;
    const play = k => say(slug(items[k].t));
    $$(".say-card").forEach(c => {
      const k = +c.dataset.k;
      $(".say-pic", c).onclick = $(".listen", c).onclick = async () => { restart($(".say-pic", c), "boing"); if (await play(k) && alive(id)) say("your_turn"); };
      $(".said", c).onclick = async e => {
        restart(c, "pop"); sfx("good"); L.floaters(c, "e_heart", 5);
        if (!done.has(k)) { done.add(k); addStar(1, e.currentTarget); c.classList.add("ok"); }
        await say("you_said");
        if (alive(id) && done.size === items.length && !L.isDone(ctx.scope, "say")) { finish("say"); celebrate({ title: "Great talking!", sub: "Mây nói giỏi quá!", again: sayIt }); }
      };
    });
    (async () => { if (await say("say_it") && alive(id) && items.length) play(0); })();
  }

  /* ================= LETTER (S / A / P) – question, sound, tracing ================= */
  function letter() {
    const lt = LETTERS[ctx.letter || "S"];
    const letterKey = lt.up === "S" ? "a_letter" : "a_letter_" + lt.up;
    view.innerHTML = `
      ${head("Letter " + lt.up, `Chữ ${lt.up} – âm /${lt.low}/`)}
      <div class="letter-grid">
        <section class="panel">
          <button class="big-s" aria-label="Letter ${lt.up}" style="color:${lt.color}">${lt.up}${lt.low}</button>
          <div class="qa">
            <div class="qa-row"><button class="btn green" data-q="letter">${I.sound}<span>What letter is it?</span></button><span class="bubble" id="ansLetter">?</span></div>
            <div class="qa-row"><button class="btn pink" data-q="sound">${I.sound}<span>What sound is it?</span></button><span class="bubble" id="ansSound">?</span></div>
          </div>
          <div class="s-words">${lt.words.map(id => `<button class="mini" data-w="${id}" aria-label="Say ${W[id].en}"><img src="${img(id)}" alt=""><b>${wordHTML(W[id])}</b></button>`).join("")}</div>
        </section>
        <section class="panel">
          <h2>Trace the ${lt.up}<small>Mây tô chữ ${lt.up} bằng ngón tay</small></h2>
          <div class="trace-wrap"><canvas id="trace" aria-label="Tracing area"></canvas></div>
          <div class="trace-tools"><button class="btn white" id="clear">${I.erase} Clear</button><button class="btn green" id="traced">${I.check} I did it!</button></div>
        </section>
      </div>`;
    const bigS = $(".big-s");
    bigS.onclick = () => { restart(bigS, "wiggle"); say(letterKey, lt.sound); };
    let askedL = false, askedS = false;
    $$("[data-q]").forEach(b => b.onclick = async () => {
      const isL = b.dataset.q === "letter", el = $(isL ? "#ansLetter" : "#ansSound");
      el.classList.remove("show"); el.textContent = "?";
      if (!(await say(isL ? "q_letter" : "q_sound"))) return;
      el.textContent = isL ? `Letter “${lt.up}”` : `Sound /${lt.low}/`; el.classList.add("show"); restart(bigS, "wiggle"); sfx("good");
      await say(...(isL ? [letterKey] : ["a_sound", lt.sound]));
      if (isL && !askedL) { askedL = true; addStar(1, el); }
      if (!isL && !askedS) { askedS = true; addStar(1, el); }
    });
    $$(".mini").forEach(b => b.onclick = () => say("w_" + b.dataset.w));
    const cv = $("#trace"), c2 = cv.getContext("2d");
    let drawn = 0, last = null;
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      cv.width = r.width * dpr; cv.height = r.height * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = r.width;
      c2.clearRect(0, 0, w, w);
      c2.font = `700 ${w * 0.92}px Andika, "Baloo 2", sans-serif`; c2.textAlign = "center"; c2.textBaseline = "middle";
      c2.fillStyle = "rgba(93,187,99,.22)"; c2.fillText(lt.up, w / 2, w * 0.54);
      c2.setLineDash([10, 12]); c2.lineWidth = 4; c2.strokeStyle = "rgba(58,42,31,.45)"; c2.strokeText(lt.up, w / 2, w * 0.54); c2.setLineDash([]);
      drawn = 0;
    };
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); last = pt(e); });
    cv.addEventListener("pointermove", e => {
      if (!last) return;
      const p = pt(e);
      c2.lineCap = "round"; c2.lineJoin = "round"; c2.lineWidth = 18; c2.strokeStyle = "#ff5c8a";
      c2.beginPath(); c2.moveTo(...last); c2.lineTo(...p); c2.stroke();
      drawn += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
    });
    const up = () => { last = null; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    $("#clear").onclick = size;
    $("#traced").onclick = e => {
      if (drawn < cv.getBoundingClientRect().width * 0.8) { sfx("bad"); say("trace_it"); return; }
      sfx("good"); addStar(1, e.currentTarget); finish("letter"); say(praise(), letterKey); later(size, 1400);
    };
    const myId = pageId;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => alive(myId) && size());
    let rw = innerWidth;
    listen(window, "resize", () => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; size(); } });
    later(() => say("q_letter"), 300);
  }

  /* ================= EXPLORE: a themed scene, tap everything ================= */
  const SPOTS = [[6, 8], [40, 4], [74, 10], [10, 40], [44, 34], [78, 42], [22, 68], [58, 66]]; // spread over the scene
  function explore() {
    const id = pageId, wk = ctx.wk;
    const items = ctx.fresh.filter(w => !w.noQuiz).slice(0, SPOTS.length);
    const found = new Set();
    let finished = false;
    view.innerHTML = `
      ${head(EXTRA.explore(wk).vi, "Chạm vào từng hình để nghe")}
      <div class="stage scene scene-${wk.theme}" id="scene">
        <div class="scene-deco" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        ${shuffle(items).map((w, k) => { const [x, y] = SPOTS[Math.floor(k * SPOTS.length / items.length)]; return `<button class="sc-item" data-id="${w.id}" aria-label="${w.en}" style="left:${x}%;top:${y}%;animation-delay:${k * 0.3}s"><img src="${img(w.id)}" alt=""></button>`; }).join("")}
        <p class="mn-say" id="scSay" aria-live="polite"></p>
      </div>`;
    const line = $("#scSay"), scene = $("#scene");
    later(() => say("tap_explore"), 300);
    $$(".sc-item").forEach(el => el.onclick = async () => {
      const wid = el.dataset.id, first = !found.has(wid), qa = qaFor(wid);
      found.add(wid); el.classList.add("seen"); restart(el, "boing"); sfx("pop");
      line.textContent = qa ? `${qa.q} ${qa.a}` : W[wid].en; restart(line, "show");
      if (first) addStar(1, el);
      await (qa ? say(slug(qa.q), slug(qa.a)) : say("w_" + wid));
      if (!alive(id) || finished || found.size < items.length) return;
      finished = true; L.floaters(scene, wk.theme === "halloween" ? "e_glowstar" : "e_firework", 6); finish("explore");
      later(() => { addStar(2); celebrate({ title: "You found them all!", sub: "Mây tìm được hết rồi!", again: explore, voice: ["found_all"] }); }, 500);
    });
  }

  /* ================= CATCH THE GINGERBREAD MAN ================= */
  function gingerbread() {
    const id = pageId, GOAL = 5;
    let caught = 0, running = false, anim = null;
    view.innerHTML = `
      ${head("Catch me!", "Chạm để bắt người bánh gừng")}
      <div class="stage scene scene-ginger" id="gstage">
        <div class="pop-meter" aria-label="Caught"><span id="gBar"></span></div>
        <button class="ginger" id="ginger" aria-label="Gingerbread man"><img src="${img("gingerbread")}" alt=""></button>
        <p class="mn-say show" id="gSay">Run, run, as fast as you can!</p>
      </div>`;
    const st = $("#gstage"), g = $("#ginger"), bar = $("#gBar"), line = $("#gSay");
    function run() {
      if (!alive(id) || caught >= GOAL) return;
      running = true;
      const r = st.getBoundingClientRect(), sz = g.getBoundingClientRect();
      const fromLeft = Math.random() < 0.5;
      const y = 50 + Math.random() * Math.max(10, r.height - sz.height - 110);
      const x0 = fromLeft ? -sz.width : r.width, x1 = fromLeft ? r.width : -sz.width;
      g.style.top = y + "px"; g.classList.toggle("flip", !fromLeft); g.classList.remove("caught");
      anim = g.animate([{ transform: `translateX(${x0}px)` }, { transform: `translateX(${x1}px)` }], { duration: Math.max(2400, 4600 - caught * 400), easing: "linear", fill: "forwards" });
      anim.onfinish = () => { if (alive(id) && running) later(run, 300); };
    }
    g.addEventListener("pointerdown", async e => {
      e.preventDefault();
      if (!running || !anim) return;
      running = false;
      const x = new DOMMatrix(getComputedStyle(g).transform).m41;
      anim.cancel(); g.style.transform = `translateX(${x}px)`;
      g.classList.add("caught"); sfx("boing"); addStar(1, g); caught++;
      bar.style.width = (caught / GOAL) * 100 + "%";
      line.textContent = caught % 2 ? "You can't catch me! I'm the gingerbread man!" : "Run, run, as fast as you can!"; restart(line, "show");
      await say(caught % 2 ? "ginger_catch" : "ginger_run");
      if (!alive(id)) return;
      if (caught >= GOAL) { finish("gingerbread"); celebrate({ title: "You caught him!", sub: "Mây bắt được rồi!", again: gingerbread }); }
      else later(run, 200);
    });
    onLeave(() => { running = false; if (anim) anim.cancel(); });
    (async () => { await say("ginger_go", "ginger_run"); if (alive(id)) run(); })();
  }

  /* ================= LITTLE GAMES (use the words of the context) ================= */
  function taphear() {
    const list = shuffle(ctx.fresh.filter(w => !w.noQuiz)).slice(0, 12);
    const heard = new Set();
    view.innerHTML = `
      ${head("Tap & hear", "Chạm vào hình để nghe")}
      <div class="board">
        ${list.map(w => `<button class="talk-tile" data-id="${w.id}" aria-label="${w.en}" style="--edge:${w.edge}"><img src="${img(w.id)}" alt=""><b>${wordHTML(w)}</b></button>`).join("")}
      </div>`;
    say("tap_hear");
    $$(".talk-tile").forEach(t => t.onclick = () => {
      const wid = t.dataset.id;
      restart(t, "boing"); sfx("pop");
      say("w_" + wid);
      if (!heard.has(wid)) {
        heard.add(wid); t.classList.add("heard");
        if (heard.size % 3 === 0) addStar(1, t);
        if (heard.size === list.length) later(() => { addStar(2); celebrate({ again: taphear }); }, 1300);
      }
    });
  }

  function bubbles() {
    const id = pageId, GOAL = 12, pool = quizWords();
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
      const w = L.pickWeighted(pool);
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
      word.innerHTML = wordHTML(b.w); restart(word, "show");
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
    const id = pageId, ROUNDS = 4, pool = uniqEn(quizWords());
    let round = 0;
    view.innerHTML = `
      ${head("Peekaboo", "Ú òa! Mở hộp xem có gì")}
      <div class="round-dots" id="rd">${Array.from({ length: ROUNDS }, () => "<i></i>").join("")}</div>
      <div class="boxes" id="boxes"></div>
      <p class="peek-line" id="peekLine" aria-live="polite">&nbsp;</p>`;
    const wrap = $("#boxes"), line = $("#peekLine");
    const colors = [["#ff5c8a", "#ffc53d"], ["#3aa0e8", "#ff5c8a"], ["#5dbb63", "#ffc53d"]];
    function deal() {
      const items = shuffle(pool).slice(0, 3);
      let opened = 0;
      line.innerHTML = "&nbsp;";
      wrap.innerHTML = items.map((w, k) => `
        <button class="gift" data-id="${w.id}" aria-label="Open box ${k + 1}" style="--box:${colors[k][0]};--ribbon:${colors[k][1]}">
          <img class="gift-toy" src="${img(w.id)}" alt="">
          <span class="gift-lid"></span><span class="gift-body"></span>
        </button>`).join("");
      $$(".gift", wrap).forEach(g => g.onclick = async () => {
        const ln = L.lineFor(g.dataset.id, ctx.qa);
        if (g.classList.contains("open")) { say(ln.key); return; }
        g.classList.add("open"); sfx("whoosh"); setTimeout(() => sfx("pop"), 180);
        line.textContent = ln.text;
        opened++;
        const last = opened === items.length;
        await say("peekaboo", ln.key);
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
    const id = pageId, ROUNDS = 6, pool = quizWords();
    let n = 0, prev = null;
    view.innerHTML = `
      ${head("Shadow match", "Tìm cái bóng đúng")}
      <div class="round-dots" id="rd">${Array.from({ length: ROUNDS }, () => "<i></i>").join("")}</div>
      <div class="shadow-game"><div class="shadow-hero" id="hero"></div><div class="shadow-opts" id="opts"></div></div>`;
    const hero = $("#hero"), opts = $("#opts");
    function next(first) {
      if (n >= ROUNDS) { addStar(2); celebrate({ again: shadow }); return; }
      const w = L.pickWeighted(pool, prev); prev = w.id;
      const other = pick(pool.filter(x => !sameAs(x, w)));
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
    const id = pageId, LEVELS = [2, 3, 3], pool = uniqEn(quizWords());
    let level = 0;
    view.innerHTML = `
      ${head("Find the same", "Lật thẻ tìm hai hình giống nhau")}
      <div class="round-dots" id="rd">${LEVELS.map(() => "<i></i>").join("")}</div>
      <div class="mem" id="mem"></div>`;
    const grid = $("#mem");
    function deal(first) {
      const pairs = Math.min(LEVELS[level], pool.length);
      const picks = shuffle(pool).slice(0, pairs);
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

  /* ================= SCHOOL THINGS: pack my bag ================= */
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
        if (alive(id)) { finish("pack"); celebrate({ again: pack }); }
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
      ${ctx.wk && ctx.wk.song ? `<div class="night-bar"><a class="btn pink" id="sing" href="${ctx.wk.song}" target="_blank" rel="noopener">${I.music} Sing along <small>Tập hát</small></a></div>` : ""}`;
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
        found.add("done"); sky.classList.add("festive"); L.floaters(sky, "e_firework", 6); finish("moon");
        later(() => { addStar(2); celebrate({ title: "Happy Mid-Autumn!", sub: "Trung thu vui vẻ!", again: moon, voice: ["mid_happy"] }); }, 600);
      }
    });
    const sing = $("#sing"); if (sing) sing.addEventListener("click", () => { L.pauseMusic(); hush(); });
  }

  /* ================= LETTER S week: tidy up ================= */
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
      else later(async () => { task.textContent = "All tidy!"; await say("done"); if (alive(id)) { finish("tidy"); celebrate({ again: tidy, voice: ["w_tidyup"] }); } }, 600);
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

  /* ---------- router ----------
     #home  #stickers  #care  #review
     #w/<week>  #w/<week>/<activity>   #m/<month>  #m/<month>/<activity>   #play/<game> */
  const ACTS = {
    words: () => words(), find: () => quiz("find"), qa: () => quiz("qa"), mix: () => quiz("mix"), say: sayIt,
    letter, explore, gingerbread, tidy, pack, moon, taphear, bubbles, peekaboo, shadow, memory,
  };
  const OLD_GAMES = ["taphear", "bubbles", "peekaboo", "shadow", "memory"];
  function resolve(hash) {
    const [a, b, c] = hash.split("/");
    if (a === "w") {
      const wk = WEEKS.find(x => x.id === b);
      if (wk && (!c || ACTS[c])) { ctx = weekCtx(wk); return c ? [c, ACTS[c]] : ["week", () => weekPage(wk)]; }
    }
    if (a === "m") {
      const m = monthOf(+b);
      if (m && (!c || ACTS[c])) { ctx = monthCtx(m); return c ? [c, ACTS[c]] : ["month", () => monthPage(m)]; }
    }
    if (a === "review") { ctx = reviewCtx(); return ["review", () => quiz("mix")]; }
    ctx = playCtx();
    if (a === "play" && OLD_GAMES.includes(b)) return [b, ACTS[b]];
    if (OLD_GAMES.includes(a)) return [a, ACTS[a]]; // links from the old version
    const oldWeek = WEEKS.find(x => x.extra.includes(a));
    if (oldWeek) { ctx = weekCtx(oldWeek); return [a, ACTS[a]]; }
    if (a === "stickers") return ["stickers", stickers];
    if (a === "care") return ["care", () => care()];
    return ["home", home];
  }
  function render(fn) {
    cleaners.forEach(f => { try { f(); } catch (e) { /* */ } });
    cleaners = []; pageId++;
    fn();
    buddy.bind(view);
  }
  let leaving = false;
  function route() {
    leaving = false;
    hush(); L.closeCelebrate(); L.startSession();
    const [page, fn] = resolve((location.hash || "#home").slice(1));
    document.body.dataset.page = page;
    render(fn);
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
  // Leaving a page: Bunny says bye, then we go back one level
  document.addEventListener("click", e => {
    const back = e.target.closest(".back");
    if (!back) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    const to = back.getAttribute("href") || "#home";
    buddy.mood("sleep", 0); buddy.say("Bye bye!", 900); say("bye");
    setTimeout(() => { if (location.hash === to) route(); else location.hash = to; }, 700);
  });
  L.mountHeader();
  addEventListener("hashchange", route);
  route();
  L.showGate(() => {
    buddy.mood("wave", 2000); buddy.say("What shall we learn?", 2600);
    if ((location.hash || "#home") === "#home") say("what_play");
  });
})();
