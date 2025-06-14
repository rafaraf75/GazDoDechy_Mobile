const { supabaseAdmin } = require('../supabaseClient');
const cloudinary = require('../config/cloudinaryConfig');

// POST /api/posts
exports.createPost = async (req, res) => {
  const { description, user_id, group_id } = req.body;
  const files = req.files || [];

  try {
    if (!user_id || !description) {
      return res.status(400).json({ message: 'Brakuje opisu lub ID użytkownika' });
    }

    // Upload zdjęć do Cloudinary z buffer
    const uploads = await Promise.all(
      files.map(async (file) => {
        const base64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'vehicles'
        });
        return {
          url: result.secure_url,
          public_id: result.public_id
        };
      })
    );

    // Utwórz post w Supabase
    const { data: post, error: postErr } = await supabaseAdmin
      .from('posts')
      .insert([{ description, user_id, group_id }])
      .select()
      .single();

    if (postErr) throw postErr;

    // Dodaj zdjęcia do post_images
    const imageInserts = uploads.map(img => ({
      post_id: post.id,
      url: img.url,
      public_id: img.public_id
    }));

    const { error: imageErr } = await supabaseAdmin
      .from('post_images')
      .insert(imageInserts);

    if (imageErr) throw imageErr;

    res.status(201).json({ message: 'Post utworzony', post });
  } catch (err) {
    console.error('Błąd tworzenia posta:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/posts
exports.getAllPosts = async (req, res) => {
  try {
    const { group_id } = req.query;

    const query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        users:user_id (username, profilePicture),
        groups:group_id (name, slug),
        post_images (url),
        comments (
          id
        )
      `)
      .order('created_at', { ascending: false });

    if (group_id) {
      query.eq('group_id', group_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    // Dodaj count komentarzy
    const postsWithCommentCount = data.map(post => ({
      ...post,
      comment_count: post.comments?.length || 0,
    }));

    postsWithCommentCount.forEach(p => delete p.comments);

    res.json(postsWithCommentCount);
  } catch (err) {
    console.error('Błąd pobierania postów:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/posts/:id
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        post_images (url, public_id)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Nie znaleziono posta' });
    }

    res.json(data);
  } catch (err) {
    console.error('Błąd pobierania posta:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { description, user_id } = req.body;

  try {
    if (!user_id || !description) {
      return res.status(400).json({ message: 'Brakuje danych' });
    }

    // Sprawdź, czy post istnieje i należy do użytkownika
    const { data: existingPost, error: findErr } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (findErr || !existingPost) {
      return res.status(404).json({ message: 'Post nie istnieje' });
    }

    if (existingPost.user_id !== user_id) {
      return res.status(403).json({ message: 'Brak dostępu' });
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({ description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Post zaktualizowany', post: data });
  } catch (err) {
    console.error('Błąd edycji posta:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Sprawdź właściciela
    const { data: existingPost, error: findErr } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (findErr || !existingPost) {
      return res.status(404).json({ message: 'Post nie istnieje' });
    }

    if (existingPost.user_id !== user_id) {
      return res.status(403).json({ message: 'Brak dostępu' });
    }

    // Usuń zdjęcia z Cloudinary
    const { data: images } = await supabaseAdmin
      .from('post_images')
      .select('public_id')
      .eq('post_id', id);

    if (images && images.length > 0) {
      await Promise.all(images.map(img =>
        cloudinary.uploader.destroy(img.public_id)
      ));
    }

    // Usuń rekordy z `post_images`
    await supabaseAdmin
      .from('post_images')
      .delete()
      .eq('post_id', id);

    // Usuń post
    const { error: deleteErr } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    res.json({ message: 'Post usunięty' });
  } catch (err) {
    console.error('Błąd usuwania posta:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};


