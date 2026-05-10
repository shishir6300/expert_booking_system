const Expert = require('../models/Expert');

// GET /experts — with pagination, search, filter
exports.getExperts = async (req, res, next) => {
  try {
    const { page = 1, limit = 6, category, search } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query, '-slots') // exclude slots for listing
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: experts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /experts/:id — with full slot info
exports.getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });
    res.json({ success: true, data: expert });
  } catch (err) {
    next(err);
  }
};
