import { GoogleGenAI, Type } from "@google/genai";
import { PrescriptionResponse } from "../types";

const SYSTEM_PROMPT = `
Your task is to decode this medical prescription image and convert it into a clean, simplified explanation for patients.

Steps:
1. Read and decode the handwritten prescription.
2. Extract all medicine names, dosage formats, and doctor notes.
3. Interpret dosage such as "1-0-1", "BD", "OD", "HS", "SOS".
4. Provide:
   - Purpose of each medicine
   - Simplified dosage explanation
   - Common side effects
   - Important safety warnings (neutral, general)
5. Translate all content into Hindi, Urdu, and Tamil.
6. Highlight any unclear text in "uncertain_items".
7. Generate a short spoken summary for each medicine that can be used for text-to-speech audio.
   This summary must:
   - Be very short (1–2 sentences only)
   - Include exactly when to take the medicine (morning/evening/afternoon/bedtime)
   - Be simplified for the patient
   - Avoid medical advice; only describe what the doctor wrote
   - Provide this in four languages: English, Hindi, Urdu, and Tamil.

Return EVERYTHING in the specific JSON format requested.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    medicines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          decoded_name: { type: Type.STRING },
          purpose: { type: Type.STRING },
          dosage_raw: { type: Type.STRING },
          dosage_explained: { type: Type.STRING },
          warnings: { type: Type.STRING },
          side_effects: { type: Type.STRING },
          translation: {
            type: Type.OBJECT,
            properties: {
              hindi: { type: Type.STRING },
              urdu: { type: Type.STRING },
              tamil: { type: Type.STRING },
            },
          },
          spoken_summary: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              hindi: { type: Type.STRING },
              urdu: { type: Type.STRING },
              tamil: { type: Type.STRING },
            },
          },
        },
      },
    },
    notes_from_doctor: { type: Type.STRING },
    general_safety_observations: { type: Type.STRING },
    uncertain_items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
};

export const analyzePrescription = async (
  imageFile: File
): Promise<PrescriptionResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const model = "gemini-2.5-flash"; // Good balance of vision and text capability

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data,
            },
          },
          {
            text: SYSTEM_PROMPT,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(text) as PrescriptionResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};