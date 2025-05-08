const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm kitap route'ları için authentication gerekli
router.use(authMiddleware);

// Tek kitap listeleme
router.post('/list', bookController.listBook);

// Toplu kitap listeleme
router.post('/bulk-list', bookController.bulkListBooks);

// Kitap şablonlarını getir
router.get('/templates', bookController.getBookTemplates);

// Hızlı kitap listeleme
router.post('/quick-list', bookController.quickList);

module.exports = router; 