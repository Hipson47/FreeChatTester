import type { ChatMessage, ChatCompletionResponse, ModelsResponse, OpenRouterModel } from "../types";

const BASE_URL = "https://openrouter.ai/api/v1";

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": window.location.origin,
  };
}

function extractError(data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: { message?: string } }).error;
    return err?.message ?? "Unknown API error";
  }
  return "Unknown error";
}

export async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch(`${BASE_URL}/models`, {
    headers: headers(apiKey),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      res.status === 401
        ? "Invalid API key"
        : body ? extractError(body) : `Failed to fetch models (${res.status})`
    );
  }

  const data: ModelsResponse = await res.json();
  return data.data
    .filter((m) => m.id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function sendChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  stream: boolean
): Promise<ReadableStream<Uint8Array> | string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ model, messages, stream }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      res.status === 401
        ? "Invalid API key"
        : body ? extractError(body) : `Request failed (${res.status})`
    );
  }

  if (stream) {
    if (!res.body) throw new Error("Streaming not supported by browser");
    return res.body;
  }

  const data: ChatCompletionResponse = await res.json();
  if (data.error) throw new Error(data.error.message);

  return data.choices?.[0]?.message?.content ?? "";
}

export function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function read() {
    reader.read().then(({ done, value }) => {
      if (done) {
        onDone();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch {
          // skip malformed chunks
        }
      }

      read();
    }).catch(onError);
  }

  read();
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
