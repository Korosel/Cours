import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { auth } from '../firebase';

export function signUp(email: string, password: string): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser(): Promise<void> {
    return signOut(auth);
}
