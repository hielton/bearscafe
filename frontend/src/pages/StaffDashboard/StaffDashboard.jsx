import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./StaffDashboard.css";

function StaffDashboard() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/meals"
      );

      setMeals(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setError("Could not load meals.");
      setLoading(false);
    }
  }

  async function handleUseToday(meal) {
    setMessage("");
    setError("");

    const today = new Date().toLocaleDateString("en-CA");

    const reusedMeal = {
      name: meal.name,
      description: meal.description,
      imageUrl: meal.imageUrl,
      mealDate: today,
      mealPeriod: meal.mealPeriod,
      status: "PUBLISHED",
    };

    try {
      await axios.post(
        "http://localhost:8080/api/meals",
        reusedMeal
      );

      setMessage(
        `${meal.name} was added to today's meals.`
      );

      fetchMeals();
    } catch (error) {
      console.error("Error reusing meal:", error);
      setError("Could not add this meal to today's menu.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/meals/${id}`
      );

      setMeals(
        meals.filter((meal) => meal.id !== id)
      );

      setMessage("Meal deleted successfully.");
    } catch (error) {
      console.error("Error deleting meal:", error);
      setError("Could not delete meal.");
    }
  }

  if (loading) {
    return <p>Loading meals...</p>;
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Manage and publish cafeteria meals.</p>
        </div>

        <Link
          to="/add-meals"
          className="add-meal-button"
        >
          + Add New Meal
        </Link>
      </div>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      <section className="dashboard-section">
        <h2>Meal History</h2>

        {meals.length === 0 ? (
          <p>No meals have been created yet.</p>
        ) : (
          <div className="meal-history">
            {meals.map((meal) => (
              <div
                className="history-card"
                key={meal.id}
              >
                <div className="history-info">
                  <h3>{meal.name}</h3>

                  <p>{meal.description}</p>

                  <div className="meal-details">
                    <span>
                      <strong>Date:</strong>{" "}
                      {meal.mealDate}
                    </span>

                    <span>
                      <strong>Period:</strong>{" "}
                      {meal.mealPeriod}
                    </span>

                    <span>
                      <strong>Status:</strong>{" "}
                      {meal.status}
                    </span>
                  </div>
                </div>

                <div className="history-actions">
                  <button
                    className="reuse-button"
                    onClick={() => handleUseToday(meal)}
                  >
                    Use Today
                  </button>

                  <Link
                    to={`/edit-meal/${meal.id}`}
                    className="edit-button"
                  >
                    Edit
                  </Link>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(meal.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffDashboard;