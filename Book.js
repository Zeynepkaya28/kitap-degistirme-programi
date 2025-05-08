const mongoose = require('mongoose');
const { db } = require('../config/firebase');

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  publisher: String,
  coverImage: String,
  description: String,
  category: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['Yeni gibi', 'Az kullanılmış', 'Yıpranmış'],
    required: true
  },
  additionalNotes: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'traded'],
    default: 'available'
  },
  tradePreferences: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Otomatik kategori ve etiketleme için statik metod
bookSchema.statics.autoCategorize = async function(bookData) {
  // Burada yapay zeka veya ön tanımlı kurallarla kategori belirleme işlemi yapılabilir
  // Şimdilik basit bir örnek:
  const categories = {
    'roman': ['roman', 'hikaye', 'öykü'],
    'bilim': ['bilim', 'teknoloji', 'araştırma'],
    'çocuk': ['çocuk', 'masal', 'çizgi roman']
  };

  let bestCategory = 'diğer';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(categories)) {
    const matches = keywords.filter(keyword => 
      bookData.title.toLowerCase().includes(keyword) || 
      bookData.description?.toLowerCase().includes(keyword)
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  return bestCategory;
};

class Book {
  static async createBook(bookData) {
    const { isbn, title, author, publisher, genre, coverImage, language, publicationYear } = bookData;
    
    const bookRef = db.collection('books').doc(isbn);
    const bookDoc = await bookRef.get();
    
    if (bookDoc.exists) {
      return bookRef;
    }
    
    await bookRef.set({
      title,
      author,
      publisher,
      genre,
      coverImage,
      language,
      publicationYear,
      createdAt: new Date()
    });
    
    return bookRef;
  }

  static async getBookByISBN(isbn) {
    const bookRef = db.collection('books').doc(isbn);
    const bookDoc = await bookRef.get();
    
    if (!bookDoc.exists) {
      throw new Error('Book not found');
    }
    
    return bookDoc.data();
  }

  static async searchBooks(filters) {
    let query = db.collection('books');
    
    if (filters.genre) {
      query = query.where('genre', '==', filters.genre);
    }
    
    if (filters.language) {
      query = query.where('language', '==', filters.language);
    }
    
    if (filters.publicationYear) {
      query = query.where('publicationYear', '==', filters.publicationYear);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = mongoose.model('Book', bookSchema);
module.exports = Book; 