const moment = require('moment');
const mogno = require('../mongo');
const boardModel = require('../board/board.schema');
const commentModel = require('../comment/comment.schema');
const ticketModel = require('./ticket.schema');
const logger = require('../../logger');

let conn = null;
let Board = null;
let Comment = null;
let Ticket = null;

const getTicket = async ({ id }) => Ticket.findById(id);

const getBoard = async ({ board }) => Board.findById(board);

const getComments = async ({ comments }) =>
  Comment.find({
    _id: { $in: comments },
    removed: false,
  }).sort({ _id: -1 });

const createTicket = async ({ ticket }) => {
  const now = moment().toDate();
  const data = { ...ticket, created: now };
  return Ticket.create(data);
};

const moveTicket = async ({ id, board }) =>
  Ticket.findOneAndUpdate(
    { _id: id },
    {
      $set: { board },
    },
    { new: true },
  );

const updateTicket = async ({ id, ticket }) =>
  Ticket.findOneAndUpdate({ _id: id }, { $set: ticket }, { new: true });

const removeTicket = async ({ id }) =>
  Ticket.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true },
  );

module.exports = async (event, context, callback) => {
  // eslint-disable-next-line
  context.callbackWaitsForEmptyEventLoop = false;

  if (conn === null) {
    conn = await mogno();
    Board = boardModel(conn);
    Ticket = ticketModel(conn);
    Comment = commentModel(conn);
    logger().info('Connection Created');
  }

  logger().info(event, 'event');

  const args = event.arguments;
  switch (event.field) {
    case 'board':
      return getBoard(args)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'comments':
      return getComments(args)
        .then(arr => arr.map(r => r.toClient()))
        .then(res => callback(null, res));

    case 'ticket':
      return getTicket(args)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'createTicket':
      return createTicket(args)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'moveTicket':
      return moveTicket(args)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'updateTicket':
      return updateTicket(args)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'removeTicket':
      return removeTicket(args)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    default:
      return callback(`Unknown field, unable to resolve ${event.field}`, null);
  }
};
