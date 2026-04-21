const express = require('express');
const cors = require('cors');
const path = require('path');

const configRoutes = require('./routes/config');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const scrapbookRoutes = require('./routes/scrapbook');
const opinionRoutes = require('./routes/opinions');
const anonymousRoutes = require('./routes/anonymous');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/scrapbook', scrapbookRoutes);
app.use('/api/opinions', opinionRoutes);
app.use('/api/anonymous', anonymousRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Yaadee Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
