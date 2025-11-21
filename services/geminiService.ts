import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Configuration Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, professional, and appealing product description (max 30 words) for a wholesale grocery item. 
      Product: ${productName}. Category: ${category}. 
      Tone: Commercial, B2B focused.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description.";
  }
};

export const suggestRecipesFromCart = async (items: string[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Configuration Error: API Key missing.";

  if (items.length === 0) return "Add items to your cart to get recipe suggestions!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have these ingredients in my wholesale order: ${items.join(', ')}. 
      Suggest 2 popular dishes a local restaurant could make with these. Keep it brief.`,
    });
    return response.text || "No suggestions available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not fetch recipe suggestions.";
  }
};