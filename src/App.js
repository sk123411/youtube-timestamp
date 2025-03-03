import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Check if the chrome object is available
  const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage;

  // Load saved state when the component mounts
  useEffect(() => {
    if (isChromeExtension) {
      chrome.storage.sync.get(['videoUrl', 'query', 'language', 'results'], (data) => {
        if (data.videoUrl) setVideoUrl(data.videoUrl);
        if (data.query) setQuery(data.query);
        if (data.language) setLanguage(data.language);
        if (data.results) setResults(data.results);
      });
    }
  }, [isChromeExtension]);

  // Save state whenever it changes
  useEffect(() => {
    if (isChromeExtension) {
      chrome.storage.sync.set({ videoUrl, query, language, results });
    }
  }, [videoUrl, query, language, results, isChromeExtension]);

  const handleAnalyze = async () => {
    if (!videoUrl || !query) {
      setError('Please provide a YouTube URL and a query.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        video_url: videoUrl,
        query: query,
        language: language || 'en',
      });
      setResults(response.data);
      setError('');
    } catch (err) {
      setError('Error analyzing the video. Please check the URL and try again.');
      setResults([]);
    }
  };

  const handleResultClick = (videoUrl, start) => {
    if (isChromeExtension) {
      chrome.tabs.update({ url: `${videoUrl}&t=${Math.floor(start)}s` });
    } else {
      window.location.href = `${videoUrl}&t=${Math.floor(start)}s`;
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

export default App;