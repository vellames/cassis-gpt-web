export type ModelId = "en" | "br";

export interface Model {
  id: ModelId;
  name: string;
  endpoint: string;
}

export const MODELS: Model[] = [
  {
    id: "en",
    name: "CassisGPT-0.1-EN",
    endpoint:
      "https://c-vellames--arandu-1-serve-owt-aranduserver-instruct.modal.run",
  },
  {
    id: "br",
    name: "CassisGPT-0.1-BR",
    endpoint: "/api/chat/br",
  },
];

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
