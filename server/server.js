import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000; // Changed to 5000 to match the proxy in frontend package.json

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "productivity",
  password: "Sakshamt@12",
  port: 5432,
});

db.connect();
// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON parsing
app.use(express.static("public"));

// Serve React app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// API Routes
app.post("/api/register", async (req, res) => {
  const email = req.body.email; // Changed from username to email
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
  const email = req.body.email; // Changed from username to email
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

// Catch all handler for React Router
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});