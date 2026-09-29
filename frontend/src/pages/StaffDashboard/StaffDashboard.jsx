import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";

import "./StaffDashboard.css";

function StaffDashboard() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  async function fetchTodaysMeals() {
    try {
      const response = await api.get(
        "/meals/today"
      );

      setMeals(response.data);
      setError("");
    } catch (error) {
      console.error(
        "Error fetching today's meals:",
        error
      );

      if (
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to view this page."
        );
      } else {
        setError(
          "Could not load today's menu."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const breakfastMeals = meals.filter(
    (meal) =>
      meal.mealPeriod === "BREAKFAST"
  );

  const lunchMeals = meals.filter(
    (meal) =>
      meal.mealPeriod === "LUNCH"
  );

  const dinnerMeals = meals.filter(
    (meal) =>
      meal.mealPeriod === "DINNER"
  );

  function renderMealPeriod(
    title,
    periodMeals
  ) {
    return (
      <div className="dashboard-period">
        <h3>{title}</h3>

        {periodMeals.length === 0 ? (
          <div className="empty-period">
            <p>No meal published.</p>
          </div>
        ) : (
          periodMeals.map((meal) => (
            <div
              className="dashboard-meal-card"
              key={meal.id}
            >
              {meal.imageUrl && (
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="dashboard-meal-image"
                />
              )}

              <div className="dashboard-meal-content">
                <h4>{meal.name}</h4>

                <p>
                  {meal.description ||
                    "No description provided."}
                </p>

                <div className="feedback-summary">
                  <div className="feedback-stat">
                    <span className="feedback-label">
                      Rating
                    </span>

                    <strong>
                      No ratings yet
                    </strong>
                  </div>

                  <div className="feedback-stat">
                    <span className="feedback-label">
                      Feedback
                    </span>

                    <strong>
                      No comments yet
                    </strong>
                  </div>
                </div>

                <Link
                  to={`/edit-meal/${meal.id}`}
                  className="edit-button"
                >
                  Edit Meal
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="staff-dashboard">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>

          <p>
            View today's menu and student
            responses.
          </p>
        </div>

        <Link
          to="/meal-management"
          className="manage-meals-button"
        >
          Manage Meals
        </Link>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Today's Menu</h2>

            <p>
              Meals currently available to
              students.
            </p>
          </div>

          <span className="today-count">
            {meals.length}{" "}
            {meals.length === 1
              ? "meal"
              : "meals"}{" "}
            published
          </span>
        </div>

        {meals.length === 0 ? (
          <div className="empty-dashboard">
            <h3>
              No meals published today
            </h3>

            <p>
              Visit Meal Management to add or
              reuse a meal.
            </p>

            <Link
              to="/meal-management"
              className="manage-meals-button"
            >
              Go to Meal Management
            </Link>
          </div>
        ) : (
          <div className="today-menu-grid">
            {renderMealPeriod(
              "Breakfast",
              breakfastMeals
            )}

            {renderMealPeriod(
              "Lunch",
              lunchMeals
            )}

            {renderMealPeriod(
              "Dinner",
              dinnerMeals
            )}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Today's Student Feedback</h2>

            <p>
              Ratings and comments submitted
              for today's meals.
            </p>
          </div>
        </div>

        <div className="feedback-placeholder">
          <div className="feedback-placeholder-icon">
            ★
          </div>

          <h3>
            Student feedback will appear here
          </h3>

          <p>
            Once we connect the rating and
            feedback system, staff will be able
            to view ratings and comments for
            each meal served today.
          </p>
        </div>
      </section>
    </div>
  );
}

export default StaffDashboard;