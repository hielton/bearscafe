import { useState } from "react";

import api from "../../api/axios";

import "./AddMeal.css";

function AddMeal() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    mealDate: "",
    mealPeriod: "BREAKFAST",
    status: "DRAFT",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post(
        "/meals",
        formData
      );

      console.log(
        "Meal created:",
        response.data
      );

      setMessage(
        "Meal added successfully!"
      );

      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        mealDate: "",
        mealPeriod: "BREAKFAST",
        status: "DRAFT",
      });
    } catch (error) {
      console.error(
        "Error adding meal:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to add meals."
        );
      } else {
        setError(
          "Could not add meal. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-meal-page">
      <h1>Add Meal</h1>

      <form
        className="add-meal-form"
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
            <option value="BREAKFAST">
              Breakfast
            </option>

            <option value="LUNCH">
              Lunch
            </option>

            <option value="DINNER">
              Dinner
            </option>
          </select>
        </label>

        <label>
          Status

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="DRAFT">
              Draft
            </option>

            <option value="PUBLISHED">
              Published
            </option>

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
            placeholder="Optional"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Adding Meal..."
            : "Add Meal"}
        </button>
      </form>

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}

export default AddMeal;