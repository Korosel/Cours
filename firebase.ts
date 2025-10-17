import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// ACTION REQUISE : VEUILLEZ REMPLACER CES VALEURS PAR VOTRE PROPRE CONFIGURATION
// Vous trouverez cette configuration dans les paramètres de votre projet Firebase.
// Allez dans "Paramètres du projet" > "Général" > "Vos applications" > "SDK setup and configuration"
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDrwi9Hdox_52039OXnf2YGXXrrw_dZOic",
  authDomain: "site-flash-card-b59c4.firebaseapp.com",
  projectId: "site-flash-card-b59c4",
  storageBucket: "site-flash-card-b59c4.firebasestorage.app",
  messagingSenderId: "790096569383",
  appId: "1:790096569383:web:15d4b44b69cc7b61f8da02",
  measurementId: "G-KP687YWB89"
};


// Vérification pour s'assurer que la configuration a été modifiée
if (firebaseConfig.apiKey === "VOTRE_API_KEY") {
  const errorMessage = "Erreur de configuration Firebase : Veuillez remplacer les valeurs par défaut dans le fichier `firebase.ts` par les clés de votre propre projet Firebase.";
  // Affiche l'erreur dans la console pour le développeur
  console.error(errorMessage);
  // Affiche un message à l'utilisateur directement sur la page
  document.body.innerHTML = `<div style="padding: 2rem; text-align: center; font-family: sans-serif; color: #fff; background-color: #1e293b; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;"><h1>Configuration Requise</h1><p style="max-width: 600px; line-height: 1.5;">${errorMessage}</p></div>`;
  throw new Error(errorMessage);
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialise les services Firebase et les exporte pour les utiliser dans l'application
export const auth = getAuth(app);
export const db = getFirestore(app);
