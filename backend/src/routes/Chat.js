// const express = require("express");
// const router = express.Router();

// router.post("/", (req, res) => {
//   console.log("✅ CHAT ROUTE HIT");
//   res.json({ reply: "Coffee Buddy connected ☕" });
// });

// module.exports = router;
const express = require("express");
const axios = require("axios");
const router = express.Router();



// Define the Python Microservice URL
// Use environment variable for production, fallback to localhost for development
const CAFE_BOT_BASE_URL = process.env.CAFE_BOT_URL || "https://brewaibot-production.up.railway.app";
const PYTHON_API_URL = `${CAFE_BOT_BASE_URL}/chat/stream`; 

router.post("/", async (req, res) => {
  console.log("✅ CHAT ROUTE HIT");
  const { message, session_id } = req.body;

  // Validation
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // 1. Forward request to Python FastAPI
    const response = await axios({
      method: "post",
      url: PYTHON_API_URL,
      data: {
        message: message,
        session_id: session_id || "default_user",
      },
      responseType: "stream", // CRITICAL: Tell axios to expect a stream
      // 🔥 Streaming safety (Fix 4)
      timeout: 0,                 // Never timeout streaming
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // 2. Set Headers for the Frontend
    // 'Transfer-Encoding: chunked' lets the browser know data is coming in pieces
    // res.setHeader("Content-Type", "text/plain");
    // res.setHeader("Transfer-Encoding", "chunked");
    // 2. Set Headers for Streaming (CRITICAL)
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // 🔥 Force headers to flush immediately
    res.flushHeaders();

    // 3. Pipe the Python Stream directly to the Express Response
    // This connects the "faucet" from Python to the "hose" going to React
    response.data.pipe(res);

    // Optional: Log when stream ends
    response.data.on("end", () => {
      console.log("✅ Stream finished successfully");
    });

  } catch (error) {
    console.error("❌ Error connecting to Python Bot:", error.message);
    
    // Check if the error came from the Python server
    if (error.response) {
      console.error("Python Status:", error.response.status);
      return res.status(error.response.status).json({ error: "Bot service error" });
    }
    
    // Otherwise, it's a connection error (is Python running?)
    res.status(503).json({ 
      error: "Coffee Buddy is sleeping (Service Unavailable). Make sure uvicorn is running!" 
    });
  }
});

module.exports = router;