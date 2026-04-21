const express = require('express');
const { getAnonymous, addAnonymous } = require('../controllers/anonymousController');

const router = express.Router();

router.get('/', getAnonymous);
router.post('/', addAnonymous);

module.exports = router;
