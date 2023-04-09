const User = require('../models/User');
const Management = require('../models/Mangement');
const mongoose = require('mongoose');

exports.checkSuperAdminRole = async (req, res, next) => {
  // Check if the user has the 'Super Admin' role
  const user = await Management.findOne({
    user_id: req.user.id,
  }).select('-password');
  // //console.log('check user role', req.user.id);
  if (!user || user.managementType !== 'Super Admin') {
    return res.status(401).json({ message: 'Super Admin Unauthorized access' });
  }
  next();
};
exports.checkUserRole = async (req, res, next) => {
  // Check if the user has the 'User' role

  const user = await User.findById(req.user.id).select('-password');
  // //console.log('check user role', user);
  if (user.managementType !== 'Customer') {
    return res.status(401).json({ message: 'User Unauthorized access' });
  }
  next();
};

exports.checkAdminRole = async (req, res, next) => {
  // Check if the user has the 'Admin' or 'Super Admin' role
  const user = await Management.findOne({
    user_id: new mongoose.Types.ObjectId(req.user.id),
  }).select('-password');
  //console.log(user);
  // //console.log(user.managementType);
  if (
    user.managementType !== 'Admin' &&
    user.managementType !== 'Super Admin'
  ) {
    return res.status(401).json({ message: 'Admin Unauthorized access' });
  }
  next();
};

exports.checkAgentRoleForAssignment = async (req, res, next) => {
  const agentId = req.params.agentId;

  try {
    const user = await Management.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
    }).select('-password');
    if (
      user.managementType !== 'Admin' &&
      user.managementType !== 'Super Admin' &&
      user.managementType !== 'Agent'
    ) {
      return res.status(401).json({ message: 'Agent Unauthorized access' });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Intarnal server Error Occured');
  }
};
exports.checkAgentRole = async (req, res, next) => {
  // const agentId = req.params.agentId;
  const agentId = req.user.id;
  try {
    const user = await Management.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
    }).select('-password');
    if (
      user.managementType !== 'Admin' &&
      user.managementType !== 'Super Admin' &&
      user.managementType !== 'Agent'
    ) {
      return res.status(401).json({ message: 'Agent Unauthorized access' });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Intarnal server Error Occured');
  }
};
