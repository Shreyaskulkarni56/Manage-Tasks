const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getMe,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getEmployees,
} = require("../controllers/usercontroller");

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.get("/me", protect, getMe);

// Employees
router.get("/employees", protect, getEmployees);

// CRUD users
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
