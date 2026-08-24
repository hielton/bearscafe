import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar/Navbar";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Meals from "./pages/Meals/Meals";
import StaffDashboard from "./pages/StaffDashboard/StaffDashboard";
import AddMeal from "./pages/AddMeal/AddMeal";

function AppContent() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route
          path="/staff-dashboard"
          element={<StaffDashboard />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;