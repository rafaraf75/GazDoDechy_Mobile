import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import Post from './Post';
import API_URL from '../api';
import { useTheme } from '../context/ThemeContext';

const PostFeed = ({ groupId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  const fetchPosts = useCallback(async () => {
    try {
      const url = groupId
        ? `${API_URL}/api/posts?group_id=${groupId}`
        : `${API_URL}/api/posts`;

      const res = await axios.get(url);
      setPosts(res.data || []);
    } catch (err) {
      console.error('Błąd pobierania postów:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderItem = ({ item }) => (
    <Post
      post={item}
      showActions={false}
      containerStyle={{
        borderColor: colors.accent,
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor: colors.card,
        padding: 10,
        marginBottom: 12,
      }}
    />
  );

  return (
    <View style={[styles.container, { borderColor: colors.accent, backgroundColor: colors.card }]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} />
      ) : posts.length === 0 ? (
        <Text style={[styles.message, { color: colors.text + '99' }]}>
          Brak postów. Bądź pierwszy i dodaj coś!
        </Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  message: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    padding: 16,
  },
});

export default PostFeed;