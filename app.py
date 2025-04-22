from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Veritabanı bağlantısı
def get_db_connection():
    conn = sqlite3.connect('kitap_takas.db')
    conn.row_factory = sqlite3.Row
    return conn

# Kullanıcı işlemleri
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
        ''', (data['username'], data['email'], data['password']))
        conn.commit()
        return jsonify({'message': 'Kullanıcı başarıyla oluşturuldu'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Kullanıcı adı veya email zaten kullanımda'}), 400
    finally:
        conn.close()

# Kitap işlemleri
@app.route('/api/books', methods=['POST'])
def add_book():
    if 'cover_image' in request.files:
        file = request.files['cover_image']
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    data = request.form
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO books (title, author, publication_year, cover_image, 
                             page_count, owner_id, current_holder_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['title'], data['author'], data.get('publication_year'),
              filename if 'cover_image' in request.files else None,
              data['page_count'], data['owner_id'], data['owner_id']))
        conn.commit()
        return jsonify({'message': 'Kitap başarıyla eklendi'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

# Kitap listesi
@app.route('/api/books', methods=['GET'])
def get_books():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT b.*, u.username as owner_name
            FROM books b
            JOIN users u ON b.owner_id = u.id
            WHERE b.is_available = 1
        ''')
        books = [dict(row) for row in cursor.fetchall()]
        return jsonify(books)
    finally:
        conn.close()

# Değiş tokuş isteği
@app.route('/api/exchange', methods=['POST'])
def create_exchange_request():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Kullanıcının aktif değiş tokuş sayısını kontrol et
        cursor.execute('''
            SELECT COUNT(*) FROM exchange_requests
            WHERE requester_id = ? AND status = 'pending'
        ''', (data['requester_id'],))
        active_requests = cursor.fetchone()[0]
        
        if active_requests >= 3:
            return jsonify({'error': 'Maksimum 3 aktif değiş tokuş isteğiniz olabilir'}), 400
        
        cursor.execute('''
            INSERT INTO exchange_requests (book_id, requester_id)
            VALUES (?, ?)
        ''', (data['book_id'], data['requester_id']))
        conn.commit()
        return jsonify({'message': 'Değiş tokuş isteği oluşturuldu'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True) 