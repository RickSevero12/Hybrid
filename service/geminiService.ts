import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client using the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a detailed workout description based on a context prompt and student level.
 */
export async function generateWorkoutDescription(prompt: string, level: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um treino de corrida nível ${level}. Contexto: ${prompt}. Markdown em PT-BR.`,
    });
    // Correctly accessing the text property from the response.
    return response.text || "Erro ao gerar.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro na API.";
  }
}

/**
 * Structures the workout instructions for export to smartwatches (Garmin/Apple Watch).
 */
export async function structureWorkoutForWatch(
  description: string,
  warmup: string,
  cooldown: string,
  speedZones?: any
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transforme o seguinte treino em um formato estruturado (passo a passo) ideal para relógios de corrida.
      Aquecimento: ${warmup}
      Principal: ${description}
      Desaquecimento: ${cooldown}
      Zonas de Pace: ${JSON.stringify(speedZones)}
      Retorne instruções claras de ritmo e duração.`,
    });
    return response.text || "Erro ao estruturar.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro na API.";
  }
}