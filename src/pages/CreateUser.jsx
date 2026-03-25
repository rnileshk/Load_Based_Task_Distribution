import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getUserRole } from "../utils/auth";

function CreateUser() {
  const navigate = useNavigate();
  const role = getUserRole();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/users", form);

      console.log("USER CREATED:", res.data);

      setSuccess("User created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
      });

      setTimeout(() => {
        navigate("/users");
      }, 1200);
    } catch (err) {
      console.log("CREATE USER ERROR:", err);

      if (err.response) {
        setError(err.response.data?.message || "Failed to create user");
      } else {
        setError("Server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>Create User</h1>
            <p style={styles.subtitle}>
              Add a new team member and assign the appropriate role
            </p>
          </div>

          <button
            onClick={() => navigate("/users")}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Back to Users
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconBox}>U</div>
            <div>
              <h2 style={styles.cardTitle}>New User Details</h2>
              <p style={styles.cardSubtitle}>
                Fill in the information below to create a new user account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={() => navigate("/users")}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                {loading ? "Creating..." : "Create User"}
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
    maxWidth: "950px",
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
    fontSize: "24px",
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
    width: "90%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #d2dbe6",
    outline: "none",
    fontSize: "15px",
    background: "#fbfcfe",
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

export default CreateUser;