import { useEffect, useState } from "react";
import api from "../../api/axios";
import MealCard from "../../components/MealCard/MealCard";
import "./Meals.css";

function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/meals/today")
      .then((response) => {
        setMeals(response.data);
        setLoading(false);
      })
      .catch((error) => {
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
            "Could not load today's meals."
          );
        }

        setLoading(false);
      });
  }, []);

  const breakfastMeals = meals.filter(
    (meal) =>
      meal.mealPeriod?.toUpperCase() ===
      "BREAKFAST"
  );

  const lunchMeals = meals.filter(
    (meal) =>
      meal.mealPeriod?.toUpperCase() ===
      "LUNCH"
  );

  const dinnerMeals = meals.filter(
    (meal) =>
      meal.mealPeriod?.toUpperCase() ===
      "DINNER"
  );

  if (loading) {
    return <p>Loading today's meals...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="meals-page">
      <h1>Today's Meals</h1>

      {meals.length === 0 ? (
        <p className="no-meals">
          No meals have been published for today.
        </p>
      ) : (
        <>
          <MealSection
            title="Breakfast"
            meals={breakfastMeals}
          />

          <MealSection
            title="Lunch"
            meals={lunchMeals}
          />

          <MealSection
            title="Dinner"
            meals={dinnerMeals}
          />
        </>
      )}
    </div>
  );
}

function MealSection({ title, meals }) {
  return (
    <section className="meal-section">
      <h2>{title}</h2>

      {meals.length === 0 ? (
        <p className="no-meals">
          No {title.toLowerCase()} available.
        </p>
      ) : (
        <div className="meals-container">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Meals;