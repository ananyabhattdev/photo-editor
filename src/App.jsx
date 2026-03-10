import { useState, useCallback } from 'react'
import CameraCapture from './components/CameraCapture'
import ImagePreview from './components/ImagePreview'
import FunnyGenerator from './components/FunnyGenerator'
import './App.css'

/**
 * App component — manages the overall flow:
 * 1. CAMERA  → user starts camera and captures a photo
 * 2. PREVIEW → user sees the captured photo and clicks Submit
 * 3. RESULT  → funny avatar is generated using DiceBear
 */
function App() {
  // 'camera' | 'preview' | 'result'
  const [stage, setStage] = useState('camera')
  const [capturedImage, setCapturedImage] = useState(null)
  const [funnyImage, setFunnyImage] = useState(null)

  /** Called by CameraCapture when the user clicks "Capture" */
  const handleCapture = (dataUrl) => {
    setCapturedImage(dataUrl)
    setStage('preview')
  }

  /** Called by ImagePreview when the user clicks "Submit" */
  const handleSubmit = () => {
    setStage('result')
  }

  /** Called by FunnyGenerator when it finishes processing */
  const handleFunnyReady = useCallback((dataUrl) => {
    setFunnyImage(dataUrl)
  }, [])

  /** Reset everything back to the camera stage */
  const handleTryAgain = () => {
    setCapturedImage(null)
    setFunnyImage(null)
    setStage('camera')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-emoji">🎭</div>
        <h1>Funny Avatar Maker</h1>
        <p className="tagline">Take a selfie · Get a hilarious funny avatar</p>
      </header>

      <main className="app-main">
        {stage === 'camera' && (
          <CameraCapture onCapture={handleCapture} />
        )}

        {stage === 'preview' && (
          <ImagePreview
            imageDataUrl={capturedImage}
            onSubmit={handleSubmit}
            onRetake={() => setStage('camera')}
          />
        )}

        {stage === 'result' && (
          <FunnyGenerator
            imageDataUrl={capturedImage}
            onFunnyReady={handleFunnyReady}
            funnyImage={funnyImage}
            onTryAgain={handleTryAgain}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>All processing is done locally in your browser — no images are uploaded 🔒</p>
      </footer>
    </div>
  )
}

export default App
