// server/src/index.ts
import express from "express";
import path from "path";

const app = express();

// Correct path for the deployed static frontend
const buildPath = path.join(__dirname, "../build");
app.use(express.static(buildPath));

// Catch-all to send the index.html for any request
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});