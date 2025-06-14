import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SocketContext } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../api';
import axios from 'axios';

const Chat = () => {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const { colors } = useTheme();

  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Ustawienia nagłówka
  useEffect(() => {
    navigation.setOptions({
      title: 'Chat',
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={{ marginLeft: 16, color: colors.text, fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  // Główna inicjalizacja
  useEffect(() => {
    let interval;

    const init = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      setCurrentUserId(userId);

      const emitConnect = () => {
        console.log('[MOBILE] Emit user_connected:', userId);
        socket.emit('user_connected', userId);
        fetchOnlineUsers();
      };

      if (socket) {
        if (socket.connected) {
          emitConnect();
        } else {
          socket.once('connect', emitConnect);
        }
      }

      try {
        const res = await fetch(`${API_URL}/api/chat/users`);
        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error('Błąd pobierania użytkowników:', err);
      }

      await fetchOnlineUsers();
      interval = setInterval(fetchOnlineUsers, 10000);
    };

    init();

    return () => {
      clearInterval(interval);
      socket?.off('connect');
    };
  }, [socket]);

  // Nasłuch online statusu z backendu
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUpdate = (ids) => {
      console.log('[FRONTEND] Otrzymano users_online:', ids);
      setOnlineUsers(ids);
    };

    socket.on('users_online', handleOnlineUpdate);

    return () => {
      socket.off('users_online', handleOnlineUpdate);
    };
  }, [socket]);

  // Fallback do pobierania online userów (gdy socket nie działa)
  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/online-users`);
      if (Array.isArray(res.data)) {
        setOnlineUsers(res.data);
      }
    } catch (err) {
      console.error('Błąd online-users:', err);
    }
  };

  const handleSelect = (user) => {
    navigation.navigate('ChatRoom', { receiver: user });
  };

  const renderItem = ({ item }) => {
    if (item.id === currentUserId) return null;

    const isOnline = onlineUsers.includes(item.id);
    return (
      <TouchableOpacity style={styles.userItem} onPress={() => handleSelect(item)}>
        <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
        <Text style={{ color: isOnline ? 'green' : 'gray', fontSize: 14 }}>
          {isOnline ? '● online' : '○ offline'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Czat – Wybierz użytkownika</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userItem: {
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderColor: '#b87333',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 16,
  },
});

export default Chat;