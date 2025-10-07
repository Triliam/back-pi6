const express = require('express');
const router = express.Router();
const db = require('../db/db');
const httpStatus = require('../constants/httpStatusesCodes');
const { getTicketsOfAssociate } = require('../models/tickets');

// Get all users
router.get('/', async (req, res) => {
  const [users] = await db.query('SELECT * FROM users');
  res.json(users);
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'User Not Found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
});

// get tickets of user
router.get('/:id/tickets', async (req, res) => {
  try {
    const tickets = await getTicketsOfAssociate(req.params.id);
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
