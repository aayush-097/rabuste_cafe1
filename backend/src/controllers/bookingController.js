const ArtBooking = require('../models/ArtBooking');
const Art = require('../models/Art');

// POST /art/book - create booking request
const createBooking = async (req, res) => {
  try {
    const { artId, artName, userName, phone, email, message } = req.body;

    if (!artId || !artName || !userName || !phone) {
      return res.status(400).json({ 
        message: 'artId, artName, userName, and phone are required' 
      });
    }

    // Verify art exists
    const art = await Art.findById(artId);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    // Check if art is available
    if (art.availability === 'sold') {
      return res.status(400).json({ message: 'This art piece is already sold' });
    }

    const booking = await ArtBooking.create({
      artId,
      artName,
      userName,
      phone,
      email: email || '',
      message: message || '',
      status: 'PENDING',
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Failed to create booking request' });
  }
};

// GET /admin/art/bookings - get all bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await ArtBooking.find()
      .sort({ createdAt: -1 })
      .populate('artId', 'title artistName price imageUrl availability');
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// PATCH /admin/art/bookings/:id/accept - accept booking
const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await ArtBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if art is still available
    const art = await Art.findById(booking.artId);
    if (!art) {
      return res.status(404).json({ message: 'Art piece not found' });
    }

    if (art.availability === 'sold') {
      return res.status(400).json({ message: 'Cannot accept booking for sold art piece' });
    }

    // Update booking status
    booking.status = 'ACCEPTED';
    await booking.save();

    // Update art availability to reserved
    await Art.findByIdAndUpdate(booking.artId, {
      availability: 'reserved',
    });

    const updatedBooking = await ArtBooking.findById(id)
      .populate('artId', 'title artistName price imageUrl availability');

    res.json(updatedBooking);
  } catch (err) {
    console.error('Accept booking error:', err);
    res.status(500).json({ message: 'Failed to accept booking' });
  }
};

// PATCH /admin/art/bookings/:id/reject - reject booking
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await ArtBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status
    booking.status = 'REJECTED';
    await booking.save();

    // Ensure art is available (only if it was reserved by this booking)
    const art = await Art.findById(booking.artId);
    if (art && art.availability === 'reserved') {
      // Check if there are other accepted bookings for this art
      const otherAccepted = await ArtBooking.findOne({
        artId: booking.artId,
        status: 'ACCEPTED',
        _id: { $ne: id },
      });

      // Only set to available if no other accepted bookings exist
      if (!otherAccepted) {
        await Art.findByIdAndUpdate(booking.artId, {
          availability: 'available',
        });
      }
    }

    const updatedBooking = await ArtBooking.findById(id)
      .populate('artId', 'title artistName price imageUrl availability');

    res.json(updatedBooking);
  } catch (err) {
    console.error('Reject booking error:', err);
    res.status(500).json({ message: 'Failed to reject booking' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  acceptBooking,
  rejectBooking,
};
