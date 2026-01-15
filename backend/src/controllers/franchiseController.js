const FranchiseEnquiry = require('../models/FranchiseEnquiry');

const submitEnquiry = async (req, res) => {
  const { fullName, phone, email, city, investmentRange, message } = req.body || {};
  
  if (!fullName || !phone || !city) {
    return res.status(400).json({ 
      message: 'fullName, phone, and city are required' 
    });
  }
  
  try {
    await FranchiseEnquiry.create({
      fullName,
      phone,
      email: email || '',
      city,
      investmentRange: investmentRange || '',
      message: message || '',
      status: 'NEW',
    });
    res.status(201).json({ message: 'We\'ll contact you soon.' });
  } catch (err) {
    console.error('Submit enquiry error:', err);
    res.status(500).json({ message: 'Could not submit enquiry' });
  }
};

// GET /admin/franchise/enquiries - get all franchise enquiries
const getEnquiries = async (_req, res) => {
  try {
    const enquiries = await FranchiseEnquiry.find()
      .sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('Get franchise enquiries error:', err);
    res.status(500).json({ message: 'Failed to fetch franchise enquiries' });
  }
};

// PATCH /admin/franchise/enquiries/:id/status - update enquiry status
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'id and status are required' });
    }

    if (!['NEW', 'CONTACTED'].includes(status)) {
      return res.status(400).json({ message: 'status must be NEW or CONTACTED' });
    }

    const enquiry = await FranchiseEnquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (err) {
    console.error('Update enquiry status error:', err);
    res.status(500).json({ message: 'Failed to update enquiry status' });
  }
};

module.exports = { submitEnquiry, getEnquiries, updateEnquiryStatus };









