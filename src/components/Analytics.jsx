import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Analytics.css';

function Analytics() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last-week');
  const [question, setQuestion] = useState('');
  const [analyticsResult, setAnalyticsResult] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGettingResponse, setIsGettingResponse] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('timerState');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate API call for analytics
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const period = selectedPeriod === 'last-week' ? 'last week' : 'last month';
      setAnalyticsResult(`Analytics for ${period} generated successfully! Here's your productivity summary...`);
    } catch (error) {
      console.error('Error getting analytics:', error);
      setAnalyticsResult('Error generating analytics. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetResponse = async () => {
    if (!question.trim()) return;
    
    setIsGettingResponse(true);
    try {
      // Simulate API call for chat response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setChatResponse(`Here's the response to your question: "${question}". This is where the AI-generated answer would appear.`);
    } catch (error) {
      console.error('Error getting response:', error);
      setChatResponse('Error getting response. Please try again.');
    } finally {
      setIsGettingResponse(false);
    }
  };

  const handleQuestionKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGetResponse();
    }
  };

  return (
    <>
      <nav>
        <div className="logo">
          <svg className="logo-svg" width="50" height="50" viewBox="0 0 50 50">
            <polygon
              className="logo-hex"
              points="25,2 45,13.5 45,36.5 25,48 5,36.5 5,13.5"
              fill="none"
              stroke="#b19cd9"
              strokeWidth="2"
            />
            <line className="logo-line" x1="15" y1="25" x2="35" y2="25" stroke="#b19cd9" strokeWidth="2" />
            <line className="logo-line" x1="25" y1="15" x2="25" y2="35" stroke="#b19cd9" strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" className="logo-text">PM</text>
          </svg>
          <span className="logo-text-full">
            Productivity<span className="accent">Manager</span>
          </span>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/todo">My Tasks</Link></li>
          <li><a href="#features">Features</a></li>
          <li><Link to="/about">About</Link></li>
          {isLoggedIn ? (
            <li><button onClick={handleLogout} className="login-button">Logout</button></li>
          ) : (
            <li><Link to="/login" className="login-button">Login</Link></li>
          )}
        </ul>
      </nav>

      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p>Get insights into your productivity patterns</p>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <div className="analytics-box">
            <div className="analytics-content">
              {analyticsResult ? (
                <div className="analytics-result">
                  <i className="fas fa-chart-line"></i>
                  <p>{analyticsResult}</p>
                </div>
              ) : (
                <div className="analytics-placeholder">
                  <i className="fas fa-analytics"></i>
                  <p>Get analytics for {selectedPeriod === 'last-week' ? 'last week' : 'last month'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="analytics-controls">
            <div className="period-selector">
              <label htmlFor="period-select">Select Period:</label>
              <select 
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-dropdown"
              >
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
              </select>
            </div>

            <button 
              onClick={handleAnalyze}
              className="analyze-btn"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-bar"></i>
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="chat-section">
          <div className="chat-box">
            <div className="chat-content">
              {chatResponse ? (
                <div className="chat-result">
                  <i className="fas fa-robot"></i>
                  <p>{chatResponse}</p>
                </div>
              ) : (
                <div className="chat-placeholder">
                  <i className="fas fa-comments"></i>
                  <p>Ask anything about your productivity data</p>
                </div>
              )}
            </div>
          </div>

          <div className="chat-controls">
            <div className="question-input-container">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleQuestionKeyPress}
                placeholder="Ask anything..."
                className="question-input"
              />
            </div>

            <button 
              onClick={handleGetResponse}
              className="response-btn"
              disabled={isGettingResponse || !question.trim()}
            >
              {isGettingResponse ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Getting Response...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Get Response
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;