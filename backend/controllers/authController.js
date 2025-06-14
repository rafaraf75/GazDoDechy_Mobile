const { supabase, supabaseAdmin } = require('../supabaseClient');


exports.registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Tworzenie użytkownika przez Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }

    const userId = data.user.id;

    // Dodanie użytkownika do tabeli "users"
    const { error: insertError } = await supabaseAdmin.from('users').insert([
      {
        id: userId,
        email,
        username,
        role: 'user', // domyślna rola
        profilePicture: '',
        bio: ''
      }
    ]);

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ message: 'Użytkownik utworzony, ale nie dodano do bazy danych.' });
    }
    // Dodanie użytkownika do online_status
    const { error: statusError } = await supabaseAdmin.from('online_status').insert([
      {
        user_id: userId,
        is_online: false,
        last_active: new Date().toISOString()
      }
    ]);

    if (statusError) {
      console.error(statusError);
      return res.status(500).json({ message: 'Użytkownik utworzony, ale nie dodano do online_status.' });
    }

    res.status(201).json({ message: 'Użytkownik zarejestrowany', user: data.user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera przy rejestracji' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }

    const token = data.session.access_token;
    const user = data.user;

    // Pobieramy dane z tabeli users (w tym role)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .select('username, role')
      .eq('id', user.id)
      .maybeSingle();

      // Aktualizuj online_status po logowaniu
      await supabaseAdmin
        .from('online_status')
        .update({
          is_online: true,
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id);

    if (profileError) {
      console.error(profileError);
      return res.status(500).json({ message: 'Nie udało się pobrać danych użytkownika' });
    }

    res.status(200).json({
      message: 'Zalogowano',
      token,
      username: profileData.username,
      role: profileData.role,
      user: data.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd logowania' });
  }
};

exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Weryfikacja starego hasła
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (loginError || !data.user) {
      return res.status(401).json({ message: 'Stare hasło jest nieprawidłowe.' });
    }

    // Pobranie ID użytkownika
    const userId = data.user.id;

    // Zmiana hasła przez admina
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error(updateError);
      return res.status(400).json({ message: 'Nie udało się zmienić hasła.' });
    }

    res.status(200).json({ message: 'Hasło zostało zmienione.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
};

// DELETE /api/auth/delete/:id
exports.deleteUserAccount = async (req, res) => {
  const { id } = req.params;

  try {
    // Usuń dane z tabeli users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Błąd usuwania z tabeli users:', dbError);
      return res.status(500).json({ message: 'Błąd usuwania użytkownika z bazy' });
    }

    // Usuń konto z Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Błąd usuwania z auth:', authError);
      return res.status(500).json({ message: 'Błąd usuwania konta z Supabase Auth' });
    }

    res.status(200).json({ message: 'Konto zostało całkowicie usunięte' });
  } catch (err) {
    console.error('Błąd serwera przy usuwaniu konta:', err);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
};



