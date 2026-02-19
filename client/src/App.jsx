import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Send the URL to your Backend
      const response = await axios.post('http://localhost:5001/api/analyze', { url });
      setResult(response.data.data); // Save the mock data to state
    } catch (err) {
      setError('Analysis failed. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1>TrueView AI</h1>
        <p>AI-Powered Fake Review Detection</p>
      </header>

      <main className="main-content">
        <div className="search-box">
          <h2>Paste Product URL</h2>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="https://amazon.in/dp/..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={handleAnalyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="result-card fade-in">
            <div className="score-badge" style={{ backgroundColor: result.trustScore > 70 ? '#00c853' : '#d50000' }}>
              {result.trustScore}% <span className="score-label">TRUST SCORE</span>
            </div>
            
            <div className="product-info">
              <h3>{result.productName}</h3>
              <p className="platform-tag">{result.platform}</p>
              <p className="verdict">Verdict: <strong>{result.summary.verdict}</strong></p>
            </div>

            <div className="pros-cons">
              <div className="pros">
                <h4>✅ Pros</h4>
                <ul>
                  {result.summary.pros.map((pro, index) => <li key={index}>{pro}</li>)}
                </ul>
              </div>
              <div className="cons">
                <h4>❌ Cons</h4>
                <ul>
                  {result.summary.cons.map((con, index) => <li key={index}>{con}</li>)}
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