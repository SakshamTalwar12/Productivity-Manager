import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import "../styles/Dashboard.css";
import ScrollAnimation from "./ScrollAnimation.jsx";

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Check if user is logged in
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!user);
    }, []);
  
    const handleLogout = () => {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      navigate('/login');
    };
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setTimerMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                clearInterval(timerIntervalRef.current);
                setTimerRunning(false);
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (timerRunning) {
      clearInterval(timerIntervalRef.current);
      setTimerRunning(false);
    }
  };

  const resetTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerMinutes(25);
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <>
      <ScrollAnimation 
        selectors={{
          quickStats: '.quick-stats',
          activity: '.activity-section',
          dashboardGrid: '.dashboard-grid',
          gridItems: '.grid-item'
        }}
        thresholds={{
          quickStats: 0.2,
          activity: 0.3,
          dashboardGrid: 0.2,
          gridItems: 0.3
        }}
        cardSelectors=".stat-card, .grid-item"
        delay={150}
      />
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
          <li><Link to="/todo">My Tasks</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
          {/* <li><Link to="/dashboard">Dashboard</Link></li> */}
          {/* <li><a href="#progress">Progress</a></li> */}
          <li><a href="/#features">Features</a></li>
          <li><Link to="/about">About</Link></li>
          {isLoggedIn ? (
                      <li><button onClick={handleLogout} className="login-button">Logout</button></li>
                    ) : (
                      <li><Link to="/login" className="login-button">Login</Link></li>
                    )}
        </ul>
      </nav>

      <div className="dashboard-container">
        <main className="dashboard-main">
          <h1>Dashboard</h1>
          <div className="quick-stats">
            <div className="stat-card">
              <i className="fas fa-check-circle"></i>
              <h3>Tasks Completed</h3>
              <p>24/30</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-clock"></i>
              <h3>Hours Focused</h3>
              <p>6.5 hrs</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-star"></i>
              <h3>Streak</h3>
              <p>12 days</p>
            </div>
          </div>

          <div className="activity-section">
            <h2>Activity Overview</h2>
            <p className="no-chart-placeholder">Activity chart has been removed.</p>
          </div>

          <div className="dashboard-grid">
            <div className="grid-item tasks-due">
              <h3>Tasks Due Today</h3>
              <ul className="task-list">
                <li><span className="priority high">High</span> Complete Project Proposal</li>
                <li><span className="priority medium">Medium</span> Team Meeting at 2 PM</li>
                <li><span className="priority low">Low</span> Review Documentation</li>
              </ul>
            </div>
            <div className="grid-item productivity-trends" id="productivity-section">
              <h3>Productivity Trends</h3>
              <p className="no-chart-placeholder">Productivity chart has been removed.</p>
              <div className="calendar-integration">
                <button id="authorize_button" style={{ visibility: 'hidden' }}>
                  Authorize Calendar
                </button>
              </div>
            </div>
            <div className="grid-item focus-timer">
              <h3>Focus Timer</h3>
              <div className="timer-display">
                <span id="minutes">{formatTime(timerMinutes)}</span>:<span id="seconds">{formatTime(timerSeconds)}</span>
              </div>
              <div className="timer-controls">
                <button onClick={startTimer} className="timer-btn">
                  <i className="fas fa-play"></i>
                </button>
                <button onClick={pauseTimer} className="timer-btn">
                  <i className="fas fa-pause"></i>
                </button>
                <button onClick={resetTimer} className="timer-btn">
                  <i className="fas fa-redo"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;