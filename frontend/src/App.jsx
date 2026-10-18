
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import StaffNavbar from "./components/StaffNavbar/StaffNavbar";
import StudentNavbar from "./components/StudentNavbar/StudentNavbar";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import Login from "./pages/Login/Login";
import Meals from "./pages/Meals/Meals";
import StaffDashboard from "./pages/StaffDashboard/StaffDashboard";
import MealManagement from "./pages/MealManagement/MealManagement";
import AddMeal from "./pages/AddMeal/AddMeal";
import EditMeal from "./pages/EditMeal/EditMeal";
import Analytics from "./pages/Analytics/Analytics";

import "./App.css";

function getStoredAuth() {
  return {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  };
}

function App() {
  const [auth, setAuth] = useState(getStoredAuth);

  const { token, role } = auth;

  const isStudent = Boolean(token) && role === "STUDENT";

  const isStaff =
    Boolean(token) && (role === "STAFF" || role === "ADMIN");

  function handleLoginSuccess() {
    setAuth(getStoredAuth());
  }

  return (
    <>
      {isStudent && <StudentNavbar />}
      {isStaff && <StaffNavbar />}

      <Routes>
        <Route
          path="/"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isStudent ? (
              <Navigate to="/meals" replace />
            ) : isStaff ? (
              <Navigate to="/staff-dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            <Login onLoginSuccess={handleLoginSuccess} />
          }
        />

        <Route
          path="/meals"
          element={
            <ProtectedRoute
              allowedRoles={["STUDENT", "STAFF", "ADMIN"]}
            >
              <Meals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meal-management"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
              <MealManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-meals"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
              <AddMeal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-meal/:id"
          element={
            <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
              <EditMeal />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
