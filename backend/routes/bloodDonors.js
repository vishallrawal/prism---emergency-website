const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { bloodGroup } = req.query;
    const filter = {};
    if (bloodGroup && bloodGroup !== 'ALL') {
      filter.bloodGroup = bloodGroup;
    }
    const donors = await db.collection('blood_donors').find(filter).toArray();
    res.json({ donors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch blood donors.' });
  }
});
router.post('/request', async (req, res) => {
  const { patientName, bloodGroup, hospitalLocation, contactNumber } = req.body;

  if (!patientName || !bloodGroup || !hospitalLocation || !contactNumber) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const db = getDB();
    const newRequest = {
      name: `${patientName} (Urgent Patient)`,
      bloodGroup,
      location: hospitalLocation,
      phone: contactNumber,
      distance: hospitalLocation,
      isAvailable: true,
      isUrgent: true,
      createdAt: new Date()
    };

    await db.collection('blood_requests').insertOne(newRequest);
    await db.collection('emergency_logs').insertOne({
      type: 'BLOOD_REQUEST',
      message: `Emergency blood request: ${bloodGroup} needed at ${hospitalLocation}`,
      patientName,
      contactNumber,
      timestamp: new Date()
    });

    res.status(201).json({ message: 'Blood request dispatched to all nearby donors!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit blood request.' });
  }
});
router.get('/requests', async (req, res) => {
  try {
    const db = getDB();
    const requests = await db.collection('blood_requests').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blood requests.' });
  }
});

module.exports = router;
