const { Router } = require('express');
const lambda = require('./board.lambda');

const board = new Router();
const callback = (err, res) => {
  if (err) {
    throw err;
  }
  return res;
};

board.get('/', async (req, res) => {
  const boards = await lambda({ field: 'boards' }, {}, callback);
  res.json(boards);
});

board.post('/', async (req, res) => {
  const {
    body: { label },
  } = req;
  const nBoard = await lambda(
    {
      field: 'createBoard',
      arguments: { label },
    },
    {},
    callback,
  );
  res.json(nBoard);
});

board.put('/:id', async (req, res) => {
  const {
    body: { label },
  } = req;
  const {
    params: { id },
  } = req;
  const uBoard = await lambda(
    {
      field: 'updateBoard',
      arguments: {
        id,
        label,
      },
    },
    {},
    callback,
  );
  res.json(uBoard);
});

board.delete('/:id', async (req, res) => {
  const {
    params: { id },
  } = req;
  const dBoard = await lambda(
    {
      field: 'removeBoard',
      arguments: {
        id,
      },
    },
    {},
    callback,
  );
  res.json(dBoard);
});

board.get('/:id/tickets', async (req, res) => {
  const {
    params: { id },
  } = req;
  const tickets = await lambda(
    {
      field: 'tickets',
      arguments: { id },
    },
    {},
    callback,
  );
  res.json(tickets);
});

module.exports = board;
