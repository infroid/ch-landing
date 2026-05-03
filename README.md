# ContextHub Landing Page

Marketing site for ContextHub — one shared context, every coding agent.

## Structure

- `index.html` — markup
- `styles.css` — design tokens + components
- `script.js` — nav, mobile menu, auth modal, scroll reveal, terminal/editor animations
- `CNAME` — custom domain config

## Develop

Static site — no build step. Open `index.html` directly, or serve the directory:

```sh
python3 -m http.server 8000
# or: npx serve .
```
