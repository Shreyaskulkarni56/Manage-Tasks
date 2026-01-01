import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import "../styles/common.css";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // WHY: useCallback memoizes the function so it doesn't change on every render
  // This prevents infinite loops when used in useEffect dependencies
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // WHY: Fetch all tasks, then filter for current employee
      // This approach is simpler than creating a backend endpoint for employee-specific tasks
      const tasksRes = await API.get("/tasks");
      const currentUserId = localStorage.getItem("userId");
      
      // WHY: Filter tasks to show only those assigned to the logged-in employee
      // Employees should only see their own tasks, not all tasks
      const myTasks = tasksRes.data.filter(
        (task) => task.assignedTo === currentUserId
      );
      setTasks(myTasks);
    } catch (error) {
      console.error("Error fetching data:", error);
      // WHY: Check if error is due to authentication failure
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/employee/login");
        return;
      }
      alert("Failed to load data. Please check your connection.");
    } finally {
      // WHY: finally block always runs, ensuring loading state is reset
      setLoading(false);
    }
  }, [navigate]);

  // WHY: useEffect runs once on component mount
  // This checks authentication and loads initial data
  useEffect(() => {
    // WHY: Check authentication before loading data
    // Prevents unauthorized access and API errors
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "employee") {
      // WHY: Redirect to login if not authenticated or not employee
      navigate("/employee/login");
      return;
    }

    fetchData();
  }, [navigate, fetchData]);

  // WHY: Update only the status field, not the entire task
  // Employees can update task status but cannot modify other fields
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      // WHY: PUT request updates the task with new status
      // Only sending status field (partial update)
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      // WHY: Refresh data to show updated status immediately
      fetchData();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status.");
    }
  };

  // WHY: Clear all authentication data on logout
  // This ensures user can't access protected routes after logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/employee/login");
  };

  // WHY: Show loading state while fetching data
  // Prevents showing empty/broken UI during API calls
  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        {/* WHY: Display user name if available for better UX */}
        {localStorage.getItem("userName") && (
          <span className="user-name">Welcome, {localStorage.getItem("userName")}</span>
        )}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="tasks-header">
          <h2>My Tasks ({tasks.length})</h2>
        </div>

        <div className="tasks-list">
          {/* WHY: Conditional rendering - show message if no tasks
              Otherwise show the task grid */}
          {tasks.length === 0 ? (
            <div className="no-tasks">No tasks assigned to you yet.</div>
          ) : (
            // WHY: CSS Grid layout - responsive and clean
            // Automatically adjusts columns based on screen size
            <div className="tasks-grid">
              {/* WHY: map() renders each task as a card
                  key prop is required by React for list rendering */}
              {tasks.map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    {/* WHY: Dynamic className based on status
                        Allows different styling for pending/completed */}
                    <span className={`status-badge ${task.status}`}>
                      {task.status}
                    </span>
                  </div>
                  {/* WHY: Conditional rendering - only show description if it exists
                      && operator is shorthand for conditional rendering */}
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-info">
                    <p>
                      {/* WHY: Format date for better readability
                          toLocaleDateString() converts to user's locale format */}
                      <strong>Created:</strong>{" "}
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                      <p>
                        <strong>Updated:</strong>{" "}
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="task-actions employee-actions">
                    {/* WHY: Employees can only update status, not delete tasks
                        This is a security/authorization best practice */}
                    <label htmlFor={`status-${task._id}`} className="status-label">
                      Update Status:
                    </label>
                    <select
                      id={`status-${task._id}`}
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

