export interface OpenRouterModel {
  id: string;
  name: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export interface TextContentPart {
  type: "text";
  text: string;
}

export interface ImageContentPart {
  type: "image_url";
  image_url: { url: string };
}

export type ContentPart = TextContentPart | ImageContentPart;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export interface Attachment {
  id: string;
  file: File;
  dataUrl: string;
  textContent?: string;
  type: "image" | "video" | "document";
}

export interface ChatCompletionResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
  error?: {
    message: string;
    code?: number;
  };
}

export interface ModelsResponse {
  data: OpenRouterModel[];
}
