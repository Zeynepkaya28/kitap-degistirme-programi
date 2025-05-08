const { db } = require('../config/firebase');

class User {
  static async createUser(userData) {
    const { uid, email, displayName, city, region, location } = userData;
    
    const userRef = db.collection('users').doc(uid);
    await userRef.set({
      email,
      displayName,
      city,
      region,
      location,
      createdAt: new Date()
    });
    
    return userRef;
  }

  static async getUserById(uid) {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    return userDoc.data();
  }

  static async updateUser(uid, updateData) {
    const userRef = db.collection('users').doc(uid);
    await userRef.update(updateData);
    return userRef;
  }
}

module.exports = User; 