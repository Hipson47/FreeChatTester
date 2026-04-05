import { useState, useRef, useCallback } from "react";
import type { Attachment } from "../types";
import { fileToDataUrl, fileToText } from "../lib/openrouter";

interface Props {
  onSend: (message: string, attachments: Attachment[]) => void;
  disabled: boolean;
}

const ACCEPT = "image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm,application/pdf,.md,.markdown,text/markdown";

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, []);

  function getFileKind(file: File): Attachment["type"] {
    if (file.type.startsWith("video/")) return "video";
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return "document";
    if (file.type === "text/markdown" || file.name.endsWith(".md") || file.name.endsWith(".markdown")) return "document";
    return "image";
  }

  function isTextDocument(file: File): boolean {
    return file.type === "text/markdown" || file.name.endsWith(".md") || file.name.endsWith(".markdown");
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      const kind = getFileKind(file);
      const dataUrl = await fileToDataUrl(file);
      const textContent = isTextDocument(file) ? await fileToText(file) : undefined;
      newAttachments.push({
        id: crypto.randomUUID(),
        file,
        dataUrl,
        textContent,
        type: kind,
      });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = !disabled && (input.trim() || attachments.length > 0);

  return (
    <div className="chat-input-area">
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((a) => (
            <div key={a.id} className={`attachment-thumb${a.type === "document" ? " doc" : ""}`}>
              {a.type === "image" ? (
                <img src={a.dataUrl} alt={a.file.name} />
              ) : a.type === "video" ? (
                <video src={a.dataUrl} />
              ) : (
                <div className="attachment-doc">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 2H12L16 6V18H5V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 2V6H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M8 10H13M8 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>{a.file.name}</span>
                </div>
              )}
              <button className="attachment-remove" onClick={() => removeAttachment(a.id)}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="chat-input-row">
        <button
          className="attach-btn"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          title="Attach image or video"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17 10L10.7 16.3C8.7 18.3 5.3 18.3 3.3 16.3C1.3 14.3 1.3 10.9 3.3 8.9L11.1 1.1C12.3 -0.1 14.3 -0.1 15.5 1.1C16.7 2.3 16.7 4.3 15.5 5.5L8.3 12.7C7.7 13.3 6.7 13.3 6.1 12.7C5.5 12.1 5.5 11.1 6.1 10.5L12 4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          placeholder={disabled ? "Connect an API key first..." : "Message..."}
          value={input}
          onChange={(e) => { setInput(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button className="send-btn" onClick={handleSend} disabled={!canSend}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10L17 3L10 17L9 11L3 10Z" fill="currentColor"/>
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>
    </div>
  );
}
