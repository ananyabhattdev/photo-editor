import { useRef, useState, useEffect, useCallback } from 'react'
import './CameraCapture.css'

/**
 * CameraCapture component
 *
 * Renders a live webcam preview and a "Capture" button.
 * When the user captures a photo, the dataURL is passed to `onCapture`.
 */
function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [stream, setStream] = useState(null)
  const [cameraStarted, setCameraStarted] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facingMode, setFacingMode] = useState('user') // 'user' = front cam, 'environment' = back cam

  /** Start (or restart) the webcam */
  const startCamera = useCallback(async (facing = facingMode) => {
    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }

    setIsLoading(true)
    setError(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setCameraStarted(true)
    } catch (err) {
      const msg = buildErrorMessage(err)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [stream, facingMode])

  /** Stop the webcam when the component unmounts */
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stream])

  /** Capture the current video frame as a PNG dataURL */
  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    // Mirror the image if using front camera to match how user sees themselves
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/png')
    onCapture(dataUrl)
  }

  /** Toggle between front and back camera */
  const toggleCamera = () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    startCamera(newFacing)
  }

  return (
    <div className="camera-card card">
      <h2 className="section-title">📸 Live Camera</h2>

      {/* Error message */}
      {error && (
        <div className="banner banner-error" role="alert">
          <strong>Camera error:</strong> {error}
          <br />
          <small>Make sure you're using HTTPS and have granted camera permission.</small>
        </div>
      )}

      {/* Start camera button (shown before camera is started) */}
      {!cameraStarted && !isLoading && (
        <div className="camera-placeholder">
          <div className="camera-icon">📷</div>
          <p>Allow camera access to take a funny selfie!</p>
          <button className="btn btn-primary" onClick={() => startCamera()}>
            🎥 Start Camera
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="camera-placeholder">
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: '#a0a0c0' }}>Starting camera…</p>
        </div>
      )}

      {/* Live video preview */}
      <div className={`video-wrapper ${cameraStarted ? 'visible' : 'hidden'}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`video-feed ${facingMode === 'user' ? 'mirrored' : ''}`}
        />
        <div className="video-overlay-badge">LIVE</div>
      </div>

      {/* Hidden canvas used for capturing the frame */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Controls */}
      {cameraStarted && (
        <div className="btn-group">
          <button className="btn btn-primary" onClick={capturePhoto}>
            📸 Capture
          </button>
          <button className="btn btn-secondary" onClick={toggleCamera} title="Switch camera">
            🔄 Flip
          </button>
        </div>
      )}
    </div>
  )
}

/** Map common getUserMedia errors to human-readable messages */
function buildErrorMessage(err) {
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    return 'Camera permission denied. Please allow camera access in your browser settings.'
  }
  if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    return 'No camera found on this device.'
  }
  if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    return 'Camera is already in use by another application.'
  }
  if (err.name === 'OverconstrainedError') {
    return 'Camera does not support the requested resolution. Try a different device.'
  }
  if (err.name === 'TypeError') {
    return 'Camera access requires a secure connection (HTTPS).'
  }
  return err.message || 'An unknown error occurred while accessing the camera.'
}

export default CameraCapture
