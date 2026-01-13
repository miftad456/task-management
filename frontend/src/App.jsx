import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Team from './pages/Team';
import TeamDetails from './pages/TeamDetails';
import TeamProfileEdit from './pages/TeamProfileEdit';
import AssignedTasks from './pages/AssignedTasks';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Settings from './pages/Settings';

import Layout from './components/Layout';
import useAuthStore from './store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- Protected Routes ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ---------- Team Routes ---------- */}
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <Layout>
                <Team />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ✅ TEAM PROFILE EDIT */}
        <Route
          path="/team/:teamId/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamProfileEdit />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ---------- Task Routes ---------- */}
        <Route
          path="/assigned-tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <AssignedTasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/:taskId"
          element={
            <ProtectedRoute>
              <Layout>
                <TaskDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
