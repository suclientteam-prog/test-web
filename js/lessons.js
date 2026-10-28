/* Learning English with Mây – lesson content.
   One entry per week of the class "Báo bài" PDFs (pdf/ folder), grouped by school month.
   Adding a week: add its words to WORDS, its picture to assets/images/<id>.webp, a WEEKS entry,
   then run `node tools/build.mjs` (lists the voice lines) and `python tools/make_audio.py` (records them). */
window.LESSONS = (() => {
  "use strict";

  /* ---------- word bank ----------
     a: the word inside a sentence ("I have a book.")  find: Listen & find prompt (default "Find the <en>.")
     pl: plural (Where are your ears?)  same: another word with the same English (never shown together) */
  const WORDS = [
    // Tháng 8 – tuần 2: camping
    { id: "camping",    en: "camping",      vi: "cắm trại",          a: "camping", find: "Find camping." },
    { id: "tent",       en: "tent",         vi: "cái lều",           a: "a tent" },
    { id: "campfire",   en: "campfire",     vi: "lửa trại",          a: "a campfire" },
    { id: "mountains",  en: "mountains",    vi: "núi",               a: "mountains", pl: true },
    { id: "beach",      en: "beach",        vi: "bãi biển",          a: "a beach" },
    { id: "campbag",    en: "backpack",     vi: "cái ba lô",         a: "a backpack", same: "backpack" },
    { id: "lamp",       en: "camping lamp", vi: "đèn cắm trại",      a: "a camping lamp" },
    { id: "flashlight", en: "flashlight",   vi: "đèn pin",           a: "a flashlight" },
    // Tháng 8 – tuần 3: picnic
    { id: "picnic",     en: "picnic",       vi: "dã ngoại",          a: "a picnic" },
    { id: "basket",     en: "basket",       vi: "cái giỏ",           a: "a basket" },
    { id: "blanket",    en: "blanket",      vi: "tấm thảm",          a: "a blanket" },
    { id: "apple",      en: "apple",        vi: "quả táo",           a: "an apple" },
    { id: "banana",     en: "banana",       vi: "quả chuối",         a: "a banana" },
    { id: "sandwich",   en: "sandwich",     vi: "bánh mì kẹp",       a: "a sandwich" },
    { id: "hotdog",     en: "hot dog",      vi: "bánh mì xúc xích",  a: "a hot dog" },
    { id: "icecream",   en: "ice cream",    vi: "kem",               a: "an ice cream" },
    { id: "water",      en: "water",        vi: "nước",              a: "some water" },
    { id: "juice",      en: "juice",        vi: "nước ép",           a: "some juice" },
    { id: "milk",       en: "milk",         vi: "sữa",               a: "some milk" },
    // Tháng 8 – tuần 4: Vietnam (2/9)
    { id: "vietnam",    en: "Vietnam",      vi: "Việt Nam",          a: "Vietnam", find: "Find Vietnam." },
    { id: "flag",       en: "flag",         vi: "lá cờ",             a: "a flag" },
    { id: "star",       en: "star",         vi: "ngôi sao",          a: "a star" },
    { id: "yellow",     en: "yellow",       vi: "màu vàng",          a: "yellow", find: "Find yellow." },
    { id: "red",        en: "red",          vi: "màu đỏ",            a: "red", find: "Find red." },
    { id: "fireworks",  en: "fireworks",    vi: "pháo hoa",          a: "fireworks", pl: true },
    { id: "bird",       en: "bird",         vi: "con chim",          a: "a bird" },
    // Tháng 9 – tuần 3: school things
    { id: "backpack",   en: "backpack",     vi: "cái ba lô",         a: "a backpack", same: "campbag" },
    { id: "book",       en: "book",         vi: "quyển sách",        a: "a book" },
    { id: "chair",      en: "chair",        vi: "cái ghế",           a: "a chair" },
    { id: "crayon",     en: "crayon",       vi: "bút sáp màu",       a: "a crayon" },
    { id: "gluestick",  en: "glue stick",   vi: "keo dán",           a: "a glue stick" },
    { id: "pencil",     en: "pencil",       vi: "bút chì",           a: "a pencil" },
    { id: "table",      en: "table",        vi: "cái bàn",           a: "a table" },
    // Tháng 9 – tuần 4: Mid-Autumn
    { id: "moon",       en: "moon",         vi: "mặt trăng",         a: "the moon" },
    { id: "mooncake",   en: "moon cake",    vi: "bánh trung thu",    a: "a moon cake" },
    { id: "lantern",    en: "lantern",      vi: "đèn lồng",          a: "a lantern" },
    { id: "moonlady",   en: "moon lady",    vi: "chị Hằng",          a: "the moon lady" },
    { id: "rabbit",     en: "rabbit",       vi: "con thỏ",           a: "a rabbit" },
    // Tháng 9 – tuần 5: letter S
    { id: "school",     en: "school",       vi: "trường học",        a: "a school" },
    { id: "scissors",   en: "scissors",     vi: "cái kéo",           a: "scissors", pl: true },
    { id: "snake",      en: "snake",        vi: "con rắn",           a: "a snake" },
    { id: "tidyup",     en: "tidy up",      vi: "dọn dẹp",           a: "tidy up", noQuiz: true },
    // Tháng 10 – tuần 1: my face, feelings
    { id: "face",       en: "face",         vi: "khuôn mặt",         a: "a face" },
    { id: "ears",       en: "ears",         vi: "đôi tai",           a: "ears", pl: true },
    { id: "eyes",       en: "eyes",         vi: "đôi mắt",           a: "eyes", pl: true },
    { id: "mouth",      en: "mouth",        vi: "cái miệng",         a: "a mouth" },
    { id: "nose",       en: "nose",         vi: "cái mũi",           a: "a nose" },
    { id: "angry",      en: "angry",        vi: "tức giận",          a: "angry", find: "Who is angry?" },
    { id: "happy",      en: "happy",        vi: "vui vẻ",            a: "happy", find: "Who is happy?" },
    { id: "sad",        en: "sad",          vi: "buồn",              a: "sad", find: "Who is sad?" },
    { id: "monster",    en: "monster",      vi: "quái vật",          a: "a monster" },
    { id: "one",        en: "one",          vi: "số một",            a: "one", find: "Find number one." },
    // Tháng 10 – tuần 2: letter A, family
    { id: "ant",        en: "ant",          vi: "con kiến",          a: "an ant" },
    { id: "mummy",      en: "mummy",        vi: "mẹ",                a: "mummy", find: "Where is mummy?" },
    { id: "daddy",      en: "daddy",        vi: "bố",                a: "daddy", find: "Where is daddy?" },
    { id: "brother",    en: "brother",      vi: "anh / em trai",     a: "my brother", find: "Where is brother?" },
    { id: "sister",     en: "sister",       vi: "chị / em gái",      a: "my sister", find: "Where is sister?" },
    { id: "family",     en: "family",       vi: "gia đình",          a: "my family", find: "Find the family." },
    { id: "grandma",    en: "grandma",      vi: "bà",                a: "grandma", find: "Where is grandma?" },
    { id: "grandad",    en: "grandad",      vi: "ông",               a: "grandad", find: "Where is grandad?" },
    // Tháng 10 – tuần 3: actions, letter P
    { id: "jump",       en: "jump",         vi: "nhảy",              a: "jump", find: "Who can jump?" },
    { id: "run",        en: "run",          vi: "chạy",              a: "run", find: "Who can run?" },
    { id: "swim",       en: "swim",         vi: "bơi",               a: "swim", find: "Who can swim?" },
    { id: "gingerbread", en: "gingerbread man", vi: "người bánh gừng", a: "the gingerbread man" },
    { id: "paintbrush", en: "paintbrush",   vi: "cọ vẽ",             a: "a paintbrush" },
    { id: "pineapple",  en: "pineapple",    vi: "quả dứa",           a: "a pineapple" },
    // Tháng 10 – tuần 4: Halloween
    { id: "halloween",  en: "Halloween",    vi: "lễ Halloween",      a: "Halloween", find: "Find Halloween." },
    { id: "blackcat",   en: "black cat",    vi: "con mèo đen",       a: "a black cat" },
    { id: "witch",      en: "witch",        vi: "phù thủy",          a: "a witch" },
    { id: "ghost",      en: "ghost",        vi: "con ma",            a: "a ghost" },
    { id: "skeleton",   en: "skeleton",     vi: "bộ xương",          a: "a skeleton" },
    { id: "pumpkin",    en: "pumpkin",      vi: "quả bí ngô",        a: "a pumpkin" },
  ];
  const EDGES = ["#ff4f9a", "#ff2d2d", "#a83232", "#7a3a10", "#f07a10", "#7cc02a", "#1a8ac6", "#8a4fd8", "#e0a800"];
  WORDS.forEach((w, i) => { w.edge = EDGES[i % EDGES.length]; });
  const W = Object.fromEntries(WORDS.map(w => [w.id, w]));

  /* ---------- weeks (school calendar) ----------
     days: what was taught on which day (the "Ngày học" pages)
     qa:   the "Cấu trúc" box, as listen-and-choose questions
       ask   – a picture + a question; the child chooses the answer sentence
       yesno – "Do you have …?" / "Do you want …?"; the child looks at the picture and chooses yes or no
       point – "Where is your …? Point to the …" – the child taps the right picture
       say   – a sentence to listen to and say together
     {a} / {en} in a sentence are replaced by the word.
     extra: special activities of the week; song: the class song (YouTube) */
  const SONG_FAMILY = "https://youtu.be/d_WQEw13TCo?si=UbhVZFhQyYRm0I9p";
  const SONG_MOON = "https://youtu.be/tyxhkJau1O0?si=nCEM7StysrX0Qn9J";
  const WEEKS = [
    {
      id: "t8w2", month: 8, from: "2026-08-10", to: "2026-08-14", dates: "10 – 14/8",
      en: "Camping", vi: "Cắm trại", theme: "camp", cover: "tent",
      days: [
        { d: "10 – 14/8", words: ["camping", "tent", "campfire"] },
        { d: "11 – 14/8", words: ["mountains", "beach"] },
        { d: "12 – 14/8", words: ["campbag", "lamp", "flashlight"] },
      ],
      qa: [
        { type: "ask", q: "What do you need?", a: "I need {a}.", items: ["tent", "campfire", "campbag", "lamp", "flashlight"] },
        { type: "ask", q: "What is this?", a: "This is {a}.", items: ["tent", "campfire", "beach", "campbag", "lamp", "flashlight"] },
        { type: "yesno", q: "Do you have {a}?", yes: "Yes, I do.", no: "No, I don't.", scene: "bag", items: ["flashlight", "tent", "lamp", "campbag"] },
      ],
      extra: ["explore"],
    },
    {
      id: "t8w3", month: 8, from: "2026-08-17", to: "2026-08-21", dates: "17 – 21/8",
      en: "Picnic", vi: "Dã ngoại", theme: "picnic", cover: "basket",
      days: [
        { d: "17 – 21/8", words: ["picnic", "basket", "blanket"] },
        { d: "18 – 21/8", words: ["apple", "banana"] },
        { d: "19 – 21/8", words: ["sandwich", "hotdog", "icecream"] },
        { d: "20 – 21/8", words: ["water", "juice", "milk"] },
      ],
      qa: [
        { type: "ask", q: "What do you have?", a: "I have {a}.", items: ["basket", "blanket", "apple", "banana", "sandwich", "hotdog", "icecream"] },
        { type: "yesno", q: "Do you want {a}?", yes: "Yes, please.", no: "No, thank you.", scene: "want", items: ["banana", "apple", "sandwich", "hotdog", "icecream", "juice", "water", "milk"] },
      ],
      extra: ["explore"],
    },
    {
      id: "t8w4", month: 8, from: "2026-08-24", to: "2026-08-28", dates: "24 – 28/8",
      en: "Vietnam", vi: "Ngày 2/9", theme: "vietnam", cover: "flag",
      days: [
        { d: "24 – 28/8", words: ["vietnam", "flag", "star"] },
        { d: "25 – 28/8", words: ["yellow", "red"] },
        { d: "26 – 28/8", words: ["fireworks", "bird"] },
      ],
      qa: [
        { type: "ask", q: "What is this?", a: "This is {a}.", items: ["flag", "star", "bird"] },
        { type: "ask", q: "What can you see?", a: "I can see {a}.", items: ["flag", "star", "bird", "fireworks"] },
        { type: "say", lines: ["I love Vietnam."], pic: "vietnam" },
      ],
      extra: ["explore"],
    },
    {
      id: "t9w3", month: 9, from: "2026-09-14", to: "2026-09-18", dates: "14 – 18/9",
      en: "School things", vi: "Đồ dùng học tập", theme: "school", cover: "backpack",
      days: [{ d: "14 – 18/9", words: ["backpack", "book", "chair", "crayon", "gluestick", "pencil", "table"] }],
      qa: [
        { type: "ask", q: "What is this?", a: "This is {a}.", items: ["backpack", "book", "chair", "crayon", "gluestick", "pencil", "table"] },
        { type: "ask", q: "What do you have?", a: "I have {a}.", items: ["backpack", "book", "crayon", "gluestick", "pencil"] },
      ],
      extra: ["pack"],
    },
    {
      id: "t9w4", month: 9, from: "2026-09-21", to: "2026-09-25", dates: "21 – 25/9",
      en: "Mid-Autumn", vi: "Trung thu", theme: "moon", cover: "lantern", song: SONG_MOON,
      days: [{ d: "21 – 25/9", words: ["moon", "mooncake", "lantern", "moonlady", "rabbit"] }],
      qa: [
        { type: "ask", q: "What is it?", a: "It's {a}.", items: ["moon", "mooncake", "lantern", "rabbit"] },
        { type: "ask", q: "Who is this?", a: "Moon lady.", items: ["moonlady"] },
      ],
      extra: ["moon"],
    },
    {
      id: "t9w5", month: 9, from: "2026-09-28", to: "2026-10-02", dates: "28/9 – 02/10",
      en: "Letter S", vi: "Chữ S", theme: "school", cover: "snake",
      days: [
        { d: "28, 29/9 + 01, 02/10", words: ["school", "scissors", "snake"] },
        { d: "30/9 – 02/10", words: ["tidyup"] },
        { d: "01, 02/10", words: ["backpack", "book", "chair", "crayon", "gluestick", "pencil", "table"], review: true },
      ],
      letter: "S",
      qa: [
        { type: "ask", q: "What is this?", a: "This is {a}.", over: { scissors: "These are scissors." }, items: ["school", "scissors", "snake", "book", "chair", "table"] },
        { type: "ask", q: "What do you have?", a: "I have {a}.", items: ["book", "pencil", "crayon", "scissors"] },
      ],
      extra: ["letter", "tidy"],
    },
    {
      id: "t10w1", month: 10, from: "2026-10-05", to: "2026-10-09", dates: "05 – 09/10",
      en: "My face & feelings", vi: "Khuôn mặt & cảm xúc", theme: "face", cover: "happy",
      days: [
        { d: "05, 06/10", words: ["face", "ears", "eyes", "mouth", "nose"] },
        { d: "07, 08/10", words: ["angry", "happy", "sad"] },
        { d: "08/10", words: ["monster", "one"] },
        { d: "09/10", words: ["backpack", "book", "chair", "crayon", "gluestick", "pencil", "table"], review: true },
      ],
      qa: [
        { type: "point", q: "Where is your {en}?", qPl: "Where are your {en}?", a: "Point to the {en}.", items: ["face", "ears", "eyes", "mouth", "nose"] },
        { type: "ask", q: "How are you?", a: "I'm {en}.", items: ["angry", "happy", "sad"] },
        { type: "ask", q: "What is it?", a: "It is {a}.", items: ["monster", "backpack", "book", "chair", "crayon", "pencil", "table"] },
      ],
      extra: [],
    },
    {
      id: "t10w2", month: 10, from: "2026-10-12", to: "2026-10-16", dates: "12 – 16/10",
      en: "Letter A & my family", vi: "Chữ A & gia đình", theme: "family", cover: "family", song: SONG_FAMILY,
      days: [
        { d: "13, 14/10", words: ["angry", "ant", "apple"] },
        { d: "13, 14/10", words: ["angry", "happy", "sad"], review: true },
        { d: "14/10", words: ["face", "ears", "eyes", "mouth", "nose"], review: true },
        { d: "14/10", words: ["backpack", "book", "chair", "crayon", "gluestick", "pencil", "table"], review: true },
        { d: "15/10", words: ["mummy", "daddy", "brother", "sister", "family"] },
        { d: "16/10", words: ["grandad", "grandma"] },
      ],
      letter: "A",
      qa: [
        { type: "ask", q: "Who is this?", a: "This is {a}.", items: ["mummy", "daddy", "brother", "sister", "grandma", "grandad"] },
        { type: "say", lines: ["I love my family."], pic: "family" },
        { type: "point", q: "Where is your {en}?", qPl: "Where are your {en}?", a: "Point to the {en}.", items: ["face", "ears", "eyes", "mouth", "nose"] },
        { type: "ask", q: "How are you?", a: "I'm {en}.", items: ["angry", "happy", "sad"] },
        { type: "ask", q: "What is it?", a: "It is {a}.", items: ["backpack", "book", "chair", "crayon", "pencil", "table"] },
      ],
      extra: ["letter"],
    },
    {
      id: "t10w3", month: 10, from: "2026-10-19", to: "2026-10-23", dates: "19 – 23/10",
      en: "Letter P & I can jump", vi: "Chữ P & vận động", theme: "family", cover: "jump", song: SONG_FAMILY,
      days: [
        { d: "19 – 21, 23/10", words: ["mummy", "daddy", "grandma", "grandad", "brother", "sister", "family"], review: true },
        { d: "20, 21/10", words: ["jump", "run", "swim", "gingerbread"] },
        { d: "22/10", words: ["paintbrush", "pencil", "pineapple"] },
      ],
      letter: "P",
      qa: [
        { type: "ask", q: "What can you do?", a: "I can {a}.", items: ["jump", "run", "swim"] },
        { type: "ask", q: "Who is this?", a: "This is {a}.", items: ["mummy", "daddy", "brother", "sister", "grandma", "grandad"] },
        { type: "say", lines: ["I love my mummy."], pic: "mummy" },
      ],
      extra: ["letter", "gingerbread"],
    },
    {
      id: "t10w4", month: 10, from: "2026-10-26", to: "2026-10-30", dates: "26 – 30/10",
      en: "Halloween", vi: "Lễ hội Halloween", theme: "halloween", cover: "pumpkin",
      days: [{ d: "26 – 30/10", words: ["halloween", "blackcat", "witch", "ghost", "skeleton", "pumpkin"] }],
      qa: [
        { type: "say", lines: ["Happy Halloween!"], pic: "halloween" },
        { type: "ask", q: "What is it?", a: "It's {a}.", items: ["blackcat", "ghost", "skeleton", "pumpkin"] },
        { type: "ask", q: "Who is she?", a: "She is {a}.", items: ["witch"] },
      ],
      extra: ["explore"],
    },
  ];
  const MONTHS = [
    { id: 8,  en: "August",   vi: "Tháng 8",  art: "beach" },
    { id: 9,  en: "September", vi: "Tháng 9", art: "school" },
    { id: 10, en: "October",  vi: "Tháng 10", art: "pumpkin" },
  ];
  WEEKS.forEach((wk, i) => {
    wk.n = WEEKS.filter((x, j) => j <= i && x.month === wk.month).length;
    wk.fresh = [...new Set(wk.days.filter(d => !d.review).flatMap(d => d.words))];
    wk.review = [...new Set(wk.days.filter(d => d.review).flatMap(d => d.words))].filter(id => !wk.fresh.includes(id));
    wk.all = [...wk.fresh, ...wk.review];
  });

  /* ---------- letters ---------- */
  const LETTERS = {
    S: { up: "S", low: "s", words: ["school", "scissors", "snake"], sound: "s_hiss", soundText: "sss", color: "#5dbb63" },
    A: { up: "A", low: "a", words: ["ant", "apple", "angry"], sound: "snd_a", soundText: "a, a, ant!", color: "#ff5c8a" },
    P: { up: "P", low: "p", words: ["paintbrush", "pencil", "pineapple"], sound: "snd_p", soundText: "p, p, pineapple!", color: "#3aa0e8" },
  };

  /* ---------- voice lines ---------- */
  const slug = t => "s_" + t.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const fill = (tpl, w) => cap(tpl.replace("{a}", w.a).replace("{en}", w.en));
  /* the sentences of one question about one word */
  function qaLines(qa, id) {
    const w = W[id];
    if (qa.type === "point") return { q: fill(w.pl ? qa.qPl : qa.q, w), a: fill(qa.a, w) };
    if (qa.type === "yesno") return { q: fill(qa.q, w), yes: qa.yes, no: qa.no };
    return { q: qa.q, a: (qa.over && qa.over[id]) || fill(qa.a, w) };
  }
  /* fixed lines used by the games (file name = key) */
  const UI = {
    q_letter: "What letter is it?", q_sound: "What sound is it?", a_sound: "Sound", s_hiss: "sss",
    a_letter: "Letter S.", a_letter_A: "Letter A.", a_letter_P: "Letter P.", snd_a: "a, a, ant!", snd_p: "p, p, pineapple!",
    q_this: "What is this?", q_have: "What do you have?", q_whatisit: "What is it?", q_who: "Who is this?",
    tidy_intro: "Let's tidy up!", w_tidyup: "Tidy up!", done: "All tidy! Good job!",
    ok1: "Great job!", ok2: "Well done!", ok3: "Super!", yay: "Yay!", hooray: "Hooray!", no1: "Oops! Try again.", think: "Hmm. Try again!",
    listen: "Listen and find.", shoot_bubbles: "Shoot the bubbles! Three the same, pop!", match_three: "Match three pictures!", find_shadow: "Find the shadow!", find_same: "Find the same picture!",
    pack_bag: "Pack your backpack!", go_school: "Let's go to school!", sticker: "You got a sticker!", tap_hear: "Tap and listen!",
    hello_ready: "Hello Mây! Let's learn English together!", lets_play: "Yes! Let's play!", bye: "Bye bye!", welcome_back: "Welcome back!", what_play: "What shall we play?",
    good_morning: "Good morning!", pick_friend: "Choose your friend!", care_hi: "Hi! I'm your friend.", giggle: "Hee hee!",
    w_bunny: "Bunny.", w_cat: "Cat. Meow!", w_bear: "Bear.",
    hungry: "I'm hungry!", yummy: "Yummy!", full: "I'm full! Thank you!",
    eat_apple: "Eat an apple.", eat_banana: "Eat a banana.", drink_milk: "Drink some milk.", eat_mooncake: "Eat a moon cake.", eat_carrot: "Eat a carrot.", eat_cookie: "Eat a cookie.",
    bath_time: "Bath time!", use_soap: "Soap. Bubbles, bubbles!", use_sponge: "Wash, wash, wash!", use_shower: "Water. Splash, splash!", all_clean: "All clean!",
    dress_up: "Let's get dressed!", put_shirt: "Put on your shirt.", put_shoes: "Put on your shoes.", put_hat: "Put on your hat.", put_socks: "Put on your socks.",
    put_sunglasses: "Put on your sunglasses.", put_crown: "Put on your crown.", look_great: "You look great!",
    bed_time: "Time for bed.", use_pillow: "Here is your pillow.", use_teddy: "Here is your teddy bear.", good_night: "Good night!", locked: "Get more stars to open it!",
    w_carrot: "Carrot.", w_cookie: "Cookie.", w_soap: "Soap.", w_sponge: "Sponge.", w_shower: "Water.", w_shirt: "Shirt.", w_shoes: "Shoes.", w_hat: "Hat.",
    w_socks: "Socks.", w_sunglasses: "Sunglasses.", w_crown: "Crown.", w_pillow: "Pillow.", w_teddy: "Teddy bear.", w_heart: "Heart.", w_rainbow: "Rainbow.", w_balloon: "Balloon.", w_sun: "Sun.",
    put_backpack: "Put away the backpack.", put_book: "Put away the book.", put_crayon: "Put away the crayon.", put_gluestick: "Put away the glue stick.",
    put_pencil: "Put away the pencil.", put_scissors: "Put away the scissors.", put_pens: "Put away the pens.",
    have_backpack: "I have a backpack.", have_book: "I have a book.", have_crayon: "I have a crayon.", have_gluestick: "I have a glue stick.", have_pencil: "I have a pencil.", have_scissors: "I have scissors.",
    mid_happy: "Happy Mid-Autumn Festival!", light_lanterns: "Let's light the lanterns!",
    itis_moon: "It's the moon.", itis_mooncake: "It's a moon cake.", itis_lantern: "It's a lantern.", itis_rabbit: "It's a rabbit.", a_moonlady: "Moon lady.",
    // new in "Learning English with Mây"
    new_words: "Let's learn new words!", choose_answer: "Listen and choose the answer.", your_turn: "Your turn! Say it with me.",
    say_it: "Say it with me!", tap_explore: "Tap and explore!", found_all: "You found them all!", review_time: "Review time!",
    week_done: "You finished this week! Hooray!", trace_it: "Trace the letter with your finger.", point_now: "Point to it!",
    look_bag: "Look in your bag.", look_want: "Look! What do you want?", you_said: "Great talking!",
    ginger_run: "Run, run, as fast as you can!", ginger_catch: "You can't catch me! I'm the gingerbread man!",
    ginger_go: "Help the gingerbread man run!", day_review: "Let's review!", month_review: "Month review!",
    play_out: "Let's go out and play!", decorate: "Let's decorate!", all_used: "Get more stickers to put more!",
    // My friend: needs and outings
    sleepy: "I'm sleepy.", tired: "I'm tired.", want_play: "I want to play!", not_sleepy: "I'm not sleepy! Let's play!",
    too_tired: "I'm tired. Let's sleep first.", too_hungry: "I'm hungry. Let's eat first.",
    where_go: "Where shall we go?", go_market: "Let's go to the supermarket!", go_gym: "Let's exercise!",
    shop_list: "Listen! What do I need?", shop_done: "Thank you! Bye bye!", park_done: "What a fun day!",
    gym_watch: "Watch me!", breathe: "Breathe in. Breathe out.", gym_done: "Phew! I'm tired. I'm hungry!",
    pose_tree: "Be a tree!", pose_star: "Be a star!", pose_cat: "Be a cat! Stretch!", pose_butterfly: "Be a butterfly! Flap, flap!",
    // cheering and guiding: after a wrong answer, or when the answer takes long
    try1: "Almost! Try again.", try2: "Good try! Look again.", try3: "Don't worry. You can do it!", try4: "Listen again. Try one more time.",
    got_it: "You got it! Good job!", look_shine: "Look at the shining one!",
    slow1: "Take your time.", slow2: "Listen carefully.", slow3: "Are you ready? Tap your answer!", need_help: "Need help? Look at the shining one!",
  };
  /* the supermarket sells the food words of the lessons */
  const FOOD = ["apple", "banana", "sandwich", "hotdog", "icecream", "water", "juice", "milk", "mooncake", "pineapple"];
  /* ---------- stickers: one for every 5 stars, drawn at random (doubles are counted).
     Every sticker is used in "My friend": food → Eat, wear → Dress, scene/deco → Play, bath/sleep → their rooms.
     voice: an older line key that already has an mp3; otherwise the key is made from the kind (eat_, put_, go_, use_) */
  const STICKERS = [
    // food
    { id: "banana", en: "banana", art: "e_banana", kind: "food", say: "Eat a banana." },
    { id: "milk", en: "milk", art: "e_milk", kind: "food", say: "Drink some milk.", voice: "drink_milk" },
    { id: "carrot", en: "carrot", art: "e_carrot", kind: "food", say: "Eat a carrot." },
    { id: "cookie", en: "cookie", art: "e_cookie", kind: "food", say: "Eat a cookie." },
    { id: "mooncake", en: "moon cake", art: "mooncake", kind: "food", say: "Eat a moon cake." },
    { id: "icecream", en: "ice cream", art: "icecream", kind: "food", say: "Eat some ice cream." },
    { id: "sandwich", en: "sandwich", art: "sandwich", kind: "food", say: "Eat a sandwich." },
    { id: "hotdog", en: "hot dog", art: "hotdog", kind: "food", say: "Eat a hot dog." },
    { id: "juice", en: "juice", art: "juice", kind: "food", say: "Drink some juice." },
    { id: "pineapple", en: "pineapple", art: "pineapple", kind: "food", say: "Eat some pineapple." },
    { id: "lollipop", en: "lollipop", art: "e_lollipop", kind: "food", say: "Lick the lollipop." },
    { id: "strawberry", en: "strawberry", art: "f_strawberry", kind: "food", say: "Eat a strawberry." },
    { id: "watermelon", en: "watermelon", art: "f_watermelon", kind: "food", say: "Eat some watermelon." },
    { id: "cupcake", en: "cupcake", art: "f_cupcake", kind: "food", say: "Eat a cupcake." },
    { id: "pizza", en: "pizza", art: "f_pizza", kind: "food", say: "Eat some pizza." },
    { id: "grapes", en: "grapes", art: "f_grapes", kind: "food", say: "Eat some grapes." },
    { id: "doughnut", en: "doughnut", art: "f_doughnut", kind: "food", say: "Eat a doughnut." },
    // bath & sleep
    { id: "sponge", en: "wash", art: "e_sponge", kind: "bath", say: "Wash, wash, wash!", voice: "use_sponge" },
    { id: "toothbrush", en: "toothbrush", art: "f_toothbrush", kind: "bath", say: "Brush your teeth!" },
    { id: "teddy", en: "teddy bear", art: "e_teddy", kind: "sleep", say: "Here is your teddy bear.", voice: "use_teddy" },
    // clothes: one thing per slot; x, y, w = where a picture sits on the friend (% of the friend's box).
    // shoes, socks, hat, crown and sunglasses are drawn inside the friend picture (art.js) instead.
    { id: "shoes", en: "shoes", art: "e_shoes", kind: "wear", slot: "feet", say: "Put on your shoes." },
    { id: "socks", en: "socks", art: "e_socks", kind: "wear", slot: "socks", say: "Put on your socks." },
    { id: "hat", en: "hat", art: "e_hat", kind: "wear", slot: "head", say: "Put on your hat." },
    { id: "crown", en: "crown", art: "e_crown", kind: "wear", slot: "head", say: "Put on your crown." },
    { id: "sunglasses", en: "sunglasses", art: "e_sunglasses", kind: "wear", slot: "face", say: "Put on your sunglasses." },
    { id: "cap", en: "cap", art: "f_cap", kind: "wear", slot: "head", say: "Put on your cap.", x: 50, y: 13, w: 52 },
    { id: "tophat", en: "top hat", art: "f_tophat", kind: "wear", slot: "head", say: "Put on your top hat.", x: 50, y: 9, w: 46 },
    { id: "gradcap", en: "graduation cap", art: "f_gradcap", kind: "wear", slot: "head", say: "Put on your graduation cap.", x: 50, y: 11, w: 54 },
    { id: "bow", en: "bow", art: "f_bow", kind: "wear", slot: "bow", say: "Put on your bow.", x: 72, y: 20, w: 28 },
    { id: "glasses", en: "glasses", art: "f_glasses", kind: "wear", slot: "face", say: "Put on your glasses.", x: 50, y: 37, w: 50 },
    { id: "scarf", en: "scarf", art: "f_scarf", kind: "wear", slot: "neck", say: "Put on your scarf.", x: 50, y: 68, w: 42 },
    { id: "wand", en: "magic wand", art: "f_wand", kind: "wear", slot: "hand", say: "Hold the magic wand.", x: 88, y: 64, w: 30 },
    { id: "umbrella", en: "umbrella", art: "f_umbrella", kind: "wear", slot: "hand", say: "Hold the umbrella.", x: 84, y: 40, w: 52 },
    // places for the Play room
    { id: "beach", en: "beach", art: "beach", kind: "scene", say: "Let's go to the beach!" },
    { id: "mountains", en: "mountains", art: "mountains", kind: "scene", say: "Let's go to the mountains!" },
    { id: "camping", en: "camping", art: "camping", kind: "scene", say: "Let's go camping!" },
    { id: "picnic", en: "picnic", art: "picnic", kind: "scene", say: "Let's have a picnic!" },
    { id: "school", en: "school", art: "school", kind: "scene", say: "Let's go to school!", voice: "go_school" },
    { id: "moon", en: "moon", art: "moon", kind: "scene", say: "Look at the moon!" },
    { id: "halloween", en: "Halloween", art: "halloween", kind: "scene", say: "Happy Halloween!" },
    { id: "vietnam", en: "Vietnam", art: "vietnam", kind: "scene", say: "I love Vietnam!" },
    { id: "snow", en: "snow", art: "f_snowman", kind: "scene", say: "Let's play in the snow!" },
    { id: "space", en: "space", art: "f_rocket", kind: "scene", say: "Let's fly to space!" },
    { id: "sea", en: "sea", art: "f_fish", kind: "scene", say: "Let's swim in the sea!" },
    // decorations for the Play room (one copy on the scene for each sticker you have)
    { id: "balloon", en: "balloon", art: "e_balloon", kind: "deco" }, { id: "rainbow", en: "rainbow", art: "e_rainbow", kind: "deco" },
    { id: "heart", en: "heart", art: "e_heart", kind: "deco" }, { id: "sun", en: "sun", art: "e_sun", kind: "deco" },
    { id: "glowstar", en: "star", art: "e_glowstar", kind: "deco" }, { id: "flower", en: "flower", art: "e_flower", kind: "deco" },
    { id: "lantern", en: "lantern", art: "lantern", kind: "deco" }, { id: "redlantern", en: "red lantern", art: "e_redlantern", kind: "deco" },
    { id: "rabbit", en: "rabbit", art: "rabbit", kind: "deco" }, { id: "moonlady", en: "moon lady", art: "moonlady", kind: "deco" },
    { id: "snake", en: "snake", art: "snake", kind: "deco" }, { id: "book", en: "book", art: "book", kind: "deco" },
    { id: "pencil", en: "pencil", art: "pencil", kind: "deco" }, { id: "gift", en: "gift", art: "e_gift", kind: "deco" },
    { id: "pumpkin", en: "pumpkin", art: "pumpkin", kind: "deco" }, { id: "ghost", en: "ghost", art: "ghost", kind: "deco" },
    { id: "blackcat", en: "black cat", art: "blackcat", kind: "deco" }, { id: "flag", en: "flag", art: "flag", kind: "deco" },
    { id: "firework", en: "fireworks", art: "e_firework", kind: "deco" }, { id: "tent", en: "tent", art: "tent", kind: "deco" },
    { id: "campfire", en: "campfire", art: "campfire", kind: "deco" }, { id: "bird", en: "bird", art: "bird", kind: "deco" },
    { id: "gingerbread", en: "gingerbread man", art: "gingerbread", kind: "deco" }, { id: "butterfly", en: "butterfly", art: "f_butterfly", kind: "deco" },
    { id: "kite", en: "kite", art: "f_kite", kind: "deco" }, { id: "unicorn", en: "unicorn", art: "f_unicorn", kind: "deco" },
    { id: "dino", en: "dinosaur", art: "f_dino", kind: "deco" }, { id: "puppy", en: "puppy", art: "f_puppy", kind: "deco" },
    { id: "castle", en: "castle", art: "f_castle", kind: "deco" }, { id: "tree", en: "tree", art: "f_tree", kind: "deco" },
    { id: "sunflower", en: "sunflower", art: "f_sunflower", kind: "deco" }, { id: "mushroom", en: "mushroom", art: "f_mushroom", kind: "deco" },
    { id: "ladybug", en: "ladybug", art: "f_ladybug", kind: "deco" }, { id: "turtle", en: "turtle", art: "f_turtle", kind: "deco" },
    { id: "xmastree", en: "Christmas tree", art: "f_xmastree", kind: "deco" }, { id: "planet", en: "planet", art: "f_planet", kind: "deco" },
    { id: "shell", en: "shell", art: "f_shell", kind: "deco" },
  ];
  const USE_KEY = { food: "eat_", wear: "put_", scene: "go_", bath: "use_", sleep: "use_" };
  STICKERS.forEach(s => { if (s.say) s.voice = s.voice || USE_KEY[s.kind] + s.id; });

  /* every line the app can say: key → text (used for the voice files and as speech fallback) */
  function allLines() {
    const L = { ...UI };
    WORDS.forEach(w => {
      L["w_" + w.id] = cap(w.en) + (w.id === "tidyup" ? "!" : ".");
      L["find_" + w.id] = w.find || `Find the ${w.en}.`;
    });
    WEEKS.forEach(wk => wk.qa.forEach(qa => {
      if (qa.type === "say") { qa.lines.forEach(t => { L[slug(t)] = t; }); return; }
      qa.items.forEach(id => Object.values(qaLines(qa, id)).forEach(t => { L[slug(t)] = t; }));
    }));
    STICKERS.forEach(s => {
      if (!L["w_" + s.id]) L["w_" + s.id] = cap(s.en) + ".";
      if (s.say && !L[s.voice]) L[s.voice] = s.say;
    });
    L.go_park = "Let's go to the park!";
    FOOD.forEach(id => { L["need_" + id] = `I need ${W[id].a}.`; });
    return L;
  }

  return { WORDS, W, WEEKS, MONTHS, LETTERS, STICKERS, FOOD, slug, qaLines, allLines };
})();
