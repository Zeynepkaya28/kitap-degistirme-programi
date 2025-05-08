const { db } = require('../config/firebase');

class ExchangeRequest {
  static async createExchangeRequest(requestData) {
    const { senderUserId, receiverUserId, offeredUserBookId, requestedUserBookId } = requestData;
    
    const exchangeRequestRef = db.collection('exchangeRequests').doc();
    await exchangeRequestRef.set({
      senderUserId,
      receiverUserId,
      offeredUserBookId,
      requestedUserBookId,
      status: 'pending',
      createdAt: new Date()
    });
    
    return exchangeRequestRef;
  }

  static async getExchangeRequests(userId) {
    const snapshot = await db.collection('exchangeRequests')
      .where('senderUserId', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getReceivedExchangeRequests(userId) {
    const snapshot = await db.collection('exchangeRequests')
      .where('receiverUserId', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateExchangeRequestStatus(requestId, status) {
    const requestRef = db.collection('exchangeRequests').doc(requestId);
    await requestRef.update({ status });
    return requestRef;
  }
}

module.exports = ExchangeRequest; 