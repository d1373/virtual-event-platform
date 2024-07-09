const Event = require('../models/Events');

// Create an event
exports.create = async (req, res) => {
  const { email, date, time, name, people, description } = req.body;

  try {
    let event = new Event({ email, date, time, name, people, description });
    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// View events by email
exports.view = async (req, res) => {
  const { email } = req.body;

  try {
    let events = await Event.find({ email });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update an event by name and email
exports.update = async (req, res) => {
  const { email, name, date, time, people, description } = req.body;

  try {
    let event = await Event.findOne({ email, name });
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    event.date = date || event.date;
    event.time = time || event.time;
    event.people = people || event.people;
    event.description = description || event.description;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete an event by name and email

exports.delete = async (req, res) => {
  const { email, name } = req.body;

  try {
    const event = await Event.findOneAndDelete({ email, name });
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};