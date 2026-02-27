import { createGameAndInvitatePlayers } from './domain/game-creation-service';
import { getTotalScores } from './domain/game-score-manager';
import { initHand } from './domain/game-service';
import { trickResponseDuringCardRemoval } from './domain/trick-machine';
import { getGameDump, importGameDump } from './service/dev-service';
import { GamePlayerRequest } from './types/game-player-request';
import { GameRequest } from './types/game-request';
import { gameIdExtractor } from './service/game-identifier-middleware';
import { playerExtractor } from './service/player-middleware';
import { tokenForLoginId } from './service/token-service';
import { Card, Rank, Suit } from '../types/card';
import { GameDump } from './types/game-dump';
import { RegisterPlayer } from '../types/register-player';
import { TrickResponse } from '../types/trick-response';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import * as http from 'http';
import StatusCodes from 'http-status-codes';
import morgan from 'morgan';
import * as path from 'path';
import url from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  addCardToTrick,
  chooseGameType,
  getCurrentTrick,
  getHandsTrickCounts,
  getPlayersHand,
  getStatute,
  getTableCards,
  removePlayersCard,
  startTrick,
} from './domain/hand-service';
import { GameType } from '../types/game-type';
import { SuitEnum } from '../types/suit';
import { FetchTokenRequest } from './types/fetch-token-request';
import { fileURLToPath } from 'url';
import { error } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());

const server = http.createServer(app);

let reactPath: string;
if (process.env.NODE_ENV === 'production') {
  reactPath = path.join(__dirname, 'public');
} else {
  dotenv.config();
  reactPath = path.join(__dirname, 'bismarck-web/dist');
  app.use(cors());
  app.use(morgan('dev'));
}
app.use(express.static(reactPath));

const wss = new WebSocketServer({ server });
const port = process.env.PORT || 3001;
const router = express.Router();

type WebSocketWithGameId = WebSocket & {
  gameId?: string;
};

const publishTrick = (trick: TrickResponse, gameId: string) => {
  wss.clients.forEach((client: WebSocketWithGameId) => {
    if (client.gameId === gameId) {
      client.send(JSON.stringify(trick));
    }
  });
};

const handleError = (
  res: express.Response,
  err: unknown,
  statusCode: number = StatusCodes.BAD_REQUEST
) => {
  if (err instanceof Error) {
    res.status(statusCode).send({ error: err.message });
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: 'Unexpected error' });
  }
};

router.get(
  '/games/:id/hand/statute',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const statute = await getStatute(req.gameId);
      res.send(statute);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.post(
  '/games/:id/hand/statute',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    try {
      const gameTypeChoice = {
        gameType: req.body.gameType as GameType,
        trumpSuit: req.body?.trumpSuit as SuitEnum | undefined,
      };
      const statute = await chooseGameType(
        req.player,
        gameTypeChoice,
        req.gameId
      );
      publishTrick(trickResponseDuringCardRemoval(), req.gameId);
      res.send(statute);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.get(
  '/games/:id/hand/cards',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    try {
      const cards = await getPlayersHand(req.player, req.gameId);
      res.send(cards);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.delete(
  '/games/:id/hand/cards',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    try {
      const card: Card = {
        rank: req.query.rank as Rank,
        suit: req.query.suit as Suit,
      };
      await removePlayersCard(req.player, card, req.gameId);
      res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.get(
  '/games/:id/hand/trick',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const trick = await getCurrentTrick(req.gameId);
      res.send(trick);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.post(
  '/games/:id/hand/trick',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    try {
      const card: Card = {
        rank: req.body.rank as Rank,
        suit: req.body.suit as Suit,
      };
      const trick = await startTrick(req.player, card, req.gameId);
      publishTrick(trick, req.gameId);
      res.send(trick);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.post(
  '/games/:id/hand/trick/cards',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    try {
      const card = req.body as Card;
      const trick = await addCardToTrick(req.player, card, req.params.id);
      publishTrick(trick, req.gameId);
      res.send(trick);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.get(
  '/games/:id/hand/trick-count',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const scores = await getHandsTrickCounts(req.gameId);
      res.send(scores);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.get(
  '/games/:id/hand/tablecards',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const cards = await getTableCards(req.gameId);
      res.send(cards);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.get(
  '/games/:id/score',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const scores = await getTotalScores(req.gameId);
      res.send(scores);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.post('/games', async (req: express.Request, res: express.Response) => {
  try {
    const players = req.body.players as RegisterPlayer[];
    const game = await createGameAndInvitatePlayers(players);
    res.send(game);
  } catch (err: unknown) {
    handleError(res, err);
  }
});

router.post(
  '/games/:id/hand',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const statute = await initHand(req.gameId);
      publishTrick(trickResponseDuringCardRemoval(), req.gameId);
      res.send(statute);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.post(
  '/fetch-token',
  async (req: express.Request, res: express.Response) => {
    try {
      const request = req.body as FetchTokenRequest;
      const result = await tokenForLoginId(request.loginId);
      res.send(result);
    } catch (err: unknown) {
      handleError(res, err, StatusCodes.FORBIDDEN);
    }
  }
);

router.get(
  '/dev/:id',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const gameDump = await getGameDump(req.gameId);
      res.send(gameDump);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

router.post(
  '/dev/:id',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    try {
      const gameDump = req.body as GameDump;
      await importGameDump(req.gameId, gameDump);
      res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err: unknown) {
      handleError(res, err);
    }
  }
);

wss.on('connection', (ws: WebSocketWithGameId, req: Request) => {
  console.log('Client connected');

  const parameters = url.parse(req.url, true);

  ws.gameId = parameters.query.gameId as string;

  getCurrentTrick(ws.gameId).then((trick) => {
    ws.send(JSON.stringify(trick));
  });

  ws.on('close', () => console.log('Client disconnected'));
});

app.use(express.json());
app.use('/api', router);
app.get('*', (_req, res) => {
  res.sendFile(`${reactPath}/index.html`);
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
