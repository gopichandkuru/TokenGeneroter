// server.js — Express API Server (sqlite3)
const express = require("express");
const cors = require("cors");
const { dbRun, dbGet, dbAll, initializeDatabase } = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- API ENDPOINTS ---

// POST /api/token — Generate a new sequential token
app.post("/api/token", async (req, res) => {
  try {
    const row = await dbGet(
      "SELECT COALESCE(MAX(token_number), 0) AS max_token FROM tokens"
    );
    const nextTokenNumber = row.max_token + 1;

    await dbRun(
      "INSERT INTO tokens (token_number, status) VALUES (?, 'waiting')",
      [nextTokenNumber]
    );

    const newToken = await dbGet(
      "SELECT * FROM tokens WHERE token_number = ?",
      [nextTokenNumber]
    );

    console.log(`🎫 Token #${newToken.token_number} generated.`);
    res.status(201).json({
      message: `Token #${newToken.token_number} created successfully!`,
      token: newToken,
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    res.status(500).json({ error: "Failed to generate token." });
  }
});

// GET /api/current — Get the token currently being served
app.get("/api/current", async (req, res) => {
  try {
    const token = await dbGet(
      "SELECT * FROM tokens WHERE status = 'serving' LIMIT 1"
    );

    if (!token) {
      return res.json({
        message: "No token is currently being served.",
        token: null,
      });
    }

    res.json({ token });
  } catch (error) {
    console.error("Error fetching current token:", error.message);
    res.status(500).json({ error: "Failed to fetch current token." });
  }
});

// POST /api/next — Mark current as completed, serve next waiting token (FIFO)
app.post("/api/next", async (req, res) => {
  try {
    // Step 1: Complete the currently serving token
    await dbRun(
      "UPDATE tokens SET status = 'completed' WHERE status = 'serving'"
    );

    // Step 2: Find oldest waiting token
    const nextToken = await dbGet(
      "SELECT * FROM tokens WHERE status = 'waiting' ORDER BY token_number ASC LIMIT 1"
    );

    if (!nextToken) {
      console.log("📭 No more tokens in the waiting queue.");
      return res.json({
        message: "No more tokens in the waiting queue.",
        token: null,
      });
    }

    // Step 3: Mark it as serving
    await dbRun("UPDATE tokens SET status = 'serving' WHERE id = ?", [
      nextToken.id,
    ]);

    console.log(`📢 Now serving Token #${nextToken.token_number}`);
    res.json({
      message: `Now serving Token #${nextToken.token_number}`,
      token: { ...nextToken, status: "serving" },
    });
  } catch (error) {
    console.error("Error calling next token:", error.message);
    res.status(500).json({ error: "Failed to call next token." });
  }
});

// GET /api/queue — Get all waiting tokens in FIFO order
app.get("/api/queue", async (req, res) => {
  try {
    const queue = await dbAll(
      "SELECT * FROM tokens WHERE status = 'waiting' ORDER BY token_number ASC"
    );

    res.json({ queue });
  } catch (error) {
    console.error("Error fetching queue:", error.message);
    res.status(500).json({ error: "Failed to fetch queue." });
  }
});

// --- START SERVER ---
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
