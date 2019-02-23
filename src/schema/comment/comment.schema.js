const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types } = Schema;

let CommentModel = null;

module.exports = conn => {
  const commentSchema = Schema({
    ticket: {
      type: Types.ObjectId,
      ref: 'Ticket',
    },
    removed: {
      type: Boolean,
      default: false,
    },
    body: String,
  });

  commentSchema.methods.getTicket = function getTicket() {
    return conn.model('Ticket').findById(this.ticket);
  };

  commentSchema.method('toClient', function toClient() {
    const obj = this.toObject();
    obj.id = obj._id;
    return obj;
  });

  if (CommentModel === null) {
    CommentModel = conn.model('Comment', commentSchema);
  }

  return CommentModel;
};
