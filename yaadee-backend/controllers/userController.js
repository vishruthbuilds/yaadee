const { readData, writeData } = require('../utils/fileOps');

const getUsers = (req, res) => {
    const users = readData('users.json', []);
    users.sort((a, b) => a.name.localeCompare(b.name));
    res.json(users);
};

const addOrUpdateUser = (req, res) => {
    const users = readData('users.json', []);
    const { id, name, quote } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ message: 'ID and Name are required' });
    }

    let photoUrl = req.body.photoUrl; // Allow passing URL directly
    if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
    }

    const userIndex = users.findIndex(u => u.id === id);
    const userData = {
        id,
        name,
        quote: quote || '',
        photoUrl: photoUrl || (userIndex >= 0 ? users[userIndex].photoUrl : '')
    };

    if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], ...userData };
    } else {
        users.push(userData);
    }

    const success = writeData('users.json', users);
    if (success) {
        res.json({ message: 'User added/updated successfully', user: userData });
    } else {
        res.status(500).json({ message: 'Failed to save user' });
    }
};

module.exports = { getUsers, addOrUpdateUser };
