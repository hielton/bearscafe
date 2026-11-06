
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
import StaffDashboard from "./StaffDashboard";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../utils/mealImage", () => ({
  getMealImageUrl: vi.fn(() => null),
}));

const sampleMeals = [
  {
    id: 1,
    name: "Pancakes",
    description: "Fresh pancakes",
    mealPeriod: "BREAKFAST",
    status: "PUBLISHED",
  },
  {
    id: 2,
    name: "Pizza",
    description: "Cheese pizza",
    mealPeriod: "LUNCH",
    status: "PUBLISHED",
  },
  {
    id: 3,
    name: "Pasta",
    description: "Tomato pasta",
    mealPeriod: "DINNER",
    status: "DRAFT",
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <StaffDashboard />
    </MemoryRouter>
  );
}

describe("BearsCafe - Staff Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: sampleMeals });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("loads today's meals from the API", async () => {
    renderDashboard();

    expect(await screen.findByText("Pancakes")).toBeTruthy();
    expect(screen.getByText("Pizza")).toBeTruthy();
    expect(screen.getByText("Pasta")).toBeTruthy();

    expect(api.get).toHaveBeenCalledWith("/meals/today");
  });

  test("calculates dashboard statistics correctly", async () => {
    renderDashboard();

    await screen.findByText("Pancakes");

    const stats = screen.getByRole("region", {
      name: "Today's menu overview",
    });

    const cards = stats.querySelectorAll(".dashboard-stat-card");

    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText("3")).toBeTruthy();
    expect(within(cards[1]).getByText("2")).toBeTruthy();
    expect(
      cards[2].querySelector("strong").textContent
        .replace(/\s+/g, " ")
        .trim()
    ).toBe("3 / 3");
  });

  test("displays an empty state when no meals exist", async () => {
    api.get.mockResolvedValue({ data: [] });

    renderDashboard();

    expect(
      await screen.findByText("No meals on today's menu")
    ).toBeTruthy();

    expect(
      screen.getByRole("link", {
        name: "Go to Meal Management",
      })
    ).toHaveProperty("pathname", "/meal-management");
  });

  test("refreshes the menu when staff clicks Refresh", async () => {
    renderDashboard();

    await screen.findByText("Pancakes");

    fireEvent.click(
      screen.getByRole("button", { name: /Refresh/i })
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  test("shows a permission error for a 403 response", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.get.mockRejectedValue({
      response: { status: 403 },
    });

    try {
      renderDashboard();

      expect(
        await screen.findByRole("alert")
      ).toHaveProperty(
        "textContent",
        expect.stringContaining(
          "You do not have permission to view this page."
        )
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("allows staff to retry after an API failure", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.get
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ data: sampleMeals });

    try {
      renderDashboard();

      await screen.findByRole("alert");

      fireEvent.click(
        screen.getByRole("button", { name: "Try again" })
      );

      expect(await screen.findByText("Pancakes")).toBeTruthy();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2);
      });

      expect(screen.queryByRole("alert")).toBeNull();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});