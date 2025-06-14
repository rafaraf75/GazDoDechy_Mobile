import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../api';
import { useTheme } from '../context/ThemeContext';

const PostForm = ({ onPostAdded, groupId }) => {
  const { colors } = useTheme();

  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [assets, setAssets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Brak uprawnień', 'Aby dodać zdjęcia, daj dostęp do galerii.');
      } else {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: 'photo',
          sortBy: [['creationTime', false]],
          first: 50,
        });
        setAssets(media.assets);
      }
    })();
  }, []);

  const handleSelectImage = (asset) => {
    if (images.length >= 3) {
      Alert.alert('Limit zdjęć', 'Możesz dodać maksymalnie 3 zdjęcia.');
      return;
    }
    setImages([...images, asset]);
    setModalVisible(false);
  };

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = async () => {
    if (!description.trim() && images.length === 0) {
      Alert.alert('Błąd', 'Post musi zawierać opis lub zdjęcia.');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    const formData = new FormData();

    formData.append('description', description);
    formData.append('user_id', userId);
    if (groupId) formData.append('group_id', groupId);

    images.forEach((img, index) => {
      formData.append('images', {
        uri: img.uri,
        type: 'image/jpeg',
        name: `photo${index}.jpg`,
      });
    });

    try {
      await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDescription('');
      setImages([]);
      Alert.alert('Sukces', 'Post dodany!');
      onPostAdded?.();
    } catch (err) {
      console.error('Błąd dodawania posta:', err);
      Alert.alert('Błąd', 'Nie udało się dodać posta.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.header, { color: colors.text }]}>Dodaj post</Text>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Opisz swoje auto, tuning, trasę..."
        placeholderTextColor={colors.text + '88'}
        multiline
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.accent,
          },
        ]}
      />

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.imageButtonSmall, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.imageButtonText}>Wybierz zdjęcie</Text>
        </TouchableOpacity>
        <Text style={[styles.imageInfo, { color: colors.text }]}>max 3 zdjęcia</Text>
      </View>

      {images.length > 0 &&
        images.map((img, i) => (
          <View key={i} style={styles.previewWrapper}>
            <Image source={{ uri: img.uri }} style={styles.imagePreview} />
            <Button title="Usuń" color="red" onPress={() => handleRemoveImage(i)} />
          </View>
        ))}

      <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: colors.accent }]}>
        <Text style={styles.submitText}>DODAJ POST</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Wybierz zdjęcie</Text>
          <FlatList
            data={assets}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectImage(item)}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              </TouchableOpacity>
            )}
          />
          <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>Zamknij</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    borderRadius: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imageButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  imagePreview: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalClose: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    fontWeight: 'bold',
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 4,
  },
  row: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
imageButtonSmall: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 8,
},
imageInfo: {
  marginLeft: 12,
  fontSize: 12,
  opacity: 0.7,
},
submitButton: {
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
submitText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
});

export default PostForm;