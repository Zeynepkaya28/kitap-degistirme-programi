const axios = require('axios');

class BookService {
  constructor() {
    this.googleBooksApi = 'https://www.googleapis.com/books/v1/volumes';
    this.openLibraryApi = 'https://openlibrary.org/api/books';
  }

  async getBookInfoByISBN(isbn) {
    try {
      // Önce Google Books API'yi dene
      const googleResponse = await axios.get(`${this.googleBooksApi}?q=isbn:${isbn}`);
      
      if (googleResponse.data.items && googleResponse.data.items.length > 0) {
        const book = googleResponse.data.items[0].volumeInfo;
        return {
          title: book.title,
          author: book.authors ? book.authors.join(', ') : 'Bilinmiyor',
          publisher: book.publisher || 'Bilinmiyor',
          coverImage: book.imageLinks?.thumbnail || null,
          description: book.description || '',
          isbn: isbn
        };
      }

      // Google Books'ta bulunamazsa Open Library'i dene
      const openLibraryResponse = await axios.get(`${this.openLibraryApi}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      
      if (openLibraryResponse.data[`ISBN:${isbn}`]) {
        const book = openLibraryResponse.data[`ISBN:${isbn}`];
        return {
          title: book.title,
          author: book.authors ? book.authors.map(a => a.name).join(', ') : 'Bilinmiyor',
          publisher: book.publishers ? book.publishers[0].name : 'Bilinmiyor',
          coverImage: book.cover?.medium || null,
          description: book.notes || '',
          isbn: isbn
        };
      }

      throw new Error('Kitap bulunamadı');
    } catch (error) {
      console.error('Kitap bilgisi alınırken hata oluştu:', error);
      throw error;
    }
  }

  async bulkImportBooks(isbnList) {
    const results = [];
    for (const isbn of isbnList) {
      try {
        const bookInfo = await this.getBookInfoByISBN(isbn);
        results.push({ success: true, data: bookInfo });
      } catch (error) {
        results.push({ success: false, isbn, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new BookService(); 