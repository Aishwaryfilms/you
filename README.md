# You eSports — Website

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📧 Contact Form (Auto Send)

The Reach Out form now sends in the background using EmailJS (no FormSubmit activation email flow).

1. Copy `.env.example` to `.env`
2. Add your EmailJS values:

```bash
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

3. Restart `npm run dev`

---

## 📦 Build for Production

```bash
npm run build
```

This creates a `dist/` folder — that's your deployable site.

---

## ☁️ Deploy Options

### Vercel (Recommended — free & instant)
1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import your repo
3. Vercel auto-detects Vite — just click Deploy ✅

### Netlify (Also free)
1. Run `npm run build`
2. Go to https://app.netlify.com → Sites → Drag & drop the `dist/` folder ✅

### GitHub Pages
1. Install: `npm install --save-dev gh-pages`
2. Add to package.json scripts: `"deploy": "gh-pages -d dist"`
3. Run: `npm run build && npm run deploy` ✅

---

## 📁 Project Structure

```
youesports/
├── index.html          # HTML entry point
├── vite.config.js      # Vite config
├── package.json        # Dependencies
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Your full site component
```
