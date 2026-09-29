import { NavLink, useNavigate } from "react-router-dom";
import "./StaffNavbar.css";

function StaffNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove all authentication information.
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    // Send the user back to the login page.
    navigate("/login", {
      replace: true,
    });

    // Refresh so App.jsx immediately updates
    // the navbar based on the cleared authentication.
    window.location.reload();
  };

  return (
    <nav className="staff-navbar">
      <div className="staff-navbar-container">

        <NavLink
          to="/staff-dashboard"
          className="staff-navbar-brand"
        >
          🐻 BearsCafe
        </NavLink>

        <div className="staff-navbar-links">

          <NavLink
            to="/staff-dashboard"
            className={({ isActive }) =>
              isActive
                ? "staff-nav-link active"
                : "staff-nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/meal-management"
            className={({ isActive }) =>
              isActive
                ? "staff-nav-link active"
                : "staff-nav-link"
            }
          >
            Meal Management
          </NavLink>

          <NavLink
            to="/add-meals"
            className={({ isActive }) =>
              isActive
                ? "staff-nav-link active"
                : "staff-nav-link"
            }
          >
            Add Meal
          </NavLink>

          <button
            type="button"
            className="staff-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default StaffNavbar;