const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDB } = require('../db');
const { verifyAdmin } = require('../middleware/auth');
const { ObjectId } = require('mongodb');
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = getDB();
    const users = db.collection('users');
    const user = await users.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials. Account not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    req.session.userId = user._id.toString();
    req.session.role = 'admin';

    res.json({
      message: 'Admin login successful.',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
});
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const totalUsers = await db.collection('users').countDocuments({ role: 'user' });
    const totalAdmins = await db.collection('users').countDocuments({ role: 'admin' });
    const totalDonors = await db.collection('blood_donors').countDocuments({});
    const totalServices = await db.collection('nearby_services').countDocuments({});
    const totalRequests = await db.collection('blood_requests').countDocuments({});
    const totalLogs = await db.collection('emergency_logs').countDocuments({});

    res.json({ stats: { totalUsers, totalAdmins, totalDonors, totalServices, totalRequests, totalLogs } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find(
      {},
      { projection: { password: 0 } }
    ).sort({ createdAt: -1 }).toArray();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const {
      fullName,
      username,
      email,
      password,
      role,
      bloodGroup,
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (username && username.toLowerCase() !== user.username) {
      const existingUser = await db.collection('users').findOne({
        _id: { $ne: new ObjectId(id) },
        username: username.toLowerCase().trim()
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken by another account.' });
      }
    }
    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await db.collection('users').findOne({
        _id: { $ne: new ObjectId(id) },
        email: email.toLowerCase().trim()
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email address is already registered to another account.' });
      }
    }

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (username !== undefined) updateFields.username = username.toLowerCase().trim();
    if (email !== undefined) updateFields.email = email.toLowerCase().trim();
    if (role !== undefined) updateFields.role = role;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (emergencyContactName !== undefined) updateFields.emergencyContactName = emergencyContactName.trim();
    if (emergencyContactPhone !== undefined) updateFields.emergencyContactPhone = emergencyContactPhone.trim();
    if (password && password.trim().length > 0) {
      updateFields.password = await bcrypt.hash(password.trim(), 10);
    }

    updateFields.updatedAt = new Date();

    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.json({
      message: 'User updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ message: 'Failed to update user details.' });
  }
});
router.get('/donors', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const donors = await db.collection('blood_donors').find({}).toArray();
    res.json({ donors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donors.' });
  }
});
router.post('/donors', verifyAdmin, async (req, res) => {
  const { name, bloodGroup, phone, location, distance } = req.body;
  try {
    const db = getDB();
    await db.collection('blood_donors').insertOne({
      name, bloodGroup, phone, location, distance: distance || '0 km',
      isAvailable: true, createdAt: new Date()
    });
    res.status(201).json({ message: 'Donor added.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add donor.' });
  }
});
router.delete('/donors/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    await db.collection('blood_donors').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Donor deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete donor.' });
  }
});
router.get('/logs', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const logs = await db.collection('emergency_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs.' });
  }
});
router.get('/services', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const services = await db.collection('nearby_services').find({}).toArray();
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services.' });
  }
});
router.post('/services', verifyAdmin, async (req, res) => {
  const { name, category, address, phone, rating, lat, lng } = req.body;
  try {
    const db = getDB();
    await db.collection('nearby_services').insertOne({
      name, category, address, phone: phone || '', rating: rating || '4.5',
      lat: lat || 21.1702, lng: lng || 72.8311, createdAt: new Date()
    });
    res.status(201).json({ message: 'Service added.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add service.' });
  }
});
router.delete('/services/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    await db.collection('nearby_services').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service.' });
  }
});

module.exports = router;
