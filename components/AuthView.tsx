import React, { useState } from 'react';
import { signUp, signIn } from '../services/authService';

type AuthMode = 'signin' | 'signup';

interface AuthViewProps {
  onGuestLogin: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onGuestLogin }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // The onAuthStateChanged listener in App.tsx will handle the redirect.
    } catch (err: any) {
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Adresse e-mail invalide.');
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('Email ou mot de passe incorrect.');
            break;
          case 'auth/email-already-in-use':
            setError('Cette adresse e-mail est déjà utilisée.');
            break;
          case 'auth/weak-password':
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            break;
          default:
            setError('Une erreur est survenue. Veuillez réessayer.');
        }
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'signin' ? 'signup' : 'signin'));
    setError(null);
    setEmail('');
    setPassword('');
  };

  const isSignup = mode === 'signup';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
          {isSignup ? "Créer un Compte" : "Se Connecter"}
        </h1>
        <p className="text-slate-400 text-center mb-8">
            {isSignup ? "Rejoignez-nous pour sauvegarder vos progrès !" : "Content de vous revoir !"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-left text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="votre.email@exemple.com"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-left text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="********"
              required
            />
          </div>
          {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors shadow-lg"
          >
            {isLoading ? 'Chargement...' : (isSignup ? "S'inscrire" : "Se connecter")}
          </button>
        </form>
        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs">OU</span>
            <div className="flex-grow border-t border-slate-600"></div>
        </div>
         <button
          onClick={onGuestLogin}
          className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-md transition-colors"
        >
          Continuer en tant qu'invité
        </button>
        <p className="text-center text-sm text-slate-400 mt-6">
          {isSignup ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
          <button onClick={toggleMode} className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2">
            {isSignup ? "Se connecter" : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthView;