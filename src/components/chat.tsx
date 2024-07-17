import { useState } from "react";
import { Button } from "./ui/button";

type ChatbotModalProps = {
  onClose: () => void;
};

const predefinedQuestions = ["O que é um CNPJ?", "Porque colocar o CNPJ?"];

export function ChatbotModal({ onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSend = async (question: string = input) => {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, question]);

    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();
    setMessages((prev) => [...prev, data.answer]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Chatbot</h2>
          <Button onClick={onClose}>x</Button>
        </div>
        <div>
          <span>Dúvidas frequentes</span>
        </div>
        <div className="mt-4 space-y-2 h-64 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="p-2 border rounded bg-gray-100">
              {msg}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <div className="flex space-x-2">
            {predefinedQuestions.map((question, idx) => (
              <Button
                key={idx}
                onClick={() => handleSend(question)}
                className="p-2 text-white rounded"
              >
                {question}
              </Button>
            ))}
          </div>
          <div className="flex mt-4">
            <input
              type="text"
              className="flex-1 border p-2 rounded"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              onClick={() => handleSend()}
              className="ml-2 p-2 text-white rounded"
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
