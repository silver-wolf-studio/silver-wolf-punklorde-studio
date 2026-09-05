# Silver Wolf Studio

Local-first chat and web-page builder with a Punklorde-inspired interface.

## Run locally

1. Install [Ollama](https://ollama.com/), then download the local model:

   ```bash
   ollama pull gemma3:4b
   ```

2. Start Ollama if it is not already running:

   ```bash
   ollama serve
   ```

3. Install the web dependencies and start the studio:

   ```bash
   pnpm install
   pnpm dev
   ```

4. Open `http://localhost:3000`.

The model runs locally after it has been downloaded, so chat and page generation do not require an API key or Internet connection. The Web Builder asks the model for short Indonesian copy and a color direction, then a local template immediately assembles a responsive standalone HTML page. Generated pages can be edited and downloaded.

## Offline and installable mode

The browser app includes a PWA app shell. After opening it once while the local studio is running, Chrome can install it from its install-app button and can reopen the cached interface without Internet.

- The chat history is stored only in the browser with `localStorage`.
- AI chat and the web builder still require both `ollama serve` and `pnpm dev` (or the production server) to be running on this laptop.
- Do not expose Ollama to the public Internet. The local endpoint is intentionally kept at `127.0.0.1:11434`.

## Important publishing note

The AI routes communicate with Ollama at `127.0.0.1:11434`, so the full interactive app must run on the same machine as Ollama. A static host such as GitHub Pages can host the project source or a non-AI demo, but cannot itself run the local AI backend.
