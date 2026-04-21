const express = require('express');
const { getQuestions, addOrUpdateQuestion } = require('../controllers/questionController');

const router = express.Router();

router.get('/', getQuestions);
router.post('/', addOrUpdateQuestion);

module.exports = router;
