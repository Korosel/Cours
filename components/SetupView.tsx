import React, { useState } from 'react';
import { GeneratedFlashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { saveDeck } from '../services/firestoreService';
import { RefreshIcon, PlusIcon, TrashIcon, ArrowLeftIcon } from './Icons';

interface SetupViewProps {
  onFinish: () => void;
  isGuest: boolean;
  folderId: string | null;
}

const SetupView: React.FC<SetupViewProps> = ({ onFinish, isGuest, folderId }) => {
    const [topic, setTopic] = useState('');
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Veuillez entrer un sujet.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedCards([]);
        
        try {
            let imagePayload;
            if (image) {
                const base64Data = await fileToBase64(image.file);
                imagePayload = { mimeType: image.file.type, data: base64Data };
            }
            const cards = await generateFlashcards(topic, imagePayload);
            setGeneratedCards(cards);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDeck = async () => {
        if (isGuest) {
            // In guest mode, we don't save, just proceed to study
             if (generatedCards.length > 0) {
                // To-do: transition to study view with temporary deck
                alert("La session d'étude en mode invité n'est pas encore implémentée.");
            }
            return;
        }
        if (generatedCards.length === 0) return;
        setIsLoading(true);
        try {
            await saveDeck(topic, generatedCards, folderId);
            onFinish();
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la sauvegarde du paquet.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Edit/delete functions for generated cards
    const updateCard = (index: number, field: 'question' | 'answer', value: string) => {
        const newCards = [...generatedCards];
        newCards[index] = { ...newCards[index], [field]: value };
        setGeneratedCards(newCards);
    };

    const deleteCard = (index: number) => {
        setGeneratedCards(generatedCards.filter((_, i) => i !== index));
    };

    const addCard = () => {
        setGeneratedCards([...generatedCards, { question: '', answer: '' }]);
    };

    const buttonText = isGuest ? "Commencer à étudier" : "Sauvegarder le Paquet";

    return (
        <div className="w-full flex flex-col items-center">
            <button onClick={onFinish} className="self-start flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Retour
            </button>
            <div className="w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center">Créer un nouveau Paquet</h2>

                <div className="mb-6">
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Sujet</label>
                    <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Les capitales d'Europe"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    />
                </div>

                <div className="mb-6">
                     <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-2">Image (Optionnel)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                             {image ? (
                                <img src={image.preview} alt="Aperçu" className="mx-auto h-24 w-auto"/>
                            ) : (
                                <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <div className="flex text-sm text-slate-400">
                                <label htmlFor="image-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none">
                                    <span>Télécharger un fichier</span>
                                    <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                                <p className="pl-1">ou glissez-déposez</p>
                            </div>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF jusqu'à 10MB</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-bold rounded-md transition-colors shadow-lg"
                >
                    {isLoading ? 'Génération en cours...' : 'Générer les Flashcards'}
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {generatedCards.length > 0 && (
                <div className="w-full mt-8">
                    <h3 className="text-2xl font-bold mb-4">Flashcards Générées ({generatedCards.length})</h3>
                    <div className="space-y-4">
                        {generatedCards.map((card, index) => (
                             <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex gap-4">
                                <span className="text-cyan-400 font-bold">{index + 1}.</span>
                                <div className="flex-grow">
                                    <textarea
                                        value={card.question}
                                        onChange={(e) => updateCard(index, 'question', e.target.value)}
                                        placeholder="Question"
                                        className="w-full bg-slate-700 p-2 rounded-md mb-2 resize-none"
                                        rows={2}
                                    />
                                    <textarea
                                        value={card.answer}
                                        onChange={(e) => updateCard(index, 'answer', e.target.value)}
                                        placeholder="Réponse"
                                        className="w-full bg-slate-700 p-2 rounded-md resize-none"
                                        rows={2}
                                    />
                                </div>
                                <button onClick={() => deleteCard(index)} className="text-slate-500 hover:text-red-500">
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>

                     <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={addCard}
                            className="flex items-center gap-2 py-2 px-4 bg-slate-700 hover:bg-slate-600 font-semibold rounded-md transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Ajouter une carte
                        </button>
                        <button
                            onClick={handleSaveDeck}
                            disabled={isLoading}
                            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors shadow-lg"
                        >
                            {isLoading ? 'Sauvegarde...' : buttonText}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SetupView;