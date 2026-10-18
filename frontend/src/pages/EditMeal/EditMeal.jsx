import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./EditMeal.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8080";
const EMPTY_FORM = {
  name: "", description: "", mealDate: "", mealPeriod: "BREAKFAST", status: "DRAFT",
};

function resolveImageUrl(value) {
  if (!value?.trim()) return "";
  if (/^(https?:|blob:|data:)/i.test(value)) return value;
  return new URL(value, API_ORIGIN).href;
}

function EditMeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [dishId, setDishId] = useState(null);
  const [dishImageUrl, setDishImageUrl] = useState("");
  const [mealImageUrl, setMealImageUrl] = useState("");
  const [imageMode, setImageMode] = useState("default");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchMeal() {
      setLoading(true);
      setError("");
      try {
        const { data: meal } = await api.get(`/meals/${id}`);
        if (cancelled) return;
        setFormData({
          name: meal.name || "",
          description: meal.description || "",
          mealDate: meal.mealDate || "",
          mealPeriod: meal.mealPeriod || "BREAKFAST",
          status: meal.status || "DRAFT",
        });
        setDishId(meal.dish?.id ?? null);
        setDishImageUrl(meal.dish?.imageUrl || "");
        setMealImageUrl(meal.imageUrl || "");
        setImageMode(meal.imageUrl?.trim() ? "override" : "default");
      } catch (requestError) {
        if (cancelled) return;
        console.error("Error loading meal:", requestError);
        setError(requestError.response?.status === 403
          ? "You do not have permission to edit meals."
          : requestError.response?.status === 404
            ? "The requested meal could not be found."
            : "Could not load the meal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMeal();
    return () => { cancelled = true; };
  }, [id]);

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
    setFormData(previous => ({ ...previous, [name]: value }));
  }

  function clearSelection() {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleModeChange(event) {
    setImageMode(event.target.value);
    clearSelection();
    setError("");
    setMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setError("");
    setMessage("");
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setSelectedImage(file);
  }

  async function applyImageChoice() {
    if (imageMode === "default") {
      if (mealImageUrl?.trim()) {
        await api.delete(`/meals/${id}/image`);
        setMealImageUrl("");
      }
      return "Meal now uses the default dish picture.";
    }
    if (!selectedImage) return "No new picture selected; the existing image was kept.";
    if (imageMode === "dish" && !dishId) throw new Error("MISSING_DISH_ID");

    const imageData = new FormData();
    imageData.append("file", selectedImage);
    const endpoint = imageMode === "dish"
      ? `/dishes/${dishId}/image`
      : `/meals/${id}/image`;
    const { data } = await api.post(endpoint, imageData);
    if (imageMode === "dish") {
      setDishImageUrl(data?.imageUrl || "");
    } else {
      setMealImageUrl(data?.imageUrl || "");
    }
    clearSelection();
    return imageMode === "dish"
      ? "Default dish picture updated. Meals with their own override are unchanged."
      : "Picture updated for this meal only.";
  }

  function describeError(requestError, fallback) {
    if (requestError.message === "MISSING_DISH_ID") {
      return "This meal is not linked to a dish. Please repair the dish association before updating the shared picture.";
    }
    if (requestError.response?.status === 403) {
      return "Permission denied (403). Please confirm you are logged in as staff or admin.";
    }
    return fallback;
  }

  async function handleUploadOnly() {
    if (saving || uploadingImage) return;
    if (imageMode !== "default" && !selectedImage) {
      setError("Please select a picture first.");
      return;
    }
    setError("");
    setMessage("");
    setUploadingImage(true);
    try {
      const result = await applyImageChoice();
      setMessage(result);
      if (imageMode === "default") setImageMode("default");
    } catch (requestError) {
      console.error("Image action failed:", requestError);
      setError(describeError(requestError, "Could not update the picture. Please try again."));
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || uploadingImage) return;
    setSaving(true);
    setError("");
    setMessage("");
    let detailsSaved = false;
    try {
      // Never send imageUrl in PUT: image changes use dedicated endpoints.
      await api.put(`/meals/${id}`, {
        ...formData,
        ...(dishId ? { dish: { id: dishId } } : {}),
      });
      detailsSaved = true;
      await applyImageChoice();
      navigate("/meal-management", { replace: true });
    } catch (requestError) {
      console.error("Error updating meal:", requestError);
      setError(detailsSaved
        ? describeError(requestError, "Meal details were saved, but the picture action failed. Retry using the picture button below.")
        : describeError(requestError, "Could not update the meal."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="edit-meal-page"><p>Loading meal...</p></div>;

  const currentImage = imageMode === "default"
    ? dishImageUrl
    : imageMode === "override"
      ? (mealImageUrl || dishImageUrl)
      : dishImageUrl;
  const currentImageLabel = imageMode === "override" && mealImageUrl
    ? "Current meal-specific picture"
    : "Current default dish picture";
  const busy = saving || uploadingImage;

  return (
    <div className="edit-meal-page">
      <div className="edit-meal-header">
        <span className="edit-meal-eyebrow">BEARSCAFE · STAFF</span>
        <h1>Edit Meal</h1>
        <p>Update this serving and choose whether its picture is shared or meal-specific.</p>
      </div>
      {error && <p className="edit-meal-error" role="alert">{error}</p>}
      {message && <p className="edit-meal-success" role="status">{message}</p>}

      <form className="edit-meal-form" onSubmit={handleSubmit}>
        <div className="edit-meal-section">
          <h2>Meal Details</h2>
          <p>Changes to this serving's information.</p>
        </div>
        <label>Meal Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>Description
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
        </label>
        <div className="edit-meal-grid">
          <label>Meal Date
            <input type="date" name="mealDate" value={formData.mealDate} onChange={handleChange} required />
          </label>
          <label>Meal Period
            <select name="mealPeriod" value={formData.mealPeriod} onChange={handleChange}>
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
            </select>
          </label>
        </div>
        <label>Status
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
          </select>
        </label>

        <div className="edit-meal-divider" />
        <div className="edit-meal-section">
          <h2>Picture Settings</h2>
          <p>Choose which picture to display and whether changes affect other servings.</p>
        </div>
        {dishId && <div className="edit-meal-dish-id">Linked Dish ID: <strong>{dishId}</strong></div>}

        <fieldset className="edit-meal-image-choices" disabled={busy}>
          <legend>Picture behavior</legend>
          <label className="edit-meal-image-choice">
            <input type="radio" name="imageMode" value="default" checked={imageMode === "default"} onChange={handleModeChange} />
            <span><strong>Use default dish picture</strong><small>Remove this meal's override and reuse the shared image.</small></span>
          </label>
          <label className="edit-meal-image-choice">
            <input type="radio" name="imageMode" value="override" checked={imageMode === "override"} onChange={handleModeChange} />
            <span><strong>Picture for this meal only</strong><small>Upload a separate image without changing other servings.</small></span>
          </label>
          <label className="edit-meal-image-choice">
            <input type="radio" name="imageMode" value="dish" checked={imageMode === "dish"} onChange={handleModeChange} />
            <span><strong>Replace default dish picture</strong><small>Update all servings that don't have a meal-specific override.</small></span>
          </label>
        </fieldset>

        {currentImage ? (
          <div className="edit-meal-existing-image">
            <span>{currentImageLabel}</span>
            <img src={resolveImageUrl(currentImage)} alt={formData.name || "Meal"} />
          </div>
        ) : (
          <p className="edit-meal-hint">No picture is currently available for this selection.</p>
        )}

        {imageMode !== "default" && (
          <div className="edit-meal-upload-area">
            <label htmlFor="edit-meal-image" className="edit-meal-upload-label">
              <span className="edit-meal-camera">📷</span>
              <span>{selectedImage ? selectedImage.name : "Choose a new picture"}</span>
              <small>JPG, PNG, or WebP · Maximum 5 MB</small>
            </label>
            <input ref={fileInputRef} id="edit-meal-image" className="edit-meal-file-input"
              type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange} disabled={busy} />
            {imagePreview && (
              <div className="edit-meal-preview">
                <img src={imagePreview} alt="Selected picture preview" />
                <button type="button" className="edit-meal-remove" onClick={clearSelection} disabled={busy}>
                  Remove Selection
                </button>
              </div>
            )}
          </div>
        )}

        <button type="button" className="edit-meal-upload-button" onClick={handleUploadOnly}
          disabled={busy || (imageMode === "default" ? !mealImageUrl?.trim() : !selectedImage || (imageMode === "dish" && !dishId))}>
          {uploadingImage ? "Updating Picture..." : imageMode === "default"
            ? "Remove Override Only" : "Upload Picture Only"}
        </button>
        <p className="edit-meal-hint">
          The picture button applies only your picture choice. Save Changes also saves the meal details.
        </p>
        <div className="edit-meal-buttons">
          <button type="submit" className="edit-meal-save" disabled={busy}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" className="edit-meal-cancel" disabled={busy}
            onClick={() => navigate("/meal-management")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EditMeal;