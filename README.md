# Let's play cards!

This is a multiplayer (3 or 4 players) card game.

## Local dev environment

### Prerequirements

- Node
- Docker & docker-compose

### Running

Create `.env` files for back end and and front end.

File for back end should be in the root of the repo with following contents:

```txt
DISABLE_EMAIL_SENDING=TRUE
JWT_SECRET={ADD_YOUR SECRET}
```

File for front end should be in `src/bismarck-web` directory with following contents:

```txt
REACT_APP_API_URL=http://localhost:3001
```

Run following commands to start the application

```sh
docker-compose up

npm install
npm run build
npm run start:watch

cd src/bismarck-web
npm install
npm run develop
```

Browse to http://localhost:1234/create
Fill the form and fetch login codes from stdout of terminal where back end is running
