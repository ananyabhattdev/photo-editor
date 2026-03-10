import { useEffect, useState, useRef } from 'react'
import { createAvatar } from '@dicebear/core'
import * as collection from '@dicebear/collection'
import './FunnyGenerator.css'

/**
 * Available DiceBear avatar styles with display names.
 * Each entry maps a human-readable label to a style object from the collection.
 */
const AVATAR_STYLES = [
  { key: 'funEmoji',    label: 'Fun Emoji',    style: collection.funEmoji },
  { key: 'bottts',      label: 'Robots',       style: collection.bottts },
  { key: 'adventurer',  label: 'Adventurer',   style: collection.adventurer },
  { key: 'bigSmile',    label: 'Big Smile',    style: collection.bigSmile },
  { key: 'lorelei',     label: 'Lorelei',      style: collection.lorelei },
  { key: 'thumbs',      label: 'Thumbs',       style: collection.thumbs },
  { key: 'pixelArt',    label: 'Pixel Art',    style: collection.pixelArt },
  { key: 'croodles',    label: 'Croodles',     style: collection.croodles },
]

/**
 * FunnyGenerator component
 *
 * Generates funny avatars using the DiceBear library instead of
 * AI-generated images. Users can switch between avatar styles
 * and randomise their seed for new variations.
 */
function FunnyGenerator({ imageDataUrl, onFunnyReady, funnyImage, onTryAgain }) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [activeStyleIdx, setActiveStyleIdx] = useState(0)
  const [seed, setSeed] = useState(() => String(Date.now()))
  const processedRef = useRef(false)

  /* Generate avatar when the component mounts or style/seed changes */
  useEffect(() => {
    if (!imageDataUrl) return

    const generate = () => {
      setProcessing(true)
      setError(null)
      try {
        const { style } = AVATAR_STYLES[activeStyleIdx]
        const avatar = createAvatar(style, {
          seed,
          size: 512,
          radius: 10,
        })
        const dataUri = avatar.toDataUri()
        onFunnyReady(dataUri)
      } catch (err) {
        console.error('FunnyGenerator error:', err)
        setError('Oops! Something went wrong generating the avatar. Please try again.')
      } finally {
        setProcessing(false)
      }
    }

    generate()
  }, [imageDataUrl, activeStyleIdx, seed, onFunnyReady])

  /** Randomise the seed for a new avatar variation */
  const handleRandomise = () => {
    setSeed(String(Date.now()))
  }

  /** Trigger download of the avatar as SVG */
  const handleDownload = () => {
    if (!funnyImage) return
    const link = document.createElement('a')
    link.href = funnyImage
    link.download = `funny-avatar-${Date.now()}.svg`
    link.click()
  }

  return (
    <div className="funny-card card">
      <h2 className="section-title">🎭 Your Funny Avatar</h2>

      {/* Processing state */}
      {processing && (
        <div className="funny-processing">
          <div className="spinner" />
          <p className="processing-text">
            🎨 Creating your avatar…
            <span className="processing-dots" />
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      {/* Result avatar */}
      {funnyImage && !processing && (
        <div className="funny-result">
          <img
            src={funnyImage}
            alt="Funny avatar"
            className="funny-image"
          />
          <div className="funny-badge">AVATAR 🎭</div>
        </div>
      )}

      {/* Style selector */}
      {!processing && (
        <div className="style-selector">
          <p className="style-label">Choose a style:</p>
          <div className="style-chips">
            {AVATAR_STYLES.map((s, idx) => (
              <button
                key={s.key}
                className={`style-chip ${idx === activeStyleIdx ? 'active' : ''}`}
                onClick={() => setActiveStyleIdx(idx)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(funnyImage || error) && !processing && (
        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleRandomise}>
            🎲 Randomise
          </button>
          {funnyImage && (
            <button className="btn btn-download" onClick={handleDownload}>
              ⬇️ Download
            </button>
          )}
          <button className="btn btn-secondary" onClick={onTryAgain}>
            🔁 Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default FunnyGenerator
