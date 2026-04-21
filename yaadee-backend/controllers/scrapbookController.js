const { readData, writeData } = require('../utils/fileOps');

const getScrapbook = (req, res) => {
    const { userId } = req.params;
    const scrapbooks = readData('scrapbook.json', []);
    const userScrapbook = scrapbooks.find(s => s.userId === userId) || { userId, photos: [], messages: [] };
    res.json(userScrapbook);
};

const updateScrapbook = (req, res) => {
    const { userId } = req.params;
    const scrapbooks = readData('scrapbook.json', []);
    
    let userIndex = scrapbooks.findIndex(s => s.userId === userId);
    let userScrapbook = userIndex >= 0 ? scrapbooks[userIndex] : { userId, photos: [], messages: [] };

    // If new photos were uploaded
    if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
        userScrapbook.photos = [...userScrapbook.photos, ...newPhotos];
    } else if (req.body.photoUrl) {
        userScrapbook.photos.push(req.body.photoUrl);
    }

    // If a message was added
    if (req.body.message) {
        userScrapbook.messages.push({
            id: require('crypto').randomUUID(),
            text: req.body.message,
            from: req.body.from || 'Anonymous',
            timestamp: new Date().toISOString()
        });
    }

    if (userIndex >= 0) {
        scrapbooks[userIndex] = userScrapbook;
    } else {
        scrapbooks.push(userScrapbook);
    }

    const success = writeData('scrapbook.json', scrapbooks);
    if (success) {
        res.json({ message: 'Scrapbook updated successfully', scrapbook: userScrapbook });
    } else {
        res.status(500).json({ message: 'Failed to update scrapbook' });
    }
};

module.exports = { getScrapbook, updateScrapbook };
