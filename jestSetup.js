// eslint-disable-next-line
const MongoMemorySrv = require('mongodb-memory-server').default;
const mongoose = require('mongoose');
// eslint-disable-next-line
const nodeFetch = require('node-fetch');
// eslint-disable-next-line
const gql = require('graphql-tag');

// setup environment
process.env.NODE_ENV = 'test';

const mongoServer = new MongoMemorySrv();

// Mock mongodb connection
jest.mock('./src/schema/mongo');

// Set mogno use native promises
mongoose.Promise = Promise;
mongoose.set('useFindAndModify', false);

// Util functions
const clearMongoDb = () => {
  const {
    connection: { collections },
  } = mongoose;

  if (collections) {
    const tasks = Object.keys(collections).map(k =>
      collections[k].deleteMany(),
    );

    return Promise.all(tasks);
  }

  return Promise.resolve();
};

const connectMongoDb = async () => {
  const connSrt = await mongoServer.getConnectionString(process.env.TEST_SUITE);

  const mongooseOpts = {
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
  };

  return mongoose.connect(
    connSrt,
    mongooseOpts,
  );
};

const disconnectMongoDb = async () => mongoose.disconnect();
const mongoDbDisconnected = () => mongoose.connection.readyState === 0;

beforeEach(async done => {
  if (mongoDbDisconnected()) {
    await connectMongoDb();
  }
  await clearMongoDb();
  done();
});

afterEach(async done => {
  await disconnectMongoDb();
  done();
});
