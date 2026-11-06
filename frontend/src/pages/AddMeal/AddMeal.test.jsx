
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
import AddMeal from "./AddMeal";

vi.mock("../../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("BearsCafe - Add Meal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.post.mockResolvedValue({
      data: {
        id: 1,
        dish: { id: 10 },
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function fillRequiredFields() {
    fireEvent.change(
      screen.getByPlaceholderText("e.g. Chicken Alfredo"),
      { target: { value: "Chicken Alfredo" } }
    );

    fireEvent.change(
      screen.getByLabelText(/Meal Date/i),
      { target: { value: "2026-11-10" } }
    );
  }

  test("displays the form with correct default values", () => {
    render(<AddMeal />);

    expect(screen.getByText("Add a New Meal")).toBeTruthy();

    expect(screen.getByLabelText("Meal Period").value)
      .toBe("BREAKFAST");

    expect(screen.getByLabelText("Status").value)
      .toBe("DRAFT");
  });

  test("creates a meal with the entered information", async () => {
    render(<AddMeal />);

    fillRequiredFields();

    fireEvent.change(
      screen.getByLabelText("Description"),
      { target: { value: "Pasta with creamy sauce" } }
    );

    fireEvent.change(
      screen.getByLabelText("Meal Period"),
      { target: { value: "LUNCH" } }
    );

    fireEvent.change(
      screen.getByLabelText("Status"),
      { target: { value: "PUBLISHED" } }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add Meal" })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/meals",
        expect.objectContaining({
          name: "Chicken Alfredo",
          description: "Pasta with creamy sauce",
          mealDate: "2026-11-10",
          mealPeriod: "LUNCH",
          status: "PUBLISHED",
        })
      );
    });

    expect(
      await screen.findByText("Meal added successfully!")
    ).toBeTruthy();
  });

  test("requires a meal name and date", () => {
    render(<AddMeal />);

    expect(
      screen.getByPlaceholderText("e.g. Chicken Alfredo").required
    ).toBe(true);

    expect(screen.getByLabelText(/Meal Date/i).required)
      .toBe(true);
  });

  test("rejects unsupported image formats", async () => {
    render(<AddMeal />);

    const file = new File(
      ["image content"],
      "document.pdf",
      { type: "application/pdf" }
    );

    const fileInput = document.getElementById("add-meal-image");

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(
      await screen.findByRole("alert")
    ).toHaveProperty(
      "textContent",
      expect.stringContaining(
        "Please select a JPG, PNG, or WebP image."
      )
    );

    expect(api.post).not.toHaveBeenCalled();
  });

  test("rejects images larger than 5 MB", async () => {
    render(<AddMeal />);

    const file = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "large.png",
      { type: "image/png" }
    );

    fireEvent.change(
      document.getElementById("add-meal-image"),
      { target: { files: [file] } }
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveProperty(
      "textContent",
      expect.stringContaining(
        "The image must be 5 MB or smaller."
      )
    );
  });

  test("shows an error if the API rejects meal creation", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.post.mockRejectedValue({
      response: { status: 403 },
    });

    try {
      render(<AddMeal />);
      fillRequiredFields();

      fireEvent.click(
        screen.getByRole("button", { name: "Add Meal" })
      );

      expect(
        await screen.findByRole("alert")
      ).toHaveProperty(
        "textContent",
        expect.stringContaining(
          "You do not have permission to add meals."
        )
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test("resets the form after successfully adding a meal", async () => {
    render(<AddMeal />);

    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: "Add Meal" })
    );

    expect(
      await screen.findByText("Meal added successfully!")
    ).toBeTruthy();

    expect(
      screen.getByPlaceholderText("e.g. Chicken Alfredo").value
    ).toBe("");

    expect(screen.getByLabelText(/Meal Date/i).value)
      .toBe("");

    expect(screen.getByLabelText("Meal Period").value)
      .toBe("BREAKFAST");

    expect(screen.getByLabelText("Status").value)
      .toBe("DRAFT");
  });

  test("reports a partial success when image upload fails", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const createObjectURL = vi.fn(() => "blob:meal-preview");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("URL", Object.assign(URL, {
      createObjectURL,
      revokeObjectURL,
    }));

    api.post
      .mockResolvedValueOnce({
        data: { id: 1, dish: { id: 10 } },
      })
      .mockRejectedValueOnce(new Error("Upload failed"));

    try {
      render(<AddMeal />);
      fillRequiredFields();

      const file = new File(
        ["fake image"],
        "pancakes.png",
        { type: "image/png" }
      );

      fireEvent.change(
        document.getElementById("add-meal-image"),
        { target: { files: [file] } }
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Add Meal" })
      );

      expect(
        await screen.findByRole("alert")
      ).toHaveProperty(
        "textContent",
        expect.stringContaining(
          "The meal was created successfully, but the image"
        )
      );

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(api.post).toHaveBeenNthCalledWith(
        2,
        "/dishes/10/image",
        expect.any(FormData)
      );
    } finally {
      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

});