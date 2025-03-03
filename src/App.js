import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en'); // Default to English
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!videoUrl || !query) {
      setError('Please provide a YouTube URL and a query.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        video_url: videoUrl,
        query: query,
        language: language || 'en', // Use English if no language is selected
      });
      setResults(response.data);
      setError('');
    } catch (err) {
      setError('Error analyzing the video. Please check the URL and try again.');
      setResults([]);
    }
  };

  return (
    <div className="container">
      <h1>YouTube Video Analyzer</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="zh">Mandarin Chinese</option>

          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="ar">Arabic</option>
          <option value="bn">Bengali</option>
          <option value="pr">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ur">Urdu</option>

        </select>
        <button onClick={handleAnalyze}>Analyze</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="results">
        <h2>Results</h2>
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              <button
                className="link-style"
                onClick={() => handleResultClick(videoUrl, result.start)}
              >
                {result.text} (at {Math.floor(result.start)}s)
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const handleResultClick = (videoUrl, start) => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Open the link in the same tab using the chrome.tabs API
    chrome.tabs.update({ url: `${videoUrl}&t=${Math.floor(start)}s` });
  } else {
    // Fallback for non-Chrome environments (e.g., development)
    window.location.href = `${videoUrl}&t=${Math.floor(start)}s`;
  }
};


export default App;