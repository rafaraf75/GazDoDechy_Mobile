import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../api';
import { SocketContext } from '../context/SocketContext';

const Login = () => {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const user = res.data.user;
      const userId = user.id;
      const name = user.user_metadata?.username || user.email;
      const role = res.data.role || 'user';

      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('username', name);
      await AsyncStorage.setItem('role', role);

      const emitUserConnected = () => {
      console.log('[SOCKET] Emituję user_connected:', userId);
      socket.emit('user_connected', userId);
    };

    if (socket) {
      if (socket.connected) {
        emitUserConnected();
      } else {
        // Poczekaj na połączenie, wtedy wyemituj
        socket.once('connect', emitUserConnected);
      }
    }

    } catch (err) {
      setInfo('Logowanie nieudane');
      Alert.alert('Błąd', 'Nie udało się zalogować');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Logowanie</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Zaloguj</Text>
        </TouchableOpacity>
        {info ? <Text style={styles.info}>{info}</Text> : null}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 360,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  info: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  link: {
    marginTop: 16,
    color: '#1e90ff',
    textAlign: 'center',
  },
});