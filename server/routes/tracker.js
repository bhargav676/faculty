const express = require('express');
const router = express.Router();
const FacultyLog = require('../models/FacultyLog');

// @route   POST /api/location
// @desc    Receive location info from ESP32
router.post('/location', async (req, res) => {
  try {
    const { facultyId, wifiName } = req.body;

    if (!facultyId || !wifiName) {
      return res.status(400).json({ error: 'Please provide facultyId and wifiName' });
    }

    const newLog = new FacultyLog({
      facultyId,
      wifiName
    });

    const savedLog = await newLog.save();
    console.log(`[Location Update] Faculty: ${facultyId} | WiFi: ${wifiName}`);
    
    res.status(201).json(savedLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/location/latest
// @desc    Get the latest location for all active faculties
router.get('/location/latest', async (req, res) => {
  try {
    // Standard aggregation to get the latest record for each faculty
    const latestLocations = await FacultyLog.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$facultyId",
          wifiName: { $first: "$wifiName" },
          timestamp: { $first: "$timestamp" }
        }
      },
      {
        $project: {
          facultyId: "$_id",
          wifiName: 1,
          timestamp: 1,
          _id: 0
        }
      }
    ]);

    res.json(latestLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/location/history/:facultyId
// @desc    Get history for a specific faculty (Optional, but good to have)
router.get('/location/history/:facultyId', async (req, res) => {
    try {
        const history = await FacultyLog.find({ facultyId: req.params.facultyId })
                                        .sort({ timestamp: -1 })
                                        .limit(50); // Get last 50 updates
        res.json(history);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
