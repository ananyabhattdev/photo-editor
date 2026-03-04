import './ImagePreview.css'

/**
 * ImagePreview component
 *
 * Shows the captured photo and lets the user either:
 *  • Submit → triggers the funny AI transformation
 *  • Retake → go back to the camera
 */
function ImagePreview({ imageDataUrl, onSubmit, onRetake }) {
  return (
    <div className="preview-card card">
      <h2 className="section-title">🖼️ Your Photo</h2>
      <p className="preview-hint">Happy with the shot? Hit <strong>Submit</strong> to make it funny!</p>

      <div className="preview-image-wrapper">
        <img
          src={imageDataUrl}
          alt="Captured preview"
          className="preview-image"
        />
        <div className="preview-badge">CAPTURED</div>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={onSubmit}>
          🤣 Submit &amp; Make it Funny!
        </button>
        <button className="btn btn-secondary" onClick={onRetake}>
          🔁 Retake
        </button>
      </div>
    </div>
  )
}

export default ImagePreview
