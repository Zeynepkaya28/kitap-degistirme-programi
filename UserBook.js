const { db } = require('../config/firebase');

class UserBook {
  static async addUserBook(userBookData) {
    const { userId, bookId, condition, description, isAvailable } = userBookData;
    
    const userBookRef = db.collection('userBooks').doc();
    await userBookRef.set({
      userId,
      bookId,
      condition,
      description,
      isAvailable,
      createdAt: new Date()
    });
    
    return userBookRef;
  }

  static async getUserBooks(userId) {
    const snapshot = await db.collection('userBooks')
      .where('userId', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateUserBook(userBookId, updateData) {
    const userBookRef = db.collection('userBooks').doc(userBookId);
    await userBookRef.update(updateData);
    return userBookRef;
  }

  static async searchUserBooks(filters) {
    let query = db.collection('userBooks');
    
    if (filters.city) {
      const usersSnapshot = await db.collection('users')
        .where('city', '==', filters.city)
        .get();
      
      const userIds = usersSnapshot.docs.map(doc => doc.id);
      query = query.where('userId', 'in', userIds);
    }
    
    if (filters.isAvailable !== undefined) {
      query = query.where('isAvailable', '==', filters.isAvailable);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = UserBook; 