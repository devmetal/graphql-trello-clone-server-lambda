const mongoose = require('mongoose');
const lambda = require('./user.lambda');
const userModel = require('./user.schema');

process.env.TEST_SUITE = 'user-resolver';

let User;

const lambdaCallback = (err, res) => {
  if (err) {
    throw err;
  }
  return res;
};

beforeEach(async () => {
  User = userModel(mongoose.connection);

  const password = await User.hash('p4ssword');

  await User.create({
    email: 'test@test.com',
    password,
  });
});

test('get users query', async () => {
  const users = await lambda({ field: 'users' }, {}, lambdaCallback);
  expect(users).toHaveLength(1);
  expect(users[0]).toMatchObject({
    email: 'test@test.com',
  });
});

test('create user mutation', async () => {
  const token = await lambda(
    {
      field: 'createUser',
      arguments: {
        email: 'test2@test.com',
        password: 'p4ssword',
      },
    },
    {},
    lambdaCallback,
  );

  const userInDb = await User.findByToken(token);
  expect(userInDb).toMatchObject({ email: 'test2@test.com' });
});

test('login mutation', async () => {
  const token = await lambda(
    {
      field: 'login',
      arguments: {
        email: 'test@test.com',
        password: 'p4ssword',
      },
    },
    {},
    lambdaCallback,
  );

  const userInDb = await User.findByToken(token);
  expect(userInDb).toMatchObject({ email: 'test@test.com' });
});

test('validate mutation', async () => {
  const token = await lambda(
    {
      field: 'login',
      arguments: {
        email: 'test@test.com',
        password: 'p4ssword',
      },
    },
    {},
    lambdaCallback,
  );

  const isValid = await lambda(
    {
      field: 'validate',
      arguments: { token },
    },
    {},
    lambdaCallback,
  );

  expect(isValid).toBeTruthy();
});
