const { readData, writeData } = require('../utils/fileOps');

const getOpinions = (req, res) => {
    const opinions = readData('opinions.json', []);
    res.json(opinions);
};

const addOpinion = (req, res) => {
    const opinions = readData('opinions.json', []);
    const { text, authorName } = req.body;
    
    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    const newOpinion = {
        id: require('crypto').randomUUID(),
        text,
        authorName: authorName || 'Anonymous',
        timestamp: new Date().toISOString()
    };

    opinions.push(newOpinion);

    const success = writeData('opinions.json', opinions);
    if (success) {
        res.json({ message: 'Opinion added successfully', opinion: newOpinion });
    } else {
        res.status(500).json({ message: 'Failed to save opinion' });
    }
};

module.exports = { getOpinions, addOpinion };
