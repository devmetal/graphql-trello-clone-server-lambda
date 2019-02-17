const mongo = require('../mongo');
const commentModel = require('./comment.schema');
const ticketModel = require('../ticket/ticket.schema');

let conn = null;
let Comment = null;
let Ticket = null;

const getTicket = async ({ id }) => Ticket.findById(id);

const commentTicket = async ({ ticket, body }) => {
  const t = await Ticket.findById(ticket);

  const comment = await Comment.create({
    ticket,
    body,
  });

  t.comments.push(comment._id);
  await t.save();

  return comment;
};

const updateComment = async ({ id, body }) =>
  Comment.findOneAndUpdate({ _id: id }, { $set: { body } }, { new: true });

const removeComment = async ({ id }) =>
  Comment.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true },
  );

module.exports = async (event, context, callback) => {
  // eslint-disable-next-line
  context.callbackWaitsForEmptyEventLoop = false;

  if (conn === null) {
    conn = await mongo();
    Comment = commentModel(conn);
    Ticket = ticketModel(conn);
    console.log('Connection Created');
  }

  const args = event.arguments;
  switch (event.field) {
    case 'ticket':
      return getTicket(args).then(res => callback(null, res));
    case 'commentTicket':
      return commentTicket(args).then(res => callback(null, res));
    case 'updateComment':
      return updateComment(args).then(res => callback(null, res));
    case 'removeComment':
      return removeComment(args).then(res => callback(null, res));
    default:
      return callback(`Unknown field, unable to resolve ${event.field}`, null);
  }
};
