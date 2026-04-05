import { useEffect, useRef } from "react";
import type { ChatMessage, ContentPart } from "../types";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
}

function renderContent(content: string | ContentPart[]) {
  if (typeof content === "string") {
    return <div className="msg-text">{content}</div>;
  }

  return (
    <>
      {content.map((part, i) => {
        if (part.type === "text") {
          // Check if this is an injected file
          const fileMatch = part.text.match(/^\[File: (.+?)\]\n/);
          if (fileMatch) {
            return (
              <div key={i} className="msg-file-block">
                <div className="msg-file-label">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M5 2H12L16 6V18H5V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 2V6H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  {fileMatch[1]}
                </div>
                <pre className="msg-file-content">{part.text.slice(fileMatch[0].length)}</pre>
              </div>
            );
          }
          return <div key={i} className="msg-text">{part.text}</div>;
        }
        if (part.type === "image_url") {
          const url = part.image_url.url;
          if (url.startsWith("data:video/")) {
            return (
              <video key={i} className="msg-media" controls>
                <source src={url} />
              </video>
            );
          }
          if (url.startsWith("data:application/pdf")) {
            return (
              <div key={i} className="msg-file-block">
                <div className="msg-file-label">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M5 2H12L16 6V18H5V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 2V6H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  PDF document attached
                </div>
              </div>
            );
          }
          return <img key={i} className="msg-media" src={url} alt="attachment" />;
        }
        return null;
      })}
    </>
  );
}

export function ChatWindow({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0) {
    return (
      <div className="chat-area">
        <div className="chat-empty">
          <div className="chat-empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 20H34M14 28H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p>Start a conversation</p>
          <span>Select a model and type a message below</span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-messages">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const isLoading = loading && !isUser && i === messages.length - 1;
          const content = msg.content;
          const isEmpty = typeof content === "string" ? !content : content.every(p => p.type === "text" && !p.text);

          return (
            <div key={i} className={`msg ${msg.role}`}>
              <div className="msg-avatar">
                {isUser ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 16C3 13 5.5 11 9 11C12.5 11 15 13 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="3" y="3" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="7" cy="8" r="1" fill="currentColor"/>
                    <circle cx="11" cy="8" r="1" fill="currentColor"/>
                    <path d="M7 11.5C7.5 12.5 10.5 12.5 11 11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <div className="msg-body">
                <div className="msg-role">{isUser ? "You" : "Assistant"}</div>
                {isEmpty && isLoading ? (
                  <div className="msg-typing">
                    <span></span><span></span><span></span>
                  </div>
                ) : (
                  <div className="msg-content">{renderContent(content)}</div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
