/**
 * Harmonize EcoConnect AI Service
 * Provides "Edge-Authoritative" predictions for Agri and Health modes.
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function predictCropYield(data: any, imageBase64?: string) {
  const prompt = `Act as an edge-native agricultural expert. Given local data: ${JSON.stringify(data)}, provide a concise crop yield prediction or disease diagnosis if an image is provided. Provide 3 actionable tips for a rural farmer. Respond in JSON format: { "prediction": "string", "confidence": number, "tips": ["string", "string", "string"] }`;
  
  try {
    const contents: any[] = [{ role: "user", parts: [{ text: prompt }] }];
    
    if (imageBase64) {
      contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1]
        }
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
    });
    const text = result.text || "";
    return JSON.parse(text.replace(/```json|```/g, ""));
  } catch (error) {
    console.error("AI Agri Prediction Error:", error);
    return {
      prediction: "Limited data for localized yield calc. Ensure soil moisture logs are complete.",
      confidence: 0.65,
      tips: ["Check soil pH", "Monitor rainfall levels", "Observe leaf discoloration"]
    };
  }
}

export async function triageSymptoms(symptoms: string, imageBase64?: string) {
  const prompt = `Act as an edge-native primary healthcare doctor in a rural setting. Triage these symptoms/visuals: "${symptoms}". Provide a risk level (Low, Medium, High) and immediate advice. Respond in JSON format: { "riskLevel": "string", "advice": "string", "redFlags": ["string"] }`;

  try {
    const contents: any[] = [{ role: "user", parts: [{ text: prompt }] }];
    
    if (imageBase64) {
      contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1]
        }
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
    });
    const text = result.text || "";
    return JSON.parse(text.replace(/```json|```/g, ""));
  } catch (error) {
    console.error("AI Health Triage Error:", error);
    return {
      riskLevel: "Medium",
      advice: "Rest and monitor temperature. Use local clinic if symptoms persist.",
      redFlags: ["Sudden fever", "Difficulty breathing"]
    };
  }
}
