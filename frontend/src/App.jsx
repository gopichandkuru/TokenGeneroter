// ============================================
// App.jsx - Main React Component
// ============================================
// This is the main component for the Queue Management System.
// It handles fetching data from the backend and rendering the UI.

import { useState, useEffect } from "react";
import "./App.css";

// Backend API base URL
const API_URL = "http://localhost:5000/api";

function App() {
  // --- State Variables ---
  // currentToken: the token currently being served (or null)
  // waitingQueue: array of tokens with status 'waiting'
  // lastGeneratedToken: the most recently generated token (to show confirmation)
  // loading: whether an API call is in progress
  // message: feedback messages to the user

  const [currentToken, setCurrentToken] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [lastGeneratedToken, setLastGeneratedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Fetch data from backend on first render ---
  useEffect(() => {
    fetchCurrentToken();
    fetchQueue();
  }, []);

  /**
   * fetchCurrentToken()
   * Gets the token currently being served from the backend.
   */
  async function fetchCurrentToken() {
    try {
      const response = await fetch(`${API_URL}/current`);
      const data = await response.json();
      setCurrentToken(data.token);
    } catch (error) {
      console.error("Error fetching current token:", error);
    }
  }

  /**
   * fetchQueue()
   * Gets all waiting tokens from the backend.
   */
  async function fetchQueue() {
    try {
      const response = await fetch(`${API_URL}/queue`);
      const data = await response.json();
      setWaitingQueue(data.queue);
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }

  /**
   * handleGetToken()
   * Generates a new token by calling POST /api/token.
   */
  async function handleGetToken() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/token`, { method: "POST" });
      const data = await response.json();
      setLastGeneratedToken(data.token);
      setMessage(data.message);
      // Refresh the queue after generating a new token
      await fetchQueue();
    } catch (error) {
      console.error("Error generating token:", error);
      setMessage("❌ Failed to generate token. Is the server running?");
    }
    setLoading(false);
  }

  /**
   * handleCallNext()
   * Calls the next token by calling POST /api/next.
   * This marks the current serving token as completed
   * and the next waiting token as serving.
   */
  async function handleCallNext() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/next`, { method: "POST" });
      const data = await response.json();
      setMessage(data.message);
      // Refresh both current token and queue
      await fetchCurrentToken();
      await fetchQueue();
    } catch (error) {
      console.error("Error calling next token:", error);
      setMessage("❌ Failed to call next token. Is the server running?");
    }
    setLoading(false);
  }

  // --- Render the UI ---
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-icon">🏥</div>
        <h1>Queue Management System</h1>
        <p className="subtitle">Hospital Token System</p>
      </header>

      {/* Feedback Message */}
      {message && <div className="message-banner">{message}</div>}

      <div className="main-grid">
        {/* ---- Current Token Display ---- */}
        <section className="card current-token-card">
          <h2>📢 Now Serving</h2>
          <div className="token-display">
            {currentToken ? (
              <span className="token-number serving">
                #{currentToken.token_number}
              </span>
            ) : (
              <span className="no-token">No token being served</span>
            )}
          </div>
        </section>

        {/* ---- Get Token Section (User) ---- */}
        <section className="card get-token-card">
          <h2>🎫 Get Your Token</h2>
          <button
            className="btn btn-primary"
            onClick={handleGetToken}
            disabled={loading}
          >
            {loading ? "Generating..." : "Get Token"}
          </button>
          {lastGeneratedToken && (
            <div className="generated-token">
              <p>Your token number:</p>
              <span className="token-number">
                #{lastGeneratedToken.token_number}
              </span>
              <p className="hint">Please wait for your number to be called.</p>
            </div>
          )}
        </section>

        {/* ---- Waiting Queue ---- */}
        <section className="card queue-card">
          <h2>⏳ Waiting Queue</h2>
          {waitingQueue.length === 0 ? (
            <p className="empty-queue">No tokens in the waiting queue.</p>
          ) : (
            <div className="queue-list">
              {waitingQueue.map((token, index) => (
                <div key={token.id} className="queue-item">
                  <span className="queue-position">{index + 1}</span>
                  <span className="queue-token">
                    Token #{token.token_number}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="queue-count">
            Total waiting: <strong>{waitingQueue.length}</strong>
          </p>
        </section>

        {/* ---- Admin Section ---- */}
        <section className="card admin-card">
          <h2>🔧 Admin Panel</h2>
          <p className="admin-info">Call the next token in the queue.</p>
          <button
            className="btn btn-admin"
            onClick={handleCallNext}
            disabled={loading}
          >
            {loading ? "Processing..." : "📣 Call Next Token"}
          </button>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Queue Management System &copy; 2026</p>
      </footer>
    </div>
  );
}

export default App;
