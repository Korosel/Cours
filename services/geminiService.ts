
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedFlashcard } from '../types';

// The GoogleGenAI instance will be created on demand to avoid crashing on load.
let ai: GoogleGenAI | null = null;

const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            // This error will now be caught by the UI and displayed to the user.
            throw new Error("La variable d'environnement API_KEY n'est pas configurée. Impossible d'utiliser les fonctionnalités d'IA.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

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
    const aiInstance = getAi(); // Initialize and check for the key only when needed.

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
        const response = await aiInstance.models.generateContent({
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
        if (error instanceof Error && error.message.includes("API_KEY")) {
             throw new Error("La clé API pour le service d'IA n'est pas configurée. Veuillez contacter le développeur.");
        }
        throw new Error("Impossible de générer les flashcards. Le modèle a peut-être renvoyé une réponse inattendue.");
    }
}