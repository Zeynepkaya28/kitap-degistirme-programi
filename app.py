from flask import Flask, request, jsonify
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Email, Length, ValidationError
from cerberus import Validator
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = 'gizli-anahtar-buraya'

# WTForms ile form doğrulama
class KullaniciForm(FlaskForm):
    email = StringField('E-posta', validators=[
        DataRequired(message='E-posta alanı zorunludur'),
        Email(message='Geçerli bir e-posta adresi giriniz')
    ])
    
    sifre = PasswordField('Şifre', validators=[
        DataRequired(message='Şifre alanı zorunludur'),
        Length(min=8, message='Şifre en az 8 karakter olmalıdır')
    ])
    
    kitap_durumu = SelectField('Kitap Durumu', choices=[
        ('iyi', 'İyi'),
        ('orta', 'Orta'),
        ('kötü', 'Kötü')
    ])

# ISBN doğrulama fonksiyonu
def validate_isbn(form, field):
    isbn = field.data.replace('-', '')
    if not (len(isbn) == 10 or len(isbn) == 13):
        raise ValidationError('ISBN 10 veya 13 karakter olmalıdır')
    if not isbn.isdigit():
        raise ValidationError('ISBN sadece rakamlardan oluşmalıdır')

# Cerberus ile JSON doğrulama şeması
kitap_schema = {
    'isbn': {
        'type': 'string',
        'required': True,
        'regex': r'^[0-9-]{10,13}$'
    },
    'baslik': {
        'type': 'string',
        'required': True,
        'minlength': 1
    },
    'durum': {
        'type': 'string',
        'required': True,
        'allowed': ['iyi', 'orta', 'kötü']
    }
}

validator = Validator(kitap_schema)

@app.route('/form-dogrula', methods=['POST'])
def form_dogrula():
    form = KullaniciForm()
    if form.validate_on_submit():
        return jsonify({
            'durum': 'başarılı',
            'mesaj': 'Form doğrulandı'
        })
    return jsonify({
        'durum': 'hata',
        'hatalar': form.errors
    }), 400

@app.route('/json-dogrula', methods=['POST'])
def json_dogrula():
    veri = request.get_json()
    if validator.validate(veri):
        return jsonify({
            'durum': 'başarılı',
            'mesaj': 'JSON doğrulandı'
        })
    return jsonify({
        'durum': 'hata',
        'hatalar': validator.errors
    }), 400

if __name__ == '__main__':
    app.run(debug=True) 