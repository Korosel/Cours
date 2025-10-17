import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { AppState, Deck } from './types';
import { signOutUser } from './services/authService';

import AuthView from './components/AuthView';
import DecksView from './components/DecksView';
import SetupView from './components/SetupView';
import StudyView from './components/StudyView';
import { AppHeader } from './components/AppHeader';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [user, setUser] = useState<User | null>(null);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentFolderIdForNewDeck, setCurrentFolderIdForNewDeck] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAppState(AppState.DECKS);
        setIsGuest(false);
      } else if (!isGuest) {
        setAppState(AppState.AUTH);
      }
    });
    return () => unsubscribe();
  }, [isGuest]);
  
  const handleGuestLogin = () => {
    setIsGuest(true);
    setUser(null);
    setAppState(AppState.DECKS);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsGuest(false);
      setAppState(AppState.AUTH);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const startSetup = (folderId: string | null) => {
    setCurrentFolderIdForNewDeck(folderId);
    setAppState(AppState.SETUP);
  };
  const finishSetup = () => setAppState(AppState.DECKS);
  
  const startStudy = (deck: Deck) => {
    setCurrentDeck(deck);
    setAppState(AppState.STUDYING);
  };

  const finishStudy = () => {
    setCurrentDeck(null);
    setAppState(AppState.DECKS);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <div className="text-center">Chargement...</div>;
      case AppState.AUTH:
        return <AuthView onGuestLogin={handleGuestLogin} />;
      case AppState.DECKS:
        return <DecksView onStartSetup={startSetup} onStartStudy={startStudy} isGuest={isGuest} />;
      case AppState.SETUP:
        return <SetupView onFinish={finishSetup} isGuest={isGuest} folderId={currentFolderIdForNewDeck} />;
      case AppState.STUDYING:
        if (currentDeck) {
          return <StudyView deck={currentDeck} onFinish={finishStudy} />;
        }
        setAppState(AppState.DECKS); 
        return null;
      default:
        return <AuthView onGuestLogin={handleGuestLogin} />;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
        {user && <AppHeader user={user} onSignOut={handleSignOut} />}
        <main className="w-full max-w-3xl flex-grow flex flex-col items-center justify-center">
            {renderContent()}
        </main>
    </div>
  );
}

export default App;