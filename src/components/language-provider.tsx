'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { translations } from '@/lib/translations';
import { useDoc, useUser, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';


type Language = keyof typeof translations;

const LanguageContext = createContext<Language>('en');
const SetLanguageContext = createContext<Dispatch<SetStateAction<Language>>>(() => {});

export const useLanguage = () => useContext(LanguageContext);
export const useSetLanguage = () => useContext(SetLanguageContext);

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

  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (userProfile?.language) {
      setLanguage(userProfile.language);
    }
  }, [userProfile]);

  return (
    <LanguageContext.Provider value={language}>
        <SetLanguageContext.Provider value={setLanguage}>
            {children}
        </SetLanguageContext.Provider>
    </LanguageContext.Provider>
  );
}

    