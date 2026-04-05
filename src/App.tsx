import { useState, useCallback } from "react";
import { ApiKeyInput } from "./components/ApiKeyInput";
import { ModelSelect } from "./components/ModelSelect";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { fetchModels, sendChatCompletion, parseSSEStream } from "./lib/openrouter";
import type { OpenRouterModel, ChatMessage, Attachment, ContentPart } from "./types";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [modelsLoading, setModelsLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const loadModels = useCallback(async () => {
    setError("");
    setModelsLoading(true);
    try {
      const result = await fetchModels(apiKey);
      setModels(result);
      if (result.length > 0 && !selectedModel) setSelectedModel(result[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models");
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }, [apiKey, selectedModel]);

  const sendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    setError("");

    // Build user message content
    let userContent: string | ContentPart[];
    if (attachments.length > 0) {
      const parts: ContentPart[] = [];
      if (text) parts.push({ type: "text", text });
      for (const a of attachments) {
        if (a.textContent !== undefined) {
          // MD files: inject as text with filename context
          parts.push({ type: "text", text: `[File: ${a.file.name}]\n${a.textContent}` });
        } else {
          // Images, videos, PDFs: send as data URL
          parts.push({ type: "image_url", image_url: { url: a.dataUrl } });
        }
      }
      userContent = parts;
    } else {
      userContent = text;
    }

    const userMsg: ChatMessage = { role: "user", content: userContent };
    const assistantMsg: ChatMessage = { role: "assistant", content: "" };

    // For the API, flatten all messages to proper format
    const apiMessages: ChatMessage[] = [
      ...(systemPrompt.trim() ? [{ role: "system" as const, content: systemPrompt.trim() }] : []),
      ...messages,
      userMsg,
    ];

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setChatLoading(true);

    try {
      const result = await sendChatCompletion(apiKey, selectedModel, apiMessages, streaming);

      if (typeof result === "string") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: result };
          return updated;
        });
        setChatLoading(false);
      } else {
        parseSSEStream(
          result,
          (chunk) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              const prevContent = typeof last.content === "string" ? last.content : "";
              updated[updated.length - 1] = { ...last, content: prevContent + chunk };
              return updated;
            });
          },
          () => setChatLoading(false),
          (err) => {
            setError(err.message);
            setChatLoading(false);
          }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
      setChatLoading(false);
    }
  }, [apiKey, selectedModel, messages, systemPrompt, streaming]);

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  const canSend = apiKey.trim() !== "" && selectedModel !== "" && !chatLoading;

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <h1>OpenRouter Tester</h1>
          <ModelSelect models={models} selected={selectedModel} onChange={setSelectedModel} />
        </div>
        <div className="topbar-right">
          <ApiKeyInput
            apiKey={apiKey}
            onChange={setApiKey}
            onLoad={loadModels}
            loading={modelsLoading}
            hasModels={models.length > 0}
          />
          <button
            className="topbar-icon-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 1.5V3.5M9 14.5V16.5M1.5 9H3.5M14.5 9H16.5M3.1 3.1L4.5 4.5M13.5 13.5L14.9 14.9M3.1 14.9L4.5 13.5M13.5 4.5L14.9 3.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {messages.length > 0 && (
            <button className="topbar-icon-btn" onClick={clearChat} title="New chat">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3H10L15 8V15H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 3V8H15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M7 11H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="setting-row">
            <label htmlFor="sys-prompt">System prompt</label>
            <textarea
              id="sys-prompt"
              placeholder="You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2}
            />
          </div>
          <div className="setting-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={streaming}
                onChange={(e) => setStreaming(e.target.checked)}
              />
              Streaming responses
            </label>
          </div>
        </div>
      )}

      {/* Error bar */}
      {error && (
        <div className="error-bar">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Chat */}
      <ChatWindow messages={messages} loading={chatLoading} />
      <ChatInput onSend={sendMessage} disabled={!canSend} />
    </div>
  );
}
