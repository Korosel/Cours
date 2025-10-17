
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedFlashcard } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const flashcardSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: "La question claire et concise au recto de la flashcard."
        },
        answer: {
          type: Type.STRING,
          description: "La réponse directe et précise au verso de la flashcard."
        },
      },
      required: ["question", "answer"],
    }
};

export async function generateFlashcards(topic: string, image?: { mimeType: string; data: string }): Promise<GeneratedFlashcard[]> {
    const model = 'gemini-2.5-pro';

    const systemInstruction = `Tu es un expert en création de flashcards pédagogiques efficaces. 
    Génère un ensemble de 5 à 10 flashcards basées sur le sujet ou l'image de l'utilisateur. 
    Pour chaque carte, crée une question claire et une réponse directe. 
    Les questions doivent favoriser la mémorisation active. 
    Assure-toi que le contenu est factuellement correct et pertinent.`;

    const imagePart = image ? { inlineData: { mimeType: image.mimeType, data: image.data } } : null;
    const textPart = { text: `Le sujet est : "${topic}".` };

    const parts = imagePart ? [textPart, imagePart] : [textPart];

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const flashcards: GeneratedFlashcard[] = JSON.parse(jsonText);
        
        return flashcards;

    } catch (error) {
        console.error("Error generating flashcards with Gemini:", error);
        throw new Error("Impossible de générer les flashcards. Le modèle a peut-être renvoyé une réponse inattendue.");
    }
}
