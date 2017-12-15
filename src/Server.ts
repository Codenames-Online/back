import WebSocket = require('ws')

import * as logger from 'morgan'

import http = require('http')
import express = require('express')

import { Game } from './Game';
import { Receiver } from './Receiver'

const app: express.Application = express()

logger.token('req-body', (req, res) => { return JSON.stringify(req.body); });

app.use(logger(
		// log dev + req-body
	':method :url :status :response-time ms - :res[content-length] :req-body'
));

app.use(express.static('static'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let receiver = new Receiver(wss, new Game());

export default server;