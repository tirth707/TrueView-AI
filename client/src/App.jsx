import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeUrl = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5001/api/analyze', { url });
      setResult(response.data.data);
    } catch (err) {
      setError('Failed to analyze the product. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1>TrueView AI</h1>
        <p>AI-Powered Fake Review Detection</p>
      </header>

      <main>
        <div className="search-box">
          <h2>Paste Product URL</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="https://www.amazon.in/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={analyzeUrl} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </div>

        {result && (
          <div className="result-card fade-in">
            <div 
              className="score-badge" 
              style={{ backgroundColor: getScoreColor(result.trustScore) }}
            >
              {result.trustScore}%
              <span className="score-label">Trust Score</span>
            </div>

            <div className="product-info">
              <h3>{result.productName}</h3>
              <span className="platform-tag">{result.platform}</span>
              <p className="verdict">
                Verdict: <strong>{result.summary?.verdict || result.verdict}</strong>
              </p>
            </div>

            <div className="pros-cons">
              <div className="pros">
                <h4>✓ Pros</h4>
                <ul>
                  {(result.summary?.pros || result.pros || []).map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="cons">
                <h4>✕ Cons</h4>
                <ul>
                  {(result.summary?.cons || result.cons || []).map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;