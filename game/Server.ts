import ws = require('ws')
import url = require('url')
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

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

const server = http.createServer(app);
const wss = new ws.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url as string, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

export default app;