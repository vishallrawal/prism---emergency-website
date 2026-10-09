const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDB } = require('../db');
const { verifySession } = require('../middleware/auth');
const { ObjectId } = require('mongodb');
router.post('/register', async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  const username = req.body.username || (email ? email.split('@')[0] : '');

  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const db = getDB();
    const users = db.collection('users');

    const existing = await users.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(409).json({ message: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'user';

    const newUser = {
      fullName,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      role,
      bloodGroup: 'O+',
      phone: '',
      address: 'Surat, Gujarat',
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);

    res.status(201).json({
      message: 'Registration successful! Please login.',
      userId: result.insertedId
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const db = getDB();
    const users = db.collection('users');

    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    res.json({
      message: 'Login successful.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        bloodGroup: user.bloodGroup || 'O+',
        phone: user.phone || '',
        address: user.address || 'Surat, Gujarat',
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});
router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Unable to log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful.' });
  });
});
router.get('/me', verifySession, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });
    const donorRecord = await db.collection('blood_donors').findOne({
      $or: [{ phone: user.phone }, { name: user.fullName }]
    });
    const bloodRequests = await db.collection('blood_requests').find({
      $or: [{ contactNumber: user.phone }, { patientName: { $regex: user.fullName, $options: 'i' } }]
    }).toArray();

    res.json({ user, donorRecord, bloodRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});
router.put('/profile', verifySession, async (req, res) => {
  const { fullName, phone, address, bloodGroup } = req.body;

  try {
    const db = getDB();

    const updateFields = {
      fullName,
      phone,
      bloodGroup,
      address,
      updatedAt: new Date()
    };

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.userId) },
      { $set: updateFields }
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

module.exports = router;
