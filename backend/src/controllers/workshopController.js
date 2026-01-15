const Workshop = require('../models/Workshop');
const WorkshopRegistration = require('../models/WorkshopRegistration');

const getWorkshops = async (_req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: 1 });
    res.json(
      workshops.map((w) => ({
        ...w.toObject(),
        seatsLeft: Math.max(w.totalSeats - w.registeredCount, 0),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Failed to load workshops' });
  }
};

const registerWorkshop = async (req, res) => {
  const { workshopId, workshopTitle, name, phone, email } = req.body || {};
  
  if (!workshopId || !workshopTitle || !name || !phone) {
    return res.status(400).json({ 
      message: 'workshopId, workshopTitle, name, and phone are required' 
    });
  }
  
  try {
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const seatsLeft = workshop.totalSeats - workshop.registeredCount;
    if (seatsLeft <= 0) {
      return res.status(400).json({ message: 'No seats left' });
    }

    // Save registration to WorkshopRegistration collection
    await WorkshopRegistration.create({
      workshopId,
      workshopTitle,
      name,
      phone,
      email: email || '',
      status: 'CONFIRMED',
    });

    // Increment registered count on workshop
    workshop.registeredCount += 1;
    await workshop.save();

    res.json({
      message: 'Registration confirmed',
      seatsLeft: workshop.totalSeats - workshop.registeredCount,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// GET /admin/workshops/registrations - get all workshop registrations
const getWorkshopRegistrations = async (_req, res) => {
  try {
    const registrations = await WorkshopRegistration.find()
      .sort({ createdAt: -1 })
      .populate('workshopId', 'title description date totalSeats');
    res.json(registrations);
  } catch (err) {
    console.error('Get workshop registrations error:', err);
    res.status(500).json({ message: 'Failed to fetch workshop registrations' });
  }
};

module.exports = { getWorkshops, registerWorkshop, getWorkshopRegistrations };









