import { NavLink, useNavigate } from "react-router-dom";
import "./StudentNavbar.css";

function StudentNavbar() {
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
    <nav className="student-navbar">
      <div className="student-navbar-container">

        <NavLink
          to="/meals"
          className="student-navbar-brand"
        >
          🐻 BearsCafe
        </NavLink>

        <div className="student-navbar-links">

          <NavLink
            to="/meals"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
          >
            Today's Meals
          </NavLink>

          <button
            type="button"
            className="student-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default StudentNavbar;