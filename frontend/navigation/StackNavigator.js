import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from '../screens/Login';
import Register from '../screens/Register';
import ChatRoom from '../screens/ChatRoom';
import AppNavigation from './AppNavigation';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setIsLoggedIn(!!userId);
    };

    const interval = setInterval(checkLogin, 1000); // odświeżanie co sekundę
    return () => clearInterval(interval);
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainApp" component={AppNavigation} />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoom}
            options={({ route }) => ({
              title: `Czat z ${route.params?.receiver?.username || 'użytkownikiem'}`,
              headerShown: true,
              headerBackTitleVisible: false,
            })}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}