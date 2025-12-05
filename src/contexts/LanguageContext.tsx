import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'fr' | 'ha' | 'ig' | 'yo';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    about: "About DIC",
    departments: "Departments",
    courses: "Courses",
    pgProgram: "PG Program",
    news: "News & Blog",
    contact: "Contact Us",
    login: "Log In",
    logout: "Log Out",
    quickLinks: "Quick Links",
    eLibrary: "e-Library",
    collegePortal: "College Portal",
    email: "Email",
    welcomeTitle: "Welcome to Defence Intelligence College",
    welcomeSubtitle: "Shaping the Future of Intelligence Excellence",
    learnMore: "Learn More",
    viewCourses: "View Courses",
    aboutUs: "About Us",
    missionVision: "Mission & Vision",
  },
  fr: {
    home: "Accueil",
    about: "À propos du DIC",
    departments: "Départements",
    courses: "Cours",
    pgProgram: "Programme PG",
    news: "Actualités & Blog",
    contact: "Contactez-nous",
    login: "Connexion",
    logout: "Déconnexion",
    quickLinks: "Liens rapides",
    eLibrary: "e-Bibliothèque",
    collegePortal: "Portail du Collège",
    email: "E-mail",
    welcomeTitle: "Bienvenue au Collège de Renseignement de Défense",
    welcomeSubtitle: "Façonner l'avenir de l'excellence du renseignement",
    learnMore: "En savoir plus",
    viewCourses: "Voir les cours",
    aboutUs: "À propos de nous",
    missionVision: "Mission & Vision",
  },
  ha: {
    home: "Gida",
    about: "Game da DIC",
    departments: "Sassan",
    courses: "Darussa",
    pgProgram: "Shirin PG",
    news: "Labaran & Blog",
    contact: "Tuntuɓe mu",
    login: "Shiga",
    logout: "Fita",
    quickLinks: "Hanyoyin Sauri",
    eLibrary: "e-Laburare",
    collegePortal: "Ƙofar Kwalejin",
    email: "Imel",
    welcomeTitle: "Barka da zuwa Kwalejin Leken Asiri na Tsaro",
    welcomeSubtitle: "Tsara Makomar Kyawun Leken Asiri",
    learnMore: "Kara Koyo",
    viewCourses: "Duba Darussa",
    aboutUs: "Game da mu",
    missionVision: "Manufa & Hangen nesa",
  },
  ig: {
    home: "Ụlọ",
    about: "Maka DIC",
    departments: "Ngalaba",
    courses: "Usoro Ọmụmụ",
    pgProgram: "Mmemme PG",
    news: "Akụkọ & Blog",
    contact: "Kpọtụrụ Anyị",
    login: "Banye",
    logout: "Pụọ",
    quickLinks: "Njikọ Ngwa ngwa",
    eLibrary: "e-Ọbá Akwụkwọ",
    collegePortal: "Portal Kọleji",
    email: "Email",
    welcomeTitle: "Nnọọ na Kọleji Nchekwa Ọgụgụ Isi",
    welcomeSubtitle: "Na-akpụ ọdịnihu nke ịdị mma na nchekwa ọgụgụ isi",
    learnMore: "Mụta Karịa",
    viewCourses: "Lee Usoro Ọmụmụ",
    aboutUs: "Maka Anyị",
    missionVision: "Ebumnuche & Ọhụụ",
  },
  yo: {
    home: "Ilé",
    about: "Nípa DIC",
    departments: "Àwọn Ẹ̀ka",
    courses: "Àwọn Ẹ̀kọ́",
    pgProgram: "Ètò PG",
    news: "Ìròyìn & Blog",
    contact: "Kàn sí Wa",
    login: "Wọlé",
    logout: "Jáde",
    quickLinks: "Àwọn Ìjápọ̀ Yíyára",
    eLibrary: "e-Ilé-ìkàwé",
    collegePortal: "Ẹnu-ọ̀nà Kọ́lẹ́ẹ̀jì",
    email: "Ímeèlì",
    welcomeTitle: "Káàbọ̀ sí Kọ́lẹ́ẹ̀jì Ìmọ̀ Àbò",
    welcomeSubtitle: "Ṣíṣe àpèjúwe ọjọ́-iwájú ti ìmọ̀ àbò",
    learnMore: "Kọ́ Síi",
    viewCourses: "Wo Àwọn Ẹ̀kọ́",
    aboutUs: "Nípa Wa",
    missionVision: "Iṣẹ́ & Ìran",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
