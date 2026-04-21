const express = require('express');
const multer = require('multer');
const path = require('path');
const { getUsers, addOrUpdateUser } = require('../controllers/userController');

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

router.get('/', getUsers);
router.post('/', upload.single('photo'), addOrUpdateUser);

module.exports = router;
