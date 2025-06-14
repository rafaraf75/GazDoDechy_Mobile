const { supabaseAdmin } = require('../supabaseClient');

// GET /api/groups
exports.getAllGroups = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Błąd pobierania grup:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/groups/:slug
exports.getGroupBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Nie znaleziono grupy' });
    }

    res.json(data);
  } catch (err) {
    console.error('Błąd pobierania grupy:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// POST /api/groups
exports.createGroup = async (req, res) => {
  const { slug, name, description } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('groups')
      .insert([{ slug, name, description }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Błąd tworzenia grupy:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// PUT /api/groups/:id
exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('groups')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Błąd edycji grupy:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// DELETE /api/groups/:id
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Grupa została usunięta' });
  } catch (err) {
    console.error('Błąd usuwania grupy:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
