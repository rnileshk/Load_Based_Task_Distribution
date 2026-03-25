import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");

      const res = await api.get("/users");

      const cleanUsers = Array.isArray(res.data)
        ? res.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
          }))
        : [];

      setUsers(cleanUsers);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 403) {
        setError("Access denied. Only ADMIN can view users.");
      } else {
        setError("Failed to load users.");
      }
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);

      const res = await api.get("/tasks");

      const cleanTasks = Array.isArray(res.data)
        ? res.data
        : res.data.content || res.data.data || [];

      setTasks(cleanTasks);
    } catch (err) {
      console.log(err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      alert("User deleted successfully");
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const getTaskCountByUser = (userId) => {
    return tasks.filter((task) => task.assignedTo?.id === userId).length;
  };

  const usersWithTaskCount = users.map((user) => ({
    ...user,
    taskCount: getTaskCountByUser(user.id),
  }));

  const admins = usersWithTaskCount.filter((user) => user.role === "ADMIN");
  const managers = usersWithTaskCount.filter((user) => user.role === "MANAGER");
  const employees = usersWithTaskCount.filter((user) => user.role === "EMPLOYEE");

  const renderUserSection = (title, userList) => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <span style={styles.sectionCount}>{userList.length}</span>
      </div>

      {userList.length === 0 ? (
        <div style={styles.emptyMiniCard}>
          <p style={styles.emptyMiniText}>No {title.toLowerCase()} found</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {userList.map((user) => (
            <div key={user.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <h3 style={styles.userName}>{user.name}</h3>
                  <p style={styles.userEmail}>{user.email}</p>
                </div>
              </div>

              <div style={styles.roleRow}>
                <span style={styles.roleLabel}>Role</span>
                <span
                  style={{
                    ...styles.roleBadge,
                    ...(user.role === "ADMIN"
                      ? styles.adminBadge
                      : user.role === "MANAGER"
                      ? styles.managerBadge
                      : styles.employeeBadge),
                  }}
                >
                  {user.role}
                </span>
              </div>

              <div style={styles.taskRow}>
                <span style={styles.taskLabel}>Assigned Tasks</span>
                <span style={styles.taskCount}>{user.taskCount}</span>
              </div>

              <button
                onClick={() => handleDelete(user.id)}
                style={{ ...styles.button, ...styles.deleteButton }}
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const loading = loadingUsers || loadingTasks;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>Users Management</h1>
            <p style={styles.subtitle}>
              View users by role and check assigned workload
            </p>
          </div>

          <div style={styles.actions}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Back to Dashboard
            </button>

            <button
              onClick={() => navigate("/create-user")}
              style={{ ...styles.button, ...styles.primaryButton }}
            >
              Create User
            </button>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total Users</span>
            <span style={styles.summaryValue}>{users.length}</span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Admins</span>
            <span style={styles.summaryValue}>{admins.length}</span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Managers</span>
            <span style={styles.summaryValue}>{managers.length}</span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Employees</span>
            <span style={styles.summaryValue}>{employees.length}</span>
          </div>
        </div>

        {loading && <p style={styles.infoText}>Loading users and tasks...</p>}

        {!loading && error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && users.length === 0 && (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No users found</h3>
            <p style={styles.emptyText}>
              Create a new user to start managing the system.
            </p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <>
            {renderUserSection("Admins", admins)}
            {renderUserSection("Managers", managers)}
            {renderUserSection("Employees", employees)}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef3f9",
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
    fontSize: "32px",
    color: "#1f3b5b",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#5b7088",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  button: {
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  primaryButton: {
    background: "#2f6fcc",
    color: "white",
  },
  secondaryButton: {
    background: "white",
    color: "#2f6fcc",
    border: "1px solid #cfd9e5",
  },
  deleteButton: {
    background: "#e74c3c",
    color: "white",
    width: "100%",
    marginTop: "16px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  summaryCard: {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
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
  infoText: {
    color: "#2f6fcc",
    fontWeight: "600",
  },
  errorText: {
    color: "#e74c3c",
    fontWeight: "600",
    background: "#fff",
    padding: "14px",
    borderRadius: "10px",
  },
  emptyState: {
    background: "white",
    borderRadius: "14px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  emptyTitle: {
    margin: 0,
    color: "#1f3b5b",
  },
  emptyText: {
    marginTop: "10px",
    color: "#61758b",
  },
  section: {
    marginBottom: "32px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: {
    margin: 0,
    color: "#1f3b5b",
    fontSize: "24px",
  },
  sectionCount: {
    background: "#2f6fcc",
    color: "white",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "700",
  },
  emptyMiniCard: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  emptyMiniText: {
    margin: 0,
    color: "#61758b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#2f6fcc",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "20px",
  },
  userName: {
    margin: 0,
    color: "#1f3b5b",
  },
  userEmail: {
    margin: "6px 0 0 0",
    color: "#607488",
    fontSize: "14px",
  },
  roleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  roleLabel: {
    color: "#516679",
    fontWeight: "600",
  },
  roleBadge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },
  adminBadge: {
    background: "#fdecea",
    color: "#c0392b",
  },
  managerBadge: {
    background: "#e8f1fd",
    color: "#2f6fcc",
  },
  employeeBadge: {
    background: "#e9f8ef",
    color: "#1e8449",
  },
  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderTop: "1px solid #edf2f7",
    borderBottom: "1px solid #edf2f7",
  },
  taskLabel: {
    color: "#516679",
    fontWeight: "600",
  },
  taskCount: {
    background: "#2f6fcc",
    color: "white",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },
};

export default Users;