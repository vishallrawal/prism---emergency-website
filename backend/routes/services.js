const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    const services = await db.collection('nearby_services').find(filter).toArray();
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch services.' });
  }
});
router.get('/counts', async (req, res) => {
  try {
    const db = getDB();
    const pipeline = [
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ];
    const counts = await db.collection('nearby_services').aggregate(pipeline).toArray();
    const result = {};
    counts.forEach(c => { result[c._id] = c.count; });
    res.json({ counts: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get counts.' });
  }
});

module.exports = router;
