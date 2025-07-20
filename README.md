# GazDoDechy Mobile

GazDoDechy Mobile to uproszczona, mobilna wersja platformy społecznościowej dla fanów motoryzacji. Aplikacja pozwala użytkownikom korzystać z podstawowych funkcji serwisu za pomocą smartfona.

## Opis projektu

Mobilna aplikacja zawiera:
- tablicę postów (przeglądanie, komentowanie),
- profil użytkownika z podstawową edycją danych,
- system czatu,
- przeglądanie wydarzeń i możliwość zapisu.

Projekt został stworzony z użyciem React Native i wykorzystuje ten sam backend co aplikacja webowa.

## Stack technologiczny

**Frontend (mobile):**
- React Native
- Expo
- Axios
- CSS-in-JS / StyleSheet API

**Backend:**
- Node.js
- Express.js
- REST API

**Baza danych i przechowywanie plików:**
- Supabase (PostgreSQL)
- Cloudinary (zdjęcia i multimedia)

## Funkcjonalności

- Rejestracja i logowanie
- Przeglądanie i komentowanie postów
- Profil użytkownika
- Przeglądanie wydarzeń motoryzacyjnych
- Wbudowany czat między użytkownikami

## Uruchomienie lokalne

### Backend

```bash
cd backend
npm install
npm start

### Frontend
cd frontend
npm install
npx expo run:android
