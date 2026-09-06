import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./EditMeal.css";

function EditMeal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    mealDate: "",
    mealPeriod: "BREAKFAST",
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMeal() {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/meals/${id}`
        );

        setFormData({
          name: response.data.name || "",
          description: response.data.description || "",
          imageUrl: response.data.imageUrl || "",
          mealDate: response.data.mealDate || "",
          mealPeriod: response.data.mealPeriod || "BREAKFAST",
          status: response.data.status || "DRAFT",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading meal:", error);
        setError("Could not load the meal.");
        setLoading(false);
      }
    }

    fetchMeal();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await axios.put(
        `http://localhost:8080/api/meals/${id}`,
        formData
      );

      navigate("/staff-dashboard");
    } catch (error) {
      console.error("Error updating meal:", error);
      setError("Could not update the meal.");
    }
  }

  if (loading) {
    return <p>Loading meal...</p>;
  }

  return (
    <div className="edit-meal-page">
      <h1>Edit Meal</h1>

      {error && (
        <p className="error-message">{error}</p>
      )}

      <form
        className="edit-meal-form"
        onSubmit={handleSubmit}
      >
        <label>
          Meal Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </label>

        <label>
          Meal Date
          <input
            type="date"
            name="mealDate"
            value={formData.mealDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Meal Period
          <select
            name="mealPeriod"
            value={formData.mealPeriod}
            onChange={handleChange}
          >
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>
        </label>

        <label>
          Status
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">
              Unpublished
            </option>
          </select>
        </label>

        <label>
          Image URL
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </label>

        <div className="edit-buttons">
          <button type="submit">
            Save Changes
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/staff-dashboard")
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMeal;