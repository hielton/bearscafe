
import { NavLink, useNavigate } from "react-router-dom";
import "./StaffNavbar.css";

function StaffNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });
    window.location.reload();
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? "staff-nav-link active" : "staff-nav-link";

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
            className={navLinkClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/analytics"
            className={navLinkClass}
          >
            Analytics
          </NavLink>

          <NavLink
            to="/meal-management"
            className={navLinkClass}
          >
            Meal Management
          </NavLink>

          <NavLink
            to="/add-meals"
            className={navLinkClass}
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
