const Book = require('../models/Book');
const bookService = require('../services/bookService');

class BookController {
  async listBook(req, res) {
    try {
      const { isbn, condition, additionalNotes, tradePreferences } = req.body;
      const userId = req.user._id; // Middleware'den gelen kullanıcı bilgisi

      // ISBN ile kitap bilgilerini çek
      const bookInfo = await bookService.getBookInfoByISBN(isbn);
      
      // Otomatik kategori belirle
      const category = await Book.autoCategorize(bookInfo);

      // Yeni kitap oluştur
      const newBook = new Book({
        ...bookInfo,
        condition,
        additionalNotes,
        tradePreferences,
        category,
        owner: userId
      });

      await newBook.save();

      res.status(201).json({
        success: true,
        message: 'Kitap başarıyla listelendi',
        data: newBook
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async bulkListBooks(req, res) {
    try {
      const { isbnList, condition, tradePreferences } = req.body;
      const userId = req.user._id;

      const results = await bookService.bulkImportBooks(isbnList);
      
      const successfulBooks = results
        .filter(result => result.success)
        .map(result => ({
          ...result.data,
          condition,
          tradePreferences,
          owner: userId
        }));

      // Otomatik kategori belirleme
      for (const book of successfulBooks) {
        book.category = await Book.autoCategorize(book);
      }

      const savedBooks = await Book.insertMany(successfulBooks);

      res.status(201).json({
        success: true,
        message: 'Kitaplar başarıyla listelendi',
        data: {
          successful: savedBooks,
          failed: results.filter(result => !result.success)
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getBookTemplates(req, res) {
    try {
      const userId = req.user._id;
      
      // Kullanıcının daha önce listelediği kitaplardan şablonlar oluştur
      const userBooks = await Book.find({ owner: userId })
        .select('category condition tradePreferences')
        .distinct('category');

      const templates = userBooks.map(category => ({
        category,
        defaultCondition: 'Yeni gibi',
        defaultTradePreferences: []
      }));

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async quickList(req, res) {
    try {
      const { isbn, condition, tradePreferences } = req.body;
      const userId = req.user._id;

      // Minimum bilgiyle hızlı listeleme
      const bookInfo = await bookService.getBookInfoByISBN(isbn);
      const category = await Book.autoCategorize(bookInfo);

      const newBook = new Book({
        ...bookInfo,
        condition,
        tradePreferences,
        category,
        owner: userId
      });

      await newBook.save();

      res.status(201).json({
        success: true,
        message: 'Kitap hızlı listeleme ile eklendi',
        data: newBook
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BookController(); 