const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to read JSON body

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes (CRUD)
app.use("/api/users", require("./Routers/userRouter"));
app.use("/api/tasks", require("./Routers/taskRouter"));

// Port
const PORT = process.env.PORT || 8080;  

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
