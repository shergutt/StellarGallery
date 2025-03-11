// routes/auth.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database');

const router = express.Router();

const CLIENT_ID = '275691990703-t1aahrbh9hf006vld62htcvfq8bps0da.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    const sql = `
      INSERT INTO users (google_id, email, name, picture)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(google_id) DO UPDATE SET 
        email=excluded.email,
        name=excluded.name,
        picture=excluded.picture,
        updated_at=CURRENT_TIMESTAMP
    `;
    
    db.run(sql, [googleId, email, name, picture], function(err) {
      if (err) {
        console.error("Error inserting/updating user:", err.message);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      req.session.user = {
        email,
        name,
        picture,
        loggedInAt: new Date(),
      };

      res.status(200).json({ success: true, user: payload });
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

router.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
