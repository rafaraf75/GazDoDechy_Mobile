import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

// Jasny motyw
const lightColors = {
  background: '#ffffff',
  text: '#000000',
  card: '#f5f5f5',
  accent: '#b87333',
  inputBg: '#f0f0f0',
  border: '#e0e0e0',
};

const darkColors = {
  background: '#151825',
  card: '#242935',
  section: '#3c414f',
  text: '#f0f0f0',
  accent: '#b87333',
  inputBg: '#2b2f3d',
  border: '#b87333',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);