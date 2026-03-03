# Let's play cards!

This is a multiplayer (3 or 4 players) card game.

## Local dev environment

### Prerequisites

- Node.js (v18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers

### Architecture

- **Backend**: Cloudflare Workers with Durable Objects (SQL storage)
- **Storage**: Durable Objects for game state, KV namespace for login tokens
- **Frontend**: Vite + React

### Setup

#### Install Wrangler globally

```sh
npm install -g wrangler
```

#### Login to Cloudflare (optional for local dev)

```sh
wrangler login
```

#### Create `.env` files

**Backend** (in `src/bismarck-server-2`):

```env
JWT_SECRET=your-secret-key-here
ENVIRONMENT=development
DISABLE_EMAIL_SENDING=TRUE
```

**Frontend** (in `src/bismarck-web`):

```env
VITE_API_URL=http://localhost:8787
```

#### Install dependencies

```sh
# Backend
cd src/bismarck-server-2
npm install

# Frontend
cd ../bismarck-web
npm install
```

### Running locally

#### Start the backend (Cloudflare Workers)

```sh
cd src/bismarck-server-2
wrangler dev
```

The API will be available at `http://localhost:8787/api`

#### Start the frontend

```sh
cd src/bismarck-web
npm run dev
```

The web app will be available at `http://localhost:5173`

### Usage

1. Browse to http://localhost:5173/create
2. Fill the form with player names and emails
3. Fetch login codes from the Wrangler dev terminal output
4. Each player can login with their code

### Deployment

```sh
cd src/bismarck-server-2
wrangler deploy
```

Note: Make sure to configure production secrets:

```sh
wrangler secret put JWT_SECRET
```
