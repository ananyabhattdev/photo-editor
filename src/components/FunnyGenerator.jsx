import { useRef, useEffect, useState } from 'react'
import { applyFunnyEffects } from '../utils/canvasEffects'
import './FunnyGenerator.css'

/**
 * FunnyGenerator component
 *
 * Loads the captured image onto a Canvas, applies a series of
 * funny effects (cartoon colours, big-head warp, emoji stickers,
 * meme text, scan-lines, rainbow tint…), then surfaces the result
 * as a PNG dataURL that can be downloaded.
 */
function FunnyGenerator({ imageDataUrl, onFunnyReady, funnyImage, onTryAgain }) {
  const canvasRef = useRef(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const processedRef = useRef(false)

  /* Run the effects once when imageDataUrl changes */
  useEffect(() => {
    if (!imageDataUrl || processedRef.current) return

    processedRef.current = true

    const run = async () => {
      setProcessing(true)
      setError(null)
      try {
        const canvas = canvasRef.current
        const dataUrl = await applyFunnyEffects(canvas, imageDataUrl)
        onFunnyReady(dataUrl)
      } catch (err) {
        console.error('FunnyGenerator error:', err)
        setError('Oops! Something went wrong during transformation. Please try again.')
      } finally {
        setProcessing(false)
      }
    }

    run()
  }, [imageDataUrl, onFunnyReady])

  /** Trigger browser download of the funny image */
  const handleDownload = () => {
    if (!funnyImage) return
    const link = document.createElement('a')
    link.href = funnyImage
    link.download = `funny-photo-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="funny-card card">
      <h2 className="section-title">🤣 Your Funny AI Photo</h2>

      {/* Processing state */}
      {processing && (
        <div className="funny-processing">
          <div className="spinner" />
          <p className="processing-text">
            🤖 Applying AI magic…
            <span className="processing-dots" />
          </p>
          <p className="processing-sub">Cartoon filter · Big-head warp · Emoji stickers · Meme text</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      {/* Hidden canvas used for processing */}
      <canvas
        ref={canvasRef}
        className="funny-canvas"
        style={{ display: processing || !funnyImage ? 'none' : 'block' }}
      />

      {/* Result image rendered from the canvas dataURL */}
      {funnyImage && !processing && (
        <div className="funny-result">
          <img
            src={funnyImage}
            alt="Funny AI transformed photo"
            className="funny-image"
          />
          <div className="funny-badge">AI GENERATED 🤖</div>
        </div>
      )}

      {/* Action buttons */}
      {(funnyImage || error) && !processing && (
        <div className="btn-group">
          {funnyImage && (
            <button className="btn btn-download" onClick={handleDownload}>
              ⬇️ Download Image
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
