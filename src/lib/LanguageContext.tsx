'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { COPY, Language } from './copy';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (typeof COPY)['en'] | (typeof COPY)['hi'];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: COPY.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerogap_lang') as Language;
      if (saved === 'en' || saved === 'hi') {
        setLang(saved);
      }
    } catch (e) {
      // Ignore local storage error in sandboxed/SSR environments
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('zerogap_lang', newLang);
    } catch (e) {}
  };

  const toggleLang = () => {
    handleSetLang(lang === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang: handleSetLang,
        toggleLang,
        t: COPY[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
