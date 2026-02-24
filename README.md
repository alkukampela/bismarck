# Let's play cards!

This is a multiplayer (3 or 4 players) card game.

## Local dev environment

### Prerequirements

- Node
- Docker & docker-compose (for Redis)

### Running

npm install
Create `.env` files for back end and front end.

Back end `.env` (in project root):

```
DISABLE_EMAIL_SENDING=TRUE
JWT_SECRET={ADD_YOUR_SECRET}
```

Front end `.env` (in `src/bismarck-web`):

```
VITE_API_URL=http://localhost:3001
```

Run the following commands to start the application:

```sh
docker-compose up

npm install
npm run build

cd src/bismarck-web
npm install
npm run dev
```

Browse to http://localhost:5173/create
Fill the form and fetch login codes from stdout of terminal where back end is running
