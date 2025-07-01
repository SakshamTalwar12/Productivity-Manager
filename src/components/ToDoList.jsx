import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ToDoList.css';

function ToDoList() {
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

  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [timeModal, setTimeModal] = useState({ show: false, task: null });
  const [timeSpent, setTimeSpent] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(''); // for per-task time input

  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(25); // Default 25 minutes (Pomodoro style)
  const [currentTime, setCurrentTime] = useState(0); // Current time in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isPaused && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            setIsPaused(false);
            // Timer finished - you could add notification here
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isTimerRunning || isPaused || currentTime === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused, currentTime]);

  // Timer functions
  const increaseTimer = () => {
    if (!isTimerRunning) {
      setTimerMinutes(prev => prev + 10);
      setCurrentTime((timerMinutes + 10) * 60);
    }
  };

  const decreaseTimer = () => {
    if (!isTimerRunning && timerMinutes > 10) {
      setTimerMinutes(prev => prev - 10);
      setCurrentTime((timerMinutes - 10) * 60);
    }
  };

  const startTimer = (task = null) => {
    if (task) {
      setActiveTask(task);
      setCurrentTime((task.minutes || 25) * 60);
      setTimerMinutes(task.minutes || 25);
    }
    setIsTimerRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const endTimer = () => {
    if (activeTask) {
      const timeWorked = Math.ceil((timerMinutes * 60 - currentTime) / 60);
      completeTaskWithTimer(activeTask, `${timeWorked} minutes`);
    }
    resetTimer();
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    setCurrentTime(timerMinutes * 60);
    setActiveTask(null);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTask = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (newTask.trim() && user) {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, text: newTask, minutes: parseInt(newTaskTime, 10) || 25 })
      })
      .then(res => res.json())
      .then(task => {
        setTasks(prev => [...prev, task]);
        setNewTask('');
        setNewTaskTime('');
        setShowAddTask(false);
      });
    }
  };

  const deleteTask = (taskId) => {
    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      .then(() => setTasks(prev => prev.filter(task => task.id !== taskId)));
  };

  const completeTask = (task) => {
    setTimeModal({ show: true, task });
  };

  const completeTaskWithTimer = (task, timeSpent) => {
    fetch(`/api/tasks/${task.id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSpent })
    })
    .then(res => res.json())
    .then(completedTask => {
      setCompletedTasks(prev => [...prev, completedTask]);
      setTasks(prev => prev.filter(t => t.id !== task.id));
    });
  };

  const handleTimeSubmit = () => {
    if (timeSpent.trim() && timeModal.task) {
      const completedTask = {
        ...timeModal.task,
        timeSpent: timeSpent.trim(),
        completedAt: new Date().toLocaleDateString()
      };
      
      setCompletedTasks([...completedTasks, completedTask]);
      setTasks(tasks.filter(task => task.id !== timeModal.task.id));
      setTimeModal({ show: false, task: null });
      setTimeSpent('');
    }
  };

  const deleteCompletedTask = (taskId) => {
    setCompletedTasks(completedTasks.filter(task => task.id !== taskId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const handleTimeKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTimeSubmit();
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetch(`/api/tasks/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setTasks(data.pending || []);
          setCompletedTasks(data.completed || []);
        });
    }
  }, []);

  return (
    <>
      <div className="todo-timer-top">
        <div className="todo-timer-display">{formatTime(currentTime)}</div>
        <div className="todo-timer-label">
          {activeTask ? `Working on: ${activeTask.text.substring(0, 20)}...` : 'Ready to focus'}
        </div>
        <div className="todo-timer-controls">
          {!isTimerRunning ? (
            <button className="todo-timer-btn start" onClick={() => activeTask && startTimer(activeTask)} disabled={!activeTask} title="Start timer">
              <i className="fas fa-play"></i>
            </button>
          ) : (
            <>
              <button className="todo-timer-btn pause" onClick={pauseTimer} title={isPaused ? 'Resume' : 'Pause'}>
                <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
              </button>
              <button className="todo-timer-btn end" onClick={endTimer} title="End timer and complete task">
                <i className="fas fa-stop"></i>
              </button>
            </>
          )}
        </div>
        {activeTask && <div className="todo-timer-task-time">Time set: {activeTask.minutes} min</div>}
      </div>
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
          <li><a href="#analytics">Analytics</a></li>
          <li><a href="#features">Features</a></li>
          <li><Link to="/about">About</Link></li>
          {isLoggedIn ? (
            <li><button onClick={handleLogout} className="login-button">Logout</button></li>
          ) : (
            <li><Link to="/login" className="login-button">Login</Link></li>
          )}
        </ul>
      </nav>

      <div className="todo-container">
        <div className="todo-header">
          <h1>My Tasks</h1>
          <p>Stay organized and productive</p>
        </div>

        {/* Pending Tasks Section */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>Pending Tasks</h2>
            <button 
              className="add-task-btn"
              onClick={() => setShowAddTask(true)}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          {showAddTask && (
            <div className="add-task-form">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your task..."
                autoFocus
              />
              <input
                type="number"
                min="1"
                value={newTaskTime}
                onChange={e => setNewTaskTime(e.target.value)}
                placeholder="Time (min)"
                className="add-task-time-input"
              />
              <div className="form-buttons">
                <button onClick={addTask} className="save-btn">Add</button>
                <button 
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTask('');
                    setNewTaskTime('');
                  }} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tasks"></i>
                <p>No pending tasks. Add a new task to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={`task-item ${activeTask && activeTask.id === task.id ? 'active-task' : ''}`}>
                  <div className="task-content">
                    <span className="task-text">{task.text}</span>
                    <span className="task-date">Added: {task.createdAt}</span>
                    <span className="task-time">Time: {task.minutes} min</span>
                  </div>
                  <div className="task-actions">
                    {/* Only show Start if not active, else show Pause/End */}
                    {activeTask && activeTask.id === task.id ? (
                      <>
                        {isTimerRunning ? (
                          <>
                            <button 
                              className="todo-timer-btn pause"
                              onClick={pauseTimer}
                              title={isPaused ? 'Resume' : 'Pause'}
                            >
                              <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
                            </button>
                            <button 
                              className="todo-timer-btn end"
                              onClick={endTimer}
                              title="End timer and complete task"
                            >
                              <i className="fas fa-stop"></i>
                            </button>
                          </>
                        ) : (
                          <button 
                            className="todo-timer-btn start"
                            onClick={() => startTimer(task)}
                            title="Start timer"
                          >
                            <i className="fas fa-play"></i>
                          </button>
                        )}
                      </>
                    ) : (
                      <button 
                        className="todo-timer-btn start"
                        onClick={() => {
                          setActiveTask(task);
                          setCurrentTime((task.minutes || 25) * 60);
                          setTimerMinutes(task.minutes || 25);
                        }}
                        title="Start working on this task"
                        disabled={isTimerRunning}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    )}
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="delete-btn"
                      title="Delete task"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks Section */}
        <div className="tasks-section completed-section">
          <div className="section-header">
            <h2>Completed Tasks</h2>
            <span className="completed-count">{completedTasks.length}</span>
          </div>

          <div className="tasks-list">
            {completedTasks.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-check-circle"></i>
                <p>No completed tasks yet. Complete a task to see it here!</p>
              </div>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="task-item completed-task">
                  <div className="task-content">
                    <span className="task-text">{task.text}</span>
                    <div className="task-details">
                      <span className="task-time">Time spent: {task.timeSpent}</span>
                      <span className="task-date">Completed: {task.completedAt}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button 
                      onClick={() => deleteCompletedTask(task.id)}
                      className="delete-btn"
                      title="Remove from completed"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Time Modal */}
        {timeModal.show && (
          <div className="modal-overlay">
            <div className="time-modal">
              <h3>Task Completed!</h3>
              <p>How much time did you spend on this task?</p>
              <div className="task-preview">
                <strong>"{timeModal.task?.text}"</strong>
              </div>
              <input
                type="text"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                onKeyPress={handleTimeKeyPress}
                placeholder="e.g., 2 hours, 30 minutes, 1h 30m"
                autoFocus
              />
              <div className="modal-buttons">
                <button onClick={handleTimeSubmit} className="save-btn">
                  Complete Task
                </button>
                <button 
                  onClick={() => {
                    setTimeModal({ show: false, task: null });
                    setTimeSpent('');
                  }} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ToDoList;