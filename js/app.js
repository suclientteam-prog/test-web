/* Learning English with Mây – pages & games.
   Lessons follow the school calendar: Home → month → week → activity.
   Every activity plays with the words of its "context" (one week, one month, or the review mix). */
(() => {
  "use strict";
  const L = window.LS, ART = window.ART;
  const { $, $$, wait, shuffle, pick, img, restart, W, WEEKS, MONTHS, LETTERS, SUPPLIES, I, say, hush, praise, encourage, slowLine, sfx, addStar, buddy } = L;
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
    { r: "play/bubbles",  en: "Bubble shooter", vi: "Bắn bóng",        im: "e_bubbles",  tint: "#c9e8ff" },
    { r: "play/memory",   en: "Find the same", vi: "Lật thẻ",          im: "e_gift",     tint: "#c7f0b5" },
    { r: "play/match3",   en: "Match 3",       vi: "Xếp 3 hình",       im: "e_party",    tint: "#ffd0dd" },
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
    { r: base + "/bubbles",  en: "Bubble shooter", vi: "Bắn bóng",     im: "e_bubbles", tint: "#c9e8ff" },
    { r: base + "/memory",   en: "Find the same", vi: "Lật thẻ",       im: pics[1],     tint: "#c7f0b5" },
    { r: base + "/shadow",   en: "Shadow match",  vi: "Tìm cái bóng",  im: pics[2],     tint: "#e3d7ff" },
    { r: base + "/match3",   en: "Match 3",       vi: "Xếp 3 hình",    im: "e_party",   tint: "#ffd0dd" },
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
  const SHELVES = [
    { kinds: ["food"], en: "Food", vi: "Đồ ăn" },
    { kinds: ["wear"], en: "Clothes", vi: "Trang phục" },
    { kinds: ["scene"], en: "Places", vi: "Nơi đi chơi" },
    { kinds: ["deco"], en: "Decorations", vi: "Đồ trang trí" },
    { kinds: ["bath", "sleep"], en: "Bath & bed", vi: "Tắm & ngủ" },
  ];
  function stickers() {
    const s = L.save, fresh = new Set(s.fresh), need = L.nextStickerIn();
    const pct = ((L.STARS_PER_STICKER - need) / L.STARS_PER_STICKER) * 100;
    const slot = st => {
      const n = L.count(st.id);
      return n
        ? `<button class="sticker-slot has ${fresh.has(st.id) ? "new" : ""}" data-id="${st.id}" aria-label="${st.en}${n > 1 ? " ×" + n : ""}"><span class="sticker-art">${L.stickerArt(st)}</span>${n > 1 ? `<i class="st-count">×${n}</i>` : ""}</button>`
        : `<div class="sticker-slot locked" aria-label="Locked sticker"><span class="sticker-art">${L.stickerArt(st)}</span><span class="lock">?</span></div>`;
    };
    view.innerHTML = `
      ${head("My stickers", "Sổ sticker – dùng sticker để chăm sóc bạn nhỏ")}
      <div class="panel sticker-head">
        <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${L.STARS_PER_STICKER}" aria-valuenow="${L.STARS_PER_STICKER - need}">
          <div class="meter-fill" style="width:${pct}%"></div>
          <span>Còn ${need} ⭐ nữa là có sticker mới</span>
        </div>
        <b class="sticker-total">${L.owned()} / ${L.STICKERS.length}</b>
        <a class="btn pink use-stickers" href="#care">${I.star} Dùng sticker <small>My friend</small></a>
      </div>
      ${SHELVES.map(sh => {
        const list = L.STICKERS.filter(st => sh.kinds.includes(st.kind));
        return `<section class="shelf">
          <h2 class="step-title">${sh.vi} <small>${sh.en} · ${list.filter(st => L.count(st.id)).length}/${list.length}</small></h2>
          <div class="sticker-book">${list.map(slot).join("")}</div>
        </section>`;
      }).join("")}`;
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
    let idleT = 0, nudges = 0;
    const hear = async (...keys) => {
      clearTimeout(idleT); ear.classList.add("playing");
      const ok = await say(...keys);
      if (alive(id)) { ear.classList.remove("playing"); if (ok) wake(); }
    };
    ear.onclick = () => replay();
    /* slow to answer: cheer and ask again; the second time, the right answer shines */
    const okEl = () => $(".answer[data-ok='1']", box) || $(`.choice[data-id="${box.dataset.ans}"]`, box);
    function wake() { clearTimeout(idleT); if (nudges < 2) idleT = setTimeout(nudge, 9000); }
    async function nudge() {
      if (!alive(id) || $(".right", box) || !okEl()) return;
      nudges++; buddy.mood("think", 1800);
      if (nudges >= 2) okEl().classList.add("hint");
      if (await say(nudges >= 2 ? "need_help" : slowLine()) && alive(id) && !$(".right", box)) replay();
    }
    /* a wrong answer: cheer, and once the right answer shines, point at it */
    const wrongSay = () => okEl() && okEl().classList.contains("hint") ? "look_shine" : encourage();

    /* a correct choice: stars, learning record, then the next round */
    async function right(el, wid, misses, ...voice) {
      sfx("good"); clearTimeout(idleT);
      if (wid) L.learn(wid, misses === 0);
      if (misses === 0) { got++; streak++; $$(".progress i")[n].classList.add("got"); addStar(1, el); } else streak = 0;
      lastMiss = misses > 0;
      await say(...voice, misses ? "got_it" : praise());
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
      nudges = 0; box.dataset.ans = r.t === "point" ? r.id : "";
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
      const ans = L.pickWeighted(pool, prev); prev = ans.id; box.dataset.ans = ans.id;
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
          hear(wrongSay(), "find_" + ans.id);
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
          hear(wrongSay(), slug(lines.a));
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
          hear(wrongSay(), slug(lines.q));
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
        else { misses++; sfx("bad"); restart(b, "wrong"); $$(".answer", box).find(x => x.dataset.ok === "1").classList.add("hint"); hear(wrongSay(), lookKey, slug(lines.q)); }
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

  /* Bubble shooter: pull the slingshot back (or tap where to shoot).
     3 or more of the same picture touching → they pop, and what hangs below them drops. */
  function bubbles() {
    const id = pageId, COLS = 7, ROWS = 3;
    const kinds = shuffle(uniqEn(quizWords())).slice(0, 4);
    view.innerHTML = `
      ${head("Bubble shooter", "Kéo ná bắn bóng, 3 hình giống nhau là rơi")}
      <div class="stage shooter" id="stage">
        <svg class="sling" id="sling" aria-hidden="true">
          <line class="band" id="bandL"/><line class="band" id="bandR"/>
          <path class="fork" id="fork"/>
        </svg>
        <div class="aim" id="aim"></div>
        <p class="pop-word" id="popWord" aria-live="polite"></p>
      </div>`;
    const stage = $("#stage"), aim = $("#aim"), word = $("#popWord");
    const grid = new Map(); // "r,c" → { w, el }
    const key = (r, c) => r + "," + c;
    let D, R, TOP, MAXROW, sx, sy, ball = null, next = null, flying = false, pull = null, raf = 0, misses = 0;

    function measure() {
      const w = stage.clientWidth, h = stage.clientHeight;
      D = Math.min(w / (COLS + 0.5), h / 7.5); R = D / 2; TOP = 6;
      const left = (w - D * (COLS + 0.5)) / 2;
      measure.left = left;
      sx = w / 2; sy = h - D * 1.25;
      MAXROW = Math.max(ROWS + 1, Math.floor((sy - D * 2.6 - TOP - R) / (D * 0.87))); // one spare row below it
      const fork = $("#fork"), fy = sy + R * 0.2;
      fork.setAttribute("d", `M${sx} ${h} L${sx} ${fy + D * 0.75} M${sx - D * 0.55} ${fy} Q${sx - D * 0.5} ${fy + D * 0.75} ${sx} ${fy + D * 0.75} Q${sx + D * 0.5} ${fy + D * 0.75} ${sx + D * 0.55} ${fy}`);
      measure.tips = [[sx - D * 0.55, fy], [sx + D * 0.55, fy]];
      stage.style.setProperty("--d", D + "px");
    }
    const cx = (r, c) => measure.left + R + c * D + (r % 2 ? R : 0);
    const cy = r => TOP + R + r * D * 0.87;
    const at = (el, x, y) => { el.style.translate = `${x - R}px ${y - R}px`; }; // not transform: CSS scale would scale it too
    const neighbours = (r, c) => (r % 2
      ? [[r, c - 1], [r, c + 1], [r - 1, c], [r - 1, c + 1], [r + 1, c], [r + 1, c + 1]]
      : [[r, c - 1], [r, c + 1], [r - 1, c - 1], [r - 1, c], [r + 1, c - 1], [r + 1, c]])
      .filter(([a, b]) => a >= 0 && b >= 0 && b < COLS);

    function bubbleEl(w, cls = "") {
      const el = document.createElement("span");
      el.className = "sb " + cls;
      el.innerHTML = `<img src="${img(w.id)}" alt=""><span class="bubble-shine"></span>`;
      stage.appendChild(el);
      return el;
    }
    function put(r, c, w) {
      const el = bubbleEl(w);
      grid.set(key(r, c), { w, el });
      at(el, cx(r, c), cy(r));
    }
    measure();
    // clumps of the same picture so matches come easily
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const near = neighbours(r, c).map(([a, b]) => grid.get(key(a, b))).filter(Boolean);
      put(r, c, near.length && Math.random() < 0.55 ? pick(near).w : pick(kinds));
    }

    /* what to shoot next: a picture still on the board, preferably one the child can reach.
       After a miss it helps: the lowest picture (a straight shot hits it), best one that already has a twin. */
    function nextWord(help) {
      const cells = [...grid.entries()].map(([k, v]) => { const [r, c] = k.split(",").map(Number); return { r, c, w: v.w }; });
      const open = cells.filter(x => neighbours(x.r, x.c).some(([a, b]) => !grid.has(key(a, b))));
      if (!open.length) return cells.length ? pick(cells).w : pick(kinds);
      if (!help) return pick(open).w;
      const low = Math.max(...open.map(x => x.r));
      const bottom = open.filter(x => x.r >= low - 1).sort((x, y) => y.r - x.r);
      const twin = x => neighbours(x.r, x.c).some(([a, b]) => { const v = grid.get(key(a, b)); return v && v.w.id === x.w.id; });
      return (bottom.find(twin) || bottom[0]).w;
    }
    function load() {
      if (!grid.size) return;
      const onBoard = new Set([...grid.values()].map(v => v.w.id));
      const w = misses ? nextWord(true) : next && onBoard.has(next.w.id) ? next.w : nextWord();
      if (next) next.el.remove();
      ball = { w, el: bubbleEl(w, "ready"), x: sx, y: sy };
      at(ball.el, sx, sy);
      const nw = nextWord();
      next = { w: nw, el: bubbleEl(nw, "next") };
      at(next.el, sx + D * 1.9, sy + R * 0.35);
      next.el.onclick = swap;
      bands(sx, sy);
    }
    function swap() {
      if (flying || !ball || !next) return;
      [ball.w, next.w] = [next.w, ball.w];
      [ball.el.innerHTML, next.el.innerHTML] = [next.el.innerHTML, ball.el.innerHTML];
      sfx("flip"); say("w_" + ball.w.id);
    }
    function bands(x, y) {
      [["#bandL", 0], ["#bandR", 1]].forEach(([sel, i]) => {
        const l = $(sel), [tx, ty] = measure.tips[i];
        l.setAttribute("x1", tx); l.setAttribute("y1", ty); l.setAttribute("x2", x); l.setAttribute("y2", y);
      });
    }

    /* aiming: drag down to pull the band (it shoots the other way), or point up where to shoot */
    function direction(px, py) {
      let dx, dy;
      if (py > sy - R) { dx = sx - px; dy = sy - py; } else { dx = px - sx; dy = py - sy; }
      const len = Math.hypot(dx, dy);
      if (len < R * 0.6) return null;
      dx /= len; dy /= len;
      if (dy > -0.22) { dy = -0.22; dx = Math.sign(dx || 1) * Math.sqrt(1 - dy * dy); }
      return { dx, dy, back: py > sy - R ? Math.min(len, D * 1.2) : 0 };
    }
    // walk the path in small steps: walls bounce, stop on the top or next to a bubble
    function travel(x, y, dx, dy, each) {
      const w = stage.clientWidth, minX = measure.left + R, maxX = w - measure.left - R;
      for (let i = 0; i < 4000; i++) {
        x += dx * R * 0.25; y += dy * R * 0.25;
        if (x < minX) { x = minX; dx = -dx; } else if (x > maxX) { x = maxX; dx = -dx; }
        if (each && each(x, y, i) === false) break;
        if (y <= TOP + R) break;
        let hit = false;
        for (const k of grid.keys()) { const [r, c] = k.split(",").map(Number); if (Math.hypot(cx(r, c) - x, cy(r) - y) < D * 0.82) { hit = true; break; } }
        if (hit) break;
      }
      return { x, y };
    }
    function showAim(d) {
      if (!d) { aim.innerHTML = ""; return; }
      const dots = [];
      travel(sx, sy, d.dx, d.dy, (x, y, i) => { if (i % 6 === 5) dots.push([x, y]); return dots.length < 22; });
      aim.innerHTML = dots.map(([x, y], i) => `<i style="transform:translate(${x}px,${y}px);opacity:${1 - i / 26}"></i>`).join("");
    }
    const point = e => { const b = stage.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    listen(stage, "pointerdown", e => {
      if (flying || !ball || e.target.closest(".next")) return;
      e.preventDefault();
      const [px, py] = point(e);
      pull = { onBall: Math.hypot(px - sx, py - sy) < D, moved: false };
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      aimAt(px, py);
    });
    function aimAt(px, py) {
      const d = direction(px, py);
      pull.d = d;
      if (pull.onBall && !pull.moved && Math.hypot(px - sx, py - sy) < R * 0.6) { showAim(null); return; }
      pull.moved = true;
      showAim(d);
      const back = d && d.back ? d.back : 0;
      const bx = d ? sx - d.dx * back : sx, by = d ? sy - d.dy * back : sy;
      at(ball.el, bx, by); bands(bx, by);
    }
    listen(stage, "pointermove", e => { if (pull) aimAt(...point(e)); });
    listen(stage, "pointerup", () => {
      if (!pull) return;
      const p = pull; pull = null; showAim(null);
      if (!p.moved) { if (p.onBall) say("w_" + ball.w.id); at(ball.el, sx, sy); bands(sx, sy); return; }
      if (!p.d) { at(ball.el, sx, sy); bands(sx, sy); return; }
      shoot(p.d);
    });
    listen(stage, "pointercancel", () => { if (pull) { pull = null; showAim(null); at(ball.el, sx, sy); bands(sx, sy); } });

    function shoot(d) {
      flying = true; sfx("whoosh");
      ball.el.classList.remove("ready");
      bands(sx, sy);
      const speed = stage.clientHeight * 2.1;
      let x = sx, y = sy, dx = d.dx, dy = d.dy, last = 0;
      const w = stage.clientWidth, minX = measure.left + R, maxX = w - measure.left - R;
      const step = now => {
        if (!alive(id)) return;
        const dt = Math.min(0.04, (now - (last || now)) / 1000); last = now;
        let move = speed * dt, stop = false;
        while (move > 0 && !stop) {
          const s = Math.min(move, R * 0.25); move -= s;
          x += dx * s; y += dy * s;
          if (x < minX) { x = minX; dx = -dx; sfx("tap"); } else if (x > maxX) { x = maxX; dx = -dx; sfx("tap"); }
          if (y <= TOP + R) stop = true;
          else for (const k of grid.keys()) { const [r, c] = k.split(",").map(Number); if (Math.hypot(cx(r, c) - x, cy(r) - y) < D * 0.82) { stop = true; break; } }
        }
        at(ball.el, x, y);
        if (stop) land(x, y); else raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    /* snap to the nearest free place that touches the top or another bubble */
    async function land(x, y) {
      let best = null, bd = Infinity;
      for (let r = 0; r <= MAXROW + 1; r++) for (let c = 0; c < COLS; c++) {
        if (grid.has(key(r, c))) continue;
        if (r > 0 && !neighbours(r, c).some(([a, b]) => grid.has(key(a, b)))) continue;
        const dd = Math.hypot(cx(r, c) - x, cy(r) - y);
        if (dd < bd) { bd = dd; best = [r, c]; }
      }
      const shot = ball; ball = null;
      if (!best) best = [0, Math.max(0, Math.min(COLS - 1, Math.round((x - measure.left - R) / D)))];
      const [r, c] = best;
      shot.el.classList.add("snap");
      at(shot.el, cx(r, c), cy(r));
      grid.set(key(r, c), { w: shot.w, el: shot.el });
      await wait(140);
      if (!alive(id)) return;

      // same pictures touching
      const same = new Set([key(r, c)]), todo = [[r, c]];
      while (todo.length) {
        const [a, b] = todo.pop();
        for (const [na, nb] of neighbours(a, b)) {
          const k = key(na, nb), v = grid.get(k);
          if (v && !same.has(k) && v.w.id === shot.w.id) { same.add(k); todo.push([na, nb]); }
        }
      }
      let matched = false;
      if (same.size >= 3) {
        matched = true; misses = 0;
        same.forEach(k => { const v = grid.get(k); grid.delete(k); burst(v.el); });
        // whatever no longer hangs from the top falls down
        const held = new Set(), queue = [...grid.keys()].filter(k => k.startsWith("0,"));
        queue.forEach(k => held.add(k));
        while (queue.length) {
          const [a, b] = queue.pop().split(",").map(Number);
          for (const [na, nb] of neighbours(a, b)) { const k = key(na, nb); if (grid.has(k) && !held.has(k)) { held.add(k); queue.push(k); } }
        }
        const loose = [...grid.keys()].filter(k => !held.has(k));
        loose.forEach((k, i) => { const v = grid.get(k); grid.delete(k); setTimeout(() => fall(v.el), 60 * i); });
        if (loose.length) later(() => sfx("whoosh"), 150);
        word.innerHTML = wordHTML(shot.w); restart(word, "show");
        addStar(1, stage);
      } else if (r > MAXROW + 1) {
        // too low: this one just falls away (no losing in this game)
        grid.delete(key(r, c)); sfx("boing");
        fall(shot.el);
      } else sfx("tap");
      if (!matched) misses++;

      flying = false;
      if (!grid.size) {
        next && next.el.remove();
        await say("w_" + shot.w.id, "hooray");
        if (alive(id)) { addStar(2); celebrate({ again: bubbles }); }
        return;
      }
      load();
      if (matched) { if (await say("w_" + shot.w.id, praise()) && alive(id) && ball) say("w_" + ball.w.id); }
      else say("w_" + ball.w.id);
    }
    function fall(el) {
      const [x, y] = el.style.translate.split(" ").map(parseFloat);
      el.classList.add("drop"); el.style.translate = `${x}px ${y + stage.clientHeight}px`;
      setTimeout(() => el.remove(), 900);
    }
    function burst(el) {
      sfx("pop"); el.classList.add("popped");
      const ring = document.createElement("span"); ring.className = "pop-ring";
      const [x, y] = el.style.translate.split(" ").map(parseFloat);
      ring.style.left = x + R + "px"; ring.style.top = y + R + "px";
      stage.appendChild(ring); setTimeout(() => ring.remove(), 600);
      setTimeout(() => el.remove(), 320);
    }

    function layout() {
      measure();
      grid.forEach((v, k) => { const [r, c] = k.split(",").map(Number); at(v.el, cx(r, c), cy(r)); });
      if (ball && !flying) { at(ball.el, sx, sy); bands(sx, sy); }
      if (next) at(next.el, sx + D * 1.9, sy + R * 0.35);
    }
    load();
    listen(window, "resize", layout);
    onLeave(() => cancelAnimationFrame(raf));
    (async () => { if (await say("shoot_bubbles") && alive(id) && ball) say("w_" + ball.w.id); })();
  }

  /* Match 3: swap two pictures side by side (tap-tap or swipe); 3 in a row disappear */
  function match3() {
    const id = pageId, N = 6, GOAL = 30;
    let kinds = shuffle(uniqEn(quizWords())).slice(0, 5);
    if (kinds.length < 4) kinds = uniqEn([...kinds, ...shuffle(Object.values(W).filter(w => !w.noQuiz))]).slice(0, 4);
    view.innerHTML = `
      ${head("Match 3", "Đổi chỗ 2 hình, xếp 3 hình giống nhau thành hàng")}
      <div class="m3-top"><div class="pop-meter m3-meter" aria-label="Pictures matched"><span id="m3Bar"></span></div></div>
      <div class="m3" id="m3"></div>
      <p class="m3-word" id="m3Word" aria-live="polite">&nbsp;</p>`;
    const board = $("#m3"), bar = $("#m3Bar"), word = $("#m3Word");
    const g = Array.from({ length: N }, () => Array(N).fill(null)); // g[r][c] = { w, el }
    let got = 0, busy = false, sel = null, hintT = 0;

    const pos = (t, r, c) => { t.el.style.left = (c * 100) / N + "%"; t.el.style.top = (r * 100) / N + "%"; t.r = r; t.c = c; };
    function tileAt(r, c, w, fromRow) {
      const el = document.createElement("button");
      el.className = "m3-tile"; el.setAttribute("aria-label", w.en);
      el.innerHTML = `<img src="${img(w.id)}" alt="">`;
      const t = { w, el };
      pos(t, fromRow === undefined ? r : fromRow, c);
      board.appendChild(el);
      g[r][c] = t;
      if (fromRow !== undefined) { el.getBoundingClientRect(); pos(t, r, c); }
      return t;
    }
    const kindAt = (r, c) => g[r] && g[r][c] && g[r][c].w.id;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const bad = new Set();
      if (c >= 2 && kindAt(r, c - 1) === kindAt(r, c - 2)) bad.add(kindAt(r, c - 1));
      if (r >= 2 && kindAt(r - 1, c) === kindAt(r - 2, c)) bad.add(kindAt(r - 1, c));
      tileAt(r, c, pick(kinds.filter(w => !bad.has(w.id))));
    }

    function matches() {
      const hit = new Set();
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const k = kindAt(r, c);
        if (!k) continue;
        if (c <= N - 3 && kindAt(r, c + 1) === k && kindAt(r, c + 2) === k) { let e = c; while (e < N && kindAt(r, e) === k) hit.add(r + "," + e++); }
        if (r <= N - 3 && kindAt(r + 1, c) === k && kindAt(r + 2, c) === k) { let e = r; while (e < N && kindAt(e, c) === k) hit.add(e++ + "," + c); }
      }
      return hit;
    }
    const exchange = (a, b) => { const [ar, ac, br, bc] = [a.r, a.c, b.r, b.c]; g[ar][ac] = b; g[br][bc] = a; pos(a, br, bc); pos(b, ar, ac); };
    function findMove() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr, c2 = c + dc;
        if (r2 >= N || c2 >= N) continue;
        const a = g[r][c], b = g[r2][c2];
        [g[r][c], g[r2][c2]] = [b, a];
        const ok = matches().size > 0;
        [g[r][c], g[r2][c2]] = [a, b];
        if (ok) return [a, b];
      }
      return null;
    }
    // after a few quiet seconds, two pictures wiggle to show a good swap
    function idleHint() {
      clearTimeout(hintT);
      $$(".m3-tile.hint", board).forEach(x => x.classList.remove("hint"));
      hintT = setTimeout(() => { if (!alive(id) || busy) return; const m = findMove(); if (m) m.forEach(t => t.el.classList.add("hint")); }, 6000);
    }
    onLeave(() => clearTimeout(hintT));

    async function trySwap(a, b) {
      busy = true; select(null); idleHint();
      exchange(a, b); sfx("flip");
      await wait(230);
      if (!alive(id)) return;
      if (!matches().size) {
        exchange(a, b); sfx("boing");
        restart(a.el, "wiggle"); restart(b.el, "wiggle");
        await wait(260);
        busy = false; return;
      }
      let chain = 0;
      for (let hit = matches(); hit.size; hit = matches()) {
        const first = hit.values().next().value.split(",").map(Number);
        const w = g[first[0]][first[1]].w;
        word.innerHTML = wordHTML(w); restart(word, "show");
        if (chain === 0) say("w_" + w.id); else say(praise());
        chain++;
        sfx("pop");
        hit.forEach(k => { const [r, c] = k.split(",").map(Number); const t = g[r][c]; g[r][c] = null; t.el.classList.add("gone"); setTimeout(() => t.el.remove(), 300); });
        const before = got; got += hit.size;
        bar.style.width = Math.min(100, (got / GOAL) * 100) + "%";
        if (Math.floor(got / 6) > Math.floor(before / 6)) addStar(1, board);
        await wait(300);
        if (!alive(id)) return;
        // pictures fall down, new ones come from the top
        for (let c = 0; c < N; c++) {
          let to = N - 1;
          for (let r = N - 1; r >= 0; r--) if (g[r][c]) { const t = g[r][c]; g[r][c] = null; g[to][c] = t; pos(t, to, c); to--; }
          for (let r = to, k = 1; r >= 0; r--, k++) tileAt(r, c, pick(kinds), -k);
        }
        await wait(330);
        if (!alive(id)) return;
      }
      if (got >= GOAL) {
        clearTimeout(hintT);
        later(() => { addStar(2); celebrate({ again: match3 }); }, 500);
        return;
      }
      if (!findMove()) { // no swap left: mix the board
        sfx("whoosh");
        const all = g.flat();
        for (let i = 0; i < 40; i++) {
          const ws = shuffle(all.map(t => t.w));
          all.forEach((t, k) => { t.w = ws[k]; });
          if (!matches().size && findMove()) break;
        }
        all.forEach(t => { t.el.innerHTML = `<img src="${img(t.w.id)}" alt="">`; t.el.setAttribute("aria-label", t.w.en); restart(t.el, "wiggle"); });
      }
      busy = false;
    }

    function select(t) {
      if (sel) sel.el.classList.remove("sel");
      sel = t;
      if (t) t.el.classList.add("sel");
    }
    const tileOf = el => g.flat().find(t => t && t.el === el);
    let down = null;
    listen(board, "pointerdown", e => {
      const el = e.target.closest(".m3-tile");
      if (!el || busy) return;
      e.preventDefault();
      down = { t: tileOf(el), x: e.clientX, y: e.clientY };
    });
    listen(window, "pointerup", e => {
      if (!down || busy) { down = null; return; }
      const { t, x, y } = down; down = null;
      if (!t) return;
      const dx = e.clientX - x, dy = e.clientY - y, far = board.clientWidth / N / 3;
      if (Math.hypot(dx, dy) > far) { // swipe
        const [dr, dc] = Math.abs(dx) > Math.abs(dy) ? [0, Math.sign(dx)] : [Math.sign(dy), 0];
        const o = g[t.r + dr] && g[t.r + dr][t.c + dc];
        if (o) trySwap(t, o);
        return;
      }
      say("w_" + t.w.id);
      if (sel && sel !== t && Math.abs(sel.r - t.r) + Math.abs(sel.c - t.c) === 1) trySwap(sel, t);
      else select(sel === t ? null : t);
    });
    idleHint();
    say("match_three");
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
          say("look_shine", "w_" + w.id);
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
  /* the rooms list every thing of their kind: free starters + stickers (locked until Mây gets them) */
  const kindIds = k => L.STICKERS.filter(s => s.kind === k).map(s => s.id);
  const ROOMS = {
    eat:   { en: "Eat",      vi: "Ăn",        icon: "e_apple",   intro: "hungry",    items: () => ["apple", ...kindIds("food")] },
    sleep: { en: "Sleep",    vi: "Ngủ",       icon: "e_bed",     intro: "bed_time",  items: () => ["pillow", ...kindIds("sleep"), "goodnight"] },
    out:   { en: "Go out",   vi: "Đi chơi",   icon: "f_slide",   intro: "where_go" },
    bath:  { en: "Bath",     vi: "Tắm",       icon: "e_bathtub", intro: "bath_time", items: () => ["soap", ...kindIds("bath"), "shower"] },
    dress: { en: "Dress",    vi: "Mặc đồ",    icon: "e_shirt",   intro: "dress_up",  items: () => ["shirt", ...kindIds("wear")] },
    play:  { en: "Decorate", vi: "Trang trí", icon: "e_balloon", intro: "decorate" },
  };
  /* what my friend needs (core.js keeps the numbers): the room that helps, and what it says when the need is low */
  const NEEDS = {
    food: { art: "e_apple",   room: "eat",   low: "hungry",    vi: "Đói bụng" },
    rest: { art: "e_bed",     room: "sleep", low: "sleepy",    vi: "Buồn ngủ" },
    fun:  { art: "e_balloon", room: "out",   low: "want_play", vi: "Muốn đi chơi" },
  };
  /* outings: each one reviews the lessons; gain = what it does to the needs */
  const OUTS = {
    park:   { en: "Park",        vi: "Công viên", art: "f_slide", intro: "go_park",   done: "park_done", gain: { fun: 40, rest: -15, food: -10 } },
    market: { en: "Supermarket", vi: "Siêu thị",  art: "f_store", intro: "go_market", done: "shop_done", gain: { fun: 25, rest: -10, food: 35 } },
    gym:    { en: "Exercise",    vi: "Thể dục",   art: "f_lotus", intro: "go_gym",    done: "gym_done",  gain: { fun: 30, rest: -30, food: -25 } },
  };
  const POSES = { tree: "f_tree", star: "star", cat: "blackcat", butterfly: "f_butterfly" };
  // things everyone has (not stickers)
  const BASIC = {
    apple: { en: "apple", art: "e_apple", voice: "eat_apple" },
    soap: { en: "soap", art: "e_soap", voice: "use_soap" }, shower: { en: "water", art: "e_shower", voice: "use_shower" },
    shirt: { en: "shirt", art: "e_shirt", voice: "put_shirt", slot: "body" },
    pillow: { en: "pillow", art: "pillow", voice: "use_pillow" },
    goodnight: { en: "good night", art: "e_crescent", voice: "good_night" },
  };
  // clothes drawn inside the friend picture (art.js): where they fly to
  const DRAWN = { shirt: [0.5, 0.72], shoes: [0.5, 0.94], hat: [0.5, 0.1], socks: [0.5, 0.9], sunglasses: [0.5, 0.37], crown: [0.5, 0.08] };
  const ITEM = id => BASIC[id] || L.stickerOf(id);
  const itemArt = id => id === "pillow"
    ? `<span class="svg-art">${ART.PILLOW}</span>`
    : `<img src="${img(ITEM(id).art)}" alt="">`;
  const itemSrc = id => id === "pillow" ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ART.PILLOW) : img(ITEM(id).art);
  const isWear = id => id === "shirt" || (L.stickerOf(id) || {}).kind === "wear";
  const wearAt = id => DRAWN[id] || [ITEM(id).x / 100, ITEM(id).y / 100];
  /* Play room places: the park is free, the others are stickers. pics = what stands in the back */
  const PLACES = {
    park: { en: "park", pics: [["f_tree", "p-left"], ["e_flower", "p-low"]] },
    beach: { pics: [["beach", "p-right"], ["f_shell", "p-low"]] },
    mountains: { pics: [["mountains", "p-wide"]] },
    camping: { pics: [["tent", "p-left"], ["campfire", "p-low"]] },
    picnic: { pics: [["basket", "p-left"], ["blanket", "p-low"]] },
    school: { pics: [["school", "p-wide"]] },
    moon: { pics: [["moon", "p-sky"], ["lantern", "p-left"]] },
    halloween: { pics: [["pumpkin", "p-low"], ["e_crescent", "p-sky"]] },
    vietnam: { pics: [["flag", "p-left"], ["fireworks", "p-sky"]] },
    snow: { pics: [["f_snowman", "p-left"], ["f_xmastree", "p-right"]] },
    space: { pics: [["f_planet", "p-sky"], ["f_rocket", "p-left"]] },
    sea: { pics: [["f_fish", "p-left"], ["f_turtle", "p-low"]] },
  };
  const placeIds = () => ["park", ...kindIds("scene")];

  function care(roomId) {
    if (!L.save.friend) return pickFriend();
    const id = pageId, kind = L.save.friend;
    const used = new Set(); // first use of each item this visit gives a star (3 at most)
    let done = {}, visitStars = 0;
    L.save.room = L.save.room || { scene: "park", deco: [] };
    const room = L.save.room;
    if (!PLACES[room.scene] || !L.owns(room.scene) && room.scene !== "park") room.scene = "park";
    view.innerHTML = `
      ${head("My friend", "Chăm sóc bạn nhỏ – xem bạn cần gì nhé")}
      <div class="care">
        <div class="rooms" role="tablist" aria-label="Rooms">
          ${Object.entries(ROOMS).map(([k, r]) => `<button class="room-tab" role="tab" data-room="${k}" aria-selected="false"><img src="${img(r.icon)}" alt=""><span>${r.en}<small>${r.vi}</small></span></button>`).join("")}
          <button class="room-tab swap" id="swapFriend" aria-label="Change friend"><span class="mini-face">${ART.friend(kind)}</span><span>Friend<small>Đổi bạn</small></span></button>
        </div>
        <div class="care-stage" id="cstage">
          <div class="care-deco" id="deco" aria-hidden="true"></div>
          <div class="o-scene" id="oscene"></div>
          <div class="play-deco" id="pdeco"></div>
          <button class="friend-wrap" id="fw" aria-label="${kind}">${ART.friend(kind)}<span class="wear-on" id="wearOn"></span><img class="teddy-hold" id="teddyHold" src="${img("e_teddy")}" alt="" hidden><span class="want" id="want" hidden></span></button>
          <img class="tub" id="tub" src="${img("e_bathtub")}" alt="" hidden>
          <div class="night-layer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          <div class="needs" id="needs" role="group" aria-label="What my friend needs"></div>
        </div>
        <div class="tray" id="tray" role="toolbar" aria-label="Things"></div>
      </div>`;
    const stage = $("#cstage"), fw = $("#fw"), svg = $(".friend", fw), tray = $("#tray"), deco = $("#deco"), pdeco = $("#pdeco"), oscene = $("#oscene"), tub = $("#tub"), teddy = $("#teddyHold"), wearOn = $("#wearOn"), want = $("#want"), needsBar = $("#needs");
    const wear = new Set((L.save.wear || []).filter(w => L.owns(w)));
    const slotOf = w => (ITEM(w) || {}).slot || w;
    function applyWear() {
      Object.keys(DRAWN).forEach(w => svg.classList.toggle("wear-" + w, wear.has(w)));
      wearOn.innerHTML = [...wear].filter(w => !DRAWN[w]).map(w => { const s = ITEM(w);
        return `<img class="wear-img w-${s.slot}" src="${img(s.art)}" alt="" style="left:${s.x}%;top:${s.y}%;width:${s.w}%">`; }).join("");
    }
    applyWear();
    let night = false, mud = false, foam = false, mode = "places", outing = null;
    /* ---------- needs: meters, a thought bubble, and the friend's face ---------- */
    const lowest = () => { const n = L.needs(); return Object.keys(NEEDS).reduce((a, k) => n[k] < n[a] ? k : a, "food"); };
    function baseMood() {
      if (night) return "sleep";
      if (outing) return "idle";
      const k = lowest(), v = L.needs()[k];
      return v >= 25 ? "idle" : k === "rest" ? "tired" : "sad";
    }
    let moodT = 0;
    const fmood = (m, ms = 1600) => { clearTimeout(moodT); L.setSvgMood(svg, m); if (ms) moodT = setTimeout(() => { if (alive(id)) L.setSvgMood(svg, baseMood()); }, ms); };
    function showNeeds() {
      const n = L.needs(), k = lowest();
      needsBar.innerHTML = Object.entries(NEEDS).map(([nk, d]) => {
        const v = Math.round(n[nk]);
        return `<button class="need ${v < 30 ? "low" : v < 60 ? "mid" : ""}" data-need="${nk}" aria-label="${d.vi} ${v}%" style="--v:${v}%"><img src="${img(d.art)}" alt=""></button>`;
      }).join("");
      const wantIt = !night && !outing && n[k] < 40;
      want.hidden = !wantIt;
      if (wantIt) want.innerHTML = `<img src="${img(NEEDS[k].art)}" alt=""><b>${NEEDS[k].vi}</b>`;
      $$(".room-tab[data-room]").forEach(t => t.classList.toggle("needed", wantIt && t.dataset.room === NEEDS[k].room));
    }
    const needUp = (k, d) => { L.need(k, d); showNeeds(); };
    listen(needsBar, "click", e => {
      const b = e.target.closest(".need"); if (!b) return;
      const d = NEEDS[b.dataset.need];
      sfx("tap"); restart(b, "boing");
      if (roomId !== d.room && !night) setRoom(d.room, L.needs()[b.dataset.need] < 40 ? d.low : null);
      else say(L.needs()[b.dataset.need] < 40 ? d.low : "s_im_happy");
    });
    const tick = setInterval(() => { if (alive(id)) showNeeds(); }, 20000);
    onLeave(() => clearInterval(tick));

    const firstUse = (key, el) => { if (!used.has(key)) { used.add(key); if (visitStars < 3) { visitStars++; addStar(1, el); } } };
    const bonus = (key, el) => { if (!done[key]) { done[key] = true; addStar(1, el); } };

    function setRoom(k, intro) {
      roomId = k; hush(); outing = null;
      $$(".room-tab[data-room]").forEach(t => t.setAttribute("aria-selected", String(t.dataset.room === k)));
      stage.className = "care-stage room-" + k + (k === "play" ? " place-" + room.scene : "");
      tray.classList.remove("o-mode");
      svg.classList.remove(...[...svg.classList].filter(c => /^(pose|act)-/.test(c)));
      tub.hidden = k !== "bath"; teddy.hidden = true;
      night = false; stage.classList.remove("is-night"); svg.classList.remove("show-blanket", "show-pillow", "show-bubbles");
      mud = k === "bath"; foam = false; svg.classList.toggle("show-mud", mud);
      deco.innerHTML = {
        eat: `<div class="win"><img src="${img("e_sun")}" alt=""></div><img class="deco-chair" src="${img("chair")}" alt=""><img class="deco-table" src="${img("table")}" alt="">`,
        bath: `<img class="deco-duck" src="${img("e_bubbles")}" alt=""><img class="deco-drop" src="${img("e_droplet")}" alt="">`,
        dress: `<div class="bunting"></div><img class="deco-bag" src="${img("backpack")}" alt=""><img class="deco-rain" src="${img("e_rainbow")}" alt="">`,
        sleep: `<div class="win night"><img src="${img("e_crescent")}" alt=""></div><div class="headboard"></div><img class="deco-lantern" src="${img("lantern")}" alt="">`,
        play: placePics(),
        out: `<img class="deco-sun" src="${img("e_sun")}" alt=""><img class="deco-tree" src="${img("f_tree")}" alt="">`,
      }[k];
      oscene.innerHTML = k === "out" ? Object.entries(OUTS).map(([o, d]) => `<button class="map-spot s-${o}" data-out="${o}" aria-label="${d.en}"><img src="${img(d.art)}" alt=""><b>${d.en}</b><small>${d.vi}</small></button>`).join("") : "";
      $$("[data-out]", oscene).forEach(b => b.onclick = () => goOut(b.dataset.out, b));
      renderDeco();
      renderTray();
      showNeeds();
      fmood("wave", 1400);
      later(() => { if (roomId === k && !outing) say(intro || ROOMS[k].intro); }, 250);
    }
    const placePics = () => PLACES[room.scene].pics.map(([art, cls]) => `<img class="place-pic ${cls}" src="${img(art)}" alt="">`).join("");

    /* ---------- tray ---------- */
    const lockedTile = it => `<button class="care-item locked" data-it="${it}" aria-label="${ITEM(it).en} (locked)">${itemArt(it)}<b>${ITEM(it).en}</b><span class="lock-badge">${I.lock}</span></button>`;
    const ownedFirst = list => [...list.filter(it => L.owns(it)), ...list.filter(it => !L.owns(it))];
    function renderTray() {
      if (roomId === "play") return renderPlayTray();
      if (roomId === "out") {
        tray.innerHTML = `<div class="tray-items">${Object.entries(OUTS).map(([o, d]) => `<button class="care-item" data-out="${o}" aria-label="${d.en}"><img src="${img(d.art)}" alt=""><b>${d.en}</b></button>`).join("")}</div>`;
        $$("[data-out]", tray).forEach(b => b.onclick = () => goOut(b.dataset.out, b));
        return;
      }
      tray.innerHTML = `<div class="tray-items">${ownedFirst(ROOMS[roomId].items()).map(it => {
        if (!L.owns(it)) return lockedTile(it);
        const label = it === "goodnight" && night ? "good morning" : ITEM(it).en;
        const art = it === "goodnight" && night ? `<img src="${img("e_sun")}" alt="">` : itemArt(it);
        return `<button class="care-item ${isWear(it) && wear.has(it) ? "on" : ""}" data-it="${it}" aria-label="${label}">${art}<b>${label}</b></button>`;
      }).join("")}</div>`;
      $$(".care-item", tray).forEach(b => b.onclick = () => use(b));
    }
    function renderPlayTray() {
      const left = d => L.count(d) - room.deco.filter(x => x.id === d).length;
      const modes = `<div class="tray-modes" role="group" aria-label="Places or decorations">
          <button class="mode-btn" data-mode="places" aria-pressed="${mode === "places"}"><img src="${img("f_tree")}" alt=""><b>Places</b><small>Nơi chơi</small></button>
          <button class="mode-btn" data-mode="decorate" aria-pressed="${mode === "decorate"}"><img src="${img("e_balloon")}" alt=""><b>Decorate</b><small>Trang trí</small></button>
          ${mode === "decorate" && room.deco.length ? `<button class="mode-btn clear" id="clearDeco" aria-label="Clear"><span class="emoji-art" aria-hidden="true">🧹</span><b>Clear</b><small>Dọn hết</small></button>` : ""}
        </div>`;
      const items = mode === "places"
        ? ownedFirst(placeIds()).map(p => {
            if (!L.owns(p) && p !== "park") return lockedTile(p);
            const art = p === "park" ? `<img src="${img("f_tree")}" alt="">` : itemArt(p);
            return `<button class="care-item ${room.scene === p ? "on" : ""}" data-place="${p}" aria-label="${p}">${art}<b>${p === "park" ? "park" : ITEM(p).en}</b></button>`;
          })
        : ownedFirst(kindIds("deco")).map(d => !L.owns(d) ? lockedTile(d)
            : `<button class="care-item" data-deco="${d}" aria-label="${ITEM(d).en}">${itemArt(d)}<b>${ITEM(d).en}</b><i class="st-count ${left(d) ? "" : "zero"}">${left(d)}</i></button>`);
      tray.innerHTML = modes + `<div class="tray-items">${items.join("")}</div>`;
      $$(".mode-btn[data-mode]", tray).forEach(b => b.onclick = () => { mode = b.dataset.mode; sfx("tap"); renderTray(); if (mode === "decorate") say("decorate"); });
      const clr = $("#clearDeco"); if (clr) clr.onclick = () => { room.deco = []; L.persist(); sfx("whoosh"); renderDeco(); renderTray(); say("all_clean"); };
      $$(".care-item.locked", tray).forEach(b => b.onclick = () => lockedTap(b));
      $$("[data-place]", tray).forEach(b => b.onclick = () => goPlace(b.dataset.place, b));
      $$("[data-deco]", tray).forEach(b => b.onclick = () => addDeco(b.dataset.deco, b));
    }
    function lockedTap(b) {
      restart(b, "wiggle"); sfx("boing");
      buddy.mood("think", 1800); buddy.say(`Còn ${L.nextStickerIn()} ⭐ nữa là có sticker mới!`, 2400);
      say("locked");
    }

    /* ---------- Play room: places and decorations ---------- */
    function goPlace(p, b) {
      restart(b, "pressed");
      if (room.scene === p) { say(p === "park" ? "go_park" : ITEM(p).voice); return; }
      room.scene = p; L.persist();
      stage.className = "care-stage room-play place-" + p;
      deco.innerHTML = placePics();
      sfx("whoosh"); L.floaters(fw, "e_sparkles", 4); fmood("happy");
      firstUse("place-" + p, fw);
      say(p === "park" ? "go_park" : ITEM(p).voice);
      renderTray();
    }
    // free spots around the friend (in % of the stage)
    const SPOTS = [[12, 22], [86, 20], [14, 62], [86, 60], [30, 12], [70, 12], [8, 42], [92, 40], [26, 80], [74, 80], [50, 10], [38, 86], [62, 86]];
    function addDeco(d, b) {
      if (L.count(d) - room.deco.filter(x => x.id === d).length <= 0) {
        restart(b, "wiggle"); sfx("boing"); buddy.say("Hết rồi! Học thêm để có nhiều hơn nhé", 2400); say("all_used"); return;
      }
      restart(b, "pressed");
      const taken = room.deco.map(x => x.x + "," + x.y);
      const free = SPOTS.filter(s => !taken.includes(s.join(",")));
      const [x, y] = free.length ? free[0] : [10 + Math.random() * 80, 10 + Math.random() * 70];
      room.deco.push({ id: d, x, y }); L.persist();
      renderDeco(true); renderTray();
      sfx("pop"); fmood("happy");
      firstUse("deco-" + d, fw);
      say("w_" + d);
    }
    function renderDeco(popLast) {
      if (roomId !== "play") { pdeco.innerHTML = ""; return; }
      pdeco.innerHTML = room.deco.map((x, i) => `<button class="pd ${popLast && i === room.deco.length - 1 ? "pop" : ""}" data-i="${i}" aria-label="${ITEM(x.id).en}" style="left:${x.x}%;top:${x.y}%"><img src="${img(ITEM(x.id).art)}" alt=""></button>`).join("");
    }
    // drag a decoration around; drop it on the tray to put it back
    let drag = null;
    listen(pdeco, "pointerdown", e => {
      const el = e.target.closest(".pd"); if (!el) return;
      e.preventDefault();
      drag = { el, i: +el.dataset.i, x0: e.clientX, y0: e.clientY, moved: false };
      el.classList.add("drag");
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* */ }
    });
    listen(pdeco, "pointermove", e => {
      if (!drag) return;
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
      if (!drag.moved) return;
      const r = stage.getBoundingClientRect();
      drag.el.style.left = ((e.clientX - r.left) / r.width) * 100 + "%";
      drag.el.style.top = ((e.clientY - r.top) / r.height) * 100 + "%";
      tray.classList.toggle("drop-here", e.clientY > r.bottom || e.clientX > r.right || e.clientX < r.left);
    });
    const endDrag = e => {
      if (!drag) return;
      const d = drag; drag = null;
      d.el.classList.remove("drag"); tray.classList.remove("drop-here");
      const x = room.deco[d.i];
      if (!d.moved) { restart(d.el, "boing"); sfx("boing"); say("w_" + x.id); return; }
      const r = stage.getBoundingClientRect();
      if (e.clientY > r.bottom || e.clientX > r.right || e.clientX < r.left || e.clientY < r.top) {
        room.deco.splice(d.i, 1); sfx("whoosh");
      } else {
        x.x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
        x.y = Math.max(4, Math.min(94, ((e.clientY - r.top) / r.height) * 100));
        sfx("tap");
      }
      L.persist(); renderDeco(); renderTray();
    };
    listen(pdeco, "pointerup", endDrag);
    listen(pdeco, "pointercancel", endDrag);

    /* ---------- Go out: park, supermarket, exercise – each one reviews what Mây learnt ---------- */
    const taught = reviewCtx();
    const taughtIds = new Set(WEEKS.filter(wk => wk.from <= TODAY).flatMap(wk => wk.all));
    const isTaught = x => taughtIds.has(x) || !taughtIds.size;
    let replayQ = () => {};
    const weakFirst = list => shuffle(list).sort((a, b) => L.skill(a) - L.skill(b));
    function goOut(o, b) {
      const n = L.needs();
      if (n.rest < 15) { restart(b, "wiggle"); fmood("tired", 2200); say("too_tired"); return; }
      if (n.food < 10 && o !== "market") { restart(b, "wiggle"); fmood("sad", 2200); say("too_hungry"); return; }
      hush(); restart(b, "pressed");
      const tok = { o, n: 0, got: 0, total: 0 };
      outing = tok;
      stage.className = `care-stage room-out out-${o}`;
      deco.innerHTML = {
        park: `<img class="deco-sun" src="${img("e_sun")}" alt=""><img class="o-bg p1" src="${img("f_tree")}" alt=""><img class="o-bg p2" src="${img("f_slide")}" alt=""><img class="o-bg p3" src="${img("f_fountain")}" alt="">`,
        market: `<div class="o-sign"><img src="${img("f_store")}" alt=""><b>Supermarket</b></div>`,
        gym: `<img class="o-bg g1" src="${img("f_lotus")}" alt=""><img class="o-bg g2" src="${img("f_cartwheel")}" alt=""><div class="o-mat"></div>`,
      }[o];
      oscene.innerHTML = "";
      showNeeds(); sfx("whoosh"); fmood("happy", 1200);
      tray.classList.add("o-mode");
      const play = { park: parkTrip, market: marketTrip, gym: gymTrip }[o];
      say(OUTS[o].intro).then(() => { if (live(tok)) play(tok); });
    }
    const live = tok => outing === tok && alive(id);
    function oTray(tok, body) {
      tray.innerHTML = `<div class="o-bar">
          <button class="mode-btn" id="oMap"><img src="${img(OUTS[tok.o].art)}" alt=""><b>Map</b><small>Về bản đồ</small></button>
          <button class="ear o-ear" id="oEar" aria-label="Listen again">${I.sound}</button>
          <span class="o-prog" aria-label="Progress">${Array.from({ length: tok.total }, (_, i) => `<i class="${i < tok.n ? "got" : ""}">${I.star}</i>`).join("")}</span>
        </div><div class="o-body">${body}</div>`;
      $("#oMap").onclick = () => setRoom("out");
      $("#oEar").onclick = () => replayQ();
    }
    function oRight(tok, el, wid, misses) {
      sfx("good");
      if (W[wid]) L.learn(wid, misses === 0);
      if (!misses) { tok.got++; addStar(1, el); }
      const dot = $$(".o-prog i", tray)[tok.n]; if (dot) dot.classList.add("got");
      tok.n++;
    }
    function oNext(tok, step, ms = 500) {
      later(() => { if (!live(tok)) return; if (tok.n >= tok.total) oDone(tok); else step(); }, ms);
    }
    async function oDone(tok) {
      const g = OUTS[tok.o].gain;
      Object.entries(g).forEach(([k, d]) => L.need(k, d));
      showNeeds(); L.floaters(fw, "e_heart", 6); sfx("fanfare"); fmood("dance", 2200);
      firstUse("out-" + tok.o, fw);
      await say(OUTS[tok.o].done, "hooray");
      if (!live(tok)) return;
      later(() => { if (live(tok)) setRoom("out"); }, 900);
    }
    /* answer buttons (picture + sentence), shared by the park and the exercise rounds */
    const ansHTML = opts => `<div class="o-answers">${opts.map(o => `<button class="o-ans" data-ok="${o.ok ? 1 : 0}" data-id="${o.id}"><img src="${img(o.pic || o.id)}" alt=""><span>${o.text}</span></button>`).join("")}</div>`;
    function oChoose(tok, opts, prompt, onRight, step) {
      oTray(tok, ansHTML(opts));
      replayQ = prompt;
      let misses = 0, locked = false;
      $$(".o-ans", tray).forEach(b => b.onclick = async () => {
        if (locked || b.disabled) return;
        if (b.dataset.ok === "1") {
          locked = true; b.classList.remove("hint"); b.classList.add("right");
          oRight(tok, b, b.dataset.id, misses);
          await onRight(b);
          if (live(tok)) oNext(tok, step);
        } else {
          misses++; sfx("bad"); restart(b, "wrong"); b.disabled = true; b.classList.add("gone"); fmood("think", 1500);
          if (misses >= 2 || $$(".o-ans:not(:disabled)", tray).length <= 2) $(".o-ans[data-ok='1']", tray).classList.add("hint");
          if (await say(encourage()) !== false && live(tok)) prompt();
        }
      });
      prompt();
    }
    /* the friend runs to the next place, then something pops up */
    async function walk(tok) {
      stage.classList.add("walking"); svg.classList.add("act-run"); sfx("whoosh");
      await wait(900);
      stage.classList.remove("walking"); svg.classList.remove("act-run");
      return live(tok);
    }

    // Park: things pop up along the way; the teacher asks the class question, Mây chooses the answer
    function parkTrip(tok) {
      const asks = taught.qa.filter(q => q.type === "ask" && new Set(q.items.map(x => W[x].en)).size >= 3);
      const seen = new Set(), rounds = [];
      shuffle(asks.flatMap(q => q.items.map(x => ({ qa: q, id: x }))))
        .sort((a, b) => L.skill(a.id) - L.skill(b.id))
        .forEach(r => { if (rounds.length < 5 && !seen.has(r.id)) { seen.add(r.id); rounds.push(r); } });
      shuffle(rounds);
      tok.total = rounds.length;
      const SPOT = [[70, 30], [78, 52], [64, 22], [80, 36], [72, 58]];
      const step = async () => {
        if (tok.n && !await walk(tok)) return;
        const r = rounds[tok.n], w = W[r.id], lines = L.qaLines(r.qa, r.id), [x, y] = SPOT[tok.n % SPOT.length];
        oscene.innerHTML = `<button class="o-pop" style="left:${x}%;top:${y}%" aria-label="${w.en}"><img src="${img(w.id)}" alt=""></button>`;
        $(".o-pop", oscene).onclick = () => replayQ();
        fmood("think", 1800);
        const others = shuffle(r.qa.items.filter(z => W[z].en !== w.en));
        const opts = shuffle([{ id: r.id, text: lines.a, ok: true }, ...others.slice(0, 2).map(z => ({ id: z, text: L.qaLines(r.qa, z).a }))]);
        oChoose(tok, opts, () => say(slug(lines.q)), async b => {
          fmood("happy", 1500); L.floaters($(".o-pop", oscene) || fw, "e_sparkles", 4);
          await say(slug(lines.a), praise());
        }, step);
      };
      step();
    }

    // Supermarket: the friend says what it needs ("I need a banana."), Mây finds it on the shelf
    function marketTrip(tok) {
      const sold = L.FOOD.filter(isTaught);
      const shelf = shuffle(sold.length >= 6 ? sold : L.FOOD).slice(0, 8);
      const list = shuffle(weakFirst(shelf).slice(0, 4));
      tok.total = list.length;
      oscene.innerHTML = `<img class="o-cart" id="oCart" src="${img("f_cart")}" alt=""><div class="o-shelf">${shelf.map(f => `<button class="o-food" data-id="${f}" aria-label="${W[f].en}"><img src="${img(f)}" alt=""></button>`).join("")}</div>`;
      const cart = $("#oCart");
      const listHTML = () => `<div class="o-list">${list.map((f, i) => i < tok.n
        ? `<span class="o-item got"><img src="${img(f)}" alt=""><b>${W[f].en}</b></span>`
        : `<button class="o-item ${i === tok.n ? "now" : ""}" ${i === tok.n ? 'id="oNow"' : "disabled"}><span class="q">?</span><b>${i === tok.n ? "I need…" : ""}</b></button>`).join("")}</div>`;
      let misses = 0, locked = false;
      const step = () => {
        const f = list[tok.n]; misses = 0; locked = false;
        oTray(tok, listHTML());
        replayQ = () => say("need_" + f);
        const now = $("#oNow"); if (now) now.onclick = replayQ;
        fmood("think", 1400);
        tok.n ? replayQ() : say("shop_list", "need_" + f);
      };
      $$(".o-food", oscene).forEach(b => b.onclick = async () => {
        if (locked || !live(tok) || b.classList.contains("taken")) return;
        const f = list[tok.n];
        if (b.dataset.id === f) {
          locked = true; b.classList.remove("hint"); b.classList.add("taken");
          oRight(tok, b, f, misses);
          sfx("whoosh"); await fly(b, cart, 0.55, 0.35, img(f));
          if (!live(tok)) return;
          restart(cart, "boing"); fmood("happy", 1400);
          const last = tok.n >= tok.total;
          oTray(tok, listHTML());
          await say("w_" + f, "s_yes_please");
          if (live(tok)) { if (last) { fmood("eat", 1500); sfx("munch"); await say("yummy"); if (live(tok)) oDone(tok); } else step(); }
        } else {
          misses++; sfx("bad"); restart(b, "wiggle"); restart(fw, "wiggle"); fmood("think", 1500);
          if (misses >= 2) { const ok = $$(".o-food", oscene).find(x => x.dataset.id === f); if (ok) ok.classList.add("hint"); }
          await say("w_" + b.dataset.id, "s_no_thank_you", "need_" + f);
        }
      });
      step();
    }

    // Exercise: watch and choose (I can jump / run / swim), point to your nose…, and yoga poses
    function gymTrip(tok) {
      const MOVES = ["jump", "run", "swim"].filter(isTaught);
      const pointQa = taught.qa.find(q => q.type === "point");
      const parts = pointQa ? pointQa.items.filter(isTaught) : [];
      const canQa = WEEKS.flatMap(wk => wk.qa).find(q => q.type === "ask" && q.items.includes("jump"));
      const rounds = [];
      if (MOVES.length === 3 && canQa) weakFirst(MOVES).slice(0, 2).forEach(a => rounds.push({ t: "act", id: a }));
      if (parts.length >= 3) weakFirst(parts).slice(0, 2).forEach(p => rounds.push({ t: "point", id: p }));
      shuffle(Object.keys(POSES)).slice(0, 6 - rounds.length).forEach(p => rounds.push({ t: "pose", id: p }));
      // mix them so the same kind never comes twice in a row when it can be avoided
      const mixed = [];
      while (rounds.length) { const i = rounds.findIndex(r => !mixed.length || r.t !== mixed[mixed.length - 1].t); mixed.push(rounds.splice(i < 0 ? 0 : i, 1)[0]); }
      tok.total = mixed.length;
      const show = async (cls, ms) => { svg.classList.add(cls); await wait(ms); svg.classList.remove(cls); };
      const step = async () => {
        const r = mixed[tok.n];
        oscene.innerHTML = "";
        if (r.t === "act") {
          const lines = L.qaLines(canQa, r.id);
          oTray(tok, "");
          await say("gym_watch"); if (!live(tok)) return;
          await show("act-" + r.id, 2000); if (!live(tok)) return;
          const opts = shuffle(MOVES.map(a => ({ id: a, text: L.qaLines(canQa, a).a, ok: a === r.id })));
          oChoose(tok, opts, async () => { svg.classList.add("act-" + r.id); await say(slug(canQa.q)); later(() => svg.classList.remove("act-" + r.id), 600); }, async () => {
            svg.classList.add("act-" + r.id); await say(slug(lines.a), praise()); svg.classList.remove("act-" + r.id);
          }, step);
        } else if (r.t === "point") {
          const lines = L.qaLines(pointQa, r.id);
          const opts = shuffle([r.id, ...shuffle(parts.filter(p => p !== r.id)).slice(0, 2)]).map(p => ({ id: p, text: W[p].en, ok: p === r.id }));
          oChoose(tok, opts, () => say(slug(lines.q), slug(lines.a)), async () => {
            const at = { face: [0.5, 0.36], ears: [0.5, 0.06], eyes: [0.5, 0.37], mouth: [0.5, 0.5], nose: [0.5, 0.44] }[r.id] || [0.5, 0.4];
            sparkleAt(at); fmood("happy", 1400);
            await say("w_" + r.id, praise());
          }, step);
        } else {
          const opts = shuffle([r.id, ...shuffle(Object.keys(POSES).filter(p => p !== r.id)).slice(0, 2)]).map(p => ({ id: p, pic: POSES[p], text: p, ok: p === r.id }));
          oChoose(tok, opts, () => say("pose_" + r.id), async () => {
            svg.classList.add("pose-" + r.id); sfx("sparkle");
            await say("breathe"); await wait(600);
            svg.classList.remove("pose-" + r.id);
          }, step);
        }
      };
      step();
    }
    function sparkleAt([fx, fy]) {
      const b = fw.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const el = document.createElement("img");
      el.className = "o-spark"; el.src = img("e_sparkles"); el.alt = "";
      el.style.left = ((b.left - s.left + b.width * fx) / s.width) * 100 + "%";
      el.style.top = ((b.top - s.top + b.height * fy) / s.height) * 100 + "%";
      oscene.appendChild(el); sfx("sparkle");
      later(() => el.remove(), 1400);
    }

    /* ---------- using things ---------- */
    async function use(b) {
      const it = b.dataset.it, info = ITEM(it);
      if (!L.owns(it)) return lockedTap(b);
      restart(b, "pressed");
      if (roomId === "eat") {
        if (L.needs().food >= 95) { restart(fw, "wiggle"); sfx("boing"); fmood("think", 1600); await say("s_no_thank_you", "full"); return; }
        // the picnic structure: "Do you want a banana?" "Yes, please."
        const ask = W[it] && slug(`Do you want ${W[it].a}?`);
        if (ask && L.TEXT[ask]) { await say(ask, "s_yes_please"); if (!alive(id)) return; }
        sfx("whoosh");
        await fly(b, fw, 0.5, 0.49, itemSrc(it));
        if (!alive(id)) return;
        fmood("eat", 1500); sfx("munch");
        firstUse(it, fw); needUp("food", 22);
        await say(info.voice, "yummy");
        if (!alive(id)) return;
        fmood("happy", 1500); L.floaters(fw, "e_heart", 4);
        if (L.needs().food >= 95) { bonus("full", fw); say("full"); }
      } else if (roomId === "bath") {
        sfx("whoosh");
        await fly(b, fw, 0.5, it === "shower" ? 0.02 : it === "toothbrush" ? 0.45 : 0.55, itemSrc(it));
        if (!alive(id)) return;
        if (it === "soap") { foam = true; svg.classList.add("show-bubbles"); sfx("pop"); L.floaters(fw, "e_bubbles", 6); fmood("happy"); }
        if (it === "sponge") { mud = false; svg.classList.remove("show-mud"); sfx("scrub"); restart(fw, "wiggle"); fmood("happy"); }
        if (it === "toothbrush") { sfx("scrub"); L.floaters(fw, "e_sparkles", 3); fmood("happy"); }
        if (it === "shower") { mud = false; foam = false; svg.classList.remove("show-mud", "show-bubbles"); sfx("splash"); L.floaters(fw, "e_droplet", 10, "rain"); fmood("happy"); }
        firstUse(it, fw);
        await say(info.voice);
        if (!alive(id)) return;
        if (!mud && !foam && used.has("shower")) { L.floaters(fw, "e_sparkles", 5); sfx("sparkle"); bonus("clean", fw); needUp("fun", 5); say("all_clean"); fmood("dance", 1800); }
      } else if (roomId === "dress") {
        if (wear.has(it)) { wear.delete(it); sfx("whoosh"); applyWear(); }
        else {
          sfx("whoosh");
          const [ax, ay] = wearAt(it);
          await fly(b, fw, ax, ay, itemSrc(it));
          if (!alive(id)) return;
          [...wear].forEach(w => { if (slotOf(w) === slotOf(it)) wear.delete(w); }); // one thing per place
          wear.add(it); applyWear(); sfx("pop"); fmood("happy"); L.floaters(fw, "e_sparkles", 3);
          firstUse(it, fw); needUp("fun", 3);
          await say(info.voice);
          if (!alive(id)) return;
          if (wear.size >= 3) { bonus("look", fw); fmood("dance", 1800); say("look_great"); }
        }
        L.save.wear = [...wear]; L.persist(); renderTray();
      } else if (roomId === "sleep") {
        if (it === "pillow") { sfx("whoosh"); await fly(b, fw, 0.5, 0.25, itemSrc(it)); svg.classList.add("show-pillow"); sfx("pop"); fmood("happy"); firstUse(it, fw); say(info.voice); }
        if (it === "teddy") { sfx("whoosh"); await fly(b, fw, 0.3, 0.72, itemSrc(it)); teddy.hidden = false; restart(teddy, "pop"); fmood("happy"); firstUse(it, fw); say(info.voice); }
        if (it === "goodnight") {
          if (!night && L.needs().rest >= 85) { restart(fw, "boing"); sfx("boing"); fmood("happy", 1600); await say("not_sleepy"); return; }
          night = !night;
          stage.classList.toggle("is-night", night);
          if (night) {
            svg.classList.add("show-blanket", "show-pillow"); fmood("sleep", 0); sfx("lullaby"); L.pauseMusic();
            firstUse(it, fw); bonus("night", fw);
            later(() => { if (night && alive(id)) needUp("rest", 100); }, 2500); // a good sleep fills it up
            showNeeds();
            await say("good_night");
          } else {
            svg.classList.remove("show-blanket"); fmood("wave", 1600); sfx("twinkle"); L.resumeMusic();
            showNeeds();
            await say("good_morning");
          }
          renderTray();
        }
      }
    }
    // tap my friend: "How are you?" – it answers with how it feels
    fw.onclick = () => {
      if (night) { sfx("twinkle"); buddy.say("Shh… Zzz", 1500); return; }
      sfx("boing"); restart(fw, "boing");
      if (outing) { fmood("happy", 1200); say("giggle"); return; }
      const k = lowest(), v = L.needs()[k];
      if (v < 40) { fmood(baseMood() === "idle" ? "think" : baseMood(), 2200); say("s_how_are_you", ...(v < 25 ? ["s_im_sad"] : []), NEEDS[k].low); }
      else { fmood("happy", 1600); say("s_how_are_you", "s_im_happy"); }
    };
    $$(".room-tab[data-room]").forEach(t => t.onclick = () => { if (t.dataset.room !== roomId || outing) setRoom(t.dataset.room); });
    $("#swapFriend").onclick = () => { L.save.friend = null; L.persist(); render(pickFriend); };
    onLeave(() => { if (night) L.resumeMusic(); });
    // new sticker earned while playing → refresh the tray so the new thing appears (not during an outing)
    listen(document, "sticker", () => { if (alive(id) && !outing) renderTray(); });
    // first visit: go where the friend needs help most
    if (!ROOMS[roomId]) {
      const k = lowest(), low = L.needs()[k] < 40;
      return setRoom(low ? NEEDS[k].room : "eat", low ? NEEDS[k].low : null);
    }
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
      if (el.dataset.id !== current()) { sfx("bad"); el.style.translate = ""; restart(el, "wrong"); ask(encourage()); return; }
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
    letter, explore, gingerbread, tidy, pack, moon, taphear, bubbles, match3, shadow, memory,
    peekaboo: match3, // Peekaboo was replaced by Match 3 (old links)
  };
  const OLD_GAMES = ["taphear", "bubbles", "match3", "peekaboo", "shadow", "memory"];
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
