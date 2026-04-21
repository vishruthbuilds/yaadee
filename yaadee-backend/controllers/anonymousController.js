const { readData, writeData } = require('../utils/fileOps');

const getAnonymous = (req, res) => {
    const anonymousMessages = readData('anonymous.json', []);
    res.json(anonymousMessages);
};

const addAnonymous = (req, res) => {
    const anonymousMessages = readData('anonymous.json', []);
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    const newMessage = {
        id: require('crypto').randomUUID(),
        text,
        timestamp: new Date().toISOString()
    };

    anonymousMessages.push(newMessage);

    const success = writeData('anonymous.json', anonymousMessages);
    if (success) {
        res.json({ message: 'Anonymous message added successfully', anonymous: newMessage });
    } else {
        res.status(500).json({ message: 'Failed to save message' });
    }
};

module.exports = { getAnonymous, addAnonymous };
