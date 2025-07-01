import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "productivity",
  password: process.env.DB.PASSWORD,
  port: 5432,
});

db.connect();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Serve React app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// API Routes
app.post("/api/register", async (req, res) => {
  console.log("Received /api/register:", req.body);
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(400).json({ error: "Email already exists. Try logging in." });
    } else {
      const result = await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
        [email, password]
      );
      console.log(result);
      res.status(201).json({ 
        message: "User created successfully", 
        userId: result.rows[0].id 
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        res.json({ 
          message: "Login successful", 
          user: { id: user.id, email: user.email } 
        });
      } else {
        res.status(401).json({ error: "Incorrect Password" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all tasks for a user
app.get("/api/tasks/:userId", async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const result = await db.query(
      `SELECT 
        id, 
        text, 
        created_at, 
        completed_at, 
        time_spent,
        minutes,
        CASE 
          WHEN completed_at IS NULL THEN 'pending'
          ELSE 'completed'
        END as status
      FROM tasks 
      WHERE user_id = $1 
      ORDER BY 
        CASE WHEN completed_at IS NULL THEN 0 ELSE 1 END,
        created_at DESC`,
      [userId]
    );
    
    // Separate pending and completed tasks
    const pendingTasks = result.rows
      .filter(task => task.status === 'pending')
      .map(task => ({
        id: task.id,
        text: task.text,
        createdAt: new Date(task.created_at).toLocaleDateString(),
        minutes: task.minutes
      }));
    
    const completedTasks = result.rows
      .filter(task => task.status === 'completed')
      .map(task => ({
        id: task.id,
        text: task.text,
        timeSpent: task.time_spent,
        completedAt: new Date(task.completed_at).toLocaleDateString(),
        minutes: task.minutes
      }));
    
    res.json({
      pending: pendingTasks,
      completed: completedTasks
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new task
app.post("/api/tasks", async (req, res) => {
  const { userId, text, minutes } = req.body;
  console.log("New Task Request:", { userId, text, minutes });

  if (!userId || !text) {
    return res.status(400).json({ error: "Missing userId or text" });
  }

  try {
    const result = await db.query(
      "INSERT INTO tasks (user_id, text, created_at, minutes) VALUES ($1, $2, CURRENT_DATE, $3) RETURNING *",
      [userId, text, minutes || 25]
    );
    
    // Return the task in the format expected by frontend
    const newTask = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      createdAt: new Date(result.rows[0].created_at).toLocaleDateString(),
      minutes: result.rows[0].minutes
    };
    
    res.status(201).json(newTask);
  } catch (err) {
    console.error("DB error while inserting task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Mark task as complete (used when timer ends or manual completion)
app.put("/api/tasks/:id/complete", async (req, res) => {
  const taskId = req.params.id;
  const { timeSpent } = req.body;
  
  if (!timeSpent) {
    return res.status(400).json({ error: "Time spent is required" });
  }
  
  try {
    const result = await db.query(
      "UPDATE tasks SET completed_at = CURRENT_TIMESTAMP, time_spent = $1 WHERE id = $2 RETURNING *",
      [timeSpent, taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    // Return the completed task in the format expected by frontend
    const completedTask = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      timeSpent: result.rows[0].time_spent,
      completedAt: new Date(result.rows[0].completed_at).toLocaleDateString()
    };
    
    res.json(completedTask);
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const result = await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Timer session endpoints (optional - for tracking timer sessions)
app.post("/api/timer-sessions", async (req, res) => {
  const { userId, taskId, duration, startedAt, endedAt } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO timer_sessions (user_id, task_id, duration_minutes, started_at, ended_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, taskId, duration, startedAt, endedAt]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving timer session:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get timer statistics for a user
app.get("/api/timer-stats/:userId", async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_minutes,
        AVG(duration_minutes) as avg_session_length,
        COUNT(DISTINCT task_id) as tasks_worked_on
       FROM timer_sessions 
       WHERE user_id = $1`,
      [userId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching timer stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Debug middleware
app.use((req, res, next) => {
  console.log("Unhandled request:", req.method, req.url);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});