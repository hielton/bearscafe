import {
  useEffect,
  useState,
} from "react";

import api from "../../api/axios";
import MealCard from "../../components/MealCard/MealCard";
import "./Meals.css";

function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const response =
          await api.get(
            "/meals/today"
          );

        setMeals(response.data);
      } catch (error) {
        console.error(
          "Error fetching today's meals:",
          error
        );

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          setError(
            "Your session is invalid or expired. Please log in again."
          );
        } else {
          setError(
            "We could not load today's menu. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  const breakfastMeals =
    filterMealsByPeriod(
      meals,
      "BREAKFAST"
    );

  const lunchMeals =
    filterMealsByPeriod(
      meals,
      "LUNCH"
    );

  const dinnerMeals =
    filterMealsByPeriod(
      meals,
      "DINNER"
    );

  return (
    <main className="meals-page">
      <header className="meals-header">
        <span className="menu-eyebrow">
          BearsCafe
        </span>

        <h1>Today's Menu</h1>

        <p>
          See what's being served today and
          share your experience with the
          cafeteria team.
        </p>
      </header>

      {loading ? (
        <div className="meals-state-card">
          <div className="loading-spinner" />

          <p>
            Preparing today's menu...
          </p>
        </div>
      ) : error ? (
        <div className="meals-state-card error-state">
          <span className="state-icon">
            !
          </span>

          <h2>
            Something went wrong
          </h2>

          <p>{error}</p>
        </div>
      ) : meals.length === 0 ? (
        <div className="meals-state-card">
          <span className="state-icon">
            🍽️
          </span>

          <h2>
            Today's menu isn't ready yet
          </h2>

          <p>
            No meals have been published
            for today. Please check back
            soon.
          </p>
        </div>
      ) : (
        <div className="menu-sections">
          <MealSection
            title="Breakfast"
            subtitle="Start your day with today's breakfast selection."
            meals={breakfastMeals}
          />

          <MealSection
            title="Lunch"
            subtitle="See what's being served for lunch."
            meals={lunchMeals}
          />

          <MealSection
            title="Dinner"
            subtitle="Finish the day with tonight's dinner options."
            meals={dinnerMeals}
          />
        </div>
      )}
    </main>
  );
}

function MealSection({
  title,
  subtitle,
  meals,
}) {
  if (meals.length === 0) {
    return null;
  }

  return (
    <section className="meal-section">
      <div className="meal-section-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <span className="meal-count">
          {meals.length}{" "}
          {meals.length === 1
            ? "meal"
            : "meals"}
        </span>
      </div>

      <div className="meals-container">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
      </div>
    </section>
  );
}

function filterMealsByPeriod(
  meals,
  period
) {
  return meals.filter(
    (meal) =>
      meal.mealPeriod?.toUpperCase() ===
      period
  );
}

export default Meals;