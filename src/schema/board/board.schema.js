const mongoose = require('mongoose');

const { Schema } = mongoose;

let BoardModel = null;

module.exports = conn => {
  const boardSchema = Schema({
    label: String,
    removed: { type: Boolean, default: false },
  });

  if (BoardModel === null) {
    BoardModel = conn.model('Board', boardSchema);
  }

  return BoardModel;
};
