const { supabaseAdmin } = require('../supabaseClient');

// Dodaj lub zaktualizuj reakcję
exports.addOrUpdateReaction = async (req, res) => {
  const { user_id, post_id, type } = req.body;

  try {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('reactions')
      .select('*')
      .eq('user_id', user_id)
      .eq('post_id', post_id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('reactions')
        .update({ type, created_at: new Date() })
        .eq('user_id', user_id)
        .eq('post_id', post_id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('reactions')
        .insert([{ user_id, post_id, type, created_at: new Date() }]);

      if (insertError) throw insertError;
    }

    res.status(200).json({ message: 'Reakcja zapisana' });
  } catch (err) {
    console.error('Błąd dodawania reakcji:', err.message);
    res.status(500).json({ error: 'Błąd zapisu reakcji' });
  }
};

// Pobierz reakcje dla posta
exports.getReactionsForPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const { data: allReactions, error } = await supabaseAdmin
      .from('reactions')
      .select('user_id, type')
      .eq('post_id', postId);

    if (error) throw error;

    // Grupowanie po typie reakcji (np. super_fura, szacun itd.)
    const summaryMap = {};
    allReactions.forEach(({ type }) => {
      summaryMap[type] = (summaryMap[type] || 0) + 1;
    });

    const summary = Object.entries(summaryMap).map(([type, count]) => ({
      type,
      count
    }));

    res.status(200).json({
      summary,
      users: allReactions
    });
  } catch (err) {
    console.error('Błąd pobierania reakcji:', err.message);
    res.status(500).json({ error: 'Błąd pobierania reakcji' });
  }
};
