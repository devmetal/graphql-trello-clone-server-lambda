const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');

const boards = require('../schema/board/board.rest');

const app = express();

app.use(bodyParser.json({ strict: false }));

app.use('/board', boards);

module.exports = serverless(app);
