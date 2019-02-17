const boardHandler = require('./src/schema/board/board.lambda');
const ticketHandler = require('./src/schema/ticket/ticket.lambda');
const commentHandler = require('./src/schema/comment/comment.lambda');
const userHandler = require('./src/schema/user/user.lambda');

module.exports.board = boardHandler;

module.exports.ticket = ticketHandler;

module.exports.comment = commentHandler;

module.exports.user = userHandler;

module.exports.hello = async event => ({
  statusCode: 200,
  body: JSON.stringify({
    message: 'Hello AWS LAMDBA',
    input: event,
    env: process.env.NODE_ENV,
  }),
});
