import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ta';

type TranslationKeys =
  | 'home'
  | 'shop'
  | 'categories'
  | 'contact'
  | 'search'
  | 'cart'
  | 'wishlist'
  | 'profile'
  | 'addressBook'
  | 'orderHistory'
  | 'adminDashboard'
  | 'sellerDashboard'
  | 'signOut'
  | 'welcome'
  | 'checkout'
  | 'payment'
  | 'contactUs'
  | 'sendMessage'
  | 'fullName'
  | 'emailAddress'
  | 'subject'
  | 'messageDetails'
  | 'submitFeedback'
  | 'sending'
  | 'officeAddress'
  | 'hqAddress'
  | 'callSupport'
  | 'businessHours';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    contact: 'Contact',
    search: 'Search products...',
    cart: 'Cart',
    wishlist: 'Wishlist',
    profile: 'My Profile',
    addressBook: 'Address Book',
    orderHistory: 'Order History',
    adminDashboard: 'Admin Dashboard',
    sellerDashboard: 'Seller Dashboard',
    signOut: 'Sign Out',
    welcome: 'Welcome to Diyora',
    checkout: 'Checkout',
    payment: 'Secure Payment',
    contactUs: 'Contact Us',
    sendMessage: 'Send Us a Message',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    subject: 'Subject',
    messageDetails: 'Message Details',
    submitFeedback: 'Submit Feedback',
    sending: 'Sending Message...',
    officeAddress: 'Office Address & Support',
    hqAddress: 'Headquarters Address',
    callSupport: 'Call Support & Email',
    businessHours: 'Business Operation Hours',
  },
  ta: {
    home: 'முகப்பு',
    shop: 'கடை',
    categories: 'வகைகள்',
    contact: 'தொடர்பு',
    search: 'தயாரிப்புகளைத் தேடுங்கள்...',
    cart: 'கூடை',
    wishlist: 'விருப்பப்பட்டியல்',
    profile: 'என் சுயவிவரம்',
    addressBook: 'முகவரி புத்தகம்',
    orderHistory: 'ஆர்டர் வரலாறு',
    adminDashboard: 'நிர்வாகி டாஷ்போர்டு',
    sellerDashboard: 'விற்பனையாளர் டாஷ்போர்டு',
    signOut: 'வெளியேறு',
    welcome: 'டியோராவுக்கு உங்களை வரவேற்கிறோம்',
    checkout: 'செக்அவுட்',
    payment: 'பாதுகாப்பான கட்டணம்',
    contactUs: 'எங்களை தொடர்பு கொள்ள',
    sendMessage: 'எங்களுக்கு ஒரு செய்தி அனுப்புங்கள்',
    fullName: 'முழு பெயர்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    subject: 'பொருள்',
    messageDetails: 'செய்தி விவரங்கள்',
    submitFeedback: 'கருத்தை சமர்ப்பிக்கவும்',
    sending: 'செய்தி அனுப்பப்படுகிறது...',
    officeAddress: 'அலுவலக முகவரி & ஆதரவு',
    hqAddress: 'தலைமையக முகவரி',
    callSupport: 'அழைப்பு ஆதரவு & மின்னஞ்சல்',
    businessHours: 'வணிக செயல்பாட்டு நேரங்கள்',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('ec_lang');
    return (stored as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ec_lang', lang);
  };

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || translations['en'][key] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
