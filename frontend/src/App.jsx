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

import "./App.css";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const isStudent =
    token && role === "STUDENT";

  const isStaff =
    token &&
    (role === "STAFF" || role === "ADMIN");

  return (
    <>
      {isStudent && <StudentNavbar />}

      {isStaff && <StaffNavbar />}

      <Routes>

        {/* Default route */}
        <Route
          path="/"
          element={
            !token ? (
              <Navigate
                to="/login"
                replace
              />
            ) : isStudent ? (
              <Navigate
                to="/meals"
                replace
              />
            ) : (
              <Navigate
                to="/staff-dashboard"
                replace
              />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Student route */}
        <Route
          path="/meals"
          element={
            <ProtectedRoute
              allowedRoles={[
                "STUDENT",
                "STAFF",
                "ADMIN",
              ]}
            >
              <Meals />
            </ProtectedRoute>
          }
        />

        {/* Staff Dashboard */}
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "STAFF",
                "ADMIN",
              ]}
            >
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Meal Management */}
        <Route
          path="/meal-management"
          element={
            <ProtectedRoute
              allowedRoles={[
                "STAFF",
                "ADMIN",
              ]}
            >
              <MealManagement />
            </ProtectedRoute>
          }
        />

        {/* Add Meal */}
        <Route
          path="/add-meals"
          element={
            <ProtectedRoute
              allowedRoles={[
                "STAFF",
                "ADMIN",
              ]}
            >
              <AddMeal />
            </ProtectedRoute>
          }
        />

        {/* Edit Meal */}
        <Route
          path="/edit-meal/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "STAFF",
                "ADMIN",
              ]}
            >
              <EditMeal />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}

export default App;