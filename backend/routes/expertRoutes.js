const express = require('express');
const router = express.Router();
const { getExperts, getExpertById } = require('../controllers/expertController');

router.get('/', getExperts);
router.get('/:id', getExpertById);

module.exports = router;
