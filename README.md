# Little Star English – NEMO 2 (28/9 – 02/10)

Static website for kids, built from the class "Báo bài" PDF.
Open `index.html` in any browser (Chrome, Safari, Edge) – no server or internet needed
(internet only loads the nicer fonts; it falls back to system fonts offline).

## Activities
- Words (Học từ vựng): flashcards grouped by day – tap to hear, swipe or use arrow keys.
- Letter S (Chữ S): "What letter is it? → Letter S", "What sound is it? → Sound /s/", trace S with a finger.
- Listen & find (Nghe và chọn): hear a word, tap the right picture (8 rounds).
- Ask & answer (Hỏi và đáp): "What is this? → This is a …", "What do you have? → I have a …".
- Tidy up (Dọn dẹp): "Put away the …" – drag or tap the item into the toy box.

## Files
- `assets/images/` – pictures extracted from the class PDF (webp)
- `assets/audio/` – 48 mp3 files (words + sentences), generated with Piper TTS (en-US voice)
- `js/assets.js` – list of media files; add a new word by adding its image + mp3 here
- `js/app.js` – lesson content (WORDS list at the top) and games
- `css/style.css` – styles

Stars are saved in the browser (localStorage).
