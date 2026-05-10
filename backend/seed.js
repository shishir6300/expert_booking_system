const mongoose = require('mongoose');
const Expert = require('./models/Expert');
require('dotenv').config();

const generateSlots = () => {
  const slots = [];
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d + 1);
    const dateStr = date.toISOString().split('T')[0];
    times.forEach(time => slots.push({ date: dateStr, time, isBooked: false }));
  }
  return slots;
};

const experts = [
  { name: 'Dr. Arjun Mehta', category: 'Technology', experience: 12, rating: 4.8, bio: 'AI/ML expert with 12 years at top tech companies. Specializes in deep learning and computer vision.', avatar: 'AM' },
  { name: 'Priya Sharma', category: 'Finance', experience: 8, rating: 4.6, bio: 'Certified financial planner helping individuals and businesses with investment strategies and portfolio management.', avatar: 'PS' },
  { name: 'Dr. Rahul Nair', category: 'Health', experience: 15, rating: 4.9, bio: 'General physician and wellness coach with expertise in preventive healthcare and lifestyle medicine.', avatar: 'RN' },
  { name: 'Adv. Kavita Reddy', category: 'Legal', experience: 10, rating: 4.7, bio: 'Corporate lawyer specializing in startup law, IP rights, and contract negotiations.', avatar: 'KR' },
  { name: 'Rohan Kapoor', category: 'Marketing', experience: 6, rating: 4.5, bio: 'Digital marketing strategist helping brands grow through SEO, social media, and performance marketing.', avatar: 'RK' },
  { name: 'Ananya Singh', category: 'Design', experience: 7, rating: 4.8, bio: 'UX/UI designer with experience at product companies, specializing in user research and design systems.', avatar: 'AS' },
  { name: 'Prof. Vijay Kumar', category: 'Education', experience: 20, rating: 4.9, bio: 'IIT professor and academic mentor helping students with career guidance and research opportunities.', avatar: 'VK' },
  { name: 'Meera Patel', category: 'Business', experience: 9, rating: 4.6, bio: 'Business strategist and startup mentor who has helped 50+ companies scale from seed to Series A.', avatar: 'MP' },
  { name: 'Suresh Iyer', category: 'Technology', experience: 11, rating: 4.7, bio: 'Full-stack architect specializing in cloud infrastructure, microservices, and DevOps best practices.', avatar: 'SI' },
  { name: 'Dr. Fatima Khan', category: 'Health', experience: 13, rating: 4.8, bio: 'Psychiatrist and mental health counselor with expertise in anxiety, depression, and stress management.', avatar: 'FK' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Expert.deleteMany({});
    const withSlots = experts.map(e => ({ ...e, slots: generateSlots() }));
    await Expert.insertMany(withSlots);
    console.log('✅ Seeded', withSlots.length, 'experts');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
