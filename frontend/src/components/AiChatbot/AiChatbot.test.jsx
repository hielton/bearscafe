import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AiChatbot from "./AiChatbot";
import api from "../../api/axios";

// Mock the shared Axios client.
vi.mock("../../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// JSDOM does not implement scrollIntoView.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Provide randomUUID if it is unavailable in JSDOM.
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      ...globalThis.crypto,
      randomUUID: vi.fn(() => Math.random().toString(36)),
    },
  });
}

describe("AiChatbot", () => {
   beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  async function openChat(user) {
    await user.click(
      screen.getByRole("button", {
        name: "Open BearsCafe AI",
      })
    );
  }

  it("opens and closes the chatbot", async () => {
    const user = userEvent.setup();

    render(<AiChatbot />);

    expect(
      screen.queryByRole("region", {
        name: "BearsCafe AI chat",
      })
    ).not.toBeInTheDocument();

    await openChat(user);

    expect(
      screen.getByRole("region", {
        name: "BearsCafe AI chat",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/I'm BearsCafe AI/i)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Close chat",
      })
    );

    expect(
      screen.queryByRole("region", {
        name: "BearsCafe AI chat",
      })
    ).not.toBeInTheDocument();
  });

  it("displays suggested questions", async () => {
    const user = userEvent.setup();

    render(<AiChatbot />);
    await openChat(user);

    expect(
      screen.getByRole("button", {
        name: "What's for lunch today?",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Which meal has the most protein?",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Do you have vegetarian options?",
      })
    ).toBeInTheDocument();
  });

  it("sends a message and displays the AI reply", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValue({
      data: {
        reply: "Grilled Chicken Dinner is available today.",
      },
    });

    render(<AiChatbot />);
    await openChat(user);

    await user.type(
      screen.getByRole("textbox", {
        name: "Message BearsCafe AI",
      }),
      "What's for dinner?"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send message",
      })
    );

    expect(api.post).toHaveBeenCalledWith(
      "/ai/chat",
      {
        message: "What's for dinner?",
      }
    );

    expect(
      screen.getByText("What's for dinner?")
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Grilled Chicken Dinner is available today."
      )
    ).toBeInTheDocument();
  });

  it("sends a suggested question", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValue({
      data: {
        reply: "Today's lunch includes cheese pizza.",
      },
    });

    render(<AiChatbot />);
    await openChat(user);

    await user.click(
      screen.getByRole("button", {
        name: "What's for lunch today?",
      })
    );

    expect(api.post).toHaveBeenCalledWith(
      "/ai/chat",
      {
        message: "What's for lunch today?",
      }
    );

    expect(
      await screen.findByText(
        "Today's lunch includes cheese pizza."
      )
    ).toBeInTheDocument();
  });

  it("prevents empty messages", async () => {
    const user = userEvent.setup();

    render(<AiChatbot />);
    await openChat(user);

    const sendButton = screen.getByRole("button", {
      name: "Send message",
    });

    expect(sendButton).toBeDisabled();

    const input = screen.getByRole("textbox", {
      name: "Message BearsCafe AI",
    });

    await user.type(input, "   ");

    expect(sendButton).toBeDisabled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("shows loading state while waiting for Gemini", async () => {
    const user = userEvent.setup();

    let resolveRequest;

    api.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    render(<AiChatbot />);
    await openChat(user);

    await user.type(
      screen.getByRole("textbox", {
        name: "Message BearsCafe AI",
      }),
      "How many calories?"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send message",
      })
    );

    expect(
      screen.getByRole("status", {
        name: "BearsCafe AI is thinking",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Send message",
      })
    ).toBeDisabled();

    resolveRequest({
      data: {
        reply: "Approximately 478 calories.",
      },
    });

    expect(
      await screen.findByText(
        "Approximately 478 calories."
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole("status", {
          name: "BearsCafe AI is thinking",
        })
      ).not.toBeInTheDocument();
    });
  });

  it("handles a general API error", async () => {
    const user = userEvent.setup();

    api.post.mockRejectedValue(
      new Error("Network error")
    );

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(<AiChatbot />);
      await openChat(user);

      await user.type(
        screen.getByRole("textbox", {
          name: "Message BearsCafe AI",
        }),
        "Hello"
      );

      await user.click(
        screen.getByRole("button", {
          name: "Send message",
        })
      );

      expect(
        await screen.findByText(
          /I'm having trouble responding right now/i
        )
      ).toBeInTheDocument();
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("handles an expired session", async () => {
    const user = userEvent.setup();

    api.post.mockRejectedValue({
      response: {
        status: 401,
      },
    });

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(<AiChatbot />);
      await openChat(user);

      await user.type(
        screen.getByRole("textbox", {
          name: "Message BearsCafe AI",
        }),
        "Hello"
      );

      await user.click(
        screen.getByRole("button", {
          name: "Send message",
        })
      );

      expect(
        await screen.findByText(
          /Your session may have expired/i
        )
      ).toBeInTheDocument();
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("clears the conversation", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValue({
      data: {
        reply: "Hello! Welcome to BearsCafe.",
      },
    });

    render(<AiChatbot />);
    await openChat(user);

    await user.type(
      screen.getByRole("textbox", {
        name: "Message BearsCafe AI",
      }),
      "Hello"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send message",
      })
    );

    expect(
      await screen.findByText(
        "Hello! Welcome to BearsCafe."
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Clear conversation",
      })
    );

    const chatLog = screen.getByRole("log");

    expect(
      within(chatLog).queryByText(
        "Hello! Welcome to BearsCafe."
      )
    ).not.toBeInTheDocument();

    expect(
      within(chatLog).getByText(
        /I'm BearsCafe AI/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "What's for lunch today?",
      })
    ).toBeInTheDocument();
  });

  it("ignores an old API response after clearing chat", async () => {
    const user = userEvent.setup();

    let resolveRequest;

    api.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    render(<AiChatbot />);
    await openChat(user);

    await user.type(
      screen.getByRole("textbox", {
        name: "Message BearsCafe AI",
      }),
      "Old question"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send message",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Clear conversation",
      })
    );

    resolveRequest({
      data: {
        reply: "Old response",
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Old response")
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Send message",
        })
      ).toBeDisabled();
    });

    expect(
      screen.getByText(/I'm BearsCafe AI/i)
    ).toBeInTheDocument();
  });
});
