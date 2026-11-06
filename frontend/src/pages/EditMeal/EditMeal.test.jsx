
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
import EditMeal from "./EditMeal";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const sampleMeal = {
  id: 1,
  name: "Pancakes",
  description: "Fresh pancakes with syrup",
  mealDate: "2026-11-10",
  mealPeriod: "BREAKFAST",
  status: "PUBLISHED",
  dish: { id: 10, imageUrl: "" },
  imageUrl: "",
};

describe("BearsCafe - Edit Meal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockResolvedValue({ data: sampleMeal });
    api.put.mockResolvedValue({ data: sampleMeal });
    api.post.mockResolvedValue({ data: { imageUrl: "" } });
    api.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("loads and displays the existing meal information", async () => {
    render(<EditMeal />);

    expect(
      await screen.findByDisplayValue("Pancakes")
    ).toBeTruthy();

    expect(
      screen.getByDisplayValue("Fresh pancakes with syrup")
    ).toBeTruthy();

    expect(screen.getByLabelText("Meal Period").value)
      .toBe("BREAKFAST");

    expect(screen.getByLabelText("Status").value)
      .toBe("PUBLISHED");

    expect(api.get).toHaveBeenCalledWith("/meals/1");
  });

  test("updates meal details and navigates back", async () => {
    render(<EditMeal />);

    const nameInput = await screen.findByDisplayValue("Pancakes");

    fireEvent.change(nameInput, {
      target: { value: "Blueberry Pancakes" },
    });

    fireEvent.change(
      screen.getByLabelText("Meal Period"),
      { target: { value: "LUNCH" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save Changes" })
    );

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/meals/1",
        expect.objectContaining({
          name: "Blueberry Pancakes",
          mealPeriod: "LUNCH",
          status: "PUBLISHED",
          dish: { id: 10 },
        })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/meal-management",
        { replace: true }
      );
    });
  });

  test("shows an error if the meal cannot be found", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.get.mockRejectedValue({
      response: { status: 404 },
    });

    try {
      render(<EditMeal />);

      expect(
        await screen.findByRole("alert")
      ).toHaveProperty(
        "textContent",
        expect.stringContaining(
          "The requested meal could not be found."
        )
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("shows an error if updating the meal fails", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.put.mockRejectedValue(new Error("Network error"));

    try {
      render(<EditMeal />);

      await screen.findByDisplayValue("Pancakes");

      fireEvent.click(
        screen.getByRole("button", { name: "Save Changes" })
      );

      expect(
        await screen.findByRole("alert")
      ).toHaveProperty(
        "textContent",
        expect.stringContaining(
          "Could not update the meal."
        )
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("allows staff to cancel without saving", async () => {
    render(<EditMeal />);

    await screen.findByDisplayValue("Pancakes");

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel" })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/meal-management"
    );

    expect(api.put).not.toHaveBeenCalled();
  });

  test("removes a meal-specific image override", async () => {
    api.get.mockResolvedValue({
      data: {
        ...sampleMeal,
        imageUrl: "/uploads/meal-1.jpg",
      },
    });

    render(<EditMeal />);

    await screen.findByDisplayValue("Pancakes");

    fireEvent.click(
      screen.getByLabelText(/Use default dish picture/i)
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Override Only" })
    );

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        "/meals/1/image"
      );
    });

    expect(
      await screen.findByRole("status")
    ).toHaveProperty(
      "textContent",
      expect.stringContaining(
        "Meal now uses the default dish picture."
      )
    );
  });
});