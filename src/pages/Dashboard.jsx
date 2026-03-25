import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import api from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const role = getUserRole();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userMessage");
    navigate("/");
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");

      console.log("TASKS:", res.data);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.content || res.data.data || [];

      setTasks([...data]);
    } catch (err) {
      console.log(err);
      setTasks([]);
    }
  };

  const total = Array.isArray(tasks) ? tasks.length : 0;
  const pending = Array.isArray(tasks)
    ? tasks.filter((t) => t?.status === "PENDING").length
    : 0;
  const inProgress = Array.isArray(tasks)
    ? tasks.filter((t) => t?.status === "IN_PROGRESS").length
    : 0;
  const completed = Array.isArray(tasks)
    ? tasks.filter((t) => t?.status === "COMPLETED").length
    : 0;

  const pieData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ];

  const COLORS = ["#f39c12", "#3498db", "#2ecc71"];

  const userTaskMap = {};
  tasks.forEach((task) => {
    const assignedUser =
      task?.assignedTo?.name || task?.assignedTo?.email || "Unassigned";
    userTaskMap[assignedUser] = (userTaskMap[assignedUser] || 0) + 1;
  });

  const barData = Object.keys(userTaskMap).map((user) => ({
    name: user,
    tasks: userTaskMap[user],
  }));

  const formatDeadline = (deadline) => {
    if (!deadline) return "N/A";
    return new Date(deadline).toLocaleDateString();
  };

  const isOverdue = (deadline, status) => {
    if (!deadline || status === "COMPLETED") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(deadline);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>{role} Panel</h2>

        {role === "ADMIN" && (
          <>
            <button className="btn" onClick={() => navigate("/users")}>
              Manage Users
            </button>
            <button className="btn" onClick={() => navigate("/create-task")}>
              Create Task
            </button>
          </>
        )}

        {(role === "ADMIN" || role === "MANAGER") && (
          <button className="btn" onClick={() => navigate("/update-task")}>
            Update Task
          </button>
        )}

        <button className="btnl" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <main className="main-content">
        <div className="header">
          <h1>Smart Task Distributor</h1>
          <p>Manage workload efficiently with real-time task tracking</p>
          <p>Welcome, {role}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{total}</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>{pending}</p>
          </div>

          <div className="stat-card">
            <h3>In Progress</h3>
            <p>{inProgress}</p>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <p>{completed}</p>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-card">
            <h3>Task Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Task Load by User</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#2f6fcc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tasks-section">
          <h2>Current Tasks</h2>

          <div className="task-container">
            {tasks.length === 0 ? (
              <p className="empty-text">No tasks found</p>
            ) : (
              tasks.map((task) => {
                const overdue = isOverdue(task.deadline, task.status);

                return (
                  <div
                    key={task.id}
                    className="task-card"
                    style={{
                      borderLeft: overdue ? "5px solid red" : "5px solid #2f6fcc",
                    }}
                  >
                    <h3>{task.title}</h3>

                    <p>
                      <strong>Description:</strong>{" "}
                      {task.description || "No description"}
                    </p>

                    <p>
                      <strong>Status:</strong> {task.status}
                    </p>

                    <p>
                      <strong>Assigned To:</strong>{" "}
                      {task.assignedTo?.name ||
                        task.assignedTo?.email ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Deadline:</strong> {formatDeadline(task.deadline)}
                    </p>

                    {overdue && (
                      <p style={{ color: "red", fontWeight: "bold" }}>
                        ⚠ Overdue Task
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;