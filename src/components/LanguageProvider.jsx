import { useEffect, useMemo, useState } from "react";
import LanguageContext from "./language-context";
import zh from "../language/zh";
import en from "../language/en";

const dictionaries = {
  zh,
  en,
};

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "zh";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  };

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: dictionaries[language],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
