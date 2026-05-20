# Integrated Recruitment System

Projekt składa się z backendu (FastAPI), frontendu (Next.js) i bazy danych PostgreSQL uruchamianej w kontenerze Docker.
Poniżej znajduje się instrukcja, jak zainicjować projekt na całkowicie czystym komputerze z systemem Windows / Linux.

## Wymagania
*   **Docker Desktop** (do uruchomienia bazy danych PostgreSQL)
*   **Node.js** (do uruchomienia Frontendu)
*   **Python + narzędzie uv** (do uruchomienia Backendu)

---

## 🚀 Krok 1: Uruchomienie i inicjalizacja Bazy Danych
Na nowym komputerze baza danych na początku jest pusta. Uruchamiamy ją i wczytujemy początkowe dane.
Otwórz terminal (lub PowerShell) w folderze głównym projektu i wykonaj poniższe komendy.

1. **Odpalenie kontenera bazy danych:**
   ```powershell
   cd database
   docker-compose up -d
   cd ..
   ```
   *Baza wystartuje w tle pod portem `5432`.*

2. **Załadowanie struktury tabel (schematu):**
   Wyślij plik `schema.sql` prosto do kontenera:
   ```powershell
   docker exec -i io-recruitment-db psql -U user_admin -d recruitment_system < database/schema.sql
   ```

3. **(Opcjonalne) Generowanie i załadowanie tysięcy testowych danych:**
   Jeśli chcesz mieć w bazie losowych kandydatów, płatności i wnioski, wygeneruj plik `seed.sql` używając skryptu w pythonie, a następnie wrzuć go do bazy tak samo jak schemat:
   ```powershell
   cd backend
   uv run python ../database/seed_generator.py
   cd ..
   docker exec -i io-recruitment-db psql -U user_admin -d recruitment_system < database/seed.sql
   ```

*(Gdyby baza zablokowała dostęp testowym kontom, nadaj swojemu pożądanemu kontu rolę Administratora używając np.: `docker exec -i io-recruitment-db psql -U user_admin -d recruitment_system -c "UPDATE users SET role='it_admin' WHERE email='twój_mail@test.pl';"`).*

---

## 🚀 Krok 2: Uruchomienie API (FastAPI)
Otwórz **nowy, oddzielny terminal**.
Serwer backendowy udostępnia całą logikę biznesową i pośredniczy w komunikacji z bazą.

```powershell
cd backend
# uv sync automatycznie pobierze wszystkie wymagane pakiety pythona
uv sync
uv run uvicorn app.main:app --reload
```
*API będzie teraz dostępne pod `http://localhost:8000` (Dokumentacja Swagger: `http://localhost:8000/docs`).*

---

## 🚀 Krok 3: Uruchomienie Strony Głównej (Next.js)
Otwórz **trzeci, oddzielny terminal**.
Frontend to wizualna nakładka służąca jako interfejs kandydata oraz administratora.

```powershell
cd client
npm install
npm run dev
```
*Aplikacja wizualna ruszy na `http://localhost:3000`.*

---
**Podsumowanie:** Aby wygodnie rozwijać projekt na co dzień, wystarczy otworzyć trzy konsole i wykonać:
*   `docker start io-recruitment-db` (lub uruchomić ponownie przez aplikację Dockera)
*   `cd backend` -> `uv run uvicorn app.main:app --reload`
*   `cd client` -> `npm run dev`