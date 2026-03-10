# 🤖 Funny AI Photo Editor

A React + Vite web app that lets you take a **live selfie** from your webcam and instantly transforms it into a hilariously funny AI-styled picture — entirely in the browser, no server needed.

🌐 **Live demo:** [https://ananyabhattdev.github.io/photo-editor/](https://ananyabhattdev.github.io/photo-editor/)

---

## ✨ What it does

1. **Start Camera** — opens your device's front/back camera
2. **Capture** — snaps a photo from the live video feed
3. **Submit** — applies a series of funny Canvas effects:
   - 🎨 Cartoon / posterize filter
   - 🤯 Big-head spherical warp
   - 📺 Retro CRT scan-line overlay
   - 🌈 Rainbow vignette border
   - 😂 Random emoji sticker rain
   - 🏆 Impact-style meme captions
4. **Download** the result or **Try Again**

All processing happens **100% locally** in your browser — no image is ever uploaded anywhere.

---

## 🚀 Running locally

### Prerequisites
- Node.js 18 or later
- npm 9 or later

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ananyabhattdev/photo-editor.git
cd photo-editor

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173/photo-editor/](http://localhost:5173/photo-editor/) in your browser.

> **Note:** Camera access requires a **secure context** (HTTPS or `localhost`). The Vite dev server on `localhost` qualifies.

---

## 🏗️ Building for production

```bash
npm run build
```

The optimised build is output to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## 📦 Deployment (GitHub Pages)

The app is automatically deployed to GitHub Pages on every push to the `main` branch via the workflow at `.github/workflows/deploy.yml`.

### How it works

1. GitHub Actions checks out the code on `ubuntu-latest`
2. Installs Node 20 and runs `npm ci`
3. Runs `npm run build` (Vite build with `base: '/photo-editor/'`)
4. Uploads the `dist/` folder as a Pages artifact via `actions/upload-pages-artifact`
5. Deploys to `https://ananyabhattdev.github.io/photo-editor/` via `actions/deploy-pages`

### First-time setup

> **Important:** GitHub Pages must be enabled in your repository settings before the deployment workflow can succeed.

1. Go to **Settings → Pages** in your GitHub repository
2. Under **Source**, select **GitHub Actions**
3. Push to `main` (or re-run the workflow from the **Actions** tab) — the workflow handles everything else

---

## 🗂️ Project structure

```
photo-editor/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CameraCapture.jsx   # Live webcam + capture
│   │   ├── CameraCapture.css
│   │   ├── FunnyGenerator.jsx  # Canvas effects orchestrator
│   │   ├── FunnyGenerator.css
│   │   ├── ImagePreview.jsx    # Captured photo preview
│   │   └── ImagePreview.css
│   ├── utils/
│   │   └── canvasEffects.js    # All Canvas transformation logic
│   ├── App.jsx                 # Stage manager (camera → preview → result)
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD
├── index.html
├── vite.config.js              # base: '/photo-editor/'
└── package.json
```

---

## 🛠️ Troubleshooting

### Camera permission denied
- Click the camera/lock icon in your browser's address bar and allow camera access
- On iOS Safari, go to **Settings → Safari → Camera** and allow access
- On Android Chrome, tap **Site settings** from the three-dot menu

### Camera not working on mobile
- Make sure the page is served over **HTTPS** (required by all modern browsers for `getUserMedia`)
- GitHub Pages automatically serves over HTTPS ✅
- For local development, `localhost` is treated as a secure context

### Black / blank video feed
- Another app may be using the camera — close video-call apps and reload
- Try tapping "Flip" to switch to the back camera

### GitHub Pages shows 404
- Ensure **Settings → Pages → Source** is set to **GitHub Actions**
- Check the **Actions** tab for any deployment errors
- Wait ~2 minutes after a push for the first deployment to complete

---

## 📸 Screenshots

| Camera view | Captured photo | Funny result |
|-------------|---------------|--------------|
| _(camera active on real device)_ | _(snapshot preview)_ | _(canvas effects applied)_ |

---

## 📄 License

MIT

