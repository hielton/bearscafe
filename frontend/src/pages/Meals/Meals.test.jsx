
 // @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import api from "../../api/axios";
import Meals from "./Meals";

// Mock API requests so no Spring Boot server is needed.
vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Replace MealCard with a simple version for testing.
vi.mock("../../components/MealCard/MealCard", () => ({
  default: ({ meal }) => <div>{meal.name}</div>,
}));

const sampleMeals = [
  { id: 1, name: "Pancakes", mealPeriod: "BREAKFAST" },
  { id: 2, name: "Pizza", mealPeriod: "LUNCH" },
  { id: 3, name: "Pasta", mealPeriod: "DINNER" },
  { id: 4, name: "Omelette", mealPeriod: "BREAKFAST" },
];

describe("BearsCafe - Today's Menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: sampleMeals });
  });

  afterEach(() => {
    cleanup();
  });

  test("displays meals from the API", async () => {
    render(<Meals />);

    expect(await screen.findByText("Pancakes")).toBeTruthy();
    expect(screen.getByText("Pizza")).toBeTruthy();
    expect(screen.getByText("Pasta")).toBeTruthy();

    expect(api.get).toHaveBeenCalledWith("/meals/today");
  });

  test("groups meals under the correct meal periods", async () => {
    const { container } = render(<Meals />);

    await screen.findByText("Pancakes");

    const sections = container.querySelectorAll(".meal-section");

    expect(sections).toHaveLength(3);

    const breakfast = sections[0];
    const lunch = sections[1];
    const dinner = sections[2];

    expect(within(breakfast).getByText("Pancakes")).toBeTruthy();
    expect(within(breakfast).getByText("Omelette")).toBeTruthy();
    expect(within(breakfast).queryByText("Pizza")).toBeNull();

    expect(within(lunch).getByText("Pizza")).toBeTruthy();
    expect(within(dinner).getByText("Pasta")).toBeTruthy();
  });

  test("shows an empty menu message when no meals are published", async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Meals />);

    expect(
      await screen.findByText("Today's menu isn't ready yet")
    ).toBeTruthy();

    expect(screen.queryByText("Pancakes")).toBeNull();
  });

  test("shows an error message when loading meals fails", async () => {
    api.get.mockRejectedValue(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(<Meals />);

      expect(
        await screen.findByText(
          "We could not load today's menu. Please try again."
        )
      ).toBeTruthy();
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("shows a session expired message for unauthorized requests", async () => {
    api.get.mockRejectedValue({
      response: { status: 401 },
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(<Meals />);

      expect(
        await screen.findByText(
          "Your session is invalid or expired. Please log in again."
        )
      ).toBeTruthy();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});