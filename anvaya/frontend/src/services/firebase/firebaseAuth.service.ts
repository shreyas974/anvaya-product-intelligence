import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

export interface AnvayaUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  provider: 'firebase' | 'local';
}

export const firebaseAuthService = {
  /**
   * Sign in with Google Popup via Firebase Authentication.
   */
  async signInWithGoogle(): Promise<AnvayaUser> {
    const auth = getFirebaseAuth();
    if (!isFirebaseConfigured() || !auth) {
      // Return mock user for local/demo mode
      return {
        id: 'google_user_demo',
        email: 'engineer@anvaya.ai',
        name: 'Enterprise Catalog Lead',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        provider: 'local',
      };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      return {
        id: user.uid,
        email: user.email || 'user@anvaya.ai',
        name: user.displayName || user.email?.split('@')[0] || 'ANVAYA User',
        role: 'catalog_manager',
        avatarUrl: user.photoURL || undefined,
        provider: 'firebase',
      };
    } catch (err: any) {
      console.warn('[ANVAYA Firebase Auth] Google sign-in note:', err);
      throw new Error(err?.message || 'Google sign-in was cancelled or encountered an error.');
    }
  },

  /**
   * Sign in with Email and Password using Firebase Auth.
   */
  async signInWithEmail(email: string, pass: string): Promise<AnvayaUser> {
    const auth = getFirebaseAuth();
    if (!isFirebaseConfigured() || !auth) {
      return {
        id: 'local_user_' + Date.now(),
        email,
        name: email.split('@')[0].toUpperCase(),
        role: 'admin',
        provider: 'local',
      };
    }

    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    return {
      id: user.uid,
      email: user.email || email,
      name: user.displayName || email.split('@')[0],
      role: 'catalog_manager',
      avatarUrl: user.photoURL || undefined,
      provider: 'firebase',
    };
  },

  /**
   * Register with Email, Password and Display Name using Firebase Auth.
   */
  async signUpWithEmail(email: string, pass: string, name: string): Promise<AnvayaUser> {
    const auth = getFirebaseAuth();
    if (!isFirebaseConfigured() || !auth) {
      return {
        id: 'local_user_' + Date.now(),
        email,
        name,
        role: 'catalog_manager',
        provider: 'local',
      };
    }

    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    try {
      await updateProfile(user, { displayName: name });
    } catch {
      // Non-blocking
    }

    return {
      id: user.uid,
      email: user.email || email,
      name: name || email.split('@')[0],
      role: 'catalog_manager',
      provider: 'firebase',
    };
  },

  /**
   * Sign out current user.
   */
  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn('[ANVAYA Firebase Auth] Sign out note:', err);
      }
    }
  },

  /**
   * Listen to Firebase auth state changes.
   */
  onAuthStateChanged(callback: (user: AnvayaUser | null) => void): () => void {
    const auth = getFirebaseAuth();
    if (!isFirebaseConfigured() || !auth) {
      return () => {};
    }

    return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        callback({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'ANVAYA User',
          role: 'catalog_manager',
          avatarUrl: user.photoURL || undefined,
          provider: 'firebase',
        });
      } else {
        callback(null);
      }
    });
  },
};
