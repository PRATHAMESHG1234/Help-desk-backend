const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

exports.auth = (req, res, next) => {
  //Get jwttoken from header
  console.log(req.body);
  const token = req.header('x-auth-token');

  //check if no token

  if (!token) {
    return res.status(400).json({ msg: 'No token , authorization denied' });
  }

  //Verify token

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded.user;
    // //console.log('user', req.user);
    next();
  } catch (error) {
    res.status(401).json({ msg: 'token is not valid' });
  }
};
