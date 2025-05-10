import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/exchange_request.dart';

class ExchangeService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'exchangeRequests';

  // Yeni takas talebi oluştur
  Future<String> createExchangeRequest({
    required String fromUserId,
    required String toUserId,
    required String offeredBookId,
    required String requestedBookId,
  }) async {
    // Aynı kullanıcıdan aynı kitaplar için tekrar teklif kontrolü
    final existingRequest = await _firestore
        .collection(_collection)
        .where('fromUserId', isEqualTo: fromUserId)
        .where('offeredBookId', isEqualTo: offeredBookId)
        .where('requestedBookId', isEqualTo: requestedBookId)
        .where('status', isEqualTo: 'pending')
        .get();

    if (existingRequest.docs.isNotEmpty) {
      throw Exception('Bu kitaplar için zaten bir takas talebi gönderilmiş.');
    }

    final docRef = await _firestore.collection(_collection).add({
      'fromUserId': fromUserId,
      'toUserId': toUserId,
      'offeredBookId': offeredBookId,
      'requestedBookId': requestedBookId,
      'status': 'pending',
      'timestamp': FieldValue.serverTimestamp(),
    });

    return docRef.id;
  }

  // Takas talebini güncelle (kabul/red/iptal)
  Future<void> updateExchangeStatus({
    required String requestId,
    required String newStatus,
  }) async {
    await _firestore.collection(_collection).doc(requestId).update({
      'status': newStatus,
    });
  }

  // Kullanıcının gelen takas taleplerini getir
  Stream<List<ExchangeRequest>> getIncomingRequests(String userId) {
    return _firestore
        .collection(_collection)
        .where('toUserId', isEqualTo: userId)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ExchangeRequest.fromFirestore(doc))
            .toList());
  }

  // Kullanıcının gönderdiği takas taleplerini getir
  Stream<List<ExchangeRequest>> getOutgoingRequests(String userId) {
    return _firestore
        .collection(_collection)
        .where('fromUserId', isEqualTo: userId)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ExchangeRequest.fromFirestore(doc))
            .toList());
  }

  // Takas geçmişini getir
  Stream<List<ExchangeRequest>> getExchangeHistory(String userId) {
    return _firestore
        .collection(_collection)
        .where('fromUserId', isEqualTo: userId)
        .where('status', whereIn: ['accepted', 'completed'])
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ExchangeRequest.fromFirestore(doc))
            .toList());
  }
} 