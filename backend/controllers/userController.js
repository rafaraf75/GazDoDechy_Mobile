const { supabaseAdmin } = require('../supabaseClient');
const cloudinary = require('../config/cloudinaryConfig');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, role, isBlocked');

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Błąd pobierania użytkowników' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/users/full
exports.getAllUsersWithStatus = async (req, res) => {
  try {
    // Pobierz użytkowników
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, username, role');

    if (usersError) {
      console.error('Błąd pobierania użytkowników:', usersError);
      return res.status(500).json({ message: 'Błąd pobierania użytkowników' });
    }

    // Pobierz statusy
    const { data: statuses, error: statusError } = await supabaseAdmin
      .from('user_status')
      .select('user_id, is_blocked');

    if (statusError) {
      console.error('Błąd pobierania statusów:', statusError);
      return res.status(500).json({ message: 'Błąd pobierania statusów' });
    }

    // Połącz dane
    const combined = users.map(user => {
      const status = statuses.find(s => s.user_id === user.id);
      return {
        ...user,
        isBlocked: status ? status.is_blocked : false
      };
    });

    res.status(200).json(combined);
  } catch (err) {
    console.error('Błąd serwera:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('username, email, role, bio, profilePicture')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera przy pobieraniu danych użytkownika' });
  }
};

// PUT /api/users/:id
exports.updateUserById = async (req, res) => {
  const { id } = req.params;
  const { username, bio, profilePicture, avatarPublicId } = req.body;

  try {
    // Pobierz stare dane
    const { data: oldUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('profilePicture, avatarPublicId')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(fetchError);
      return res.status(500).json({ message: 'Błąd pobierania starego zdjęcia' });
    }

    // Jeśli podano nowe zdjęcie
    if (profilePicture && profilePicture !== oldUser.profilePicture) {
      // Usuń stare z Cloudinary
      if (oldUser.avatarPublicId) {
        await cloudinary.uploader.destroy(oldUser.avatarPublicId);
      }

      // Zapisz nowe
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          username,
          bio,
          profilePicture,
          avatarPublicId
        })
        .eq('id', id);

      if (updateError) {
        console.error(updateError);
        return res.status(500).json({ message: 'Błąd aktualizacji profilu' });
      }
    } else {
      // Nie zmieniono zdjęcia – tylko username i bio
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ username, bio })
        .eq('id', id);

      if (updateError) {
        console.error(updateError);
        return res.status(500).json({ message: 'Błąd aktualizacji profilu' });
      }
    }

    res.status(200).json({ message: 'Profil zaktualizowany' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// PUT /api/users/:id/role – aktualizacja roli użytkownika
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id);

    if (error) {
      console.error('Błąd aktualizacji roli:', error);
      return res.status(500).json({ message: 'Błąd aktualizacji roli' });
    }

    res.status(200).json({ message: 'Rola została zaktualizowana' });
  } catch (err) {
    console.error('Błąd serwera:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};