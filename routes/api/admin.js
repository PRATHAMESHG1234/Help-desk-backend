const express = require('express');
const router = express.Router();
const Ticket = require('../../models/Ticket');
const { auth } = require('../../middleware/auth');
const User = require('../../models/User');
const {
  checkAdminRole,
  checkAgentRoleForAssignment,
} = require('../../middleware/managementType');
const Management = require('../../models/Mangement');
const Customers = require('../../models/Customers');

/**
 * Returns a list of all support tickets, regardless of which user created them.
 *
 * @route GET /api/support/admin/alltickets
 * @description Returns a list of all support tickets, regardless of which user created them.
 * @access Admin and super Admin only
 * @middleware checkAdminRole
 */

router.get('/alltickets', [auth, checkAdminRole], async (req, res) => {
  try {
    const ticket = await Ticket.find().sort({ date: -1 });
    res.json(ticket);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

/**
 * Get List Of All Ajents
 *
 * @route GET /api/support/admin/ajents
 * @description Get List Of All Ajents
 * @access Admin and super Admin only
 * @middleware checkAdminRole auth
 */
router.get('/getagents', [auth, checkAdminRole], async (req, res) => {
  const agent = await Management.find({ managementType: 'Agent' }).select(
    '-password'
  );
  res.json(agent);
});

/**
 * Updates the status of the specified support ticket and assign to help desk agent.
 *
 * @route PUT /api/support/admin/ticket/:ticketId/agent/:agentId
 * @description Updates the status of the specified support ticket.
 * @access Admin and super Admin only
 * @middleware checkAdminRole checkAgentRole auth
 * @param  ticketId - The ID of the support ticket to assign.
 * @param  agentId - The ID of the agent to assign the support ticket to.
 */
router.put(
  '/ticket/:ticketId/agent/:agentId',
  [auth, checkAdminRole, checkAgentRoleForAssignment],
  async (req, res) => {
    const agentId = req.params.agentId;
    const ticketId = req.params.ticketId;
    const newStatus = 'in progress';

    try {
      const agent = await Mangement.findById(agentId).select('-password');

      const ticket = await Ticket.findByIdAndUpdate(
        ticketId,
        { status: newStatus, assignedTo: agentId, managementType: 'Agent' },
        { new: true }
      );
      res.send(`Ticket ${ticket.title} assigned to agent ${agent.username}`);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Intarnal server Error Occured');
    }
  }
);

/**
 * Returns a list of all user accounts.
 *
 * @route GET /api/admin/customers
 * @description Returns a list of all user accounts.
 * @access Admin and super Admin only
 * @middleware checkAdminRole auth
 */

router.get('/customers', [auth, checkAdminRole], async (req, res) => {
  try {
    const users = await Customers.find().select('-password'); // Exclude password from results
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

/**
 * Updates the user account with the specified ID.
 *
 * @route PUT /api/users/:id
 * @description Updates the user account with the specified ID.
 * @access Admin and super Admin only
 * @middleware checkAdminRole auth
 * @param  id - The ID of the user account to update.
 */
router.put('/user/:id', [auth, checkAdminRole], async (req, res) => {
  const { name, username, fullname, managementType } = req.body;

  try {
    let user = await Customers.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let updatedUser = {};
    if (name) {
      updatedUser.name = name;
    } else {
      updatedUser.name = user.name;
    }
    if (username) {
      updatedUser.username = username;
    } else {
      updatedUser.username = user.username;
    }
    if (fullname) {
      updatedUser.fullname = fullname;
    } else {
      updatedUser.fullname = user.fullname;
    }
    if (managementType) {
      updatedUser.managementType = managementType;
    } else {
      updatedUser.managementType = user.managementType;
    }
    const updatedUserObj = await Customers.findByIdAndUpdate(
      req.params.id,
      updatedUser,
      { new: true }
    ).select('-password');

    res.json(updatedUserObj);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
/**
 * Deletes the user account with the specified ID.
 *
 * @route DELETE /api/users/:id
 * @description Deletes the user account with the specified ID.
 * @access Admin and super Admin only
 * @middleware checkAdminRole
 * @param  id - The ID of the user account to delete.
 */
router.delete('/user/:id', [auth, checkAdminRole], async (req, res) => {
  try {
    const user = await Customers.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.deleteOne();

    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
