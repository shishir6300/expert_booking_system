const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:MM
  isBooked: { type: Boolean, default: false }
});

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Design', 'Education', 'Business']
  },
  experience: { type: Number, required: true }, // years
  rating: { type: Number, required: true, min: 1, max: 5 },
  bio: { type: String, required: true },
  avatar: { type: String, default: '' },
  slots: [slotSchema]
}, { timestamps: true });

// Index for search
expertSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Expert', expertSchema);
