const mongoose = require('mongoose');

const { Schema } = mongoose;

let BoardModel = null;

module.exports = conn => {
  const boardSchema = Schema({
    label: String,
    removed: { type: Boolean, default: false },
  });

  boardSchema.method('toClient', function toClient() {
    const obj = this.toObject();
    obj.id = obj._id;
    return obj;
  });

  if (BoardModel === null) {
    BoardModel = conn.model('Board', boardSchema);
  }

  return BoardModel;
};
