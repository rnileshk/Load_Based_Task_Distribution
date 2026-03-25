import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function UpdateTask() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      setError("");

      const res = await api.get("/tasks");

      const taskList = Array.isArray(res.data)
        ? res.data
        : res.data.content || res.data.data || [];

      setTasks(taskList);
    } catch (err) {
      console.log(err);
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await api.get("/users");

      const userList = Array.isArray(res.data)
        ? res.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
          }))
        : [];

      setUsers(userList);
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const assignTask = async (taskId, userId) => {
    if (!userId) return;

    try {
      setMessage("");
      setError("");

      await api.put(`/tasks/${taskId}/assign/${userId}`);
      setMessage("Task assigned successfully");
      fetchTasks();
    } catch (err) {
      console.log(err);
      setError("Assignment failed");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    if (!status) return;

    try {
      setMessage("");
      setError("");

      await api.put(`/tasks/${taskId}/status?status=${status}`);
      setMessage("Task status updated successfully");
      fetchTasks();
    } catch (err) {
      console.log(err);
      setError("Status update failed");
    }
  };

  const deleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      setMessage("");
      setError("");

      await api.delete(`/tasks/${taskId}`);
      setMessage("Task deleted successfully");

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.log(err);
      setError("Task delete failed");
    }
  };

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
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>Update Task Assignment</h1>
            <p style={styles.subtitle}>
              Reassign tasks, update status, view deadlines, and delete tasks
              from one place
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Back to Dashboard
          </button>
        </div>

        {message && <div style={styles.successBox}>{message}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total Tasks</span>
            <span style={styles.summaryValue}>{tasks.length}</span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Available Users</span>
            <span style={styles.summaryValue}>{users.length}</span>
          </div>
        </div>

        {(loadingTasks || loadingUsers) && (
          <div style={styles.infoCard}>
            <p style={styles.infoText}>Loading tasks and users...</p>
          </div>
        )}

        {!loadingTasks && tasks.length === 0 && (
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>No tasks found</h3>
            <p style={styles.infoText}>
              Create tasks first, then assign them or update their status here.
            </p>
          </div>
        )}

        {!loadingTasks && tasks.length > 0 && (
          <div style={styles.grid}>
            {tasks.map((task) => {
              const overdue = isOverdue(task.deadline, task.status);

              return (
                <div
                  key={task.id}
                  style={{
                    ...styles.card,
                    ...(overdue ? styles.overdueCard : {}),
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>{task.title}</h3>
                      <p style={styles.cardSubtitle}>
                        {task.description || "No description provided"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(task.status === "PENDING"
                          ? styles.pendingBadge
                          : task.status === "IN_PROGRESS"
                          ? styles.progressBadge
                          : styles.completedBadge),
                      }}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div style={styles.metaBox}>
                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Assigned To</span>
                      <span style={styles.metaValue}>
                        {task.assignedTo?.name ||
                          task.assignedTo?.email ||
                          "Not Assigned"}
                      </span>
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Deadline</span>
                      <span
                        style={{
                          ...styles.metaValue,
                          ...(overdue ? styles.overdueText : {}),
                        }}
                      >
                        {formatDeadline(task.deadline)}
                      </span>
                    </div>

                    {overdue && (
                      <div style={styles.overdueBadge}>⚠ Overdue Task</div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Assign User</label>
                    <select
                      defaultValue=""
                      onChange={(e) => assignTask(task.id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Select a user</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Update Status</label>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>

                  <div style={styles.actionRow}>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{ ...styles.button, ...styles.deleteButton }}
                    >
                      Delete Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eef3f9 0%, #e6edf7 100%)",
    padding: "30px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#1f3b5b",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#64788d",
    fontSize: "15px",
  },
  button: {
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#2f6fcc",
    border: "1px solid #cfd9e5",
  },
  deleteButton: {
    background: "#e74c3c",
    color: "#ffffff",
  },
  successBox: {
    background: "#eafaf1",
    color: "#1e8449",
    padding: "14px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  errorBox: {
    background: "#fdecea",
    color: "#c0392b",
    padding: "14px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(24, 39, 75, 0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#52677d",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2f6fcc",
  },
  infoCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 6px 18px rgba(24, 39, 75, 0.06)",
  },
  infoTitle: {
    margin: 0,
    color: "#1f3b5b",
  },
  infoText: {
    margin: "8px 0 0 0",
    color: "#64788d",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(24, 39, 75, 0.08)",
    borderLeft: "5px solid #2f6fcc",
  },
  overdueCard: {
    borderLeft: "5px solid #e74c3c",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },
  cardTitle: {
    margin: 0,
    color: "#1f3b5b",
    fontSize: "20px",
  },
  cardSubtitle: {
    margin: "8px 0 0 0",
    color: "#6c7f93",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  statusBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  pendingBadge: {
    background: "#fff4e5",
    color: "#d68910",
  },
  progressBadge: {
    background: "#e8f1fd",
    color: "#2f6fcc",
  },
  completedBadge: {
    background: "#eafaf1",
    color: "#1e8449",
  },
  metaBox: {
    marginBottom: "18px",
    padding: "12px 0",
    borderTop: "1px solid #edf2f7",
    borderBottom: "1px solid #edf2f7",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  metaLabel: {
    color: "#52677d",
    fontWeight: "600",
  },
  metaValue: {
    color: "#1f3b5b",
    fontWeight: "600",
    textAlign: "right",
  },
  overdueText: {
    color: "#c0392b",
  },
  overdueBadge: {
    display: "inline-block",
    marginTop: "4px",
    background: "#fdecea",
    color: "#c0392b",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "14px",
  },
  label: {
    fontWeight: "600",
    color: "#324a61",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #d2dbe6",
    outline: "none",
    fontSize: "15px",
    background: "#fbfcfe",
  },
  actionRow: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "flex-end",
  },
};

export default UpdateTask;