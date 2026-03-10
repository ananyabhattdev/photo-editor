/**
 * canvasEffects.js
 *
 * All "funny AI" image processing happens here, entirely in the browser
 * using the HTML5 Canvas 2D API — no server calls needed.
 *
 * Effects applied (in order):
 *  1. Cartoon / posterize — reduces color depth for a comic-book look
 *  2. Saturation boost + hue rotation — vivid, slightly alien colors
 *  3. Big-head warp — enlarges the top-centre of the image (face area)
 *  4. Scan-line overlay — adds retro CRT lines
 *  5. Rainbow vignette — colorful border glow
 *  6. Emoji sticker rain — sprinkles random emoji across the image
 *  7. Meme text — adds a funny caption at the top and bottom
 */

/* ─── Public API ──────────────────────────────────────────────────────────── */

/**
 * Loads `imageDataUrl` onto `canvas`, applies all funny effects, and
 * returns a new PNG dataURL of the result.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} imageDataUrl
 * @returns {Promise<string>} transformed PNG dataURL
 */
export async function applyFunnyEffects(canvas, imageDataUrl) {
  const img = await loadImage(imageDataUrl)

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  // 1. Draw the original image
  ctx.drawImage(img, 0, 0)

  // 2. Pixel-level effects (cartoon + color shift)
  applyCartoonEffect(ctx, canvas.width, canvas.height)

  // 3. Big-head warp (distort upper-centre region outward)
  applyBigHeadWarp(ctx, canvas.width, canvas.height)

  // 4. Scan-line overlay
  applyScanLines(ctx, canvas.width, canvas.height)

  // 5. Rainbow vignette border
  applyRainbowVignette(ctx, canvas.width, canvas.height)

  // 6. Emoji stickers
  applyEmojiStickers(ctx, canvas.width, canvas.height)

  // 7. Meme caption text
  applyMemeText(ctx, canvas.width, canvas.height)

  return canvas.toDataURL('image/png')
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/** Promise-wrapper around Image loading */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e))
    img.src = src
  })
}

/* ─── Effect 1: Cartoon / posterize ──────────────────────────────────────── */
/**
 * Posterizes each channel to `levels` steps and boosts edge contrast by
 * darkening pixels that are close to mid-grey (simple approximation).
 * Combined with saturation boost this looks like a cartoon filter.
 */
function applyCartoonEffect(ctx, w, h) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const levels = 5 // number of color steps per channel

  for (let i = 0; i < data.length; i += 4) {
    // Posterize
    data[i]     = posterize(data[i],     levels)
    data[i + 1] = posterize(data[i + 1], levels)
    data[i + 2] = posterize(data[i + 2], levels)

    // Boost saturation in HSL space
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
    const [r, g, b] = hslToRgb(h, Math.min(1, s * 1.8), l)
    data[i]     = r
    data[i + 1] = g
    data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
}

function posterize(value, levels) {
  return Math.round(Math.round(value / 255 * levels) / levels * 255)
}

/* ─── Effect 2: Big-head warp ─────────────────────────────────────────────── */
/**
 * Distorts the upper-centre rectangle of the image outward to give a
 * comically large-head effect.  We sample from a "shrunk" source region
 * to paint a "stretched" destination region row by row.
 */
function applyBigHeadWarp(ctx, w, h) {
  // Region to warp: upper-centre square, roughly where a face would be
  const cx = w / 2
  const cy = h * 0.28
  const radius = Math.min(w, h) * 0.30

  // Read current pixels
  const src = ctx.getImageData(0, 0, w, h)

  // Create output buffer starting as a copy of the source
  const dst = ctx.createImageData(w, h)
  dst.data.set(src.data)

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const nx = dx - cx
      const ny = dy - cy
      const dist = Math.sqrt(nx * nx + ny * ny)

      if (dist < radius) {
        // Spherical bulge: inverse-warp from destination back to source
        const factor = Math.sin((Math.PI / 2) * (dist / radius))
        const sx = Math.round(cx + nx * factor)
        const sy = Math.round(cy + ny * factor)

        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          const srcIdx = (sy * w + sx) * 4
          const dstIdx = (dy * w + dx) * 4
          dst.data[dstIdx]     = src.data[srcIdx]
          dst.data[dstIdx + 1] = src.data[srcIdx + 1]
          dst.data[dstIdx + 2] = src.data[srcIdx + 2]
          dst.data[dstIdx + 3] = src.data[srcIdx + 3]
        }
      }
    }
  }

  ctx.putImageData(dst, 0, 0)
}

/* ─── Effect 3: Scan lines ────────────────────────────────────────────────── */
function applyScanLines(ctx, w, h) {
  ctx.save()
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.fillRect(0, y, w, 2)
  }
  ctx.restore()
}

/* ─── Effect 4: Rainbow vignette border ──────────────────────────────────── */
function applyRainbowVignette(ctx, w, h) {
  ctx.save()

  // Thick colorful border glow using multiple layered strokes
  const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8b00ff']
  const borderW = Math.min(w, h) * 0.04

  colors.forEach((color, i) => {
    const offset = borderW * i * 0.5
    ctx.strokeStyle = color
    ctx.lineWidth = borderW
    ctx.globalAlpha = 0.25
    ctx.strokeRect(offset, offset, w - offset * 2, h - offset * 2)
  })

  // Dark circular vignette to frame the face
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.globalAlpha = 1
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)

  ctx.restore()
}

/* ─── Effect 5: Emoji sticker rain ───────────────────────────────────────── */
const STICKER_EMOJIS = ['🤣', '😂', '🤪', '🤖', '👾', '💥', '✨', '🌈', '🎉', '🔥', '😎', '🦄', '🎭', '🥳', '💫', '🍕']

function applyEmojiStickers(ctx, w, h) {
  ctx.save()

  // Use current timestamp as seed so each generation produces different results
  const rng = seededRng(Date.now())

  const count = 12
  const fontSize = Math.round(Math.min(w, h) * 0.075)

  ctx.font = `${fontSize}px serif`
  ctx.textBaseline = 'middle'

  for (let i = 0; i < count; i++) {
    const emoji = STICKER_EMOJIS[Math.floor(rng() * STICKER_EMOJIS.length)]
    const x = rng() * (w - fontSize * 2) + fontSize
    const y = rng() * (h - fontSize * 2) + fontSize
    const angle = (rng() - 0.5) * 0.6 // slight random rotation

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.globalAlpha = 0.88
    ctx.fillText(emoji, 0, 0)
    ctx.restore()
  }

  ctx.restore()
}

/* ─── Effect 6: Meme text ─────────────────────────────────────────────────── */
const TOP_CAPTIONS = [
  'WHEN THE AI HITS DIFFERENT',
  'POV: YOU ASKED FOR AI HELP',
  'PLOT TWIST: THIS IS ACTUALLY YOU',
  'CERTIFIED FUNNY MOMENT 😂',
  'ME EVERY MONDAY MORNING',
]

const BOTTOM_CAPTIONS = [
  'POWERED BY PURE CHAOS 🤖',
  'AI SAID: HOLD MY DATASET',
  'NO PIXELS WERE HARMED',
  '100% ORGANIC FREE-RANGE FUNNY',
  'DEEPFRIED WITH LOVE ❤️',
]

function applyMemeText(ctx, w, h) {
  ctx.save()

  const rng = seededRng(Date.now() + 1)
  const topText    = TOP_CAPTIONS[Math.floor(rng() * TOP_CAPTIONS.length)]
  const bottomText = BOTTOM_CAPTIONS[Math.floor(rng() * BOTTOM_CAPTIONS.length)]

  const fontSize = Math.max(16, Math.round(Math.min(w, h) * 0.055))
  ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  drawMemeString(ctx, topText, w / 2, fontSize * 0.4, fontSize)

  ctx.textBaseline = 'bottom'
  drawMemeString(ctx, bottomText, w / 2, h - fontSize * 0.4, fontSize)

  ctx.restore()
}

/** Draws Impact-style meme text: white fill + black stroke */
function drawMemeString(ctx, text, x, y, fontSize) {
  ctx.lineWidth = Math.max(2, fontSize * 0.14)
  ctx.strokeStyle = '#000'
  ctx.fillStyle = '#fff'
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
}

/* ─── Colour helpers ──────────────────────────────────────────────────────── */

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      default: h = ((r - g) / d + 4) / 6
    }
  }
  return [h, s, l]
}

function hslToRgb(h, s, l) {
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/* ─── Simple seeded PRNG (Mulberry32) ────────────────────────────────────── */
function seededRng(seed) {
  let s = seed
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
