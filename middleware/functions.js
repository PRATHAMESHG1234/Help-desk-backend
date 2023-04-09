const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const User = require('../models/User');
const Management = require('../models/Mangement');
const Customers = require('../models/Customers');
const registerUser = async (username, password) => {
  try {
    const user = await User.create({
      username,
      password,
    });
    return user._id;
  } catch (error) {
    if (error.code === 11000) {
      // Mongoose duplicate key error
      return { error: 'Username already exists' };
    } else {
      console.error(error.message);
      return { error: 'Server error' };
    }
  }
  next();
};

const createManagementUser = async (
  user_id,
  firstName,
  lastName,
  email,
  password,
  managementType
) => {
  try {
    const user = {
      user_id,
      firstName,
      lastName,
      email,
      password,
      managementType,
    };
    const result = await Management.create(user);
    return result;
  } catch (error) {
    console.error(error.message);
    return { error: 'Server error' };
  }
  next();
};

const createCustomerUser = async (
  user_id,
  firstName,
  lastName,
  email,
  password
) => {
  try {
    const user = {
      user_id,
      firstName,
      lastName,
      email,
      password,
    };
    const result = await Customers.create(user);
    return result;
  } catch (error) {
    console.error(error.message);
    return { error: 'Server error' };
  }
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
