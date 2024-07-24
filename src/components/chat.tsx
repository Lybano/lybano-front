import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { sendMessage } from "@/services/chatbot-service";

type ChatbotModalProps = {
  onClose: () => void;
  username: string;
};

const predefinedQuestions = ["O que é um CNPJ?", "Por que colocar o CNPJ?"];

type Message = {
  text: string;
  type: "user" | "assistant" | "loading";
  username?: string;
};

export function ChatbotModal({ onClose, username }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] =
    useState<boolean>(false);

  const handleSend = async (question: string = input) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setHasSentFirstMessage(true);

    const userMessage: Message = {
      text: question,
      type: "user",
      username,
    };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { text: "...", type: "loading" },
    ]);

    try {
      const data = await sendMessage(question);
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages.pop();
        return [...updatedMessages, { text: data, type: "assistant" }];
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem ao chatbot:", error);
      setMessages((prev) => prev.filter((msg) => msg.type !== "loading"));
    }

    setIsLoading(false);
    setInput("");
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col h-full max-h-[80vh] p-4 bg-background-dark text-foreground-dark">
        <h2 className="text-xl font-semibold mb-4">
          Olá, {username}! Como posso ajudar?
        </h2>
        <div className="flex-1 overflow-y-auto p-4 bg-card-dark rounded-lg">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg max-w-full inline-flex font-thin text-sm ${
                msg.type === "user"
                  ? "bg-primary text-white self-end text-right ml-auto"
                  : msg.type === "assistant"
                  ? "bg-secondary text-black self-start text-left"
                  : "text-center"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex flex-col mt-4">
          {!hasSentFirstMessage && (
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSend(question)}
                  className="p-2"
                >
                  {question}
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-center">
            <Input
              type="text"
              className="flex-1 mr-2 bg-input-dark text-foreground-dark"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem"
            />
            <Button
              onClick={() => handleSend()}
              className="p-2 bg-primary text-primary-foreground hover:opacity-95"
              disabled={isLoading}
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
