const pino = require('pino');

let logger = null;

module.exports = () => {
  if (logger === null) {
    logger = pino();
  }

  return logger;
};
