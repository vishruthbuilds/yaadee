const { readData, writeData } = require('../utils/fileOps');

const getConfig = (req, res) => {
    const config = readData('config.json', { eventName: 'Farewell', logoUrl: '' });
    res.json(config);
};

const updateConfig = (req, res) => {
    const config = readData('config.json', { eventName: 'Farewell', logoUrl: '' });
    
    if (req.body.eventName) {
        config.eventName = req.body.eventName;
    }
    
    if (req.file) {
        config.logoUrl = `/uploads/${req.file.filename}`;
    }

    const success = writeData('config.json', config);
    if (success) {
        res.json({ message: 'Configuration updated successfully', config });
    } else {
        res.status(500).json({ message: 'Failed to update configuration' });
    }
};

module.exports = { getConfig, updateConfig };
