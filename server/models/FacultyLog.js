const mongoose = require('mongoose');

const FacultyLogSchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    index: true,          // Fast lookup by facultyId
  },
  wifiName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,          // Fast sort by time
  }
});

// Compound index: allows the aggregation pipeline ($sort by timestamp, $group by facultyId)
// to be a covered query — the most expensive part becomes an index scan
FacultyLogSchema.index({ facultyId: 1, timestamp: -1 });

module.exports = mongoose.model('FacultyLog', FacultyLogSchema);
