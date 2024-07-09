
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/create', eventController.create);
router.post('/view', eventController.view);
router.post('/update', eventController.update);
router.post('/delete', eventController.delete);

module.exports = router;