import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed')
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Network error: Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>SEO Analyzer</h1>
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL"
            className="url-input"
          />
          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        {result && (
          <div className="results">
            <div className="score-container">
              <h2 className="score-label">SEO Score</h2>
              <div className="score-value">{result.seoScore}/100</div>
            </div>
            <div className="details">
              {result.title && (
                <div className="detail-item">
                  <strong>Title:</strong> {result.title}
                </div>
              )}
              {result.metaDescription && (
                <div className="detail-item">
                  <strong>Meta Description:</strong> {result.metaDescription}
                </div>
              )}
              {result.h1Count !== undefined && (
                <div className="detail-item">
                  <strong>H1 Count:</strong> {result.h1Count}
                </div>
              )}
              <div className="detail-item">
                <strong>Issues:</strong>
                {result.issues && result.issues.length > 0 ? (
                  <ul className="issues-list">
                    {result.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-issues">No issues found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App