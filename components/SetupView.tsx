import React, { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from './Icons';
import { generateFlashcards } from '../services/geminiService';
import { GeneratedFlashcard, Deck } from '../types';
import { saveDeck } from '../services/firestoreService';

interface SetupViewProps {
  onDeckSaved: (deck: Deck) => void;
  onBack: () => void;
  isGuest: boolean;
}

const SetupView: React.FC<SetupViewProps> = ({ onDeckSaved, onBack, isGuest }) => {
  const [cards, setCards] = useState<GeneratedFlashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCard = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      setCards(prev => [...prev, { question, answer }]);
      setQuestion('');
      setAnswer('');
      document.getElementById('question')?.focus();
    }
  }, [question, answer]);

  const handleDeleteCard = (indexToDelete: number) => {
    setCards(prev => prev.filter((_, index) => index !== indexToDelete));
  };
  
  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
        const generatedCards = await generateFlashcards(topic);
        setCards(generatedCards);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  const handleActionClick = async () => {
    if (cards.length === 0 || !topic.trim()) {
        setError("Veuillez entrer un sujet et ajouter au moins une carte.");
        return;
    }
    setError(null);

    if (isGuest) {
      // Create a temporary deck in memory for guests
      const guestDeck: Deck = {
        id: `guest-${Date.now()}`,
        userId: 'guest',
        topic,
        cards,
        createdAt: Timestamp.now(),
      };
      onDeckSaved(guestDeck);
    } else {
      // Save the deck to Firestore for logged-in users
      setIsSaving(true);
      try {
          const newDeck = await saveDeck(topic, cards);
          onDeckSaved(newDeck);
      } catch (err) {
          setError("Erreur lors de l'enregistrement du paquet.");
          console.error(err);
      } finally {
          setIsSaving(false);
      }
    }
  };

  const backButtonText = isGuest ? "Quitter le mode invité" : "Retour aux paquets";

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center w-full">
      <div className="w-full flex justify-start mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            {backButtonText}
        </button>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
        Créer un Paquet
      </h1>
      <p className="text-slate-400 mb-8 max-w-xl">
        Donnez un nom à votre sujet, puis ajoutez des cartes manuellement ou avec l'IA.
        {isGuest && <span className="block mt-1 text-amber-400 text-sm">Les paquets créés en mode invité ne sont pas sauvegardés.</span>}
      </p>

      <div className="w-full max-w-lg">
        <div className="w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 mb-8">
            <label htmlFor="deck-topic" className="block text-left text-sm font-medium text-slate-300 mb-2">
                Sujet du paquet
            </label>
            <input
                type="text"
                id="deck-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Ex: L'histoire de la Rome Antique"
            />
        </div>

        <form onSubmit={handleGenerateCards} className="w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-left mb-2 text-cyan-300">Générer avec l'IA</h2>
            <p className="text-slate-400 mb-4 text-left text-sm">
                Utilisez le sujet ci-dessus pour générer automatiquement des cartes.
            </p>
            <button
                type="submit"
                disabled={!topic.trim() || isLoading || isSaving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors shadow-lg"
            >
                {isLoading ? 'Génération en cours...' : 'Générer les cartes avec l'IA'}
            </button>
            {error && <p className="text-red-400 mt-4 text-sm text-left">{error}</p>}
        </form>

        <form onSubmit={handleAddCard} className="w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-left mb-2 text-indigo-300">Ajout Manuel</h2>
            <div className="mb-4">
            <label htmlFor="question" className="block text-left text-sm font-medium text-slate-300 mb-2">
                Question (Recto)
            </label>
            <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: Quelle est la capitale de la France ?"
            />
            </div>

            <div className="mb-6">
            <label htmlFor="answer" className="block text-left text-sm font-medium text-slate-300 mb-2">
                Réponse (Verso)
            </label>
            <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: Paris"
                rows={3}
            />
            </div>

            <button
            type="submit"
            disabled={!question.trim() || !answer.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors shadow-lg"
            >
            <PlusIcon className="w-5 h-5" />
            Ajouter la carte
            </button>
        </form>

        {cards.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-left mb-4 text-cyan-300">{cards.length} Carte(s)</h2>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {cards.map((card, index) => (
                <li key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-md animate-fade-in">
                  <span className="text-slate-200 text-left truncate pr-4">{card.question}</span>
                  <button onClick={() => handleDeleteCard(index)} className="text-red-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          onClick={handleActionClick}
          disabled={cards.length === 0 || !topic.trim() || isSaving}
          className="w-full mt-6 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors shadow-lg"
        >
          {isGuest
            ? `Commencer à Étudier (${cards.length})`
            : isSaving
              ? "Enregistrement..."
              : `Enregistrer et Étudier (${cards.length})`}
        </button>
      </div>
    </div>
  );
};

export default SetupView;