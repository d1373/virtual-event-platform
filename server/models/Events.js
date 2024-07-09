const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Note: `time` is stored as a string
  name: { type: String, required: true },
  people: { type: String },
  description: { type: String }
});

EventSchema.index({ email: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Event', EventSchema);
