# Learning English with Mây – NEMO 2

Static website for kids under 6, built from the class "Báo bài" PDFs (folder `pdf/`).
Lessons follow the school calendar, so Mây can review exactly what was taught each week.

Open `index.html` in any browser. For music to load when opening from disk, some browsers
need a small local server (e.g. `python3 -m http.server`).

## Calendar (one page per week)
| Month | Week | Topic | New words |
|---|---|---|---|
| 8 | 10 – 14/8 | Camping | camping, tent, campfire, mountains, beach, backpack, camping lamp, flashlight |
| 8 | 17 – 21/8 | Picnic | picnic, basket, blanket, apple, banana, sandwich, hot dog, ice cream, water, juice, milk |
| 8 | 24 – 28/8 | Vietnam (2/9) | Vietnam, flag, star, yellow, red, fireworks, bird |
| 9 | 14 – 18/9 | School things | backpack, book, chair, crayon, glue stick, pencil, table |
| 9 | 21 – 25/9 | Mid-Autumn | moon, moon cake, lantern, moon lady, rabbit |
| 9 | 28/9 – 02/10 | Letter S | school, scissors, snake, tidy up (+ review school things) |
| 10 | 05 – 09/10 | My face & feelings | face, ears, eyes, mouth, nose, angry, happy, sad, monster, one (+ review) |
| 10 | 12 – 16/10 | Letter A & my family | ant, apple, mummy, daddy, brother, sister, family, grandma, grandad (+ review) |
| 10 | 19 – 23/10 | Letter P & I can jump | jump, run, swim, gingerbread man, paintbrush, pineapple (+ review family) |
| 10 | 26 – 30/10 | Halloween | Halloween, black cat, witch, ghost, skeleton, pumpkin |

Home shows **this week** (from today's date), the three months as tabs, a 2-minute **review**
(everything taught so far, the words the child misses come back more often) and a play corner.

## A week = learn step by step
1. **New words** – flashcards, grouped by the school days of the PDF ("Ngày học"); review words separate.
2. **Listen & find** – hear a word, tap the picture. Adapts: misses → fewer pictures and a glow; a streak → 4 pictures.
3. **Ask & answer** – the "Cấu trúc" of the PDF. The child hears the teacher's question and answers by
   choosing: an answer sentence with a picture ("What do you need?" → "I need a tent."), yes/no by looking at
   the bag or the wish bubble ("Do you have a flashlight?" → "Yes, I do."), or a picture ("Where are your ears?
   Point to the ears.").
4. **Say it** – sentences to say together ("I love Vietnam.", "Happy Halloween!").

Plus the week's own activities (Letter S/A/P tracing, Tidy up, Pack my bag, Moon night, Explore scenes,
Catch the gingerbread man, class songs) and 5 games played with the week's words
(Bubble shooter, Find the same, Shadow match, Match 3, Tap & hear).
Each month has a month review (quiz + games over all its weeks).
Stars per week: words · listen · answer.

## Stickers & My friend
Every 5 stars gives a random sticker (81 in `STICKERS` in `js/lessons.js`); doubles are counted and the
sticker book shows "×2", "×3"… Each sticker is used in "My friend":
food → Eat, clothes → Dress (one thing per place: head, face, neck, hand…), bath/bed things → Bath/Sleep,
places → Play (change the background), decorations → Play (drag them around the scene; one copy per sticker
you have; drop one on the tray to put it back).

My friend also has needs (food, rest, fun – the three rings on the stage, saved in `needs` and going down with
real time). It says "I'm hungry!", "I'm sleepy.", "I want to play!"; tap it and it answers "How are you?" with
"I'm happy." / "I'm sad. I'm hungry!". When full it says "No, thank you."; when rested it is "not sleepy".
Stars earned anywhere make it happier.
**Go out** reviews the lessons taught so far (weakest words first):
- Park – things pop up on the way, the teacher asks the class question, Mây chooses the answer sentence.
- Supermarket – "I need a banana." – find it on the shelf (food words of the lessons); then the friend eats.
- Exercise – watch and choose "I can jump / run / swim", "Where is your nose? Point to the nose.", yoga poses.
Outings make it happy but tired and hungry (exercise most), so the child goes back to Eat and Sleep.

## Adding a new week
1. Add the words (and the week, with its `days` and `qa`) to `js/lessons.js`.
2. Put one picture per word in `assets/images/<id>.webp` (transparent background, ~440 px).
3. `node tools/build.mjs` – lists the voice lines without an mp3.
4. `python tools/make_audio.py path/to/en_US-lessac-medium.onnx` – records them (Piper TTS, same voice as before).
5. `node tools/build.mjs` again – updates `js/assets.js`.

## Credits
- Class pictures: from the Little Star PDFs.
- 3D icons: Microsoft Fluent Emoji (MIT licence), https://github.com/microsoft/fluentui-emoji
- Bunny/Cat/Bear, pillow, cloud: drawn for this site (js/art.js, js/app.js).
- Voice: Piper TTS (en_US-lessac-medium). Music: original loop made for this site. Sound effects: generated in the browser.
