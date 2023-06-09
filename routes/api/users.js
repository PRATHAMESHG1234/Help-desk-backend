const express = require('express');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const { auth } = require('../../middleware/auth');
const {
  checkUserRole,
  checkSuperAdminRole,
} = require('../../middleware/managementType');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const Ticket = require('../../models/Ticket');
const Management = require('../../models/Mangement');
const Customers = require('../../models/Customers');
const {
  registerUser,
  createManagementUser,
  createCustomerUser,
  generatePassword,
  hashPassword,
  generateToken,
} = require('../../middleware/functions');
const sendRegistrationEmail = require('../../middleware/mailler');

const router = express.Router();

// @route    POST api/auth/register
// @desc     Register a user
// @access   Private (Super Admin)
router.post(
  '/register',
  [
    auth,
    checkSuperAdminRole,
    check('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, managementType } = req.body;

      // Generate a new password
      const newPassword = generatePassword();

      // Hash the password
      const hashedPassword = await hashPassword(newPassword);

      // Register the user
      const userId = await registerUser(email, hashedPassword);

      //send email with  username and password
      const response = await sendRegistrationEmail(
        userId,
        firstName,
        email,
        newPassword
      );

      // Create a new user with the given management type
      let result;
      if (
        managementType == 'Admin' ||
        managementType == 'Super Admin' ||
        managementType == 'Agent'
      ) {
        result = await createManagementUser(
          userId,
          firstName,
          lastName,
          email,
          newPassword,
          managementType
        );
      } else {
        result = await createCustomerUser(
          userId,
          firstName,
          lastName,
          email,
          newPassword
        );
      }
      res.json({
        success: true,
        message: `${managementType} registered successfully`,
      });

      // Generate a JWT token
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
      console.log(err);
    }
  }
);

///login
router.post(
  '/login',
  [
    check('username').notEmpty().withMessage('Username is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      // Find user by username
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Return success response with token
      return res.json({
        success: true,
        message: 'Login successful',
        data: { token },
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
);

// GET /api/auth
// Returns the authenticated user's information
router.get('/auth', auth, async (req, res) => {
  try {
    const user = await Promise.any([
      Management.findOne({ user_id: req.user.id }),
      Customers.findOne({ user_id: req.user.id }),
    ]);
    if (!user) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
    return res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});
/**
 *
 *Create comments for a ticket
 *@route POST /api/user/comment/:ticketId
 *@description This endpoint allows authorized users (including users, admins, super admins, and agents) to post a comment on a ticket with the specified ticket ID.
 *@access User, Admin, Super Admin, Agent
 *@middleware This endpoint requires two middlewares to be executed before the request can proceed: authentication (auth) and user role check (checkUserRole).
 *@param  ticketId - The ID of the ticket to add a comment to.
 *@param  comment - The content of the comment to add.
 */
router.post('/comment/:ticketId', [auth], async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text, status, attachMentLinks } = req.body;
    // //console.log(req.params);
    // //console.log(ticketId, '    ', '    ', req.user.id);
    const ticket = await Ticket.findById(ticketId);
    const user = await Customers.findById(req.user.id).select('-password');
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const newComment = new Comment({
      text: text,
      status: status,
      attachMentLinks: attachMentLinks,
      managementType: user.managementType,
      createdBy: req.user.id,
    });

    ticket.comments.unshift(newComment);
    ticket.save();
    res.json(ticket.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/**
 * Get all a comments for a ticket
 *
 * @route GET /api/user/comment/:ticketId
 * @description GEt comment on a ticket
 * @access user, admin, super admin, ajent
 * @middleware auth, checkUserRole
 *
 * @param  ticketId - The ID of the ticket to add a comment to
 * @param  comment - The content of the comment to add
 */

router.get('/comment/:ticketId', [auth], async (req, res) => {
  try {
    const { ticketId } = req.params;
    // //console.log(req.params);
    // //console.log(ticketId, '    ', '    ', req.user.id);
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    // //console.log(ticket);

    const comments = ticket.comments;
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
