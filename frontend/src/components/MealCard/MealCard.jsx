import "./MealCard.css";

function MealCard({ meal }) {
  return (
    <div className="meal-card">
      <div className="meal-card-image-container">
        <img
          src={meal.image}
          alt={meal.name}
          className="meal-card-image"
        />
      </div>

      <div className="meal-card-content">
        <div className="meal-card-header">
          <h2>{meal.name}</h2>
          <span className="meal-category">{meal.category}</span>
        </div>

        <p className="meal-description">
          {meal.description}
        </p>

        <div className="meal-card-footer">
          <div className="meal-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-number">
              {meal.rating}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MealCard;
