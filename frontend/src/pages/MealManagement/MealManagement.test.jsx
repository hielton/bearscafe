
// @vitest-environment jsdom

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import api from "../../api/axios";
import MealManagement from "./MealManagement";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../utils/mealImage", () => ({
  getMealImageUrl: vi.fn(() => null),
}));

const sampleMeals = [
  {
    id: 1,
    name: "Pancakes",
    description: "Fresh pancakes with syrup",
    mealDate: "2026-10-01",
    mealPeriod: "BREAKFAST",
    status: "PUBLISHED",
    dish: { id: 10 },
  },
  {
    id: 2,
    name: "Pizza",
    description: "Cheese pizza",
    mealDate: "2026-10-02",
    mealPeriod: "LUNCH",
    status: "DRAFT",
    dish: { id: 20 },
  },
  {
    id: 3,
    name: "Pasta",
    description: "Pasta with tomato sauce",
    mealDate: "2026-10-03",
    mealPeriod: "DINNER",
    status: "UNPUBLISHED",
    dish: { id: 30 },
  },
];

function renderManagement() {
  return render(
    <MemoryRouter>
      <MealManagement />
    </MemoryRouter>
  );
}

function getMealCard(name) {
  const heading = screen.getByRole("heading", {
    name,
    level: 3,
  });

  return heading.closest(".history-card");
}

describe("BearsCafe - Meal Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockResolvedValue({
      data: sampleMeals,
    });

    api.post.mockResolvedValue({
      data: { id: 4 },
    });

    api.delete.mockResolvedValue({
      data: {},
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("loads and displays all saved meals", async () => {
    renderManagement();

    expect(await screen.findByText("Pancakes")).toBeTruthy();
    expect(screen.getByText("Pizza")).toBeTruthy();
    expect(screen.getByText("Pasta")).toBeTruthy();

    expect(api.get).toHaveBeenCalledWith("/meals");

    expect(
      screen.getByText("Showing 3 of 3 saved meals")
    ).toBeTruthy();
  });

  test("filters meals by search term", async () => {
    renderManagement();

    await screen.findByText("Pancakes");

    fireEvent.change(
      screen.getByPlaceholderText("Search meals..."),
      { target: { value: "pizza" } }
    );

    expect(screen.getByText("Pizza")).toBeTruthy();
    expect(screen.queryByText("Pancakes")).toBeNull();
    expect(screen.queryByText("Pasta")).toBeNull();
  });

  test("filters meals by meal period", async () => {
    renderManagement();

    await screen.findByText("Pancakes");

    fireEvent.change(
      screen.getByLabelText("Meal Period"),
      { target: { value: "DINNER" } }
    );

    expect(screen.getByText("Pasta")).toBeTruthy();
    expect(screen.queryByText("Pizza")).toBeNull();
    expect(screen.queryByText("Pancakes")).toBeNull();
  });

  test("filters meals by publication status", async () => {
    renderManagement();

    await screen.findByText("Pancakes");

    fireEvent.change(
      screen.getByLabelText("Status"),
      { target: { value: "DRAFT" } }
    );

    expect(screen.getByText("Pizza")).toBeTruthy();
    expect(screen.queryByText("Pancakes")).toBeNull();
    expect(screen.queryByText("Pasta")).toBeNull();
  });

  test("does not delete a meal if staff cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderManagement();

    await screen.findByText("Pancakes");

    const card = getMealCard("Pancakes");

    fireEvent.click(
      within(card).getByRole("button", { name: "Delete" })
    );

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this meal?"
    );

    expect(api.delete).not.toHaveBeenCalled();
    expect(screen.getByText("Pancakes")).toBeTruthy();
  });

  test("deletes a meal after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderManagement();

    await screen.findByText("Pancakes");

    const card = getMealCard("Pancakes");

    fireEvent.click(
      within(card).getByRole("button", { name: "Delete" })
    );

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/meals/1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Pancakes")).toBeNull();
    });

    expect(
      screen.getByText("Meal deleted successfully.")
    ).toBeTruthy();

    expect(
      screen.getByText("Showing 2 of 2 saved meals")
    ).toBeTruthy();
  });

  test("keeps the meal if deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.delete.mockRejectedValue({
      response: { status: 403 },
    });

    try {
      renderManagement();

      await screen.findByText("Pancakes");

      fireEvent.click(
        within(getMealCard("Pancakes")).getByRole(
          "button",
          { name: "Delete" }
        )
      );

      expect(
        await screen.findByText(
          "You do not have permission to delete meals."
        )
      ).toBeTruthy();

      expect(screen.getByText("Pancakes")).toBeTruthy();
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("reuses a historical meal for today's menu", async () => {
    renderManagement();

    await screen.findByText("Pancakes");

    const card = getMealCard("Pancakes");

    fireEvent.change(
      within(card).getByLabelText("Serve today as"),
      { target: { value: "LUNCH" } }
    );

    fireEvent.click(
      within(card).getByRole("button", { name: "Use Today" })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/meals",
        expect.objectContaining({
          name: "Pancakes",
          mealPeriod: "LUNCH",
          status: "PUBLISHED",
          dish: { id: 10 },
        })
      );
    });

    expect(
      await screen.findByText(
        "Pancakes was added to today's lunch menu."
      )
    ).toBeTruthy();
  });
    
  test("clears all search and filter selections", async () => {
    renderManagement();

    await screen.findByText("Pancakes");

    fireEvent.change(
      screen.getByPlaceholderText("Search meals..."),
      { target: { value: "pizza" } }
    );

    fireEvent.change(
      screen.getByLabelText("Status"),
      { target: { value: "DRAFT" } }
    );

    expect(screen.queryByText("Pancakes")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Clear Filters" })
    );

    expect(screen.getByText("Pancakes")).toBeTruthy();
    expect(screen.getByText("Pizza")).toBeTruthy();
    expect(screen.getByText("Pasta")).toBeTruthy();

    expect(screen.getByLabelText("Status").value).toBe("ALL");
  });

  test("shows no results for an unmatched search", async () => {
    renderManagement();

    await screen.findByText("Pancakes");

    fireEvent.change(
      screen.getByPlaceholderText("Search meals..."),
      { target: { value: "Sushi" } }
    );

    expect(screen.getByText("No meals found")).toBeTruthy();
    expect(
      screen.getByText("Showing 0 of 3 saved meals")
    ).toBeTruthy();
  });

  test("prevents reusing a meal without a linked dish", async () => {
    api.get.mockResolvedValue({
      data: [
        {
          ...sampleMeals[0],
          dish: null,
        },
      ],
    });

    renderManagement();

    await screen.findByText("Pancakes");

    fireEvent.click(
      screen.getByRole("button", { name: "Use Today" })
    );

    expect(
      screen.getByText(
        "This meal has no linked dish. Please verify its dish association before reusing it."
      )
    ).toBeTruthy();

    expect(api.post).not.toHaveBeenCalled();
  });

  test("prevents duplicate meals on today's menu", async () => {
    const now = new Date();

    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    api.get.mockResolvedValue({
      data: [
        {
          ...sampleMeals[0],
          mealDate: today,
          status: "PUBLISHED",
        },
        {
          ...sampleMeals[0],
          id: 99,
          mealDate: "2026-01-01",
          dish: { id: 10 },
        },
      ],
    });

    renderManagement();

    await screen.findAllByText("Pancakes");

    const cards = document.querySelectorAll(".history-card");
    const historicalCard = Array.from(cards).find((card) =>
      card.textContent.includes("2026-01-01")
    );

    expect(historicalCard).toBeTruthy();

    expect(
      within(historicalCard).getByRole("button", {
        name: /On Breakfast Menu/,
      }).disabled
    ).toBe(true);

    expect(api.post).not.toHaveBeenCalled();
  });
  
});