import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [activeLang, setActiveLang] = useState(() => {
    return localStorage.getItem('digiland_lang') || 'en';
  });

  const currentLangObj = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('digiland_lang', activeLang);
    document.documentElement.lang = activeLang;
    document.documentElement.dir = currentLangObj.dir || 'ltr';
  }, [activeLang, currentLangObj]);

  const t = (key, fallback = "") => {
    const dict = TRANSLATIONS[activeLang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ activeLang, setActiveLang, currentLangObj, languages: LANGUAGES, t }}>
      <div dir={currentLangObj.dir || 'ltr'} className={`w-full min-h-screen ${currentLangObj.dir === 'rtl' ? 'rtl' : 'ltr'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;
