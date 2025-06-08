const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../models/db');

// Tambah ke favorit
router.post('/:recipeId', verifyToken, (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.recipeId;

  const sql = 'INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)';
  db.query(sql, [userId, recipeId], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menambahkan ke favorit' });
    res.json({ message: 'Resep ditambahkan ke favorit' });
  });
});

// Ambil semua favorit user
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT r.* FROM recipes r
    JOIN favorites f ON r.id = f.recipe_id
    WHERE f.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil favorit' });
    res.json(results);
  });
});

// Hapus dari favorit
router.delete('/:recipeId', verifyToken, (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.recipeId;

  const sql = 'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?';
  db.query(sql, [userId, recipeId], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus favorit' });
    res.json({ message: 'Resep dihapus dari favorit' });
  });
});

module.exports = router;
