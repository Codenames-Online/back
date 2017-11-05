import WebSocket = require('ws')
import { Receiver } from './components/Receiver'
import { Game } from './components/Game';

import http = require('http')
import express = require('express')

import * as logger from 'morgan'
import * as bodyParser from 'body-parser';

const app: express.Application = express()

app.use(bodyParser.json());
logger.token('req-body', (req, res) => { return JSON.stringify(req.body); });

app.use(logger(
		// log dev + req-body
	':method :url :status :response-time ms - :res[content-length] :req-body'
));

app.get('/test', (req, res) => {
  res.send({ msg: "hello" });
});

app.use(express.static('static'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let receiver = new Receiver(wss, new Game());

export default server;