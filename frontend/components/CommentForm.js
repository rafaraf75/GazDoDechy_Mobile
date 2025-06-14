import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../api';
import { useTheme } from '../context/ThemeContext';

const CommentForm = ({ postId, onCommentAdded }) => {
  const { colors } = useTheme();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Błąd', 'Nie jesteś zalogowany.');
        return;
      }

      const res = await axios.post(`${API_URL}/api/comments/${postId}`, {
        content: content.trim(),
        user_id: userId,
      });

      setContent('');
      onCommentAdded?.(res.data);
    } catch (err) {
      console.error('Błąd dodawania komentarza:', err);
      Alert.alert('Błąd', 'Nie udało się dodać komentarza.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        multiline
        placeholder="Dodaj komentarz..."
        placeholderTextColor={colors.text + '88'}
        value={content}
        onChangeText={setContent}
      />
      {loading ? (
        <ActivityIndicator size="small" color="#1e90ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Skomentuj</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CommentForm;
