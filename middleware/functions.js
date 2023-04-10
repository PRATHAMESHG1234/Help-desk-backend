const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const User = require('../models/User');
const Management = require('../models/Mangement');
const Customers = require('../models/Customers');
const registerUser = async (username, password) => {
  const userExists = await User.findOne({ username });
  if (userExists) {
    throw new Error('User already exists');
  }
  const user = await User.create({
    username,
    password,
  });
  return user._id;

  next();
};

const createManagementUser = async (
  userId,
  firstName,
  lastName,
  email,
  password,
  managementType
) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }
  const user = new Management({
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    managementType: managementType,
    email: email,
    password: password,
  });
  await user.save();
  return user;
};

const createCustomerUser = async (
  userId,
  firstName,
  lastName,
  email,
  password
) => {
  const userExists = await User.findOne({ username: email });

  if (userExists) {
    throw new Error('User already exists');
  }
  const user = new Customers({
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });
  await user.save();
  return user;
};

const generatePassword = () => {
  let password = '';
  password = parseInt(Math.random() * 10 ** 6) + password;
  while (password.length != 6) {
    password = '';
    password = parseInt(Math.random() * 10 ** 6) + password;
  }
  return password;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const generateToken = (userId) => {
  const payload = {
    user: {
      id: userId.toString(),
    },
  };
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: 3600,
  });
  return token;
};

module.exports = {
  registerUser,
  createManagementUser,
  createCustomerUser,
  generatePassword,
  hashPassword,
  generateToken,
};
