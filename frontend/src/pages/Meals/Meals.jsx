import MealCard from "../../components/MealCard/MealCard";
import "./Meals.css";

function Meals() {
  const meals = [
    {
      id: 1,
      name: "Chicken Alfredo",
      description: "Creamy Alfredo pasta served with grilled chicken.",
      category: "Lunch",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0"
    },
    {
      id: 2,
      name: "Cheeseburger",
      description: "Juicy beef burger topped with melted cheese, lettuce, and tomato.",
      category: "Lunch",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
    },
    {
      id: 3,
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan.",
      category: "Healthy",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1"
    },
    {
      id: 4,
      name: "Chicken Tacos",
      description: "Seasoned chicken tacos served with fresh vegetables and salsa.",
      category: "Mexican",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85"
    }
  ];

  return (
    <div className="meals-page">
      <div className="meals-header">
        <h1>Today's Meals</h1>
        <p>Explore what's available at the cafeteria today.</p>
      </div>

      <div className="meals-grid">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
      </div>
    </div>
  );
}

export default Meals;
