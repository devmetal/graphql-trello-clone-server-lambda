const mongoose = require('mongoose');

const config = require('../config');

module.exports = async () =>
  mongoose.createConnection(config.get('mongo'), {
    bufferCommands: false,
    bufferMaxEntries: 0,
  });
