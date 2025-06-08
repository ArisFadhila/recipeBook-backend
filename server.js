//const db = require('./models/db'); // Tambahkan ini di bagian atas server.js

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipeRoutes); // Router utama

app.use('/api/auth', authRoutes);

app.use('/api/favorites', favoriteRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


const PORT = process.env.PORT || 50883;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
