const express = require('express');
const app = express();
const router = express.Router();
const User = require('../../models/User');
const Ticket = require('../../models/Ticket');
const { auth } = require('../../middleware/auth');
const {
  checkUserRole,
  checkAgentRole,
} = require('../../middleware/managementType');

const { check, validationResult } = require('express-validator');
/**
 * Allows a user to create a new support ticket.
 *
 * @route POST /api/support/tickets
 * @description Allows a user to create a new support ticket.
 * @access User, admin, super admin, agent
 * @middleware auth, checkUserRole
 */
router.post(
  '/',
  [
    auth,
    checkUserRole,
    [
      check('title', 'title is required').not().isEmpty(),
      check('description', 'description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findById(req.user.id).select('-password');
      // //console.log(user);
      const newTicket = new Ticket({
        createdBy: user.id,
        title: req.body.title,
        description: req.body.description,
        status: 'open',
        priority: req.body.priority,
        managementType: user.managementType,
      });

      const ticket = await newTicket.save();

      res.json(ticket);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

/**
 * Returns a list of support tickets created by the authenticated user.
 *
 * @route GET /api/support/tickets
 * @description Returns a list of support tickets created by the authenticated user.
 * @access User, admin, super admin, agent
 * @middleware auth, checkUserRole
 */
router.get('/', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let tickets = await Ticket.find();

    for (let i = 0; i < tickets.length; i++) {
      // //console.log(tickets[i].assignedTo, ' ', user.id);
      if (user.id === tickets[i].createdBy.toString()) {
        tickets = await Ticket.find({ createdBy: user.id });
      } else {
        tickets = await Ticket.find({
          managementType: user.managementType,
          assignedTo: user.id,
        });
      }
    }
    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ticket not found' });
    }
    res.status(500).send('server error');
  }
});

/**
 * Updates the support ticket with the specified ID. Users can update their own tickets, including adding comments and changing the priority.
 *
 * @route PUT /api/support/tickets/:id
 * @description Updates the support ticket with the specified ID.
 * @access User, admin, super admin, agent
 * @middleware auth, checkUserRole
 *
 * @param {string} id - The ID of the support ticket to update
 */ router.put('/update/:id', auth, async (req, res) => {
  const { title, description, status } = req.body;
  //create new note object
  const newTicket = {};
  if (title) {
    newTicket.title = title;
  }
  if (description) {
    newTicket.description = description;
  }
  if (status) {
    newTicket.status = status;
  }

  ///find the note to be updated and update it

  let ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404).send('Not Found');
  }
  if (ticket.createdBy.toString() !== req.user.id) {
    res.status(401).send('Not Allowed');
  }

  note = await Ticket.findByIdAndUpdate(
    req.params.id,
    { $set: newTicket },
    { new: true }
  );
  res.json(note);
});

/**
 * Allows a user to close their own support ticket with the specified ID.
 *
 * @route PATCH /api/support/tickets/:id
 * @description Allows a user to close their own support ticket with the specified ID.
 * @access User, admin, super admin, agent
 * @middleware auth, checkUserRole
 *
 * @param {string} id - The ID of the support ticket to close
 */
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404).send('Not Found');
    }
    if (ticket.createdBy.toString() !== req.user.id) {
      res.status(401).send('Not Allowed');
    }
    ticket = await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: 'ticket has been deleted', ticket: ticket });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Intarnal server Error Occured');
  }
});

module.exports = router;
