
import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AddMeal.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const INITIAL_FORM = {
  name: "",
  description: "",
  imageUrl: "",
  mealDate: "",
  mealPeriod: "BREAKFAST",
  status: "DRAFT",
};

function AddMeal() {
  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create and clean up the local image preview.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      setSelectedImage(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be 5 MB or smaller.");
      setSelectedImage(null);
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  }

  function removeImage() {
    setSelectedImage(null);

    const fileInput = document.getElementById(
      "add-meal-image"
    );

    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setMessage("");
    setError("");
    setSubmitting(true);

    let createdMeal = null;

    try {
      // STEP 1: Create the meal and its dish.
      const response = await api.post("/meals", formData);

      createdMeal = response.data;

      // STEP 2: Upload the selected image to the dish.
      if (selectedImage) {
        const dishId = createdMeal?.dish?.id;

        if (!dishId) {
          throw new Error("MISSING_DISH_ID");
        }

        const imageData = new FormData();
        imageData.append("file", selectedImage);

        await api.post(
          `/dishes/${dishId}/image`,
          imageData
        );
      }

      setMessage(
        selectedImage
          ? "Meal and image saved successfully!"
          : "Meal added successfully!"
      );

      setFormData({ ...INITIAL_FORM });
      removeImage();

    } catch (requestError) {
      console.error("Error saving meal:", requestError);

      if (createdMeal) {
        setError(
          "The meal was created successfully, but the image " +
          "could not be uploaded. Please keep the meal and " +
          "try adding its picture later."
        );
      } else if (requestError.response?.status === 403) {
        setError(
          "You do not have permission to add meals."
        );
      } else {
        setError(
          requestError.response?.data?.message ||
          "Could not add the meal. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-meal-page">
      <div className="add-meal-header">
        <span className="add-meal-eyebrow">
          BEARSCAFE · STAFF
        </span>

        <h1>Add a New Meal</h1>

        <p>
          Create a meal for the cafeteria menu and
          optionally upload a picture of the dish.
        </p>
      </div>

      <form
        className="add-meal-form"
        onSubmit={handleSubmit}
      >
        <div className="add-meal-section-heading">
          <h2>Meal Details</h2>
          <p>Enter the information students will see.</p>
        </div>

        <label>
          Meal Name <span className="required">*</span>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Chicken Alfredo"
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
            placeholder="Describe the meal..."
          />
        </label>

        <div className="add-meal-grid">
          <label>
            Meal Date <span className="required">*</span>

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
        </div>

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

        <div className="add-meal-divider" />

        <div className="add-meal-section-heading">
          <h2>Dish Picture</h2>
          <p>
            Upload a picture that can be reused whenever
            this dish is served again.
          </p>
        </div>

        <div className="add-meal-upload-area">
          <label
            htmlFor="add-meal-image"
            className="add-meal-upload-label"
          >
            <span className="add-meal-upload-icon">
              📷
            </span>

            <span>
              {selectedImage
                ? selectedImage.name
                : "Choose an image"}
            </span>

            <small>
              JPG, PNG, or WebP · Maximum 5 MB
            </small>
          </label>

          <input
            id="add-meal-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="add-meal-file-input"
          />

          {imagePreview && (
            <div className="add-meal-image-preview">
              <img
                src={imagePreview}
                alt="Selected meal preview"
              />

              <button
                type="button"
                className="add-meal-remove-image"
                onClick={removeImage}
                disabled={submitting}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="add-meal-submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving Meal..."
            : "Add Meal"}
        </button>

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default AddMeal;