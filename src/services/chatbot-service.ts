import axios from "axios";

import { CHATBOT_BASE_URL } from "@/constants/api-routes";

export const sendMessage = async (message: string) => {
  try {
    const response = await axios.post(CHATBOT_BASE_URL, { message });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
