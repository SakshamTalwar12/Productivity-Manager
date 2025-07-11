import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import "../styles/Dashboard.css";
import ScrollAnimation from "./ScrollAnimation.jsx";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';


function calculateStreak(dates) {
  if (!dates.length) return 0;

  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b - a); // Sort descending

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);

    if (i === 0 && date.getTime() !== today.getTime()) {
      // If user didn't log in today, streak ends
      if (date.getTime() === today.getTime() - 86400000) {
        streak = 1;
        today = date;
      } else {
        break;
      }
    } else if (date.getTime() === today.getTime()) {
      streak++;
      today.setDate(today.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loginDates, setLoginDates] = useState([]);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      fetch(`${process.env.REACT_APP_API_URL}/api/login-dates/${user.id}`)
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
            <div className="calendar-day-content">
              <div className="day-number">{format(day, "d")}</div>
              {loginDates.includes(format(day, "yyyy-MM-dd")) && (
                <div className="tick">✓</div>
              )}
            </div>
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

function RemindersSection() {
  const [reminders, setReminders] = useState([]);
  const isFirstLoad = useRef(true); // 👈 Track first mount only

  // Load reminders from localStorage on first mount
  useEffect(() => {
    const storedReminders = localStorage.getItem("reminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
  }, []);

  // Save reminders only after first load
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: '',
    time: '',
    priority: 'medium'
  });

  const handleRemoveReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const handleAddReminder = () => {
    if (newReminder.title.trim() === '') return;

    const reminder = {
      id: Date.now(),
      title: newReminder.title,
      date: newReminder.date,
      time: newReminder.time,
      priority: newReminder.priority
    };

    setReminders([...reminders, reminder]);
    setNewReminder({
      title: '',
      date: '',
      time: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setNewReminder({
      title: '',
      date: '',
      time: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  const formatDateTime = (date, time) => {
    if (!date && !time) return '';

    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    if (time) {
      const timeObj = new Date(`2000-01-01T${time}`);
      const formattedTime = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${formattedDate} at ${formattedTime}`;
    }

    return formattedDate;
  };

  return (
    <div className="grid-item reminders-section">
      <h3>Reminders</h3>
      
      {reminders.length === 0 ? (
        <div className="empty-reminders">
          <i className="fas fa-bell-slash"></i>
          <p>No reminders set</p>
        </div>
      ) : (
        <div className="reminders-container">
          {reminders.map(reminder => (
            <div key={reminder.id} className="reminder-item">
              <div className="reminder-content">
                <div className="priority-title">
                  <span className={`priority ${reminder.priority}`}>
                    {reminder.priority}
                  </span>
                </div>
                <div className="reminder-title">{reminder.title}</div>
                <div className="reminder-datetime">
                  <i className="fas fa-calendar-alt"></i>
                  {formatDateTime(reminder.date, reminder.time)}
                </div>
              </div>
              <div className="reminder-actions">
                <button 
                  className="action-btn tick-btn"
                  onClick={() => handleRemoveReminder(reminder.id)}
                  title="Mark as completed"
                >
                  ✓
                </button>
                <button 
                  className="action-btn cross-btn"
                  onClick={() => handleRemoveReminder(reminder.id)}
                  title="Remove reminder"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!showAddForm ? (
        <button 
          className="add-reminder-btn"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i>
          Add Reminder
        </button>
      ) : (
        <div className="add-reminder-form">
          <div className="form-group">
            <label htmlFor="reminder-title">Task Name</label>
            <input
              id="reminder-title"
              type="text"
              placeholder="Enter task name..."
              value={newReminder.title}
              onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
            />
          </div>
          
          <div className="datetime-group">
            <div className="form-group">
              <label htmlFor="reminder-date">Date</label>
              <input
                id="reminder-date"
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
              />
            </div>
            <div className="form-group">
  <label htmlFor="reminder-time">Time</label>
  <input
  id="reminder-time"
  type="time"
  value={newReminder.time}
  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
/>

</div>

          </div>
          
          <div className="form-group">
            <label htmlFor="reminder-priority">Priority</label>
            <select
              id="reminder-priority"
              value={newReminder.priority}
              onChange={(e) => setNewReminder({...newReminder, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button className="form-btn cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="form-btn save-btn" onClick={handleAddReminder}>
              Save Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


const COLORS = ['#b19cd9', '#d53f8c', '#f97316', '#22c55e', '#dc2626', '#9c89c9', '#16a34a'];

function ProductivityPieChart() {
  const [taskData, setTaskData] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      fetch(`${process.env.REACT_APP_API_URL}/api/recent-tasks/${user.id}`)  // Replace with your backend route
        .then(res => res.json())
        .then(data => {
          const tasks = (data || []).slice(0, 7).map(task => ({
            name: task.title || `Task ${task.id}`,
            value: task.time_spent || 0,
          }));
          setTaskData(tasks);
        });
    }
  }, []);

  if (taskData.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '1rem', color: '#aaa' }}>No recent tasks to show.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={taskData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label={({ name, value }) => `${name}: ${value} min${value === 1 ? '' : 's'}`}
    >
      {taskData.map((_, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value) => `${value} min${value === 1 ? '' : 's'}`}
    />
    <Legend />
  </PieChart>
</ResponsiveContainer>

  );
}

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    completed_tasks: 0,
    total_tasks: 0,
    total_hours: 0
  });
  const [loginDates, setLoginDates] = useState([]);
  const [streak, setStreak] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);

      const userId = JSON.parse(user).id;

      // Fetch dashboard stats
      fetch(`${process.env.REACT_APP_API_URL}/api/dashboard-stats/${userId}`)
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

      // Fetch login dates and calculate streak
      fetch(`${process.env.REACT_APP_API_URL}/api/login-dates/${userId}`)
        .then(res => res.json())
        .then(data => {
          const dates = data.loginDates || [];
          setLoginDates(dates);
          const streakCount = calculateStreak(dates);
          setStreak(streakCount);
        })
        .catch(err => console.error("Failed to load login dates", err));
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
                  <p>{streak} {streak === 1 ? "day" : "days"}</p>
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
            <RemindersSection />
            <div className="grid-item productivity-trends" id="productivity-section">
              <h3>Productivity Trends</h3>
              <ProductivityPieChart />
              <div className="calendar-integration">
                <button id="authorize_button" style={{ visibility: 'hidden' }}>
                  Authorize Calendar
                </button>
              </div>
              <p style={{  color: '#aaa', fontSize: '0.95rem', textAlign: 'center' }}>
  This chart shows a comprehensive breakdown of the last 7 tasks you completed, based on time spent.
</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;