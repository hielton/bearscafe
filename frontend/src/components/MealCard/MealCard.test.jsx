
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
} from "@testing-library/react";

import api from "../../api/axios";
import MealCard from "./MealCard";

// Mock API requests.
vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock image URL helper to keep tests independent of images.
vi.mock("../../utils/mealImage", () => ({
  getMealImageUrl: vi.fn(() => null),
}));

const sampleMeal = {
  id: 1,
  name: "Pancakes",
  description: "Fresh pancakes with syrup",
  mealPeriod: "BREAKFAST",
};

describe("BearsCafe - Meal Reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 204 means the student has not reviewed this meal.
    api.get.mockResolvedValue({
      status: 204,
      data: null,
    });

    api.post.mockResolvedValue({
      data: {
        ratingValue: 5,
        comment: "",
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("displays meal information", async () => {
    render(<MealCard meal={sampleMeal} />);

    expect(screen.getByText("Pancakes")).toBeTruthy();
    expect(
      screen.getByText("Fresh pancakes with syrup")
    ).toBeTruthy();
    expect(screen.getByText("BREAKFAST")).toBeTruthy();

    expect(
      await screen.findByRole("button", { name: "5 stars" })
    ).toBeTruthy();
  });

  test("loads the student's existing review", async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: {
        ratingValue: 4,
        comment: "Really good breakfast!",
      },
    });

    render(<MealCard meal={sampleMeal} />);

    expect(await screen.findByText("Your Review")).toBeTruthy();
    expect(screen.getByText("✓ Reviewed")).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "4 stars" })
        .getAttribute("aria-pressed")
    ).toBe("true");

    expect(
      screen.getByRole("textbox", { name: "Your feedback" }).value
    ).toBe("Really good breakfast!");
  });

  test("requires feedback for a 2-star rating", async () => {
    render(<MealCard meal={sampleMeal} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "2 stars" })
    );

    expect(screen.getByText("Required")).toBeTruthy();

    const feedback = screen.getByRole("textbox", {
      name: "Your feedback",
    });

    expect(feedback.required).toBe(true);
    expect(api.post).not.toHaveBeenCalled();
  });

  test("submits a 5-star review without a comment", async () => {
    render(<MealCard meal={sampleMeal} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "5 stars" })
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Submit Review" })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/reviews/meal/1",
        {
          ratingValue: 5,
          comment: "",
        }
      );
    });

    expect(
      await screen.findByText(
        "Thank you! Your review has been submitted."
      )
    ).toBeTruthy();
  });

  test("submits a low rating with written feedback", async () => {
    api.post.mockResolvedValue({
      data: {
        ratingValue: 2,
        comment: "The food was cold.",
      },
    });

    render(<MealCard meal={sampleMeal} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "2 stars" })
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Your feedback" }),
      {
        target: {
          value: "The food was cold.",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Submit Review" })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/reviews/meal/1",
        {
          ratingValue: 2,
          comment: "The food was cold.",
        }
      );
    });
  });

  test("updates an existing review", async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: {
        ratingValue: 3,
        comment: "It was okay.",
      },
    });

    api.post.mockResolvedValue({
      data: {
        ratingValue: 5,
        comment: "Much better!",
      },
    });

    render(<MealCard meal={sampleMeal} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "5 stars" })
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Your feedback" }),
      {
        target: {
          value: "Much better!",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Update Review" })
    );

    expect(
      await screen.findByText("Your review has been updated.")
    ).toBeTruthy();

    expect(api.post).toHaveBeenCalledWith(
      "/reviews/meal/1",
      {
        ratingValue: 5,
        comment: "Much better!",
      }
    );
  });

  test("shows an error when review submission fails", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.post.mockRejectedValue(
      new Error("Network error")
    );

    try {
      render(<MealCard meal={sampleMeal} />);

      fireEvent.click(
        await screen.findByRole("button", { name: "5 stars" })
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Submit Review" })
      );

      expect(
        await screen.findByRole("alert")
      ).toHaveProperty(
        "textContent",
        expect.stringContaining(
          "We could not save your review."
        )
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});