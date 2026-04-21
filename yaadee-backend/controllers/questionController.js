const { readData, writeData } = require('../utils/fileOps');
const { v4: uuidv4 } = require('crypto'); // We can use crypto.randomUUID()

const getQuestions = (req, res) => {
    const questions = readData('questions.json', []);
    res.json(questions);
};

const addOrUpdateQuestion = (req, res) => {
    const questions = readData('questions.json', []);
    const { id, text, options, correctAnswer } = req.body;
    
    if (!text || !options || !correctAnswer) {
        return res.status(400).json({ message: 'Text, options, and correctAnswer are required' });
    }

    const questionId = id || require('crypto').randomUUID();
    const questionData = {
        id: questionId,
        text,
        options, // Array of strings
        correctAnswer
    };

    const qIndex = questions.findIndex(q => q.id === questionId);
    if (qIndex >= 0) {
        questions[qIndex] = questionData;
    } else {
        questions.push(questionData);
    }

    const success = writeData('questions.json', questions);
    if (success) {
        res.json({ message: 'Question saved successfully', question: questionData });
    } else {
        res.status(500).json({ message: 'Failed to save question' });
    }
};

module.exports = { getQuestions, addOrUpdateQuestion };
