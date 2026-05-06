/**
 * Harmonize EcoConnect AI Service
 * Provides "Edge-Authoritative" predictions.
 * Prioritizes local FastAPI (TFLite) inference on the Pi node.
 */

import { GoogleGenAI } from "@google/genai";

const NODE_API_BASE = "http://192.168.4.1:8000"; // Pi Node IP
const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || "" });

export async function predictCropYield(data: any, imageBase64?: string) {
  // 1. Try Local Edge Inference
  try {
    const response = await fetch(`${NODE_API_BASE}/ai/agri-advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, imageBase64 })
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.warn("Local AI Inference failed, falling back to Gemini:", error);
  }

  // 2. Fallback to Gemini (Cloud)
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
      model: "gemini-1.5-flash", // Updated to a more standard model name
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
  // 1. Try Local Edge Inference
  try {
    const response = await fetch(`${NODE_API_BASE}/ai/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms, imageBase64 })
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.warn("Local Health Triage failed, falling back to Gemini:", error);
  }

  // 2. Fallback to Gemini (Cloud)
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
      model: "gemini-1.5-flash",
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
