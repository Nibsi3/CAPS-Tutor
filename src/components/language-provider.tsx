'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { translations } from '@/lib/translations';
import { useDoc, useUser, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';


type Language = keyof typeof translations;

const LANGUAGE_STORAGE_KEY = 'caps-tutor-language';

const LanguageContext = createContext<Language>('en');
const SetLanguageContext = createContext<Dispatch<SetStateAction<Language>>>(() => {});

export const useLanguage = () => useContext(LanguageContext);
export const useSetLanguage = () => useContext(SetLanguageContext);

// Helper function to get language from localStorage
function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && stored in translations) {
      return stored as Language;
    }
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
  }
  return null;
}

// Helper function to save language to localStorage
function saveLanguageToStorage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.error('Error saving language to localStorage:', error);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // useAppwrite() now handles missing AppwriteProvider gracefully
  // It returns safe fallbacks instead of throwing
  const { user } = useUser();

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);
  
  const { data: userProfile } = useDoc<{ language?: Language }>(userProfileRef);

  // Initialize language: check localStorage first (for quick load), then userProfile (if authenticated)
  const [language, setLanguageState] = useState<Language>(() => {
    // Always check localStorage first as a fallback/quick load
    return getStoredLanguage() || 'en';
  });

  // Update language when userProfile loads (for authenticated users - takes precedence)
  useEffect(() => {
    if (userProfile?.language) {
      setLanguageState(userProfile.language);
      // Also save to localStorage as backup
      saveLanguageToStorage(userProfile.language);
    }
  }, [userProfile]);

  // Wrapper function that saves to localStorage when language changes
  const setLanguage = useCallback((newLanguage: Language | ((prev: Language) => Language)) => {
    setLanguageState((prevLang) => {
      const lang = typeof newLanguage === 'function' ? newLanguage(prevLang) : newLanguage;
      // Save to localStorage for persistence (works for both authenticated and unauthenticated users)
      saveLanguageToStorage(lang);
      return lang;
    });
  }, []);

  return (
    <LanguageContext.Provider value={language}>
        <SetLanguageContext.Provider value={setLanguage}>
            {children}
        </SetLanguageContext.Provider>
    </LanguageContext.Provider>
  );
}

    