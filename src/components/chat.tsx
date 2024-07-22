import { useState } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { sendMessage } from "@/services/chatbot-service";

type ChatbotDrawerProps = {
  onClose: () => void;
};

const predefinedQuestions = ["O que é um CNPJ?", "Por que colocar o CNPJ?"];

type Message = {
  text: string;
  type: "user" | "assistant" | "loading";
};

export function ChatbotDrawer({ onClose }: ChatbotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSend = async (question: string = input) => {
    if (!question.trim()) return;

    const userMessage: Message = { text: question, type: "user" };
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

    setInput("");
  };

  return (
    <Drawer open={true} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent className="p-4">
        <div className="flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle>Assistente Virtual</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-2 bg-gray-100 rounded-lg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg ${
                  msg.type === "user"
                    ? "bg-primary text-white self-end"
                    : msg.type === "assistant"
                    ? "bg-destructive-foreground text-black self-start"
                    : "self-center"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap">
              {predefinedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSend(question)}
                  className="p-2 m-1"
                >
                  {question}
                </Button>
              ))}
            </div>
            <div className="flex items-center mt-4">
              <Input
                type="text"
                className="flex-1 mr-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem"
              />
              <Button onClick={() => handleSend()} className="p-2">
                Enviar
              </Button>
            </div>
          </div>
          <DrawerFooter className="mt-4">
            <Button onClick={onClose}>Fechar</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
