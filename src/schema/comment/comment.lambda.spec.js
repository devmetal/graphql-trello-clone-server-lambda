const mongoose = require('mongoose');
const lambda = require('./comment.lambda');
const commentModel = require('./comment.schema');
const ticketModel = require('../ticket/ticket.schema');

process.env.TEST_SUITE = 'comment-resolver';

let Ticket;
let Comment;

const lambdaCallback = (err, res) => {
  if (err) {
    throw err;
  }
  return res;
};

const fillDb = async () => {
  Ticket = ticketModel(mongoose.connection);
  Comment = commentModel(mongoose.connection);

  const ticket = await Ticket.create({
    label: 'Test Ticket',
    body: 'Test Ticket',
    created: new Date(),
  });

  const comment = await Comment.create({
    ticket: ticket._id,
    body: 'Test comment',
  });

  return [comment, ticket];
};

let comment;
let ticket;

beforeEach(async done => {
  [comment, ticket] = await fillDb();
  done();
});

test('get ticket resolver', async () => {
  const resTicket = await lambda(
    { field: 'ticket', arguments: { id: comment.ticket } },
    {},
    lambdaCallback,
  );
  expect(resTicket.label).toEqual('Test Ticket');
});

test('create comment', async () => {
  const resComment = await lambda(
    {
      field: 'commentTicket',
      arguments: { ticket: ticket._id, body: 'Test Comment' },
    },
    {},
    lambdaCallback,
  );

  expect(resComment).toMatchObject({
    ticket: ticket._id,
    body: 'Test Comment',
  });
});

test('update comment', async () => {
  await lambda(
    {
      field: 'updateComment',
      arguments: {
        id: comment._id,
        body: 'Updated Comment',
      },
    },
    {},
    lambdaCallback,
  );

  expect(await Comment.findById(comment._id).lean()).toMatchObject({
    ticket: ticket._id,
    body: 'Updated Comment',
  });
});

test('remove comment', async () => {
  await lambda(
    { field: 'removeComment', arguments: { id: comment._id } },
    {},
    lambdaCallback,
  );

  expect(await Comment.findById(comment._id).lean()).toMatchObject({
    removed: true,
  });
});
