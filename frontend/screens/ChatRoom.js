import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketContext } from '../context/SocketContext';
import API_URL from '../api';
import { useTheme } from '../context/ThemeContext';

const ChatRoom = ({ route, navigation }) => {
  const { colors, theme } = useTheme();
  const socket = useContext(SocketContext);
  const { receiver } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: `Czat z ${receiver.username}`,
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
    });

    const init = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const uname = await AsyncStorage.getItem('username');
      setUserId(String(uid));
      setSenderName(uname);

      try {
        const res = await fetch(`${API_URL}/api/chat/history?senderId=${uid}&receiverId=${receiver.id}`);
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Błąd ładowania wiadomości:', error);
      }
    };

    init();

    socket.on('private_message', (msg) => {
      if (msg.sender_id?.toString() === receiver.id?.toString()) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off('private_message');
  }, [receiver, navigation]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg = {
      senderId: userId,
      receiverId: receiver.id,
      senderName,
      text: input,
    };

    socket.emit('sendMessage', newMsg);
    setMessages((prev) => [...prev, { ...newMsg, sender_id: userId }]);
    setInput('');

    try {
      await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.error('Błąd zapisu wiadomości:', err);
    }
  };

  const renderItem = ({ item }) => {
    const isMine = item.sender_id === userId;
    return (
      <View
        style={[
          styles.message,
          isMine ? styles.fromMe : styles.fromThem,
          { backgroundColor: isMine ? colors.accent : colors.card },
        ]}
      >
        {!isMine && (
          <Text style={[styles.username, { color: colors.text }]}>
            {item.senderName || item.users?.username || 'Użytkownik'}
          </Text>
        )}
        <Text style={{ color: isMine ? '#fff' : colors.text }}>
          {item?.text || '[brak]'}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ padding: 10 }}
          />

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                },
              ]}
              value={input}
              onChangeText={setInput}
              placeholder="Wpisz wiadomość..."
              placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
              onSubmitEditing={handleSend}
            />
            <Button title="Wyślij" onPress={handleSend} color={colors.accent} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 34,
    paddingTop: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    textAlignVertical: 'top',
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    borderWidth: 1.5,
    borderColor: '#b87333',
  },
  fromMe: {
    alignSelf: 'flex-end',
  },
  fromThem: {
    alignSelf: 'flex-start',
  },
  username: {
    fontSize: 10,
    marginBottom: 2,
  },
});

export default ChatRoom;