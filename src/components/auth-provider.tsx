
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { UserProfile, UserRole } from '@/app/lib/types';

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const mockRole = localStorage.getItem(`role_${firebaseUser.uid}`) as UserRole;
        const mockProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          role: mockRole || 'customer',
          createdAt: new Date(),
        };
        setProfile(mockProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
