const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  meetingId: { type: String, required: true },
  name: { type: String, required: true }, // Change eventName to name
  senderEmail: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
