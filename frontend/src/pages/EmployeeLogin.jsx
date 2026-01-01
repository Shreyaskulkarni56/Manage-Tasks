import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../Services/api";
import "./Login.css";

const EmployeeLogin = () => {
  console.log("EmployeeLogin component rendered");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // WHY: Backend route is /api/users/login, not /api/auth/login
      const res = await API.post("/users/login", {
        email,
        password,
      });

      // WHY: Store all user data in localStorage for easy access
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("userName", res.data.name);

      // WHY: Check if user is actually an employee
      if (res.data.role !== "employee") {
        localStorage.clear();
        setError("Access denied. Employee account required.");
        setLoading(false);
        return;
      }

      // WHY: Use navigate() instead of window.location.href for better React performance
      navigate("/employee/dashboard");
    } catch (err) {
      // WHY: Better error handling with specific messages
      console.error("Login error:", err);
      
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response received
        errorMessage = "Cannot connect to server. Make sure backend is running on port 8080.";
      } else {
        // Error setting up request
        errorMessage = err.message || "An error occurred. Please try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Employee Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "#667eea", textDecoration: "none" }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
