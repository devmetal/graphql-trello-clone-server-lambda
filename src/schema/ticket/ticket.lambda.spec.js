const mongoose = require('mongoose');
const lambda = require('./ticket.lambda');
const boardModel = require('../board/board.schema');
const commentModel = require('../comment/comment.schema');
const ticketModel = require('./ticket.schema');

process.env.TEST_SUITE = 'ticket-resolver';

let Ticket;
let Comment;
let Board;

const lambdaCallback = (err, res) => {
  if (err) {
    throw err;
  }
  return res;
};

const fillDb = async () => {
  Ticket = ticketModel(mongoose.connection);
  Comment = commentModel(mongoose.connection);
  Board = boardModel(mongoose.connection);

  const comment = await Comment.create({
    body: 'Test Comment',
  });

  const board = await Board.create({
    label: 'Test Board',
  });

  const ticket = await Ticket.create({
    label: 'Test Ticket',
    body: 'Test ticket body',
    created: new Date(),
    board: board._id,
    comments: [comment._id],
  });

  return ticket;
};

let ticket;

beforeEach(async done => {
  ticket = await fillDb(done);
  done();
});

test('get ticket with resolver', async () => {
  const evt = { field: 'ticket', arguments: { id: ticket._id } };
  expect(await lambda(evt, {}, lambdaCallback)).toMatchObject({
    label: 'Test Ticket',
    body: 'Test ticket body',
  });
});

test('ticket board resolver', async () => {
  const board = await lambda(
    { field: 'board', arguments: { board: ticket.board } },
    {},
    lambdaCallback,
  );
  expect(board.label).toEqual('Test Board');
});

test('ticket comments resolver', async () => {
  const comments = await lambda(
    { field: 'comments', arguments: { comments: ticket.comments } },
    {},
    lambdaCallback,
  );
  expect(comments).toHaveLength(1);
  expect(comments[0].body).toEqual('Test Comment');
});

test('create ticket', async () => {
  const board = await Board.create({
    label: 'Test Board',
  });

  const newTicket = await lambda(
    {
      field: 'createTicket',
      arguments: {
        ticket: {
          board: board._id,
          label: 'Test Ticket',
          body: 'Test Ticket body',
        },
      },
    },
    {},
    lambdaCallback,
  );

  expect(newTicket).toMatchObject({
    label: 'Test Ticket',
    board: board._id,
  });
});

it('move ticket', async () => {
  const newBoard = await Board.create({ label: 'New Board' });

  await lambda(
    {
      field: 'moveTicket',
      arguments: {
        id: ticket._id,
        board: newBoard._id,
      },
    },
    {},
    lambdaCallback,
  );

  const ticketInDb = await Ticket.findById(ticket._id).lean();

  expect(ticketInDb).toMatchObject({
    label: 'Test Ticket',
    board: newBoard._id,
  });
});

it('remove ticket', async () => {
  await lambda(
    {
      field: 'removeTicket',
      arguments: { id: ticket._id },
    },
    {},
    lambdaCallback,
  );

  expect(await Ticket.findById(ticket._id).lean()).toMatchObject({
    removed: true,
  });
});
