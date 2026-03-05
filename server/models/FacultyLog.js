const mongoose = require('mongoose');

const FacultyLogSchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
  },
  wifiName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('FacultyLog', FacultyLogSchema);
