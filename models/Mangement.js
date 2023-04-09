const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ManagementSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  managementType: {
    type: String,
    enum: ['Customer', 'Admin', 'Agent', 'Super Admin'],
    required: true,
  },
  permissions: {
    type: [String], // array of permissions associated with this user
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Management = mongoose.model('management', ManagementSchema);
