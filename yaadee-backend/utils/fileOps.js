const fs = require('fs');
const path = require('path');

const readData = (filename, defaultValue) => {
    const filePath = path.join(__dirname, '../data', filename);
    try {
        if (!fs.existsSync(filePath)) {
            // Return default value if file doesn't exist
            return defaultValue;
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return defaultValue;
    }
};

const writeData = (filename, data) => {
    const filePath = path.join(__dirname, '../data', filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
};

module.exports = { readData, writeData };
