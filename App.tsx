import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { AppState, Deck } from './types';

import AuthView from './components/AuthView';
import DecksView from './components/DecksView';
import SetupView from './components/SetupView';
import StudyView from './components/StudyView';
import { AppHeader } from './components/AppHeader';
import { signOutUser } from './services/authService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuest(false);
        setAppState(AppState.DECKS);
      } else {
        setCurrentUser(null);
        setIsGuest(false); // Reset guest state on logout
        setAppState(AppState.AUTH);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const handleGuestLogin = () => {
    setIsGuest(true);
    setCurrentUser(null);
    setAppState(AppState.SETUP);
  };

  const handleSignOut = async () => {
    await signOutUser();
    // onAuthStateChanged will handle the state change
  };

  const handleStartStudying = (deck: Deck) => {
    setActiveDeck(deck);
    setAppState(AppState.STUDYING);
  };

  const handleGoToSetup = () => {
    setActiveDeck(null);
    setAppState(AppState.SETUP);
  };

  const handleDeckSaved = (deck: Deck) => {
    setActiveDeck(deck);
    setAppState(AppState.STUDYING);
  };
  
  const handleFinishStudySession = () => {
    setActiveDeck(null);
    if (isGuest) {
      setAppState(AppState.SETUP);
    } else {
      setAppState(AppState.DECKS);
    }
  };


  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <div className="text-center"><p>Chargement...</p></div>;
      case AppState.AUTH:
        return <AuthView onGuestLogin={handleGuestLogin} />;
      case AppState.DECKS:
        return <DecksView onSelectDeck={handleStartStudying} onNewDeck={handleGoToSetup} />;
      case AppState.SETUP:
        return <SetupView onDeckSaved={handleDeckSaved} onBack={handleFinishStudySession} isGuest={isGuest} />;
      case AppState.STUDYING:
        if (!activeDeck) {
            handleFinishStudySession();
            return null;
        }
        return <StudyView deck={activeDeck} onFinish={handleFinishStudySession} />;
      default:
        return <AuthView onGuestLogin={handleGuestLogin} />;
    }
  };

  const showHeader = appState !== AppState.AUTH && appState !== AppState.LOADING && currentUser;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4">
      {showHeader && <AppHeader user={currentUser} onSignOut={handleSignOut} />}
      <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;