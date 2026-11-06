// @vitest-environment jsdom

import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Meals from "./Meals";

// Mock the API request
vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: "Pancakes", mealPeriod: "BREAKFAST" },
        { id: 2, name: "Pizza", mealPeriod: "LUNCH" },
        { id: 3, name: "Pasta", mealPeriod: "DINNER" },
      ],
    }),
  },
}));

// Replace the MealCard component with a simple test version
vi.mock("../../components/MealCard/MealCard", () => ({
  default: ({ meal }) => <div>{meal.name}</div>,
}));

test("displays meals from the API", async () => {
  render(<Meals />);

  expect(await screen.findByText("Pancakes")).toBeTruthy();
  expect(screen.getByText("Pizza")).toBeTruthy();
  expect(screen.getByText("Pasta")).toBeTruthy();

  expect(
    screen.getByRole("heading", { name: "Breakfast" })
  ).toBeTruthy();

  expect(
    screen.getByRole("heading", { name: "Lunch" })
  ).toBeTruthy();

  expect(
    screen.getByRole("heading", { name: "Dinner" })
  ).toBeTruthy();
});