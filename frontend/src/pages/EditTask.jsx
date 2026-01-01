import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/EditTask.css";
import API from "../Services/api";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchTask = async () => {
      const res = await API.get(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTask(res.data);
    };

    const fetchEmployees = async () => {
      const res = await API.get("/users/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(res.data);
    };

    fetchTask();
    fetchEmployees();
  }, [id]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      await API.put(`/tasks/${id}`, {
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo,
      });
  
      alert("Task updated successfully");
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };
  if (!task) return <p>Loading...</p>;

  return (
    <div className="login-card">
      <h2>Edit Task</h2>

      <form onSubmit={handleUpdateTask}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={task.description}
            onChange={(e) =>
              setTask({ ...task, description: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Assign To</label>
          <select
            value={task.assignedTo || ""}
            onChange={(e) =>
              setTask({ ...task, assignedTo: e.target.value })
            }
          >
            <option value="" disabled>
              Select employee
            </option>

            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={task.status}
            onChange={(e) =>
              setTask({ ...task, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Task"}
        </button>
      </form>
    </div>
  );
};

export default EditTask;
