import { useEffect, useState, useRef } from 'react'
import { applyFunnyEffects } from '../utils/canvasEffects'
import './FunnyGenerator.css'

/**
 * FunnyGenerator component
 *
 * Generates a funny avatar by applying canvas-based effects (cartoon
 * filter, big-head warp, emoji stickers, meme text, etc.) to the
 * user's captured photo.  Each "Randomise" click re-runs the effects
 * with fresh random elements (emoji placement, captions).
 */
function FunnyGenerator({ imageDataUrl, onFunnyReady, funnyImage, onTryAgain }) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [seed, setSeed] = useState(() => Date.now())
  const canvasRef = useRef(null)

  /* Generate avatar when the component mounts or seed changes */
  useEffect(() => {
    if (!imageDataUrl) return

    let cancelled = false

    const generate = async () => {
      setProcessing(true)
      setError(null)
      try {
        const canvas = canvasRef.current
        const dataUrl = await applyFunnyEffects(canvas, imageDataUrl)
        if (!cancelled) {
          onFunnyReady(dataUrl)
        }
      } catch (err) {
        console.error('FunnyGenerator error:', err)
        if (!cancelled) {
          setError('Oops! Something went wrong generating the avatar. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setProcessing(false)
        }
      }
    }

    generate()

    return () => { cancelled = true }
  }, [imageDataUrl, seed, onFunnyReady])

  /** Randomise effects for a new avatar variation */
  const handleRandomise = () => {
    setSeed(Date.now())
  }

  /** Trigger download of the avatar as PNG */
  const handleDownload = () => {
    if (!funnyImage) return
    const link = document.createElement('a')
    link.href = funnyImage
    link.download = `funny-avatar-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="funny-card card">
      <h2 className="section-title">🎭 Your Funny Avatar</h2>

      {/* Hidden canvas used for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

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
