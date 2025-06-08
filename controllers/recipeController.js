const db = require('../models/db');
const fs = require('fs');
const path = require('path');

// GET all recipes
exports.getAllRecipes = (req, res) => {
  let sql = 'SELECT * FROM recipes';
  const { category, search } = req.query;

  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(title LIKE ? OR ingredients LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET recipe by id
exports.getRecipeById = (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM recipes WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Recipe not found' });
    res.json(results[0]);
  });
};

// POST create new recipe
exports.createRecipe = (req, res) => {
  const { title, description, ingredients, steps, category } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const sql = `
    INSERT INTO recipes (title, description, ingredients, steps, category, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [title, description, ingredients, steps, category, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Recipe created', id: result.insertId });
  });
};

// PUT update recipe by id
exports.updateRecipe = (req, res) => {
  const id = req.params.id;
  const { title, description, ingredients, steps, category } = req.body;

  // Ambil resep lama dulu untuk cek apakah ada gambar lama yang perlu dihapus
  const getSql = 'SELECT * FROM recipes WHERE id = ?';
  db.query(getSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Recipe not found' });

    const oldRecipe = results[0];
    const oldImagePath = oldRecipe.image_url ? path.join(__dirname, '..', 'public', oldRecipe.image_url) : null;

    // Cek apakah user mengupload file baru
    const image_url = req.file ? `/uploads/${req.file.filename}` : oldRecipe.image_url;

    const updateSql = `
      UPDATE recipes
      SET title = ?, description = ?, ingredients = ?, steps = ?, category = ?, image_url = ?
      WHERE id = ?
    `;
    db.query(updateSql, [title, description, ingredients, steps, category, image_url, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Jika ada file baru dan file lama ada, hapus file lama
      if (req.file && oldRecipe.image_url) {
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Gagal menghapus gambar lama:', err);
          }
        });
      }

      res.json({ message: 'Recipe updated' });
    });
  });
};

// DELETE recipe by id (and delete image file if exists)
exports.deleteRecipe = (req, res) => {
  const id = req.params.id;

  // Ambil data resep terlebih dahulu
  const selectSql = 'SELECT * FROM recipes WHERE id = ?';
  db.query(selectSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Recipe not found' });

    const recipe = results[0];
    const imagePath = recipe.image_url ? path.join(__dirname, '..', 'public', recipe.image_url) : null;

    // Hapus data dari DB
    const deleteSql = 'DELETE FROM recipes WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Hapus file gambar jika ada
      if (imagePath) {
        fs.unlink(imagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Gagal hapus file gambar:', err);
          }
        });
      }

      res.json({ message: 'Recipe deleted' });
    });
  });
};
