const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const MenuImage = require('../models/MenuImage');
const Workshop = require('../models/Workshop');
const Art = require('../models/Art');
const { getBookings, acceptBooking, rejectBooking } = require('../controllers/bookingController');
const { getWorkshopRegistrations } = require('../controllers/workshopController');
const { getEnquiries, updateEnquiryStatus } = require('../controllers/franchiseController');

const router = express.Router();

// All admin routes require authenticated admin
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/menu - get all menu images
router.get('/menu', async (req, res) => {
  try {
    const images = await MenuImage.find().sort({ category: 1, createdAt: 1 });
    res.json(images);
  } catch (err) {
    console.error('Admin get menu images error:', err);
    res.status(500).json({ message: 'Failed to fetch menu images' });
  }
});

// GET /api/admin/workshops - get all workshops
router.get('/workshops', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: 1 });
    res.json(workshops);
  } catch (err) {
    console.error('Admin get workshops error:', err);
    res.status(500).json({ message: 'Failed to fetch workshops' });
  }
});

// GET /api/admin/art - get all art listings
router.get('/art', async (req, res) => {
  try {
    const art = await Art.find().sort({ createdAt: -1 });
    res.json(art);
  } catch (err) {
    console.error('Admin get art error:', err);
    res.status(500).json({ message: 'Failed to fetch art listings' });
  }
});

// POST /api/admin/menu - add menu image
router.post('/menu', async (req, res) => {
  try {
    const { category, url, public_id } = req.body || {};
    if (!category || !url || !public_id) {
      return res.status(400).json({ message: 'category, url, and public_id are required' });
    }
    const created = await MenuImage.create({ category, url, public_id });
    res.status(201).json(created);
  } catch (err) {
    console.error('Admin create menu image error:', err);
    res.status(500).json({ message: 'Failed to create menu image' });
  }
});

// POST /api/admin/workshops - add workshop
router.post('/workshops', async (req, res) => {
  try {
    const { title, description, date, totalSeats, tags } = req.body || {};
    if (!title || !description || !date || !totalSeats) {
      return res
        .status(400)
        .json({ message: 'title, description, date, and totalSeats are required' });
    }
    const created = await Workshop.create({
      title,
      description,
      date,
      totalSeats,
      tags: tags || [],
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Admin create workshop error:', err);
    res.status(500).json({ message: 'Failed to create workshop' });
  }
});

// POST /api/admin/art - add art listing
router.post('/art', async (req, res) => {
  try {
    const { title, artistName, description, price, imageUrl, availability, moodTags } =
      req.body || {};
    if (!title || !artistName || !description || !price || !imageUrl) {
      return res
        .status(400)
        .json({ message: 'title, artistName, description, price, and imageUrl are required' });
    }
    const created = await Art.create({
      title,
      artistName,
      description,
      price,
      imageUrl,
      availability: availability || 'available',
      moodTags: moodTags || [],
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Admin create art error:', err);
    res.status(500).json({ message: 'Failed to create art listing' });
  }
});

// PUT /api/admin/menu/:id - update menu image
router.put('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, url, public_id } = req.body || {};
    
    if (!id) {
      return res.status(400).json({ message: 'Menu ID is required' });
    }
    
    const updated = await MenuImage.findByIdAndUpdate(
      id,
      { category, url, public_id },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Menu image not found' });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Admin update menu image error:', err);
    res.status(500).json({ message: 'Failed to update menu image' });
  }
});

// DELETE /api/admin/menu/:id - delete menu image
router.delete('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Menu ID is required' });
    }
    
    const deleted = await MenuImage.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Menu image not found' });
    }
    
    res.json({ message: 'Menu image deleted successfully' });
  } catch (err) {
    console.error('Admin delete menu image error:', err);
    res.status(500).json({ message: 'Failed to delete menu image' });
  }
});

// PUT /api/admin/workshops/:id - update workshop
router.put('/workshops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, totalSeats, tags } = req.body || {};
    
    if (!id) {
      return res.status(400).json({ message: 'Workshop ID is required' });
    }
    
    const updated = await Workshop.findByIdAndUpdate(
      id,
      { title, description, date, totalSeats, tags: tags || [] },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Admin update workshop error:', err);
    res.status(500).json({ message: 'Failed to update workshop' });
  }
});

// DELETE /api/admin/workshops/:id - delete workshop
router.delete('/workshops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Workshop ID is required' });
    }
    
    const deleted = await Workshop.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json({ message: 'Workshop deleted successfully' });
  } catch (err) {
    console.error('Admin delete workshop error:', err);
    res.status(500).json({ message: 'Failed to delete workshop' });
  }
});

// GET /api/admin/workshops/registrations - get all workshop registrations
router.get('/workshops/registrations', getWorkshopRegistrations);

// PUT /api/admin/art/:id - update art listing
router.put('/art/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artistName, description, price, imageUrl, availability, moodTags } =
      req.body || {};
    
    if (!id) {
      return res.status(400).json({ message: 'Art ID is required' });
    }
    
    const updated = await Art.findByIdAndUpdate(
      id,
      {
        title,
        artistName,
        description,
        price,
        imageUrl,
        availability: availability || 'available',
        moodTags: moodTags || [],
      },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Art listing not found' });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Admin update art error:', err);
    res.status(500).json({ message: 'Failed to update art listing' });
  }
});

// DELETE /api/admin/art/:id - delete art listing
router.delete('/art/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Art ID is required' });
    }
    
    const deleted = await Art.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Art listing not found' });
    }
    
    res.json({ message: 'Art listing deleted successfully' });
  } catch (err) {
    console.error('Admin delete art error:', err);
    res.status(500).json({ message: 'Failed to delete art listing' });
  }
});

// GET /api/admin/art/bookings - get all art bookings
router.get('/art/bookings', getBookings);

// PATCH /api/admin/art/bookings/:id/accept - accept booking
router.patch('/art/bookings/:id/accept', acceptBooking);

// PATCH /api/admin/art/bookings/:id/reject - reject booking
router.patch('/art/bookings/:id/reject', rejectBooking);

// GET /api/admin/franchise/enquiries - get all franchise enquiries
router.get('/franchise/enquiries', getEnquiries);

// PATCH /api/admin/franchise/enquiries/:id/status - update enquiry status
router.patch('/franchise/enquiries/:id/status', updateEnquiryStatus);

module.exports = router;


