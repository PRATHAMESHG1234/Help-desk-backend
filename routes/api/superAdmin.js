const express = require('express');
const router = express.Router();
const Ticket = require('../../models/Ticket');
const { auth } = require('../../middleware/auth');
const User = require('../../models/User');
const {
  checkSuperAdminRole,
  checkAdminRole,
} = require('../../middleware/managementType');
const Management = require('../../models/Mangement');
const Customers = require('../../models/Customers');

/////////////////////////////////////////////////Super Admin Routs/////////////////////////////////////////////////
/**
 * Returns a list of all customers accounts.
 *
 * @route GET /api/customers
 * @description Returns a list of all customer accounts excluding the password field.
 * @access Admin only
 * @middleware checkAdminRole, auth
 */
router.get('/customers', auth, checkAdminRole, async (req, res) => {
  try {
    const customers = await Customers.find().select('-password');
    res.json(customers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
/**
 * Updates a customer account by ID.
 *
 * @route PUT /api/customers/:id
 * @description Update a customer account's name, email, and password.
 * @access Admin only
 * @middleware checkAdminRole, auth
 * @params id -customer
 */
router.put('/customers/:id', auth, checkAdminRole, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let customer = await Customers.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    if (name) {
      customer.name = name;
    }

    if (email) {
      customer.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(password, salt);
    }

    const updatedCustomer = await customer.save();

    res.json(updatedCustomer);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

/**
 * Deletes a customer account by ID.
 *
 * @route DELETE /api/customers/:id
 * @description Delete a customer account by ID.
 * @access Admin only
 * @middleware checkAdminRole, auth
 *  @params id -customer
 */
router.delete('/customers/:id', auth, checkAdminRole, async (req, res) => {
  try {
    await Customers.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Customer account deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
/**
 *
 *
 * Returns a list of all admin accounts.
 *
 * @route GET /api/admins
 * @description Returns a list of all admin accounts.
 * @access Super Admin only
 * @middleware checkSuperAdminRole, auth
 */
router.get('/getadmins', [auth, checkSuperAdminRole], async (req, res) => {
  try {
    const admins = await Management.find({ managementType: 'Admin' }).select(
      '-password'
    ); // Exclude password from results
    res.json(admins);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

/**
 * Gets a list of all admin accounts.
 *
 * @route GET /api/admins
 * @description Returns a list of all admin accounts.
 * @access Super Admin only
 * @middleware checkSuperAdminRole, auth
 */
router.get('/admins', auth, checkSuperAdminRole, async (req, res) => {
  try {
    const admins = await Management.find({ managementType: 'Admin' }).select(
      '-password'
    );
    res.json(admins);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
/**
 * Updates the admin account with the specified ID.
 *
 * @route PUT /api/admins/:id
 * @description Updates the admin account with the specified ID.
 * @access Super Admin only
 * @middleware auth, checkSuperAdminRole
 *
 * @param  id - The ID of the admin account to update
 */
router.put('/admin/:id', [auth, checkSuperAdminRole], async (req, res) => {
  const { name, username, managementType } = req.body;

  try {
    let admin = await Management.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    let updatedAdmin = {};

    if (name) {
      updatedAdmin.name = name;
    } else {
      updatedAdmin.name = admin.name;
    }

    if (username) {
      updatedAdmin.username = username;
    } else {
      updatedAdmin.username = admin.username;
    }

    if (managementType) {
      updatedAdmin.managementType = managementType;
    } else {
      updatedAdmin.managementType = admin.managementType;
    }

    const updatedAdminObj = await Management.findByIdAndUpdate(
      req.params.id,
      updatedAdmin,
      { new: true }
    ).select('-password');

    res.json(updatedAdminObj);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

/**
 * Deletes the admin account with the specified ID.
 *
 * @route DELETE /api/admins/:id
 * @description Deletes the admin account with the specified ID.
 * @access Super Admin only
 * @middleware auth, checkSuperAdminRole
 *
 * @param  id - The ID of the admin account to delete
 */

router.delete('/admin/:id', [auth, checkSuperAdminRole], async (req, res) => {
  try {
    await Management.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Admin account deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
/**
 * Returns a list of all agent accounts.
 *
 * @route GET /agents
 * @description Returns a list of all agent accounts.
 * @access Super Admin only
 * @middleware checkSuperAdminRole, auth
 */
router.get('/getagents', [auth, checkAdminRole], async (req, res) => {
  try {
    const agents = await Management.find({ managementType: 'Agent' }).select(
      '-password'
    ); // Exclude password from results
    res.json(agents);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
/**
 * Deletes the agent account with the specified ID.
 *
 * @route DELETE /agents/:id
 * @description Deletes the admin account with the specified ID.
 * @access Super Admin only
 * @middleware auth, checkSuperAdminRole
 *
 * @param  id - The ID of the admin account to delete
 */

router.delete('/agents/:id', [auth, checkSuperAdminRole], async (req, res) => {
  try {
    await Management.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Agent account deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;
