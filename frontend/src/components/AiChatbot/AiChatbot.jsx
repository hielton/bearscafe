
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import "./AiChatbot.css";

const SUGGESTED_QUESTIONS = [
  "What's for lunch today?",
  "Which meal has the most protein?",
  "Do you have vegetarian options?",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! 👋 I'm BearsCafe AI. Ask me about today's menu, meal recommendations, or estimated nutrition!",
};

function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    WELCOME_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  const sendMessage = async (question) => {
    const text = question.trim();

    if (!text || isLoading || text.length > 1000) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: text,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            response.data.reply ||
            "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("BearsCafe AI error:", error);

      let errorMessage =
        "Sorry, I'm having trouble responding right now. Please try again.";

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorMessage =
          "Your session may have expired. Please log in again.";
      } else if (error.response?.status === 429) {
        errorMessage =
          "I'm receiving too many requests right now. Please try again shortly.";
      }

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage,
          isError: true,
        },
      ]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    requestIdRef.current += 1;
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="ai-chatbot">
      {isOpen && (
        <section
          className="ai-chat-window"
          aria-label="BearsCafe AI chat"
        >
          <header className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">✦</div>

              <div>
                <h2>BearsCafe AI</h2>
                <p>Your cafeteria assistant</p>
              </div>
            </div>

            <div className="ai-chat-header-actions">
              <button
                type="button"
                onClick={clearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                ↻
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </header>

          <div
            className="ai-chat-messages"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-chat-message ${message.role} ${
                  message.isError ? "error" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="ai-message-avatar">
                    ✦
                  </div>
                )}

                <div className="ai-message-bubble">
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-chat-message assistant">
                <div className="ai-message-avatar">
                  ✦
                </div>

                <div
                  className="ai-typing-indicator"
                  role="status"
                  aria-label="BearsCafe AI is thinking"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="ai-chat-suggestions">
                <p>Try asking:</p>

                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="ai-chat-input-area"
            onSubmit={handleSubmit}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about today's menu..."
              value={input}
              maxLength={1000}
              onChange={(event) =>
                setInput(event.target.value)
              }
              disabled={isLoading}
              aria-label="Message BearsCafe AI"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <p className="ai-chat-disclaimer">
            Nutrition values are estimates, not verified
            cafeteria nutrition facts.
          </p>
        </section>
      )}

      <button
        className="ai-chat-toggle"
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          isOpen ? "Close BearsCafe AI" : "Open BearsCafe AI"
        }
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "✦"}
        {!isOpen && <span>Ask BearsCafe AI</span>}
      </button>
    </div>
  );
}

export default AiChatbot;