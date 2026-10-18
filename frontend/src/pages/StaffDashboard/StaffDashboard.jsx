import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./StaffDashboard.css";
import { getMealImageUrl } from "../../utils/mealImage";

const PERIODS = [
  { key: "BREAKFAST", title: "Breakfast", symbol: "☀" },
  { key: "LUNCH", title: "Lunch", symbol: "◐" },
  { key: "DINNER", title: "Dinner", symbol: "☾" },
];

function StaffDashboard() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTodaysMeals() {
    setLoading(true);
    try {
      const response = await api.get("/meals/today");
      setMeals(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching today's meals:", err);
      setError(
        err.response?.status === 403
          ? "You do not have permission to view this page."
          : "Could not load today's menu. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  const publishedCount = meals.filter((meal) => meal.status === "PUBLISHED").length;
  const displayedCount = meals.length;
  const periodsWithMeals = PERIODS.filter((period) =>
    meals.some((meal) => meal.mealPeriod === period.key)
  ).length;

  return (
    <main className="staff-dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">BEARSCAFE · STAFF PORTAL</span>
          <h1>Staff Dashboard</h1>
          <p>Manage today's menu and keep everything ready for students.</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-button dashboard-button-outline"
            onClick={fetchTodaysMeals}
            disabled={loading}
          >
            ↻ Refresh
          </button>
          <Link to="/meal-management" className="dashboard-button dashboard-button-primary">
            Manage Meals →
          </Link>
        </div>
      </header>

      {error && (
        <div className="dashboard-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={fetchTodaysMeals}>Try again</button>
        </div>
      )}

      <section className="dashboard-stats" aria-label="Today's menu overview">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Meals on today's menu</span>
          <strong>{displayedCount}</strong>
          <span className="dashboard-stat-detail">Across breakfast, lunch and dinner</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Published meals</span>
          <strong>{publishedCount}</strong>
          <span className="dashboard-stat-detail">Marked as published in today's response</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Meal periods covered</span>
          <strong>{periodsWithMeals} <small>/ 3</small></strong>
          <span className="dashboard-stat-detail">Periods with at least one meal</span>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Today's Menu</h2>
            <p>Review the meals currently returned for today's menu.</p>
          </div>
          <span className="dashboard-count">{displayedCount} {displayedCount === 1 ? "meal" : "meals"}</span>
        </div>

        {loading ? (
          <div className="dashboard-state">Loading today's meals...</div>
        ) : displayedCount === 0 ? (
          <div className="dashboard-state">
            <div className="dashboard-empty-icon">🍽️</div>
            <h3>No meals on today's menu</h3>
            <p>Add a new meal or reuse a previous dish in Meal Management.</p>
            <Link to="/meal-management" className="dashboard-button dashboard-button-primary">
              Go to Meal Management
            </Link>
          </div>
        ) : (
          <div className="today-menu-grid">
            {PERIODS.map((period) => {
              const periodMeals = meals.filter((meal) => meal.mealPeriod === period.key);
              return (
                <div className="dashboard-period" key={period.key}>
                  <div className="dashboard-period-header">
                    <span className="dashboard-period-icon" aria-hidden="true">{period.symbol}</span>
                    <div>
                      <h3>{period.title}</h3>
                      <span>{periodMeals.length} {periodMeals.length === 1 ? "meal" : "meals"}</span>
                    </div>
                  </div>
                  {periodMeals.length === 0 ? (
                    <div className="empty-period">No meals scheduled for this period.</div>
                  ) : (
                    <div className="dashboard-period-meals">
                      {periodMeals.map((meal) => (
                        <article className="dashboard-meal-card" key={meal.id}>
                          <div className="dashboard-meal-image">
                            {getMealImageUrl(meal) ? (
                              <img
                                src={getMealImageUrl(meal)}
                                alt={meal.name || "Meal"}
                                loading="lazy"
                              />
                            ) : (
                              <span aria-hidden="true">🍽️</span>
                            )}
                          </div>
                          <div className="dashboard-meal-content">
                            <div className="dashboard-meal-topline">
                              <span className="dashboard-meal-badge">{period.title}</span>
                              {meal.status && (
                                <span className="dashboard-meal-status">{meal.status}</span>
                              )}
                            </div>
                            <h4>{meal.name}</h4>
                            <p>{meal.description || "No description provided."}</p>
                            <Link to={`/edit-meal/${meal.id}`} className="dashboard-edit-link">
                              Edit meal <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-section dashboard-insights-section">
        <div className="dashboard-insights-icon" aria-hidden="true">★</div>
        <div className="dashboard-insights-content">
          <span className="dashboard-eyebrow">STUDENT INSIGHTS</span>
          <h2>See what students think</h2>
          <p>Explore ratings, written feedback, and historical dish performance in your Analytics dashboard.</p>
        </div>
        <Link to="/analytics" className="dashboard-button dashboard-button-primary">
          View Analytics →
        </Link>
      </section>
    </main>
  );
}

export default StaffDashboard;
