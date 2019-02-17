const mongo = require('../mongo');
const userModel = require('./user.schema');
const jwt = require('jwt-simple');

let conn = null;
let User = null;

const secret = 'dmasédmasdfdsfsfds';

const getUsers = async () => User.find({}).sort({ _id: 1 });

const createUser = async ({ email, password }) => {
  const count = await User.countDocuments({ email });

  if (count) {
    throw new Error('Email already exists');
  }

  try {
    const hased = await User.hash(password);
    const user = await User.create({ email, password: hased });

    const payload = {
      _id: user._id,
      email: user.email,
    };

    return jwt.encode(payload, secret);
  } catch (e) {
    throw new Error('User creation failed');
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const payload = {
    _id: user._id,
    email: user.email,
  };

  return jwt.encode(payload, secret);
};

const validate = async ({ token }) => {
  const user = await User.findByToken(token);

  if (!user) {
    return false;
  }

  return true;
};

module.exports = async (event, context, callback) => {
  // eslint-disable-next-line
  context.callbackWaitsForEmptyEventLoop = false;

  if (conn === null) {
    conn = await mongo();
    User = userModel(conn);
  }

  const args = event.arguments;
  switch (event.field) {
    case 'users':
      return getUsers().then(res => callback(null, res));
    case 'createUser':
      return createUser(args).then(res => callback(null, res));
    case 'login':
      return login(args).then(res => callback(null, res));
    case 'validate':
      return validate(args).then(res => callback(null, res));
    default:
      return callback(`Unknown field, unable to resolve ${event.field}`, null);
  }
};