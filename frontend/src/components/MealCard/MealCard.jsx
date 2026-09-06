import "./MealCard.css";

function MealCard({ meal }) {
  return (
    <div className="meal-card">

      {meal.imageUrl && (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="meal-card-image"
        />
      )}

      <div className="meal-card-content">
        <h2>{meal.name}</h2>

        <p className="meal-description">
          {meal.description}
        </p>

        <p>
          <strong>Date:</strong> {meal.mealDate}
        </p>

        <p>
          <strong>Meal Period:</strong> {meal.mealPeriod}
        </p>

        <p>
          <strong>Status:</strong> {meal.status}
        </p>
      </div>

    </div>
  );
}

export default MealCard;