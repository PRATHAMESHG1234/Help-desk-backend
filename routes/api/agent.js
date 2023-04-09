const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const { auth } = require('../../middleware/auth');
const { checkAgentRole } = require('../../middleware/managementType');
const Ticket = require('../../models/Ticket');
const CommentSchema = require('../../models/Comment');
const Customers = require('../../models/Customers');
const Comment = mongoose.model('Comment', CommentSchema);
/**
 * Returns a list of all support tickets assigned to the help desk agent.
 *
 * @route GET /api/support/tickets
 * @description Returns a list of all support tickets assigned to the help desk agent.
 * @access admin, super admin, agent
 * @middleware auth, checkAgentRole
 */
router.get('/tickets', [auth, checkAgentRole], async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: 'in progress' });

    const filteredTickets = tickets.filter((ticket) => {
      return ticket.assignedTo.toString() === req.user.id;
    });

    res.json(filteredTickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

/**
 * @API route: /api/support/tickets/:id
 * @HTTP method: PUT
 * @Middleware: auth, checkAgentRole
 * @Description: Updates the status of the support ticket with the specified ID. Help desk agents should be able to change the status of tickets they are assigned to, but not tickets assigned to other agents or unassigned tickets.
 * @access: Agent, Admin, Super Admin
 * @param id - Assigned ticked id
 */

router.put('/tickets/:id', [auth, checkAgentRole], async (req, res) => {
  try {
    // //console.log(req.params.id, '    ', req.user.id);
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });
    if (!ticket) {
      return res.status(404).send({ message: 'Ticket not found.' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).send({ message: 'Status is required.' });
    }

    ticket.status = status;
    await ticket.save();

    res.send(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Server error.' });
  }
});

/**
 * @API route: /api/support/tickets/:id
 * @HTTP method: GET
 * @Middleware: auth, checkAgentRole
 * @Description: Returns the details of the support ticket with the specified ID. Help desk agents should only be able to view tickets assigned to them.
 * @access: Agent
 * @param id - Assigned ticked id
 */

router.get('/tickets/:id', [auth, checkAgentRole], async (req, res) => {
  try {
    // //console.log(req.params.id, '    ', req.user.id);
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!ticket) {
      return res.status(404).send({ message: 'Ticket not found.' });
    }

    res.send(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Server error.' });
  }
});
/**
 * @API route: /api/support/tickets/:id
 * @HTTP method: PUT
 * @Middleware: auth, checkAgentRole
 * @Description: Updates the support ticket with the specified ID. Help desk agents should only be able to update tickets assigned to them, and can only update certain fields such as comments, priority, and status.
 * @access: Agent
 * @param id - Assigned ticked id
 */
router.put('/ticket/:id/comment', auth, checkAgentRole, async (req, res) => {
  try {
    const { text, status, attachMentLinks } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    // //console.log(ticket.assignedTo.toString(), '     ', req.user.id);
    if (ticket.assignedTo.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to update this ticket' });
    }
    const newComment = new Comment({
      createdBy: req.user.id,
      text,
      status,
      attachMentLinks,
    });
    ticket.comments.push(newComment);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
/**
 * @API route: /api/agent/customers
 * @HTTP method: GET
 * @Middleware: auth, checkAgentRole
 * @Description: Returns a list of all customers. Help desk agents may need to reference customer information when working on support tickets.
 * @access: Agent
 */

router.get('/customers', [auth, checkAgentRole], async (req, res) => {
  try {
    const customers = await Customers.find();
    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
