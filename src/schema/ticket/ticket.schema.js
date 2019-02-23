const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types } = Schema;

let TicketModel = null;

module.exports = conn => {
  const ticketSchema = Schema({
    label: String,
    body: String,
    created: Date,
    board: {
      type: Types.ObjectId,
      ref: 'Board',
    },
    removed: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        type: Types.ObjectId,
        ref: 'Comment',
      },
    ],
  });

  ticketSchema.method('toClient', function toClient() {
    const obj = this.toObject();
    obj.id = obj._id;
    return obj;
  });

  if (TicketModel === null) {
    TicketModel = conn.model('Ticket', ticketSchema);
  }

  return TicketModel;
};
