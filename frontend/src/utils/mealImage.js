
const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8080";

export function getMealImageUrl(meal) {
  const imageUrl =
    meal?.imageUrl?.trim() ||
    meal?.dish?.imageUrl?.trim() ||
    "";

  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return new URL(imageUrl, API_ORIGIN).href;
}