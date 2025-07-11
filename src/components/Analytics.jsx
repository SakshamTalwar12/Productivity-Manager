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
  const [userTasks, setUserTasks] = useState([]);
  const [showHistogram, setShowHistogram] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    // Fetch user tasks if logged in
    if (user) {
      const userObj = JSON.parse(user);
      fetchUserTasks(userObj.id);
    }
    setShowHistogram(false); // Reset on mount
  }, []);

  useEffect(() => {
    setShowHistogram(false); // Reset when period changes
  }, [selectedPeriod]);

  const fetchUserTasks = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${userId}`);
      const data = await response.json();
      // Combine pending and completed for context
      setUserTasks([...(data.pending || []), ...(data.completed || [])]);
    } catch (err) {
      console.error('Error fetching user tasks:', err);
    }
  };
  
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
      
      const filteredTasks = getFilteredTasks();
      const totalTimeSpent = filteredTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
      const averageTime = filteredTasks.length > 0 ? Math.round(totalTimeSpent / filteredTasks.length) : 0;
      
      const period = selectedPeriod === 'last-week' ? 'last week' : 'last month';
      setAnalyticsResult(
        `Analytics for ${period}: ${filteredTasks.length} tasks completed, ${totalTimeSpent} minutes total, ${averageTime} minutes average per task.`
      );
      setShowHistogram(true); // Show histogram after analysis
    } catch (error) {
      console.error('Error getting analytics:', error);
      setAnalyticsResult('Error generating analytics. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFilteredTasks = () => {
    const now = new Date();
    let cutoffDate;

    if (selectedPeriod === 'last-week') {
      // Get tasks from the last 7 days
      cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    } else {
      // Get tasks from the last 30 days
      cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    return userTasks.filter(task => {
      if (!task.completedAt) return false;
      
      // Parse the date string (assuming format like "12/25/2024")
      const taskDate = new Date(task.completedAt);
      
      // Check if the date is valid and within the selected period
      return !isNaN(taskDate.getTime()) && taskDate >= cutoffDate && taskDate <= now;
    });
  };

  // Get the last 7 completed tasks for histogram
  const getHistogramData = () => {
    const filteredTasks = getFilteredTasks();
    
    // Sort by completion date (most recent first) and take last 7
    const sortedTasks = filteredTasks
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 7)
      .reverse(); // Reverse to show oldest to newest in histogram
    
    return sortedTasks.map(task => ({
      name: task.text.length > 12 ? task.text.substring(0, 12) + '...' : task.text,
      timeSpent: task.timeSpent || 0,
      fullName: task.text,
      id: task.id
    }));
  };

  const handleGetResponse = async () => {
    if (!question.trim()) return;
    setIsGettingResponse(true);
    try {
      // Filter tasks based on selected period
      const filteredTasks = getFilteredTasks();
      
      console.log('Filtered tasks for', selectedPeriod, ':', filteredTasks);
      
      // Prepare minimal task info for backend
      const tasksForAI = filteredTasks.map(task => ({
        name: task.text,
        timeSpent: task.timeSpent || task.minutes || 0,
        completedAt: task.completedAt
      }));
      
      console.log('Tasks being sent to AI:', tasksForAI);
      
      // Send question and tasks to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: question,
          tasks: tasksForAI
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChatResponse(data.response || 'No response from AI.');
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

  // Get count of filtered tasks for display
  const filteredTasksCount = getFilteredTasks().length;
  const histogramData = getHistogramData();

  // Calculate max value for scaling
  const maxTimeSpent = Math.max(...histogramData.map(item => item.timeSpent), 1);

  const yAxisTicks = (() => {
    const ticks = [];
    let lastValue = null;
    for (let i = 0; i < 6; i++) {
      const value = Math.round((maxTimeSpent * (5 - i)) / 5);
      if (value !== lastValue) {
        ticks.push(<div key={i} className="y-tick">{value}</div>);
        lastValue = value;
      }
    }
    return ticks;
  })();

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
              {showHistogram && histogramData.length > 0 ? (
                <div className="histogram-container">
                  <h3 className="histogram-title">Time Spent on Recent Tasks</h3>
                  <div className="histogram-chart">
                    <div className="histogram-y-axis">
                      <div className="y-axis-label">Time (minutes)</div>
                      <div className="y-axis-ticks">
                        {yAxisTicks}
                      </div>
                    </div>
                    <div className="histogram-bars">
                      {histogramData.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="histogram-bar-container">
                          <div 
                            className="histogram-bar"
                            style={{
                              height: `${Math.max((item.timeSpent / maxTimeSpent) * 100, 5)}%`,
                              animationDelay: `${index * 0.1}s`
                            }}
                            title={`${item.fullName}: ${item.timeSpent} minutes`}
                          >
                            <span className="bar-value">{item.timeSpent}m</span>
                          </div>
                          <div className="histogram-label" title={item.fullName}>
                            {item.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="histogram-footer">
                    <p>Showing last {histogramData.length} completed tasks ({selectedPeriod === 'last-week' ? 'last week' : 'last month'})</p>
                  </div>
                </div>
              ) : analyticsResult ? (
                <div className="analytics-result">
                  <i className="fas fa-chart-line"></i>
                  <p>{analyticsResult}</p>
                </div>
              ) : (
                <div className="analytics-placeholder">
                  <i className="fas fa-chart-bar"></i>
                  <p>No completed tasks found for {selectedPeriod === 'last-week' ? 'last week' : 'last month'}</p>
                  <p className="task-count">
                    {filteredTasksCount} completed tasks in selected period
                  </p>
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
              disabled={isAnalyzing || filteredTasksCount === 0}
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-bar"></i>
                  Analyze Tasks
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add extra spacing between histogram and Gemini sections */}
        <div style={{ marginTop: '48px' }}></div>

        {/* Gemini (AI chat) Section */}
        <div className="gemini-section">
          <div className="chat-box">
            <div className="chat-content">
              {chatResponse ? (
                <div className="chat-result">
                  <i className="fas fa-robot"></i>
                  <div className="chat-text">
                    <p>{chatResponse}</p>
                  </div>
                </div>
              ) : (
                <div className="chat-placeholder">
                  <i className="fas fa-comments"></i>
                  <p>Ask anything about your productivity data</p>
                  <p className="chat-help-text">
                    Try asking: "How productive was I this week?" or "What patterns do you see in my work?"
                  </p>
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
                placeholder="Ask about your productivity patterns..."
                className="question-input"
              />
              <small className="input-help">
                Analyzing {filteredTasksCount} tasks from {selectedPeriod === 'last-week' ? 'last week' : 'last month'}
              </small>
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