'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { fetchSubscriptionStatusWithRetry } from '@/lib/subscription/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkSubscriptionAndRedirect = async (user: User) => {
    try {
      const { ok, data } = await fetchSubscriptionStatusWithRetry(user);

      if (ok && data) {
        if (data.hasActiveSubscription) {
          router.push('/dashboard');
        } else {
          router.push('/subscription');
        }
      } else {
        // On error (e.g. 401 when FIREBASE_SERVICE_ACCOUNT_KEY is missing), redirect to subscription page
        router.push('/subscription');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      router.push('/subscription');
    }
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await checkSubscriptionAndRedirect(userCredential.user);
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await checkSubscriptionAndRedirect(userCredential.user);
  };

  const signInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
    await checkSubscriptionAndRedirect(userCredential.user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
