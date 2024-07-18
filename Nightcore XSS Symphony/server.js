const express = require("express");
const bodyParser = require("body-parser");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const path = require("path");
const rateLimit = require("express-rate-limit")
const bot = require("./bot");
const { error } = require("console");
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

let notes = {};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/", (req, res) => {
  const rawNote = req.body.note;
  const sanitizedNote = DOMPurify.sanitize(rawNote);
  const noteId = Date.now().toString();
  notes[noteId] = sanitizedNote;
  res.setHeader("Content-Type", "text/html");
  res.end(`
        <h1>OK</h1>
        <p>Your note id is: /note/${noteId}</p>
        <br><a href="/note/${noteId}">Go to note</a>
  `)
});

app.get("/note/:id", (req, res) => {
  const noteId = req.params.id;
  const note = notes[noteId];
  if (note) {
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <h1>Your Note</h1>
      <p>${note}</p>
      <br><a href="/">Go Back</a>
    `);
  } else {
    res.status(404).json({error: "Note not found"});
  }
});

const limit = rateLimit({
    ...bot,
    validate: {
	validationsConfig: false,
	default: true,
    },
    handler: ((req, res, _next) => {
        const timeRemaining = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        res.status(429).json({
            error: `Too many requests, please try again later after ${timeRemaining} seconds.`,
        });
    })
})

app.get("/report", (_, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bot.html'));
});

app.post("/report", limit, async (req, res) => {
    const  url  = req.body.urlToVisit;
    if (!url) {
        return res.status(400).json({ error: "Url is missing." });
    }
    if (await bot.bot(url)) {
        return res.json({ success: "Admin successfully visited the URL." });
    } else {
        return res.status(500).json({ error: "Admin failed to visit the URL." });
    }
});

app.get('/flag', (req, res) => {
    let ip = req.connection.remoteAddress;
    if (ip === '127.0.0.1') {
      res.json({ flag: 'FLAG{You_winnnnnnnn!!!!!}' });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  });

app.listen(5000, '0.0.0.0', () => console.log('Server started on port 5000'));
