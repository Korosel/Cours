import React, { useState, useEffect } from 'react';
import { getDecksForUser, deleteDeck as deleteDeckFromDb } from '../services/firestoreService';
import { Deck } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface DecksViewProps {
  onSelectDeck: (deck: Deck) => void;
  onNewDeck: () => void;
}

const DecksView: React.FC<DecksViewProps> = ({ onSelectDeck, onNewDeck }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userDecks = await getDecksForUser();
      setDecks(userDecks);
    } catch (err) {
      setError("Impossible de charger les paquets.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paquet ?")) {
        try {
            await deleteDeckFromDb(deckId);
            setDecks(prev => prev.filter(deck => deck.id !== deckId));
        } catch (err) {
            setError("Erreur lors de la suppression du paquet.");
            console.error(err);
        }
    }
  };

  if (isLoading) {
    return <div className="text-center"><p>Chargement de vos paquets...</p></div>;
  }

  if (error) {
    return <div className="text-center text-red-400"><p>{error}</p></div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Mes Paquets</h1>
        <button
          onClick={onNewDeck}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          Nouveau Paquet
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center bg-slate-800 p-8 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-semibold text-slate-300">Bienvenue !</h2>
          <p className="text-slate-400 mt-2">
            Vous n'avez encore aucun paquet de flashcards. <br/>
            Cliquez sur "Nouveau Paquet" pour commencer à apprendre.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {decks.map(deck => (
            <li key={deck.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-cyan-300">{deck.topic}</h3>
                <p className="text-sm text-slate-400">{deck.cards.length} carte(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectDeck(deck)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors"
                >
                  Étudier
                </button>
                <button onClick={() => handleDeleteDeck(deck.id)} className="text-red-400 hover:text-red-500 transition-colors">
                  <TrashIcon className="w-6 h-6" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DecksView;
