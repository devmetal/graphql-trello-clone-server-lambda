const boardHandler = require('./src/schema/board/board.lambda');
const ticketHandler = require('./src/schema/ticket/ticket.lambda');

module.exports.board = boardHandler;

module.exports.ticket = ticketHandler;

module.exports.hello = async event => ({
  statusCode: 200,
  body: JSON.stringify({
    message: 'Hello AWS LAMDBA',
    input: event,
    env: process.env.NODE_ENV,
  }),
});
