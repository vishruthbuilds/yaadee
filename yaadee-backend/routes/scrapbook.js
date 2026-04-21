const express = require('express');
const multer = require('multer');
const path = require('path');
const { getScrapbook, updateScrapbook } = require('../controllers/scrapbookController');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/:userId', getScrapbook);
router.post('/:userId', upload.array('photos', 10), updateScrapbook); // Allow up to 10 photos

module.exports = router;
