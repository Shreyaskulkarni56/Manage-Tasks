import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import "../styles/common.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [tasksRes, usersRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/users"),
      ]);
      setTasks(tasksRes.data);
      const employeeList = usersRes.data.filter((user) => user.role === "employee");
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching data:", error);
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/admin/login");
        return;
      }
      alert("Failed to load data. Please check your connection.");
    } finally {
      
      setLoading(false);
    }
  }, [navigate]); 

  useEffect(() => {
    
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
   
      navigate("/admin/login");
      return;
    }

    fetchData();
  }, [navigate, fetchData]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, 
    }));
  };

  
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    // 🔴 VALIDATION
    if (!formData.title.trim()) {
      setError("Please enter task title");
      return;
    }
  
    if (formData.title.trim().length < 3) {
      setError("Task title must be at least 3 characters");
      return;
    }
  
    if (!formData.assignedTo) {
      setError("Please select an employee");
      return;
    }
  
    if (!formData.description.trim()) {
      setError("Please enter task description");
      return;
    }
  
    if (formData.description.trim().length < 10) {
      setError("Task description must be at least 10 characters");
      return;
    }
  
    setLoading(true);
  
    try {
      const adminId = localStorage.getItem("userId");
  
      if (!adminId) {
        setError("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }
  
      await API.post("/tasks", {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        status: formData.status,
        createdBy: adminId,
      });
  
      setSuccess("Task created successfully");
  
      // ✅ Reset form
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        status: "pending",
      });
  
      setShowCreateForm(false);
      fetchData();
  
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to create task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  // WHY: Update only the status field, not the entire task
  // This is more efficient and follows RESTful API principles
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      // WHY: PUT request updates the task with new status
      // Only sending status field (partial update)
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      // WHY: Refresh data to show updated status immediately
      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task status.");
    }
  };

  // WHY: Confirmation dialog prevents accidental deletions
  // This is a good UX practice for destructive actions
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return; // WHY: Early return if user cancels
    }
    try {
      await API.delete(`/tasks/${taskId}`);
      alert("Task deleted successfully!");
      // WHY: Refresh list to remove deleted task from UI
      fetchData();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    }
  };

  // WHY: Clear all authentication data on logout
  // This ensures user can't access protected routes after logout
  const handleLogout = () => {
    localStorage.clear(); // WHY: Clear all localStorage (simpler than removing individually)
    navigate("/admin/login");
  };

  // WHY: Helper function to convert employee ID to name
  // This makes the UI more user-friendly (showing names instead of IDs)
  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.name : "Unknown";
  };

  // WHY: Show loading state while fetching data
  // Prevents showing empty/broken UI during API calls
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
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
          <h2>All Tasks ({tasks.length})</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-btn"
          >
            {showCreateForm ? "Cancel" : "+ Create New Task"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}


        {showCreateForm && (
          <div className="create-task-form">
            <h3>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title *</label>
                {/* WHY: Controlled input - value comes from state, onChange updates state
                    This ensures React controls the input value */}
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                {/* WHY: Textarea for longer text input */}
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Assign To *</label>
                {/* WHY: Dropdown populated from employees array
                    Shows name and email for better identification */}
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                
                >
                  <option value="">Select Employee</option>
                  {/* WHY: map() creates option for each employee
                      key prop helps React efficiently update the list */}
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                {/* WHY: Default status is "pending" - new tasks start as pending */}
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">
                Create Task
              </button>
            </form>
          </div>
        )}

        <div className="tasks-list">
          {/* WHY: Conditional rendering - show message if no tasks
              Otherwise show the task grid */}
          {tasks.length === 0 ? (
            <div className="no-tasks">No tasks found. Create your first task!</div>
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
                      <strong>Assigned to:</strong> {getEmployeeName(task.assignedTo)}
                    </p>
                    <p>
                      {/* WHY: Format date for better readability
                          toLocaleDateString() converts to user's locale format */}
                      <strong>Created:</strong>{" "}
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="task-actions">
                    {/* WHY: Inline onChange handler with arrow function
                        Passes task ID and new value to update handler */}
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    {/* WHY: Arrow function in onClick to pass task ID
                        Without arrow function, handleDeleteTask would be called immediately */}

                  <button
                  onClick={() => navigate(`/admin/tasks/edit/${task._id}`)}
                  className="edit-btn"
                     >
                       Edit
                   </button> 

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
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

export default AdminDashboard;

