import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import API_URL from '../api';
import { useTheme } from '../context/ThemeContext';

const CommentList = ({ postId, newComment }) => {
  const { colors } = useTheme();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/comments/${postId}`);
        setComments(res.data || []);
      } catch (err) {
        console.error('Błąd ładowania komentarzy:', err);
      }
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (
      newComment &&
      newComment.post_id === postId &&
      !comments.some((c) => c.id === newComment.id)
    ) {
      setComments((prev) => [newComment, ...prev]);
    }
  }, [newComment, postId, comments]);

  const renderItem = ({ item }) => (
    <View style={[styles.comment, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        {item.users?.profilePicture ? (
          <Image
            source={{ uri: item.users.profilePicture }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : null}
        <Text style={[styles.username, { color: colors.text }]}>{item.users?.username}</Text>
        <Text style={[styles.date, { color: colors.text + '99' }]}>
          {item.created_at
            ? new Date(item.created_at).toLocaleString()
            : ''}
        </Text>
      </View>
      <Text style={[styles.commentText, { color: colors.text }]}>{item.content}</Text>
    </View>
  );

  if (!comments.length) {
    return <Text style={styles.empty}>Brak komentarzy.</Text>;
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ paddingTop: 10 }}
    />
  );
};

const styles = StyleSheet.create({
  comment: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  username: {
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 12,
  },
  date: {
    fontSize: 10,
    color: '#888',
  },
  empty: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 13,
    marginVertical: 8,
  },
});

export default CommentList;
