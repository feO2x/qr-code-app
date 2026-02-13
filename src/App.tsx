import { useMemo, useRef, useState, type CSSProperties } from 'react'
import html2canvas from 'html2canvas'
import { QRCodeCanvas } from 'qrcode.react'
import './App.css'

const DEFAULT_URL = 'https://wildniscamp.com'
const DEFAULT_LABEL = 'Wildniscamp'

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function App() {
  const [urlInput, setUrlInput] = useState(DEFAULT_URL)
  const [labelInput, setLabelInput] = useState(DEFAULT_LABEL)
  const [borderColor, setBorderColor] = useState('#8ea989')
  const [isExporting, setIsExporting] = useState(false)
  const qrExportRef = useRef<HTMLDivElement>(null)

  const trimmedUrl = urlInput.trim()
  const qrValue = trimmedUrl.length > 0 ? trimmedUrl : DEFAULT_URL
  const label = labelInput.trim().length > 0 ? labelInput.trim() : DEFAULT_LABEL
  const isValidUrl = useMemo(() => isValidHttpUrl(trimmedUrl), [trimmedUrl])
  const previewStyle = useMemo(
    () =>
      ({
        '--badge-color': borderColor,
      }) as CSSProperties,
    [borderColor],
  )

  const handleDownloadPng = async () => {
    const exportNode = qrExportRef.current
    if (!exportNode) {
      return
    }

    setIsExporting(true)
    try {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      const exportCanvas = await html2canvas(exportNode, {
        backgroundColor: null,
        logging: false,
        scale: Math.max(window.devicePixelRatio, 3),
      })

      const downloadLink = document.createElement('a')
      const fileName = `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr-code'}.png`

      downloadLink.download = fileName
      downloadLink.href = exportCanvas.toDataURL('image/png')
      downloadLink.click()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="controls-panel" aria-label="QR code inputs">
        <h1>QR Code Creator</h1>
        <p className="panel-copy">
          Generate QR codes fully on-device. Enter a URL and the caption shown beneath the
          code.
        </p>

        <label className="field-label" htmlFor="url-input">
          URL
        </label>
        <input
          id="url-input"
          className="text-field"
          type="url"
          placeholder="https://example.com"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
        />
        <p className={`validation-copy ${isValidUrl || trimmedUrl.length === 0 ? '' : 'invalid'}`}>
          {trimmedUrl.length === 0 || isValidUrl
            ? 'Use a full URL including https://'
            : 'Please enter a valid http(s) URL.'}
        </p>

        <label className="field-label" htmlFor="label-input">
          Text Beneath QR
        </label>
        <input
          id="label-input"
          className="text-field"
          type="text"
          maxLength={40}
          placeholder="Brand or destination text"
          value={labelInput}
          onChange={(event) => setLabelInput(event.target.value)}
        />
        <label className="field-label" htmlFor="border-color-input">
          Border Color
        </label>
        <div className="color-picker-row">
          <input
            id="border-color-input"
            className="color-picker"
            type="color"
            value={borderColor}
            onChange={(event) => setBorderColor(event.target.value)}
            aria-label="Choose border color"
          />
          <span className="color-value">{borderColor.toUpperCase()}</span>
        </div>

        <button
          type="button"
          className="download-button"
          onClick={handleDownloadPng}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Download PNG'}
        </button>
      </section>

      <section className="preview-panel" aria-live="polite">
        <div className="qr-export-target" ref={qrExportRef} style={previewStyle}>
          <div className="qr-wrapper">
            <div className="qr-frame" role="img" aria-label={`QR code for ${qrValue}`}>
              <div className="qr-paper">
                <QRCodeCanvas
                  value={qrValue}
                  size={520}
                  level="M"
                  marginSize={1}
                  bgColor="transparent"
                  className="qr-canvas"
                />
              </div>
            </div>
            <div className="qr-connector" />
            <div className="caption-plate">
              <p>{label}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
