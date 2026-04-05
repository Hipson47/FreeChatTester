import { useState } from "react";

interface Props {
  apiKey: string;
  onChange: (key: string) => void;
  onLoad: () => void;
  loading: boolean;
  hasModels: boolean;
}

export function ApiKeyInput({ apiKey, onChange, onLoad, loading, hasModels }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="topbar-key">
      <div className="key-input-wrap">
        <input
          type={visible ? "text" : "password"}
          placeholder="OpenRouter API key"
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && apiKey.trim()) onLoad(); }}
        />
        <button className="key-toggle" onClick={() => setVisible(!visible)} title={visible ? "Hide" : "Show"}>
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M6.5 6.5C5.7 7.3 5.7 8.7 6.5 9.5C7.3 10.3 8.7 10.3 9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 8C4.5 5.5 6 4.5 8 4.5C10 4.5 11.5 5.5 13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <ellipse cx="8" cy="8" rx="2.5" ry="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M1.5 8C3 5 5.5 3.5 8 3.5C10.5 3.5 13 5 14.5 8C13 11 10.5 12.5 8 12.5C5.5 12.5 3 11 1.5 8Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          )}
        </button>
      </div>
      <button className="key-load" onClick={onLoad} disabled={!apiKey.trim() || loading}>
        {loading ? "Loading..." : hasModels ? "Reload" : "Connect"}
      </button>
    </div>
  );
}
