const { supabaseAdmin } = require('../supabaseClient');

// Pomocnicza funkcja do znalezienia lub utworzenia rozmowy
async function getOrCreateConversation(senderId, receiverId) {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .or(`and(user1_id.eq.${senderId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${senderId})`)
    .single();

  if (data) return data.id;

  const { data: newConv, error: insertErr } = await supabaseAdmin
    .from('conversations')
    .insert([{ user1_id: senderId, user2_id: receiverId }])
    .select()
    .single();

  if (insertErr) throw insertErr;

  return newConv.id;
}

// Zapisz wiadomość
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    const conversationId = await getOrCreateConversation(senderId, receiverId);

    const { error } = await supabaseAdmin.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        read: false
      }
    ]);

    if (error) throw error;

    res.status(200).json({ message: 'Wiadomość zapisana' });
  } catch (err) {
    console.error('Błąd zapisu wiadomości:', err.message);
    res.status(500).json({ message: 'Błąd zapisu wiadomości' });
  }
};

// Pobierz historię rozmowy z nazwą użytkownika
exports.getChatHistory = async (req, res) => {
  const { senderId, receiverId } = req.query;

  try {
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${senderId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${senderId})`)
      .single();

    if (!conv) return res.json([]);

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('id, text, sender_id, created_at, users:sender_id(username)')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(messages);
  } catch (err) {
    console.error('Błąd historii czatu:', err.message);
    res.status(500).json({ message: 'Błąd historii czatu' });
  }
};

exports.getChatUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username');

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Błąd pobierania użytkowników:', err.message);
    res.status(500).json({ message: 'Błąd pobierania użytkowników do czatu' });
  }
};

// Pobierz tylko tych, którzy są oznaczeni jako online
exports.getOnlineUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('online_status')
      .select('user_id')
      .eq('is_online', true);

    if (error) throw error;

    // Zwracamy tylko tablicę ID
    const onlineIds = data.map((row) => row.user_id);
    res.status(200).json(onlineIds);
  } catch (err) {
    console.error('Błąd pobierania statusów online:', err.message);
    res.status(500).json({ message: 'Błąd pobierania statusów online' });
  }
};