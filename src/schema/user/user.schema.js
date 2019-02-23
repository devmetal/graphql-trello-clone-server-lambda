const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jwt-simple');

const { Schema } = mongoose;

let UserModel = null;

const secret = 'dmasédmasdfdsfsfds';

const genSalt = rounds =>
  new Promise((resolve, reject) => {
    bcrypt.genSalt(rounds, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });

const genHash = (data, salt) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(data, salt, null, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });

const compare = (inputPass, userPass) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(inputPass, userPass, (err, isMatch) => {
      if (err) return reject(err);
      return resolve(isMatch);
    });
  });

module.exports = conn => {
  const userSchema = Schema({
    email: String,
    password: String,
    teamId: Number,
  });

  userSchema.statics.hash = async pass => {
    const salt = await genSalt(10);
    const hash = await genHash(pass, salt);
    return hash;
  };

  userSchema.statics.findByToken = async token => {
    const payload = jwt.decode(token, secret);

    if (!payload) {
      return null;
    }

    const { _id } = payload;
    return UserModel.findById(_id);
  };

  userSchema.methods.comparePassword = async function comparePassword(
    inputPass,
  ) {
    return compare(inputPass, this.password);
  };

  userSchema.method('toClient', function toClient() {
    const obj = this.toObject();
    obj.id = obj._id;
    return obj;
  });

  if (UserModel === null) {
    UserModel = conn.model('User', userSchema);
  }

  return UserModel;
};
