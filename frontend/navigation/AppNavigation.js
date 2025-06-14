import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Dashboard from '../screens/Dashboard';
import Profile from '../screens/Profile';
import Chat from '../screens/Chat';
import { useTheme } from '../context/ThemeContext';
import { SocketContext } from '../context/SocketContext';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const DrawerContent = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const socket = React.useContext(SocketContext);

  const handleLogout = async () => {
  const userId = await AsyncStorage.getItem('userId');
  console.log('[SOCKET] user_disconnected:', userId);

  if (socket && socket.connected && userId) {
    console.log('[SOCKET] user_disconnected:', userId);
    socket.emit('user_disconnected', userId, async () => {
      console.log('[SOCKET] Odpowiedź z backendu na disconnect');
      await AsyncStorage.multiRemove(['userId', 'token', 'username', 'role']);
      socket.disconnect();
    });

    // fallback timeout w razie braku odpowiedzi z serwera
    setTimeout(async () => {
      await AsyncStorage.multiRemove(['userId', 'token', 'username', 'role']);
      socket.disconnect();
    }, 2000);

  } else {
    await AsyncStorage.multiRemove(['userId', 'token', 'username', 'role']);
  }
};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.card }]} onPress={toggleTheme}>
        <Feather name="moon" size={20} color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {theme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card }]}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
};

const BottomTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Profile') iconName = 'user';
          else if (route.name === 'Chat') iconName = 'message-circle';

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Chat" component={Chat} />
    </Tab.Navigator>
  );
};

const AppNavigation = () => {
  const socket = React.useContext(SocketContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 240,
        },
      }}
    >
      <Drawer.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default AppNavigation;