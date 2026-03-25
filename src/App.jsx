import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateTask from "./pages/CreateTask";
import UpdateTask from "./pages/UpdateTask";
import Users from "./pages/Users";
import { getUserRole } from "./utils/auth";
import CreateUser from "./pages/CreateUser";

function App() {
  const role = getUserRole();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/create-task"
          element={role === "ADMIN" ? <CreateTask /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/update-task"
          element={
            role === "ADMIN" || role === "MANAGER"
              ? <UpdateTask />
              : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/users"
          element={role === "ADMIN" ? <Users /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/create-user"
          element={role === "ADMIN" ? <CreateUser /> : <Navigate to="/dashboard" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;