import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ha' | 'ig' | 'yo';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Simple translation function (can be enhanced with API later)
  const translate = (text: string) => {
    // For now, return original text
    // This can be enhanced with Lovable AI translation
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
