const express = require('express');
const { getOpinions, addOpinion } = require('../controllers/opinionController');

const router = express.Router();

router.get('/', getOpinions);
router.post('/', addOpinion);

module.exports = router;
