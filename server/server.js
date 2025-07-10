import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import session from "express-session";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessary for Supabase SSL
  },
});

db.connect();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware (optional - you can remove this if not using session-based auth)
const isAuthenticated = (req, res, next) => {
  // Since you're using localStorage for auth, we'll skip session validation
  // You can implement this based on your auth strategy
  next();
};

// Serve React app
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

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
        await db.query(
    "INSERT INTO logins (user_id, login_date) VALUES ($1, CURRENT_DATE) ON CONFLICT DO NOTHING",
    [user.id]
  );
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
  console.log("🔍 Fetching tasks for userId:", userId);
  
  try {
    const result = await db.query(
      `SELECT 
        id, 
        text, 
        created_at, 
        completed_at, 
        time_spent,
        minutes,
        paused_at,
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
        createdAt: task.created_at ? new Date(task.created_at).toISOString() : null,
        minutes: task.minutes,
        pausedAt: task.paused_at
      }));
    
    const completedTasks = result.rows
      .filter(task => task.status === 'completed')
      .map(task => ({
        id: task.id,
        text: task.text,
        timeSpent: task.time_spent,
        completedAt: task.completed_at ? new Date(task.completed_at).toISOString() : null,
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
    
    console.log("✅ Task saved to DB:", result.rows[0]);
    
    // Return the task in the format expected by frontend
    const newTask = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      createdAt: result.rows[0].created_at ? new Date(result.rows[0].created_at).toISOString() : null,
      minutes: result.rows[0].minutes
    };
    
    console.log("📤 Sending task to frontend:", newTask);
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
  
  // Ensure timeSpent is a number
  const numericTimeSpent = parseInt(timeSpent, 10);
  
  console.log("🔄 Completing task:", { taskId, timeSpent, numericTimeSpent, type: typeof timeSpent });
  
  if (!timeSpent || isNaN(numericTimeSpent)) {
    return res.status(400).json({ error: "Valid time spent is required" });
  }
  
  try {
    console.log("🔍 About to update task with:", { taskId, timeSpent, timeSpentType: typeof timeSpent });
    
    const result = await db.query(
      "UPDATE tasks SET completed_at = CURRENT_TIMESTAMP, time_spent = $1 WHERE id = $2 RETURNING *",
      [numericTimeSpent, taskId]
    );
    
    console.log("✅ Task completion result:", result.rows[0]);
    console.log("✅ Completed_at value:", result.rows[0].completed_at);
    console.log("✅ Time_spent value:", result.rows[0].time_spent);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    // Return the completed task in the format expected by frontend
    const completedTask = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      timeSpent: result.rows[0].time_spent,
      completedAt: result.rows[0].completed_at ? new Date(result.rows[0].completed_at).toISOString() : null
    };
    
    console.log("📤 Sending completed task:", completedTask);
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

// Pause a task (update paused_at)
app.put("/api/tasks/:id/pause", async (req, res) => {
  const taskId = req.params.id;
  const { pausedAt } = req.body;

  try {
    const result = await db.query(
      "UPDATE tasks SET paused_at = $1 WHERE id = $2 RETURNING *",
      [pausedAt, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({
      id: result.rows[0].id,
      pausedAt: result.rows[0].paused_at
    });
  } catch (err) {
    console.error("Error updating pause state:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/login-dates/:userId", async (req, res) => {

  const userId = req.params.userId;



  try {

    const result = await db.query(

      "SELECT TO_CHAR(login_date, 'YYYY-MM-DD') as date FROM logins WHERE user_id = $1",

      [userId]

    );



    const dates = result.rows.map(row => row.date);

    res.json({ loginDates: dates });



  } catch (err) {

    console.error("Error fetching login dates:", err);

    res.status(500).json({ error: "Failed to fetch login dates" });

  }

});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Dashboard stats route
app.get("/api/dashboard-stats/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE completed_at::date = CURRENT_DATE) AS completed_tasks,
        COUNT(*) FILTER (
          WHERE completed_at::date = CURRENT_DATE OR completed_at IS NULL
        ) AS total_tasks,
        COALESCE(ROUND(SUM(
  CASE 
    WHEN completed_at::date = CURRENT_DATE THEN time_spent
    ELSE 0
  END
)::numeric / 60, 6), 0) AS total_hours

      FROM tasks
      WHERE user_id = $1
    `, [userId]);
    console.log("Dashboard Stats:", result.rows[0]);
    console.log("Type of total_hours:", typeof result.rows[0].total_hours);
    res.json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// GEMINI AI INTEGRATION - Generate response based on user tasks and question
app.post("/generate-response", async (req, res) => {
  try {
    const { prompt, tasks } = req.body;
    
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: "Invalid input",
        message: "Please provide a valid prompt" 
      });
    }

    // Create context from tasks
    let taskContext = "";
    if (tasks && tasks.length > 0) {
      taskContext = "\n\nHere are the user's recent completed tasks:\n";
      tasks.forEach((task, index) => {
        taskContext += `${index + 1}. Task: "${task.name}" - Time spent: ${task.timeSpent} minutes\n`;
      });
      taskContext += "\nPlease analyze this data and provide insights based on the user's question.";
    } else {
      taskContext = "\n\nNote: The user has no completed tasks in the selected time period.";
    }

    // Combine user prompt with task context
    const fullPrompt = `You are a productivity assistant. A user is asking about their work patterns and productivity.Consider everything that user puts in as task.

User's Question: "${fullPrompt}"

${taskContext}

Please provide a helpful, insightful response about their productivity patterns, suggestions for improvement, or answer their specific question based on the task data provided. Be encouraging and constructive in your response.`;

    console.log("🤖 Generating AI response for prompt:", prompt);
    console.log("📊 Task context:", taskContext);
    
    // Generate AI response
    const result = await model.generateContent(fullPrompt);
    const aiResponse = result.response.text();
    
    console.log("✅ AI Response generated successfully");
    
    // Return successful response
    res.json({ response: aiResponse });
    
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({ 
      error: "Server error", 
      message: "Failed to generate response. Please try again later." 
    });
  }
});


// Get 7 most recent completed tasks for pie chart
app.get("/api/recent-tasks/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      `SELECT id, text, time_spent, completed_at
       FROM tasks
       WHERE user_id = $1 AND completed_at IS NOT NULL
       ORDER BY completed_at DESC
       LIMIT 7`,
      [userId]
    );

    const recentTasks = result.rows.map(task => ({
      id: task.id,
      title: task.text,
      time_spent: task.time_spent,
      completed_at: task.completed_at,
    }));

    res.json(recentTasks);
  } catch (err) {
    console.error("Error fetching recent tasks:", err);
    res.status(500).json({ error: "Failed to fetch recent tasks" });
  }
});


// Serve static React build files
app.use(express.static(path.join(__dirname, "../build")));

// For any non-API routes, serve React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
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