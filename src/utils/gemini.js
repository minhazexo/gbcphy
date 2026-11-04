// Lightweight Gemini helper — the GoogleGenerativeAI client is loaded on first use
// to avoid including a large SDK dependency on every page load.

let genAI = null;
let model = null;

// Initialize on first call
export const getGeminiResponse = async (prompt) => {
  if (!genAI) {
    // Lazy import the heavy SDK
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const API_KEY = import.meta.env.REACT_APP_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};