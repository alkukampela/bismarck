# Let's play cards!

This is a multiplayer (3 or 4 players) card game.

## Introduction

Bismarck is a Finnish trick-taking card game for 3–4 players, played with a standard 52-card deck. Players compete in four game modes—Trump, No-Trump, Misere, and Choice—taking turns as the dealer. The goal is to win the most points by collecting or avoiding tricks, depending on the mode. After all rounds, the player with the highest score wins.

## Local dev environment

### Prerequisites

- Node.js (v24+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers

### Architecture

- **Backend**: Cloudflare Workers
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

#### Configure environment variables

**Backend** (in `src/bismarck-server`):

Environment variables are managed using a `.dev.vars` file.

1. Create a new `.dev.vars` file in `src/bismarck-server/`.

2. Edit `.dev.vars` to set your environment variables:

   ```
   ENVIRONMENT=development
   DISABLE_EMAIL_SENDING=true
   JWT_SECRET=your-secret
   SMTP_HOST=
   SMTP_USERNAME=
   SMTP_PASSWORD=
   CORS_ORIGIN=*
   ```

   - `ENVIRONMENT`: Set to `development` or `production`.
   - `DISABLE_EMAIL_SENDING`: Set to `true` to disable email sending in development.
   - `JWT_SECRET`: Secret key for JWT tokens.
   - `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`: Email server configuration. Can be empty in developmet environment.
   - `CORS_ORIGIN`: Allowed CORS origins (e.g., `*` for all).

3. The application will automatically load variables when running locally.

**Frontend** (in `src/bismarck-web`):

```env
VITE_API_URL=http://localhost:8787
```

#### Install dependencies

```sh
# Backend
cd src/bismarck-server
npm install

# Frontend
cd ../bismarck-web
npm install
```

### Running locally

#### Start the backend (Cloudflare Workers)

```sh
cd src/bismarck-server
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
2. Fill the form with unique player names and emails
3. Fetch login codes from the Wrangler dev terminal output
4. Each player can login with their code, these can be run on separate browser tabs

### Deployment

```sh
cd src/bismarck-server
wrangler deploy
```

Note: Make sure to configure production secrets:

```sh
wrangler secret put JWT_SECRET
```

### Component Development with Cosmos React

This project uses [Cosmos React](https://reactcosmos.org/) for interactive component development and testing.

#### Running Cosmos

1. Go to the frontend directory:
   ```sh
   cd src/bismarck-web
   ```
2. Start Cosmos:

   ```sh
   npx cosmos
   ```

3. Open the Cosmos UI in your browser (usually at http://localhost:5000) to browse and interact with React components in isolation.

#### Adding Fixtures

- Add fixture files in `src/bismarck-web/components/__fixtures__` or alongside your components.
- See the [Cosmos documentation](https://reactcosmos.org/docs/fixtures) for details on writing and organizing fixtures.
