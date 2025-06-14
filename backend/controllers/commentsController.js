const { supabaseAdmin } = require('../supabaseClient');

// GET /api/comments/:postId
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      users:users ( username, profilePicture )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Błąd pobierania komentarzy:', error);
    return res.status(500).json({ message: 'Błąd pobierania komentarzy' });
  }
  res.status(200).json(data);
};

// POST /api/comments/:postId
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content, user_id } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Treść komentarza jest wymagana' });
  }
  if (!user_id) {
    return res.status(400).json({ message: 'Brak user_id w żądaniu' });
  }
  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert([
      {
        post_id: postId,
        user_id: user_id,
        content,
        created_at: new Date().toISOString(),
      }
    ])
    .select('*, users ( username, profilePicture )')
    .single();

  if (error) {
    console.error('Błąd dodawania komentarza:', error);
    return res.status(500).json({ message: 'Nie udało się dodać komentarza' });
  }
  res.status(201).json(data);
};
