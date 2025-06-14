import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../api';
import { FontAwesome5 } from '@expo/vector-icons';

const REACTIONS = [
  { type: 'super_fura', label: 'Super fura', icon: 'car-side' },
  { type: 'szacun', label: 'Szacun', icon: 'tools' },
  { type: 'spoko', label: 'Spoko', icon: 'thumbs-up' },
  { type: 'zlomek', label: 'Złomek', icon: 'skull' },
];

const PostReactions = ({ postId }) => {
  const [counts, setCounts] = useState({});
  const [userReaction, setUserReaction] = useState(null);

  const fetchReactions = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.get(`${API_URL}/api/reactions/${postId}`);
      const summary = res.data.summary || [];
      const users = res.data.users || [];

      const countMap = {};
      summary.forEach(r => {
        countMap[r.type] = Number(r.count);
      });
      setCounts(countMap);

      const userOwn = users.find(u => u.user_id === userId);
      setUserReaction(userOwn?.type || null);
    } catch (err) {
      console.error('Błąd pobierania reakcji:', err);
    }
  };

  const handleReaction = async (type) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.post(`${API_URL}/api/reactions`, {
        post_id: postId,
        user_id: userId,
        type,
      });
      fetchReactions();
    } catch (err) {
      console.error('Błąd zapisu reakcji:', err);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  return (
    <View style={styles.container}>
      {REACTIONS.map(({ type, label, icon }) => (
        <TouchableOpacity
          key={type}
          style={[styles.button, userReaction === type && styles.activeButton]}
          onPress={() => handleReaction(type)}
        >
          <FontAwesome5
            name={icon}
            size={16}
            color={userReaction === type ? '#fff' : '#333'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.text, userReaction === type && styles.activeText]}>
            {counts[type] || 0}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#2563eb',
  },
  text: {
    fontSize: 13,
    color: '#333',
  },
  activeText: {
    color: '#fff',
  },
});

export default PostReactions;
