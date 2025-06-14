import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import Post from '../components/Post';
import API_URL from '../api';

const Profile = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [user, setUser] = useState({});
  const [userStatus, setUserStatus] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Błąd', 'Nie jesteś zalogowany!');
        navigation.navigate('Login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/${userId}`);
        const fetchedUser = response.data;
        if (!fetchedUser.id) fetchedUser.id = userId;
        setUser(fetchedUser);
      } catch (error) {
        console.error('Błąd pobierania użytkownika:', error);
        Alert.alert('Błąd', 'Nie udało się pobrać danych użytkownika.');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const { data } = await axios.get(`${API_URL}/api/posts`);
        const userPostsOnly = data.filter(post => post.user_id === userId);
        setUserPosts(userPostsOnly);
      } catch (err) {
        console.error('Błąd pobierania postów użytkownika:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user_status/${user.id}`);
        setUserStatus(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setUserStatus({ is_blocked: false });
        } else {
          console.error('Błąd pobierania statusu użytkownika:', error);
        }
      }
    };

    if (user.id) {
      fetchUserStatus();
      fetchUserPosts();
    }
  }, [user.id]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Feather
          name="menu"
          size={28}
          color={colors.text}
          style={{ marginLeft: 15 }}
          onPress={() => navigation.toggleDrawer()}
        />
      ),
    });
  }, [navigation, colors]);

  const renderItem = ({ item }) => (
    <Post post={item} showActions={false} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileBox, { backgroundColor: colors.card, borderColor: colors.accent }]}>
        {user.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.text }]}>
            <Text style={[styles.placeholderText, { color: colors.background }]}>?</Text>
          </View>
        )}
        <View>
          <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
          <Text style={[styles.bio, { color: colors.text + '99' }]}>
            {user.bio || 'Opis profilu'}
          </Text>
        </View>
      </View>

      {userStatus?.is_blocked && (
        <View style={styles.blockedContainer}>
          <Text style={{ color: 'red' }}>Konto zablokowane: {userStatus.block_reason}</Text>
        </View>
      )}

      <Text style={[styles.postsTitle, { color: colors.text }]}>Posty użytkownika</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} />
      ) : (
        <FlatList
          data={userPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 14,
    marginTop: 4,
  },
  blockedContainer: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#ffcccc',
    borderRadius: 6,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
});

export default Profile;