# OpenRouter Chat Tester

Darmowy, lokalny tester modeli AI dostępnych przez OpenRouter. Wklej swój klucz API, wybierz model i rozmawiaj — bez rejestracji, bez bazy danych, bez śledzenia.

Projekt powstał z myślą o szybkim testowaniu **darmowych modeli** udostępnianych na platformie OpenRouter (np. Meta Llama, Google Gemma, Mistral, Qwen i wiele innych), ale działa z każdym modelem dostępnym na platformie.

---

## Czym jest OpenRouter?

[OpenRouter](https://openrouter.ai/) to bramka API agregująca setki modeli AI od różnych dostawców (OpenAI, Anthropic, Google, Meta, Mistral i wielu innych) pod jednym kluczem API. Wiele modeli jest dostępnych **całkowicie za darmo** ��� nie potrzebujesz karty kredytowej ani płatnego konta, żeby zacząć.

---

## Jak zdobyć klucz API (krok po kroku)

1. Wejdź na [openrouter.ai](https://openrouter.ai/) i kliknij **Sign In** (prawy górny róg).
2. Zaloguj się przez Google, GitHub lub e-mail — rejestracja jest darmowa.
3. Po zalogowaniu kliknij swój avatar w prawym górnym rogu, a następnie **Keys** (lub wejdź bezpośrednio na [openrouter.ai/keys](https://openrouter.ai/keys)).
4. Kliknij **Create Key**.
5. Nadaj kluczowi nazwę (np. "chat-tester") i kliknij **Create**.
6. Skopiuj wygenerowany klucz — zaczyna się od `sk-or-v1-...`.
7. Wklej klucz w aplikacji i kliknij **Connect**.

> Klucz daje dostęp do wszystkich modeli, w tym darmowych. Jeśli chcesz korzystać z modeli płatnych, doładuj konto w zakładce **Credits** na OpenRouter.

### Darmowe modele

OpenRouter oferuje wiele modeli z ceną `$0.00` za token. Po załadowaniu listy modeli w aplikacji możesz wyszukać np.:
- `meta-llama` — modele Llama od Meta
- `google/gemma` — modele Gemma od Google
- `mistralai` — modele Mistral
- `qwen` — modele Qwen od Alibaba
- `microsoft/phi` — modele Phi od Microsoft

Pełna lista darmowych modeli: [openrouter.ai/models?q=free](https://openrouter.ai/models?q=free)

---

## Uruchomienie

Wymagania: **Node.js 18+**

```bash
git clone <repo-url>
cd openrouter-chat-tester
npm install
npm run dev
```

Aplikacja uruchomi się na [http://localhost:5173](http://localhost:5173).

### Pozostałe komendy

| Komenda | Opis |
|---|---|
| `npm run dev` | Serwer deweloperski z hot reload |
| `npm run build` | Budowanie wersji produkcyjnej do `dist/` |
| `npm run preview` | Podgląd wersji produkcyjnej |
| `npm run lint` | Sprawdzenie kodu ESLint |

---

## Funkcje

- **Wklejanie klucza API** — podajesz klucz w interfejsie, bez plików konfiguracyjnych ani zmiennych środowiskowych.
- **Wyszukiwarka modeli** — modal z wyszukiwarką po nazwie i ID, pokazuje context length.
- **Chat** — interfejs wzorowany na ChatGPT/Claude: awatary, animacja pisania, textarea z Shift+Enter na nową linię.
- **Streaming** — odpowiedzi wyświetlane token po tokenie (z możliwością wyłączenia).
- **Załączniki** — obsługa obrazów (PNG, JPEG, GIF, WebP), wideo (MP4, WebM), dokumentów PDF i plików Markdown.
- **System prompt** — opcjonalne pole w ustawieniach (ikona koła zębatego).
- **Nowy chat** — reset konwersacji jednym kliknięciem.

---

## Prywatność i bezpieczeństwo

Ten projekt **nie zapisuje, nie przesyła i nie przechowuje żadnych danych** poza bezpośrednią komunikacją z API OpenRouter:

- **Klucz API** jest trzymany wyłącznie w pamięci przeglądarki (React state). Nie trafia do localStorage, sessionStorage, ciasteczek, plików ani żadnej bazy danych. Odświeżenie strony go usuwa.
- **Historia czatu** istnieje tylko w pamięci przeglądarki. Odświeżenie strony ją czyści. Nie jest zapisywana nigdzie — ani na dysku, ani na serwerze.
- **Załączniki** (obrazy, PDF, MD) są konwertowane na base64 i wysyłane bezpośrednio do OpenRouter. Nie przechodzą przez żaden pośredni serwer.
- **Brak backendu** — aplikacja jest w 100% frontendowa. Zapytania lecą prosto z Twojej przeglądarki do `openrouter.ai/api/v1`.
- **Brak analityki** — zero telemetrii, zero logowania, zero trackingu.
- **Brak konta użytkownika** — nie ma rejestracji, logowania ani bazy danych po stronie aplikacji.

Jedyną stroną trzecią, z którą komunikuje się aplikacja, jest API OpenRouter — zgodnie z ich [polityką prywatności](https://openrouter.ai/privacy).

---

## Stack technologiczny

- **Vite** — bundler i dev server
- **React 19** — UI
- **TypeScript** — typowanie
- Frontend-only, zero zależności backendowych

---

## Licencja

[MIT](LICENSE)
