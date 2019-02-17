const mongoose = require('mongoose');
const lambda = require('./board.lambda');
const boardModel = require('./board.schema');
const ticketModel = require('../ticket/ticket.schema');

process.env.TEST_SUITE = 'board-lambda';

let Board;
let Ticket;

const lambdaCallback = (err, res) => {
  if (err) {
    throw err;
  }
  return res;
};

const fillDb = async () => {
  Board = boardModel(mongoose.connection);
  Ticket = ticketModel(mongoose.connection);

  const board = await Board.create({
    label: 'Test Board 1',
  });

  await Board.create({
    label: 'Test Board 2',
  });

  await Ticket.create({
    label: 'Test Ticket 1',
    body: 'Test ticket 1 body',
    created: new Date(),
    board: board._id,
  });

  await Ticket.create({
    label: 'Test Ticket 2',
    body: 'Test ticket 2 body',
    created: new Date(),
    board: board._id,
  });

  return board;
};

let board;

beforeEach(async done => {
  board = await fillDb();
  done();
});

test('get boards with resolver', async () => {
  const boards = await lambda({ field: 'boards' }, {}, lambdaCallback);
  expect(boards).toHaveLength(2);
  expect(boards[0].label).toEqual('Test Board 1');
  expect(boards[1].label).toEqual('Test Board 2');
});

test('get tickets with resolver', async () => {
  const tickets = await lambda(
    {
      field: 'tickets',
      arguments: { id: board._id },
    },
    {},
    lambdaCallback,
  );
  expect(tickets).toHaveLength(2);
  expect(tickets[0].label).toEqual('Test Ticket 1');
  expect(tickets[1].label).toEqual('Test Ticket 2');
});

test('create board', async () => {
  const { _id } = await lambda(
    {
      field: 'createBoard',
      arguments: { label: 'Test Board' },
    },
    {},
    lambdaCallback,
  );
  expect(await Board.findById(_id).lean()).toMatchObject({
    label: 'Test Board',
  });
});

test('update board', async () => {
  await lambda(
    {
      field: 'updateBoard',
      arguments: {
        id: board._id,
        label: 'Updated Label',
      },
    },
    {},
    lambdaCallback,
  );

  expect(await Board.findById(board._id).lean()).toMatchObject({
    label: 'Updated Label',
  });
});

test('remove board', async () => {
  await lambda(
    { field: 'removeBoard', arguments: { id: board._id } },
    {},
    lambdaCallback,
  );
  expect(await Board.findById(board._id).lean()).toMatchObject({
    removed: true,
  });
});
