const mongoose = require('mongoose');

const accessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'user_id must required'],
  },
  access: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('Access', accessSchema);
