const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/add', chatController.addChatMessage);
router.post('/view', chatController.viewChatMessage);
router.post('/viewpdf', chatController.viewpdfChatMessage);

module.exports = router;
