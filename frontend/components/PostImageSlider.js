import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PostImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => {
    setIndex(index === 0 ? images.length - 1 : index - 1);
  };

  const next = () => {
    setIndex(index === images.length - 1 ? 0 : index + 1);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: images[index].url }}
        style={styles.image}
        resizeMode="cover"
      />

      {images.length > 1 && (
        <View style={styles.buttons}>
          <TouchableOpacity onPress={prev} style={styles.navButton}>
            <Text style={styles.navText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={next} style={styles.navButton}>
            <Text style={styles.navText}>▶</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.counter}>
        {index + 1} / {images.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  buttons: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  navText: {
    color: '#fff',
    fontSize: 18,
  },
  counter: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default PostImageSlider;
