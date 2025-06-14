require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { supabaseAdmin } = require('./supabaseClient');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 5001;

const onlineUsers = new Map();

// 🔧 Uniwersalna funkcja do aktualizacji statusu
const updateOnlineStatus = async (userId, isOnline) => {
  try {
    const { error } = await supabaseAdmin
      .from('online_status')
      .upsert(
        {
          user_id: userId,
          is_online: isOnline,
          last_active: new Date().toISOString(),
        },
        { onConflict: ['user_id'] }
      );

    if (error) {
      console.error('[Supabase] Błąd aktualizacji online_status:', error.message);
    } else {
      console.log(`[Supabase] Status zaktualizowany dla ${userId} → ${isOnline}`);
    }
  } catch (e) {
    console.error('[Supabase] Wyjątek podczas aktualizacji statusu:', e.message);
  }
};

// ---------------- SOCKET.IO ----------------

io.on('connection', (socket) => {
  console.log('Socket.IO: użytkownik połączony –', socket.id);

  let currentUserId = null;

  socket.on('user_connected', async (userId) => {
    console.log('[SOCKET] Emituję user_connected:', userId);
    currentUserId = userId;
    onlineUsers.set(userId, socket.id);
    console.log(`Użytkownik ${userId} połączony.`);

    await updateOnlineStatus(userId, true);
    io.emit('users_online', Array.from(onlineUsers.keys()));
  });

  socket.on('user_disconnected', async (userId, callback) => {
    console.log('[BACKEND] user_disconnected odebrany:', userId);
    onlineUsers.delete(userId);
    console.log(`Użytkownik ${userId} wylogował się ręcznie.`);

    await updateOnlineStatus(userId, false);
    io.emit('users_online', Array.from(onlineUsers.keys()));
    if (callback) callback();
  });

  socket.on('sendMessage', (message) => {
    console.log('Otrzymano wiadomość:', message);
    if (message.receiver_id) {
      io.to(message.receiver_id).emit('receiveMessage', message);
    } else {
      socket.broadcast.emit('receiveMessage', message);
    }
  });

  socket.on('disconnect', async () => {
    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      console.log(`Socket disconnected: ${socket.id}`);

      io.emit('users_online', Array.from(onlineUsers.keys()));
    }
  });
});

// ---------------- REST API ----------------

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Mobilny backend działa!');
});

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comments');
const reactionRoutes = require('./routes/reactions');
const groupRoutes = require('./routes/group');
const userRoutes = require('./routes/user');
const userStatusRoutes = require('./routes/userStatus');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user_status', userStatusRoutes);
app.use('/api/chat', chatRoutes);

// ---------------- SERVER START ----------------

server.listen(PORT, () => {
  console.log(`Mobilny backend działa na http://<IP>:${PORT}`);
});