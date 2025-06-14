import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import PostImageSlider from './PostImageSlider';
import PostReactions from './PostReactions';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import API_URL from '../api';
import { useTheme } from '../context/ThemeContext';

const Post = ({ post, onEdit, onDelete, showActions = false, containerStyle }) => {
  const [commentsMap, setCommentsMap] = useState({});
  const [openComments, setOpenComments] = useState(false);
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.accent,
        },
        containerStyle, // umożliwia stylizację z zewnątrz (np. PostFeed)
      ]}
    >
      {post.users?.username && (
        <Text style={[styles.username, { color: colors.text + 'cc' }]}>
          {post.users.username}
        </Text>
      )}

      {post.groups && (
        <Text style={[styles.group, { color: colors.text + 'bb' }]}>
          Opublikowano w grupie:{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(`${API_URL}/groups/${post.groups.slug}`)}
          >
            {post.groups.name}
          </Text>
        </Text>
      )}

      <Text style={[styles.description, { color: colors.text }]}>{post.description}</Text>

      {post.post_images?.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <PostImageSlider images={post.post_images} />
        </View>
      )}

      {!showActions && <PostReactions postId={post.id} />}

      {!showActions && (
        <>
          <TouchableOpacity onPress={() => setOpenComments(!openComments)}>
            <Text style={[styles.commentToggle, { color: colors.accent }]}>
              {openComments
                ? 'Ukryj komentarze'
                : `Pokaż komentarze ${post.comment_count ? `(${post.comment_count})` : ''}`}
            </Text>
          </TouchableOpacity>

          {openComments && (
            <>
              <CommentForm
                postId={post.id}
                onCommentAdded={(newComment) =>
                  setCommentsMap((prev) => ({ ...prev, [post.id]: newComment }))
                }
              />
              <CommentList postId={post.id} newComment={commentsMap[post.id]} />
            </>
          )}
        </>
      )}

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.deleteBtn}>
            <Text style={styles.actionText}>Usuń</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEdit(post.id)} style={styles.editBtn}>
            <Text style={styles.actionText}>Edytuj</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  username: {
    marginBottom: 4,
    fontSize: 12,
  },
  group: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#2563eb',
  },
  description: {
    marginBottom: 8,
    fontSize: 15,
  },
  commentToggle: {
    marginTop: 8,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  editBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default Post;