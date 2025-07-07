import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import "../styles/Dashboard.css";
import ScrollAnimation from "./ScrollAnimation.jsx";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';


function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loginDates, setLoginDates] = useState([]);
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.id) {
    fetch(`/api/login-dates/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setLoginDates(data.loginDates || []);
      })
      .catch(err => console.error("Failed to load login dates", err));
  }
}, []);


  const renderHeader = () => (
    <div className="calendar-header">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</button>
      <div className="calendar-month">{format(currentMonth, "MMMM yyyy")}</div>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "EE";
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="calendar-day-name" key={i}>
          {format(addDays(startDate, i), "EEE").slice(0, 2)}
        </div>
      );
    }
    return <div className="calendar-days-row">{days}</div>;
  };

  const renderCells = () => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      days.push(
        <div
          className={`calendar-cell ${
            !isSameMonth(day, monthStart) ? "disabled" : ""
          } ${isSameDay(day, selectedDate) ? "selected" : ""}`}
          key={day}
          onClick={() => setSelectedDate(cloneDay)}
        >
          <>
           <div className="calendar-day-content">
  <div className="day-number">{format(day, "d")}</div>
  {loginDates.includes(format(day, "yyyy-MM-dd")) && (
    <div className="tick">✓</div>
  )}
</div>
          </>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="calendar-row" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  return <div className="calendar-body">{rows}</div>;
};


  return (
    <div className="calendar-container">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    completed_tasks: 0,
    total_tasks: 0,
    total_hours: 0
  });
  
  const navigate=useNavigate();

   useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);

      const userId = JSON.parse(user).id;
      fetch(`/api/dashboard-stats/${userId}`)
        .then(res => res.json())
        .then(data => {
           console.log("📊 Type of total_hours:", typeof data.total_hours);
           console.log("📊 Value of total_hours:", data.total_hours);
          setDashboardStats({
            completed_tasks: data.completed_tasks || 0,
            total_tasks: data.total_tasks || 0,
            total_hours: data.total_hours || "0.00"
            
          });
        })
        .catch(err => console.error("Failed to fetch dashboard stats", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
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
          
          <div className="dashboard-layout">
            <div className="left-section">
              <div className="quick-stats">
                <div className="stat-card">
                  <i className="fas fa-check-circle"></i>
                   <h3>Tasks Completed Today:</h3>
                  <p>{dashboardStats.completed_tasks}/{dashboardStats.total_tasks}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-clock"></i>
                  <h3>Hours Focused Today</h3>
                  {console.log('total_hours:', dashboardStats.total_hours, 'Type:', typeof dashboardStats.total_hours)}
                  <p>
                    {(() => {
                      const str = String(dashboardStats.total_hours);
                      const [whole, decimal = "00"] = str.split(".");
                      return `${whole}.${decimal.slice(0, 2)}`;
                    })()}
                  </p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-star"></i>
                  <h3>Streak</h3>
                  <p>12 days</p>
                </div>
              </div>
            </div>

            <div className="right-section">
              <div className="activity-section">
                 <h2>Login Calendar</h2>
                  <Calendar />
              </div>
            </div>
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
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;