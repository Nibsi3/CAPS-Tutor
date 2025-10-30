'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { translations } from '@/lib/translations';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


type Language = keyof typeof translations;

const LanguageContext = createContext<Language>('en');
const SetLanguageContext = createContext<Dispatch<SetStateAction<Language>>>(() => {});

export const useLanguage = () => useContext(LanguageContext);
export const useSetLanguage = () => useContext(SetLanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  
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

    