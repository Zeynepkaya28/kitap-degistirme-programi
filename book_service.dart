import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class BookService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Google Books API'den kitap bilgilerini çekme
  Future<Map<String, dynamic>?> getBookDetailsFromISBN(String isbn) async {
    try {
      final response = await http.get(
        Uri.parse('https://www.googleapis.com/books/v1/volumes?q=isbn:$isbn'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['items'] != null && data['items'].isNotEmpty) {
          final bookInfo = data['items'][0]['volumeInfo'];
          return {
            'title': bookInfo['title'],
            'authors': bookInfo['authors'] ?? [],
            'publisher': bookInfo['publisher'],
            'publishedDate': bookInfo['publishedDate'],
            'description': bookInfo['description'],
            'imageLinks': bookInfo['imageLinks'],
            'categories': bookInfo['categories'] ?? [],
            'isbn': isbn,
          };
        }
      }
      return null;
    } catch (e) {
      print('Kitap bilgileri alınamadı: $e');
      return null;
    }
  }

  // Kitap ekleme
  Future<String> addBook(Map<String, dynamic> bookData) async {
    try {
      // Önce ISBN ile kitap var mı kontrol et
      final existingBook = await _firestore
          .collection('books')
          .where('isbn', isEqualTo: bookData['isbn'])
          .get();

      String bookId;
      if (existingBook.docs.isNotEmpty) {
        // Kitap zaten varsa, mevcut kitabın ID'sini kullan
        bookId = existingBook.docs.first.id;
      } else {
        // Yeni kitap oluştur
        final docRef = await _firestore.collection('books').add(bookData);
        bookId = docRef.id;
      }

      return bookId;
    } catch (e) {
      print('Kitap eklenemedi: $e');
      rethrow;
    }
  }

  // Kullanıcı kitabı ekleme
  Future<void> addUserBook(String userId, String bookId, Map<String, dynamic> userBookData) async {
    try {
      await _firestore.collection('userBooks').add({
        'userId': userId,
        'bookId': bookId,
        'status': userBookData['status'],
        'exchangePreference': userBookData['exchangePreference'],
        'addedAt': FieldValue.serverTimestamp(),
        ...userBookData,
      });
    } catch (e) {
      print('Kullanıcı kitabı eklenemedi: $e');
      rethrow;
    }
  }

  // Toplu kitap ekleme (CSV)
  Future<void> addBooksFromCSV(String userId, String csvContent) async {
    final lines = csvContent.split('\n');
    for (var i = 1; i < lines.length; i++) { // İlk satır başlık olduğu için atlanıyor
      final values = lines[i].split(',');
      if (values.length >= 3) {
        final isbn = values[0].trim();
        final status = values[1].trim();
        final exchangePreference = values[2].trim();

        final bookData = await getBookDetailsFromISBN(isbn);
        if (bookData != null) {
          final bookId = await addBook(bookData);
          await addUserBook(userId, bookId, {
            'status': status,
            'exchangePreference': exchangePreference,
          });
        }
      }
    }
  }

  // Kategorileri getir
  Future<List<String>> getCategories() async {
    try {
      final snapshot = await _firestore.collection('categories').get();
      return snapshot.docs.map((doc) => doc.id).toList();
    } catch (e) {
      print('Kategoriler alınamadı: $e');
      return [];
    }
  }

  // Etiketleri getir
  Future<List<String>> getTags() async {
    try {
      final snapshot = await _firestore.collection('tags').get();
      return snapshot.docs.map((doc) => doc.id).toList();
    } catch (e) {
      print('Etiketler alınamadı: $e');
      return [];
    }
  }
} 