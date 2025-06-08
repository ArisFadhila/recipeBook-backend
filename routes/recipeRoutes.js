const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const upload = require('../middlewares/upload');
const verifyToken = require('../middlewares/verifyToken');

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ image_url: `/uploads/${req.file.filename}` });
});

// Tambah resep + upload gambar
router.post('/', verifyToken,upload.single('image'), recipeController.createRecipe);
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);
//router.post('/', recipeController.createRecipe);
router.put('/:id',verifyToken, upload.single('image'), recipeController.updateRecipe);

router.delete('/:id',verifyToken, recipeController.deleteRecipe);


module.exports = router;
