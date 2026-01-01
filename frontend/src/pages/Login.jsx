import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../Services/api";
import "../styles/common.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    // 🔴 MANUAL REQUIRED VALIDATION
    if (!email.trim() && !password.trim()) {
      alert("Please fill all fields");
      return;
    }
  
    if (!email.trim()) {
      alert("Please fill email");
      return;
    }
  
    if (!password.trim()) {
      alert("Please fill password");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await API.post("/users/login", {
        email,
        password,
      });
  
      // ✅ Store auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("userName", res.data.name);
  
      // ✅ Auto-redirect based on backend role
      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "employee") {
        navigate("/employee/dashboard");
      } else {
        setError("Invalid user role.");
        localStorage.clear();
      }
  
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              
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

export default Login;

