const { supabaseAdmin } = require('../supabaseClient');

// Pobierz status jednego użytkownika
exports.getUserStatus = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await supabaseAdmin
      .from('user_status')
      .select('is_blocked, block_reason, blocked_at, unblocked_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Błąd pobierania statusu użytkownika:', error);
      return res.status(404).json({ message: 'Status użytkownika nie znaleziony' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Wyjątek:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobierz statusy wszystkich użytkowników
exports.getAllUserStatuses = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_status')
      .select('user_id, is_blocked, block_reason, blocked_at, unblocked_at');

    if (error) {
      console.error('Błąd pobierania statusów użytkowników:', error);
      return res.status(500).json({ message: 'Błąd serwera przy pobieraniu danych' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Wyjątek:', err);
    res.status(500).json({ message: 'Nieoczekiwany błąd serwera' });
  }
};

exports.blockUser = async (req, res) => {
  const userId = req.params.id;
  const reason = req.body?.reason || 'Brak powodu';

  try {
    const { error } = await supabaseAdmin
      .from('user_status')
      .upsert({
        user_id: userId,
        is_blocked: true,
        block_reason: reason,
        blocked_at: new Date().toISOString(),
        unblocked_at: null
      });

    if (error) {
      console.error('Błąd przy blokowaniu użytkownika:', error);
      return res.status(500).json({ message: 'Błąd serwera przy blokowaniu użytkownika' });
    }

    return res.status(200).json({ message: 'Użytkownik został zablokowany.' });
  } catch (err) {
    console.error('Wyjątek:', err);
    res.status(500).json({ message: 'Nieoczekiwany błąd serwera.' });
  }
};

exports.unblockUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const { error } = await supabaseAdmin
      .from('user_status')
      .upsert({
        user_id: userId,
        is_blocked: false,
        block_reason: null,
        blocked_at: null,
        unblocked_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Błąd przy odblokowywaniu użytkownika:', error);
      return res.status(500).json({ message: 'Błąd serwera przy odblokowywaniu użytkownika' });
    }

    return res.status(200).json({ message: 'Użytkownik został odblokowany.' });
  } catch (err) {
    console.error('Wyjątek:', err);
    res.status(500).json({ message: 'Nieoczekiwany błąd serwera.' });
  }
};