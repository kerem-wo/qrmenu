"use client";

import { useState, useEffect } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useState<string>('tr');
  
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'tr';
    setLanguage(savedLang);
    document.documentElement.lang = savedLang;
  }, []);
  
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  return {
    language,
    changeLanguage,
  };
}
