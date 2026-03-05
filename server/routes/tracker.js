const express = require('express');
const router = express.Router();
const FacultyLog = require('../models/FacultyLog');

// In-memory cache for GET /location/latest (invalidated on every POST)
let cache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 3000; // 3 seconds — matches frontend polling interval

// @route   POST /api/location
// @desc    Receive location info from ESP32
router.post('/location', async (req, res) => {
  try {
    const { facultyId, wifiName } = req.body;
    if (!facultyId || !wifiName) {
      return res.status(400).json({ error: 'Please provide facultyId and wifiName' });
    }

    // Fire-and-forget insert (no await on save to respond fast to ESP32)
    const newLog = new FacultyLog({ facultyId, wifiName });
    newLog.save().catch(err => console.error('Save error:', err.message));

    // Bust cache so next GET returns fresh data immediately
    cache = null;

    console.log(`[ESP32] ${facultyId} → ${wifiName}`);
    res.status(201).json({ ok: true, facultyId, wifiName });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/location/latest
// @desc    Get the latest WiFi for every faculty — served from cache when fresh
router.get('/location/latest', async (req, res) => {
  try {
    const now = Date.now();

    // Serve from cache if still fresh
    if (cache && now - cacheTime < CACHE_TTL_MS) {
      return res.json(cache);
    }

    // Uses the compound index {facultyId:1, timestamp:-1} → fast index scan
    const latestLocations = await FacultyLog.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$facultyId',
          wifiName: { $first: '$wifiName' },
          timestamp: { $first: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          facultyId: '$_id',
          wifiName: 1,
          timestamp: 1,
        },
      },
    ]).allowDiskUse(false); // keep it in RAM

    cache = latestLocations;
    cacheTime = now;

    // Set cache headers so browsers/CDNs stay fresh
    res.set('Cache-Control', 'public, max-age=3');
    res.json(latestLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/location/history/:facultyId
router.get('/location/history/:facultyId', async (req, res) => {
  try {
    const history = await FacultyLog
      .find({ facultyId: req.params.facultyId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean(); // plain JS objects — faster than Mongoose docs
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
