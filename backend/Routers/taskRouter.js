const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskcontroller");

// CREATE task
router.post("/", createTask);

// READ all tasks
router.get("/", getAllTasks);

// READ single task
router.get("/:id", getTaskById);

// UPDATE task
router.put("/:id", updateTask);

// DELETE task
router.delete("/:id", deleteTask);

module.exports = router;
