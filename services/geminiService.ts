
import { GoogleGenAI } from "@google/genai";

export const getSchedulingInsights = async (scheduleData: any) => {
  // Initialize AI client using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex reasoning tasks (analyzing schedules for potential issues)
      model: 'gemini-3-pro-preview',
      contents: `
        As a head nurse supervisor, analyze the following weekly shift schedule for potential issues 
        (like overworking, understaffing on specific shifts, or illegal double shifts).
        
        Schedule Data:
        ${JSON.stringify(scheduleData)}
        
        Provide a concise, professional analysis in Thai language.
      `,
    });
    
    // Access response.text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ไม่สามารถดึงข้อมูลวิเคราะห์ได้ในขณะนี้";
  }
};
