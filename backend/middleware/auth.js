const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

function verifySession(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  req.userId = req.session.userId;
  next();
}

async function verifyAdmin(req, res, next) {
  if (!req.session?.userId || req.session.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  try {
    const user = await getDB().collection('users').findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { password: 0 } }
    );

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    req.userId = req.session.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin session verification error:', error);
    res.status(500).json({ message: 'Unable to verify admin session.' });
  }
}

module.exports = { verifySession, verifyAdmin };
