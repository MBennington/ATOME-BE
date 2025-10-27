const express = require('express');
const router = express.Router();
const { createTunnel, getTunnelStatus, closeTunnel } = require('../controllers/tunnelController');

// Create tunnel
router.post('/', createTunnel);

// Get tunnel status
router.get('/status', getTunnelStatus);

// Close tunnel
router.delete('/:port', closeTunnel);

module.exports = router;
