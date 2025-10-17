import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Flashcard, Deck } from '../types';

const DECKS_COLLECTION = 'decks';

// Save a new deck to Firestore for the current user
export async function saveDeck(topic: string, cards: Flashcard[]): Promise<Deck> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const deckData = {
    userId: user.uid,
    topic,
    cards,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, DECKS_COLLECTION), deckData);
  
  return {
      ...deckData,
      id: docRef.id,
      // Fix: Use Timestamp.now() to create a Firestore Timestamp object, which matches the `Deck.createdAt` type.
      createdAt: Timestamp.now() // Approximate timestamp for immediate use
  } as Deck;
}

// Get all decks for the current user
export async function getDecksForUser(): Promise<Deck[]> {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const q = query(
    collection(db, DECKS_COLLECTION), 
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Deck[];
}

// Delete a deck from Firestore
export async function deleteDeck(deckId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    // Note: For production, you'd use security rules to ensure a user can only delete their own decks.
    // This client-side check is a good practice but not a security guarantee.
    await deleteDoc(doc(db, DECKS_COLLECTION, deckId));
}