# Portfolio website

Kunal Dangi's portfolio, live at **https://kunal-dangi-portfolio.vercel.app**.

A hand-written single page themed as a surveyor's map sheet: an original surveyor figure stands at the "React" station, with the path behind showing what's been learned and a dashed line ahead to what's next. Plain HTML, CSS and SVG, no framework; the animations are CSS and SVG with a few lines of JavaScript, and they switch off for visitors who prefer reduced motion.

It includes a chatbot ("Ask the surveyor") that answers questions about Kunal. It runs as a Vercel serverless function on Groq, and it reads this GitHub account's public repos and READMEs every few hours, so new projects show up without manual updates.

## Files

- `index.html` — the whole site
- `api/chat.js` — chatbot endpoint (Groq, rate limited, live GitHub snapshot)
- `api/knowledge.js` — hand-written facts the bot uses for things GitHub can't know
- `tests/chat.test.js` — self-check for the endpoint: `node tests/chat.test.js`

## Deploy

```bash
npx vercel deploy --prod
```

Needs `GROQ_API_KEY` set in Vercel (optional: `GROQ_MODEL`, `GITHUB_TOKEN`).
