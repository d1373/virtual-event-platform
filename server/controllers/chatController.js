const ChatMessage = require('../models/chatMessage');

exports.addChatMessage = async (req, res) => {
  const { meetingId, name, senderEmail, message } = req.body;
  if (!meetingId || !name || !senderEmail || !message) {
    return res.status(400).json({ msg: 'All fields are required' });
  }
  try {
    const chatMessage = new ChatMessage({ meetingId, name, senderEmail, message, timestamp: new Date() });
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.viewChatMessage = async (req, res) => {
  const { meetingId, name } = req.body;

  console.log('Received viewChatMessages request:', { meetingId, name });

  if (!meetingId || !name) {
    return res.status(400).json({ error: 'Meeting ID and name are required' });
  }

  try {
    const messages = await ChatMessage.find({ meetingId, name }).sort('timestamp');
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.viewpdfChatMessage = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Event name is required' });
  }

  try {
    const messages = await ChatMessage.find({ name }).sort('timestamp');
    const groupedMessages = messages.reduce((acc, message) => {
      if (!acc[message.meetingId]) {
        acc[message.meetingId] = [];
      }
      acc[message.meetingId].push(message);
      return acc;
    }, {});

    res.status(200).json(Object.entries(groupedMessages).map(([meetingId, messages]) => ({ meetingId, messages })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
