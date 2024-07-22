import axios from "axios";

const BASE_URL = "https://6403-200-129-62-72.ngrok-free.app/bot/";

export const sendMessage = async (message: string) => {
  try {
    const response = await axios.post(BASE_URL, { message });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
