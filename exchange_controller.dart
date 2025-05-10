import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/exchange_service.dart';
import '../services/notification_service.dart';
import '../models/exchange_request.dart';

class ExchangeController {
  final ExchangeService _exchangeService = ExchangeService();
  final NotificationService _notificationService = NotificationService();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Yeni takas talebi oluştur
  Future<void> createExchangeRequest({
    required String fromUserId,
    required String toUserId,
    required String offeredBookId,
    required String requestedBookId,
  }) async {
    try {
      // Kullanıcı ve kitap bilgilerini al
      DocumentSnapshot fromUserDoc = await _firestore.collection('users').doc(fromUserId).get();
      DocumentSnapshot offeredBookDoc = await _firestore.collection('books').doc(offeredBookId).get();
      
      String fromUserName = fromUserDoc.get('name') as String;
      String bookTitle = offeredBookDoc.get('title') as String;

      // Takas talebini oluştur
      String requestId = await _exchangeService.createExchangeRequest(
        fromUserId: fromUserId,
        toUserId: toUserId,
        offeredBookId: offeredBookId,
        requestedBookId: requestedBookId,
      );

      // Bildirim gönder
      await _notificationService.sendExchangeRequestNotification(
        toUserId: toUserId,
        fromUserName: fromUserName,
        bookTitle: bookTitle,
      );
    } catch (e) {
      throw Exception('Takas talebi oluşturulamadı: $e');
    }
  }

  // Takas talebini güncelle
  Future<void> updateExchangeStatus({
    required String requestId,
    required String newStatus,
    required String fromUserId,
    required String toUserId,
    required String bookId,
  }) async {
    try {
      // Takas durumunu güncelle
      await _exchangeService.updateExchangeStatus(
        requestId: requestId,
        newStatus: newStatus,
      );

      // Kitap bilgilerini al
      DocumentSnapshot bookDoc = await _firestore.collection('books').doc(bookId).get();
      String bookTitle = bookDoc.get('title') as String;

      // Bildirim gönder
      await _notificationService.sendExchangeStatusNotification(
        toUserId: fromUserId,
        status: newStatus,
        bookTitle: bookTitle,
      );

      // Eğer takas kabul edildiyse kitapların durumunu güncelle
      if (newStatus == 'accepted') {
        await _updateBooksStatus(requestId);
      }
    } catch (e) {
      throw Exception('Takas durumu güncellenemedi: $e');
    }
  }

  // Kitapların durumunu güncelle
  Future<void> _updateBooksStatus(String requestId) async {
    try {
      DocumentSnapshot requestDoc = await _firestore.collection('exchangeRequests').doc(requestId).get();
      String offeredBookId = requestDoc.get('offeredBookId') as String;
      String requestedBookId = requestDoc.get('requestedBookId') as String;

      // Kitapların durumunu güncelle
      await _firestore.collection('books').doc(offeredBookId).update({
        'status': 'exchanged',
      });

      await _firestore.collection('books').doc(requestedBookId).update({
        'status': 'exchanged',
      });
    } catch (e) {
      throw Exception('Kitapların durumu güncellenemedi: $e');
    }
  }

  // Gelen takas taleplerini getir
  Stream<List<ExchangeRequest>> getIncomingRequests(String userId) {
    return _exchangeService.getIncomingRequests(userId);
  }

  // Gönderilen takas taleplerini getir
  Stream<List<ExchangeRequest>> getOutgoingRequests(String userId) {
    return _exchangeService.getOutgoingRequests(userId);
  }

  // Takas geçmişini getir
  Stream<List<ExchangeRequest>> getExchangeHistory(String userId) {
    return _exchangeService.getExchangeHistory(userId);
  }
} 