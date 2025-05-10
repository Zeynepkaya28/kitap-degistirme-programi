const { storage } = require('../config/firebase');

class StorageService {
  static async uploadBookCover(file, isbn) {
    const bucket = storage.bucket();
    const fileName = `book-covers/${isbn}-${Date.now()}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  }

  static async deleteBookCover(fileUrl) {
    const bucket = storage.bucket();
    const fileName = fileUrl.split('/').pop();
    const file = bucket.file(`book-covers/${fileName}`);
    
    try {
      await file.delete();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

module.exports = StorageService; 