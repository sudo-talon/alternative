import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'fr' | 'ha' | 'ig' | 'yo';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    about: "About DIC",
    departments: "Departments",
    courses: "Courses",
    pgProgram: "PG Program",
    news: "News & Blog",
    contact: "Contact Us",
    login: "Log In",
    logout: "Log Out",
    
    // Quick Links
    quickLinks: "Quick Links",
    eLibrary: "e-Library",
    collegePortal: "College Portal",
    browseCourses: "Browse Courses",
    
    // Common
    email: "Email",
    readMore: "Read More",
    learnMore: "Learn More",
    viewCourses: "View Courses",
    submit: "Submit",
    
    // Hero Section
    welcomeTitle: "Welcome to Defence Intelligence College Nigeria",
    welcomeSubtitle: "Empowering security professionals with world-class intelligence training to safeguard Nigeria and beyond.",
    explorePrograms: "Explore our programmes",
    
    // Features
    whyChooseDIC: "Why Choose DIC?",
    eliteTraining: "Elite Training",
    eliteTrainingDesc: "World-class intelligence and security training programs",
    professionalDevelopment: "Professional Development",
    professionalDevelopmentDesc: "Continuous learning for defense professionals",
    expertInstructors: "Expert Instructors",
    expertInstructorsDesc: "Learn from experienced intelligence professionals",
    comprehensiveCurriculum: "Comprehensive Curriculum",
    comprehensiveCurriculumDesc: "Cutting-edge courses in intelligence and security",
    
    // About Section
    aboutUs: "About Us",
    missionVision: "Mission & Vision",
    established2001: "Established as DIS",
    established2001Desc: "The Defence Intelligence College (DIC) hitherto known as the Defence Intelligence School (DIS) was established in 2001. At inception it was located at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp Lagos.",
    campusRelocation: "Campus Relocation",
    campusRelocationDesc: "The college relocated to a permanent site in Victoria Island, expanding its facilities to accommodate more students and programs.",
    curriculumExpansion: "Curriculum Expansion",
    curriculumExpansionDesc: "Major curriculum overhaul introducing new specialized courses in cyber intelligence and digital forensics.",
    modernEra: "Modern Era",
    modernEraDesc: "Partner with Talongeeks to achieve full digitalization of learning systems and international accreditation for all programs.",
    
    // Commandants
    pastPresentCommandants: "Past and Present Commandants",
    commandantDIC: "Commandant DIC",
    
    // News
    latestNews: "Latest News",
    newsFlash: "News Flash",
    
    // Footer
    footerRights: "All rights reserved.",
    designedBy: "Designed & Managed by Talongeeks",
    
    // Contact
    getInTouch: "Get in Touch",
    location: "Location",
    phone: "Phone",
    sendMessage: "Send Message",
    yourName: "Your Name",
    yourEmail: "Your Email",
    message: "Message",
    
    // Government Banner
    govBannerText: "An Official Website of the Defence Intelligence Agency, Federal Republic of Nigeria",
  },
  fr: {
    // Navigation
    home: "Accueil",
    about: "À propos du DIC",
    departments: "Départements",
    courses: "Cours",
    pgProgram: "Programme PG",
    news: "Actualités & Blog",
    contact: "Contactez-nous",
    login: "Connexion",
    logout: "Déconnexion",
    
    // Quick Links
    quickLinks: "Liens rapides",
    eLibrary: "e-Bibliothèque",
    collegePortal: "Portail du Collège",
    browseCourses: "Parcourir les cours",
    
    // Common
    email: "E-mail",
    readMore: "Lire la suite",
    learnMore: "En savoir plus",
    viewCourses: "Voir les cours",
    submit: "Soumettre",
    
    // Hero Section
    welcomeTitle: "Bienvenue au Collège de Renseignement de Défense du Nigeria",
    welcomeSubtitle: "Former les professionnels de la sécurité avec une formation de renseignement de classe mondiale pour protéger le Nigeria et au-delà.",
    explorePrograms: "Explorez nos programmes",
    
    // Features
    whyChooseDIC: "Pourquoi choisir le DIC?",
    eliteTraining: "Formation d'élite",
    eliteTrainingDesc: "Programmes de formation en renseignement et sécurité de classe mondiale",
    professionalDevelopment: "Développement professionnel",
    professionalDevelopmentDesc: "Apprentissage continu pour les professionnels de la défense",
    expertInstructors: "Instructeurs experts",
    expertInstructorsDesc: "Apprenez des professionnels du renseignement expérimentés",
    comprehensiveCurriculum: "Programme complet",
    comprehensiveCurriculumDesc: "Cours de pointe en renseignement et sécurité",
    
    // About Section
    aboutUs: "À propos de nous",
    missionVision: "Mission & Vision",
    established2001: "Créé en tant que DIS",
    established2001Desc: "Le Collège de Renseignement de Défense (DIC) anciennement connu sous le nom d'École de Renseignement de Défense (DIS) a été créé en 2001.",
    campusRelocation: "Relocalisation du campus",
    campusRelocationDesc: "Le collège a déménagé sur un site permanent à Victoria Island, élargissant ses installations.",
    curriculumExpansion: "Expansion du programme",
    curriculumExpansionDesc: "Révision majeure du programme introduisant de nouveaux cours spécialisés.",
    modernEra: "Ère moderne",
    modernEraDesc: "Partenariat avec Talongeeks pour la numérisation complète des systèmes d'apprentissage.",
    
    // Commandants
    pastPresentCommandants: "Commandants passés et présents",
    commandantDIC: "Commandant DIC",
    
    // News
    latestNews: "Dernières nouvelles",
    newsFlash: "Flash Info",
    
    // Footer
    footerRights: "Tous droits réservés.",
    designedBy: "Conçu et géré par Talongeeks",
    
    // Contact
    getInTouch: "Contactez-nous",
    location: "Emplacement",
    phone: "Téléphone",
    sendMessage: "Envoyer un message",
    yourName: "Votre nom",
    yourEmail: "Votre e-mail",
    message: "Message",
    
    // Government Banner
    govBannerText: "Site officiel de l'Agence de Renseignement de Défense, République Fédérale du Nigeria",
  },
  ha: {
    // Navigation
    home: "Gida",
    about: "Game da DIC",
    departments: "Sassan",
    courses: "Darussa",
    pgProgram: "Shirin PG",
    news: "Labaran & Blog",
    contact: "Tuntuɓe mu",
    login: "Shiga",
    logout: "Fita",
    
    // Quick Links
    quickLinks: "Hanyoyin Sauri",
    eLibrary: "e-Laburare",
    collegePortal: "Ƙofar Kwalejin",
    browseCourses: "Duba Darussa",
    
    // Common
    email: "Imel",
    readMore: "Kara Karantawa",
    learnMore: "Kara Koyo",
    viewCourses: "Duba Darussa",
    submit: "Aika",
    
    // Hero Section
    welcomeTitle: "Barka da zuwa Kwalejin Leken Asiri na Tsaro ta Nigeria",
    welcomeSubtitle: "Baiwa kwararrun tsaro damar samun horo na leken asiri na duniya don kare Nigeria da waje.",
    explorePrograms: "Duba shirye-shiryenmu",
    
    // Features
    whyChooseDIC: "Me yasa za a zaɓi DIC?",
    eliteTraining: "Horon Manyan Makarantu",
    eliteTrainingDesc: "Shirye-shiryen horar da leken asiri da tsaro na duniya",
    professionalDevelopment: "Ci Gaban Ƙwararru",
    professionalDevelopmentDesc: "Koyo na ci gaba don ƙwararrun tsaro",
    expertInstructors: "Malaman Ƙwararru",
    expertInstructorsDesc: "Koyi daga gwanayen leken asiri",
    comprehensiveCurriculum: "Manhaja Mai Cikakke",
    comprehensiveCurriculumDesc: "Darussa na zamani a cikin leken asiri da tsaro",
    
    // About Section
    aboutUs: "Game da mu",
    missionVision: "Manufa & Hangen nesa",
    established2001: "An Kafa a matsayin DIS",
    established2001Desc: "An kafa Kwalejin Leken Asiri na Tsaro (DIC) a shekara ta 2001.",
    campusRelocation: "Matsayin Kwalejin",
    campusRelocationDesc: "Kwalejin ta ƙaura zuwa wuri na dindindin a Victoria Island.",
    curriculumExpansion: "Fadada Manhaja",
    curriculumExpansionDesc: "Gyara manhajar don ƙara sabbin darussa na musamman.",
    modernEra: "Zamani Na Yanzu",
    modernEraDesc: "Haɗin gwiwa da Talongeeks don cikakken dijital.",
    
    // Commandants
    pastPresentCommandants: "Kwamandojin Da Suka Gabata da Na Yanzu",
    commandantDIC: "Kwamandan DIC",
    
    // News
    latestNews: "Sabbin Labarai",
    newsFlash: "Labari Mai Sauri",
    
    // Footer
    footerRights: "An kiyaye dukkan haƙƙoƙi.",
    designedBy: "Talongeeks ne suka tsara kuma suna kula da shi",
    
    // Contact
    getInTouch: "Tuntuɓe mu",
    location: "Wuri",
    phone: "Waya",
    sendMessage: "Aika Saƙo",
    yourName: "Sunanka",
    yourEmail: "Imelinka",
    message: "Saƙo",
    
    // Government Banner
    govBannerText: "Shafin yanar gizon Hukumar Leken Asiri na Tsaro ta Jamhuriyar Tarayyar Nigeria",
  },
  ig: {
    // Navigation
    home: "Ụlọ",
    about: "Maka DIC",
    departments: "Ngalaba",
    courses: "Usoro Ọmụmụ",
    pgProgram: "Mmemme PG",
    news: "Akụkọ & Blog",
    contact: "Kpọtụrụ Anyị",
    login: "Banye",
    logout: "Pụọ",
    
    // Quick Links
    quickLinks: "Njikọ Ngwa ngwa",
    eLibrary: "e-Ọbá Akwụkwọ",
    collegePortal: "Portal Kọleji",
    browseCourses: "Nyochaa Usoro Ọmụmụ",
    
    // Common
    email: "Email",
    readMore: "Gụkwuo",
    learnMore: "Mụta Karịa",
    viewCourses: "Lee Usoro Ọmụmụ",
    submit: "Nyefee",
    
    // Hero Section
    welcomeTitle: "Nnọọ na Kọleji Nchekwa Ọgụgụ Isi Nigeria",
    welcomeSubtitle: "Na-enye ndị ọkachamara nchekwa ike site na ọzụzụ nchekwa ọgụgụ isi nke ụwa iji chekwaa Nigeria.",
    explorePrograms: "Nyochaa mmemme anyị",
    
    // Features
    whyChooseDIC: "Gịnị mere ji ahọrọ DIC?",
    eliteTraining: "Ọzụzụ Ndị Ọkachamara",
    eliteTrainingDesc: "Mmemme ọzụzụ nchekwa ọgụgụ isi nke ụwa",
    professionalDevelopment: "Mmepe Ndị Ọkachamara",
    professionalDevelopmentDesc: "Ịmụ ihe na-aga n'ihu maka ndị ọrụ nchekwa",
    expertInstructors: "Ndị Nkuzi Ọkachamara",
    expertInstructorsDesc: "Mụta n'aka ndị ọkachamara nchekwa ọgụgụ isi",
    comprehensiveCurriculum: "Usoro Ọmụmụ Zuru Oke",
    comprehensiveCurriculumDesc: "Usoro ọmụmụ ọhụrụ n'ime nchekwa ọgụgụ isi",
    
    // About Section
    aboutUs: "Maka Anyị",
    missionVision: "Ebumnuche & Ọhụụ",
    established2001: "E hibere dị ka DIS",
    established2001Desc: "E hibere Kọleji Nchekwa Ọgụgụ Isi (DIC) na 2001.",
    campusRelocation: "Ịkwaga Ogige",
    campusRelocationDesc: "Kọleji ahụ kwagara n'ebe obibi na Victoria Island.",
    curriculumExpansion: "Mgbasawanye Usoro Ọmụmụ",
    curriculumExpansionDesc: "Nnukwu mgbanwe n'usoro ọmụmụ na-eweta usoro ọmụmụ pụrụ iche.",
    modernEra: "Oge Ọhụrụ",
    modernEraDesc: "Ndị mmekọ na Talongeeks maka dijitalụ zuru oke.",
    
    // Commandants
    pastPresentCommandants: "Ndị Kọmanda Gara Aga na Ndị Kọmanda Ugbu a",
    commandantDIC: "Kọmanda DIC",
    
    // News
    latestNews: "Akụkọ Kachasị Ọhụrụ",
    newsFlash: "Akụkọ Ngwa Ngwa",
    
    // Footer
    footerRights: "Ikike niile echekwara.",
    designedBy: "Talongeeks mere ya ma na-ahụ maka ya",
    
    // Contact
    getInTouch: "Kpọtụrụ Anyị",
    location: "Ebe",
    phone: "Ekwentị",
    sendMessage: "Zipu Ozi",
    yourName: "Aha gị",
    yourEmail: "Email gị",
    message: "Ozi",
    
    // Government Banner
    govBannerText: "Weebụsaịtị nke ụlọ ọrụ nchekwa ọgụgụ isi nke Federal Republic of Nigeria",
  },
  yo: {
    // Navigation
    home: "Ilé",
    about: "Nípa DIC",
    departments: "Àwọn Ẹ̀ka",
    courses: "Àwọn Ẹ̀kọ́",
    pgProgram: "Ètò PG",
    news: "Ìròyìn & Blog",
    contact: "Kàn sí Wa",
    login: "Wọlé",
    logout: "Jáde",
    
    // Quick Links
    quickLinks: "Àwọn Ìjápọ̀ Yíyára",
    eLibrary: "e-Ilé-ìkàwé",
    collegePortal: "Ẹnu-ọ̀nà Kọ́lẹ́ẹ̀jì",
    browseCourses: "Wo Àwọn Ẹ̀kọ́",
    
    // Common
    email: "Ímeèlì",
    readMore: "Ka síi",
    learnMore: "Kọ́ Síi",
    viewCourses: "Wo Àwọn Ẹ̀kọ́",
    submit: "Fíránṣẹ́",
    
    // Hero Section
    welcomeTitle: "Káàbọ̀ sí Kọ́lẹ́ẹ̀jì Ìmọ̀ Àbò ti Nigeria",
    welcomeSubtitle: "Ṣíṣe ìmúlò àwọn ọ̀gá àbò pẹ̀lú ìkẹ́kọ̀ọ́ ìmọ̀ àbò ti ayé láti dáàbò bo Nigeria.",
    explorePrograms: "Ṣàwárí àwọn ètò wa",
    
    // Features
    whyChooseDIC: "Kí ló dé tí wọ́n fi yàn DIC?",
    eliteTraining: "Ìkẹ́kọ̀ọ́ Gíga",
    eliteTrainingDesc: "Àwọn ètò ìkẹ́kọ̀ọ́ ìmọ̀ àbò ti ayé",
    professionalDevelopment: "Ìdàgbàsókè Ọjọ́gbọ́n",
    professionalDevelopmentDesc: "Ìkẹ́kọ̀ọ́ títẹ̀síwájú fún àwọn ọjọ́gbọ́n àbò",
    expertInstructors: "Àwọn Olùkọ́ Ọlọ́gbọ́n",
    expertInstructorsDesc: "Kọ́ ẹ̀kọ́ láti ọ̀dọ̀ àwọn ọjọ́gbọ́n ìmọ̀ àbò",
    comprehensiveCurriculum: "Ètò Ẹ̀kọ́ Kíkún",
    comprehensiveCurriculumDesc: "Àwọn ẹ̀kọ́ tuntun nínú ìmọ̀ àbò",
    
    // About Section
    aboutUs: "Nípa Wa",
    missionVision: "Iṣẹ́ & Ìran",
    established2001: "Ti dá sílẹ̀ gẹ́gẹ́ bí DIS",
    established2001Desc: "A dá Kọ́lẹ́ẹ̀jì Ìmọ̀ Àbò (DIC) sílẹ̀ ní ọdún 2001.",
    campusRelocation: "Ìyípò Ilé-ẹ̀kọ́",
    campusRelocationDesc: "Kọ́lẹ́ẹ̀jì ti yí lọ sí ibi tuntun ní Victoria Island.",
    curriculumExpansion: "Ìgbòòrò Ètò Ẹ̀kọ́",
    curriculumExpansionDesc: "Ìyípadà ètò ẹ̀kọ́ tó ń múlò àwọn ẹ̀kọ́ pàtàkì.",
    modernEra: "Àkókò Òde-òní",
    modernEraDesc: "Àjọṣe pẹ̀lú Talongeeks fún dígítálù kíkún.",
    
    // Commandants
    pastPresentCommandants: "Àwọn Kọ̀màńdà Àtijọ́ àti Lọ́wọ́lọ́wọ́",
    commandantDIC: "Kọ̀màńdà DIC",
    
    // News
    latestNews: "Ìròyìn Tuntun",
    newsFlash: "Ìròyìn Yíyára",
    
    // Footer
    footerRights: "Gbogbo ẹ̀tọ́ ni a pamọ́.",
    designedBy: "Talongeeks ló ṣe àpẹẹrẹ tí wọ́n sì ń bójú tó o",
    
    // Contact
    getInTouch: "Kàn sí Wa",
    location: "Ibi",
    phone: "Fóònù",
    sendMessage: "Fi Ìròyìn Ránṣẹ́",
    yourName: "Orúkọ rẹ",
    yourEmail: "Ímeèlì rẹ",
    message: "Ìròyìn",
    
    // Government Banner
    govBannerText: "Ojú-ẹ̀wé wẹ́ẹ̀bù ti Àjọ Ìmọ̀ Àbò ti Orílẹ̀-èdè Nigeria",
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
