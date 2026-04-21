const express = require('express');
const multer = require('multer');
const path = require('path');
const { getConfig, updateConfig } = require('../controllers/configController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/', getConfig);
router.post('/', upload.single('logo'), updateConfig);

module.exports = router;
