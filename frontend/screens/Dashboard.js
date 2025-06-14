import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../api';
import Post from '../components/Post';
import PostForm from '../components/PostForm';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts`);
      setPosts(res.data || []);
    } catch (err) {
      console.error('Błąd pobierania postów:', err);
      Alert.alert('Błąd', 'Nie udało się pobrać postów.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('username');
      if (!userId) {
        //navigation.navigate('Login');
      } else {
        setUsername(name || '');
        fetchPosts();
      }
    };
    checkLogin();
  }, [fetchPosts]);

  // Ustawiamy ikonę hamburgera w nagłówku
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={{ marginLeft: 16, color: colors.text, fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const renderItem = ({ item }) => (
    <Post key={item.id} post={item} showActions={false} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={[styles.headerBox, { borderColor: colors.accent }]}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Witaj{username ? `, ${username}` : ''}! Pochwal się swoim autem:
              </Text>
              <PostForm onPostAdded={fetchPosts} />
            </View>
          }
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
