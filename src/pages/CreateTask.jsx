import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateTask() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "PENDING",
    deadline: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
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

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.deadline) {
      setError("Deadline is required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/tasks", {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline,
      });

      console.log("TASK CREATED:", response.data);

      setSuccess("Task created successfully");

      setFormData({
        title: "",
        description: "",
        status: "PENDING",
        deadline: "",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      console.log("CREATE TASK ERROR:", err);
      console.log("CREATE TASK RESPONSE:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>Create Task</h1>
            <p style={styles.subtitle}>
              Add a new task with status and deadline
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Back to Dashboard
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconBox}>+</div>
            <div>
              <h2 style={styles.cardTitle}>New Task Details</h2>
              <p style={styles.cardSubtitle}>
                Fill in the task information below
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTask} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Task Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
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
    maxWidth: "900px",
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
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 8px 24px rgba(24, 39, 75, 0.08)",
    marginBottom: "24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  iconBox: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2f6fcc, #4a8df5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "700",
  },
  cardTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#1f3b5b",
  },
  cardSubtitle: {
    margin: "6px 0 0 0",
    color: "#6c7f93",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#324a61",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #d2dbe6",
    outline: "none",
    fontSize: "15px",
    background: "#fbfcfe",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #d2dbe6",
    outline: "none",
    fontSize: "15px",
    background: "#fbfcfe",
    resize: "vertical",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #d2dbe6",
    outline: "none",
    fontSize: "15px",
    background: "#fbfcfe",
    boxSizing: "border-box",
  },
  errorBox: {
    background: "#fdecea",
    color: "#c0392b",
    padding: "12px 14px",
    borderRadius: "10px",
    fontWeight: "600",
  },
  successBox: {
    background: "#eafaf1",
    color: "#1e8449",
    padding: "12px 14px",
    borderRadius: "10px",
    fontWeight: "600",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  button: {
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  primaryButton: {
    background: "linear-gradient(90deg, #2f6fcc, #4a8df5)",
    color: "white",
    minWidth: "140px",
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#2f6fcc",
    border: "1px solid #cfd9e5",
  },
};

export default CreateTask;