import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mapping of languages to their "hello" translations
  const helloTranslations = {
    en: 'Hello',
    zh: '你好',
    hi: 'नमस्ते',
    es: 'Hola',
    fr: 'Bonjour',
    ar: 'مرحبا',
    bn: 'হ্যালো',
    pr: 'Olá',
    ru: 'Привет',
    ur: 'ہیلو',
  };

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

    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        video_url: videoUrl,
        query: query,
        language: language || 'en',
      });
      setResults(response.data);
      setError('');
    } catch (err) {
      if (err.response) {
        // Server responded with a status code outside the 2xx range
        if (err.response.status === 400) {
          setError('Invalid request. Please check your input and try again.');
        } else if (err.response.status === 404) {
          setError('No matches found for the given query.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Unexpected error: ${err.response.status}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Other errors
        setError('Something went wrong. Please try again.');
      }
      setResults([]);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleResultClick = (videoUrl, start) => {
    if (isChromeExtension) {
      chrome.tabs.update({ url: `${videoUrl}&t=${Math.floor(start)}s` });
    } else {
      window.location.href = `${videoUrl}&t=${Math.floor(start)}s`;
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setQuery(''); // Clear the query text
    // Set the placeholder hint based on the selected language
    document.getElementById('query-input').placeholder = `e.g., ${helloTranslations[selectedLanguage]}`;
  };

  return (
    <div className="container">
      <h1>YouTube Timestamp</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <input
          id="query-input"
          type="text"
          placeholder={`e.g., ${helloTranslations[language]}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={language}
          onChange={handleLanguageChange}
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

      <div className="results">
        <h2>Results</h2>
        {loading ? (
          <p>Loading...</p> // You can replace this with a spinner
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <ul>
            {results.map((result, index) => (
              <li key={index}>
                ✅{" "}
                <button
                  className="link-style"
                  onClick={() => handleResultClick(videoUrl, result.start)}
                >
                  {result.text} (at {Math.floor(result.start)}s)
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;