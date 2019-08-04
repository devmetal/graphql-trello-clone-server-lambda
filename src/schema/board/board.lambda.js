const mongo = require('../mongo');
const boardModel = require('./board.schema');
const ticketModel = require('../ticket/ticket.schema');
const logger = require('../../logger');

let conn = null;
let Board = null;
let Ticket = null;

const getTickets = async ({ id }) =>
  Ticket.find({
    board: id,
    removed: false,
  }).sort({ created: 1 });

const getBoards = async () => Board.find({ removed: false }).sort({ _id: 1 });

const createBoard = async ({ label }) => {
  const board = new Board({ label });
  return board.save();
};

const updateBoard = async ({ id, label }) =>
  Board.findOneAndUpdate({ _id: id }, { $set: { label } }, { new: true });

const removeBoard = async ({ id }) =>
  Board.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true },
  );

module.exports = async (event, context, callback) => {
  // eslint-disable-next-line
  context.callbackWaitsForEmptyEventLoop = false;

  if (conn === null) {
    conn = await mongo();
    Board = boardModel(conn);
    Ticket = ticketModel(conn);
    logger().info('Connection Created');
  }

  logger().info(event.field, 'event');

  switch (event.field) {
    case 'boards':
      return getBoards()
        .then(arr => arr.map(r => r.toClient()))
        .then(res => callback(null, res));

    case 'tickets':
      return getTickets(event.arguments)
        .then(arr => arr.map(r => r.toClient()))
        .then(res => callback(null, res));

    case 'createBoard':
      return createBoard(event.arguments)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'updateBoard':
      return updateBoard(event.arguments)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    case 'removeBoard':
      return removeBoard(event.arguments)
        .then(r => r.toClient())
        .then(res => callback(null, res));

    default:
      return callback(`Unknown field, unable to resolve ${event.field}`, null);
  }
};
