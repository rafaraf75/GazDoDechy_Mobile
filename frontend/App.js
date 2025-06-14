import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainApp() {
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={theme === 'light' ? DefaultTheme : DarkTheme}>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}