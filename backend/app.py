from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
import logging

logging.basicConfig(level=logging.INFO)
logging.info(f"Attempting DB connection to {Config.SQLALCHEMY_DATABASE_URI.split('@')[-1]}")

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db = SQLAlchemy(app)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name}

@app.route('/')
def home():
    return jsonify({
        'message': 'Search Backend API is running!',
        'endpoints': {
            'search': '/api/items?q=search_term',
            'example': '/api/items?q=test'
        }
    })

@app.route('/api/items')
def get_items():
    q = request.args.get('q', '').strip()
    items = []
    if q:
        items = Item.query.filter(Item.name.ilike(f"{q}%")).all()
    return jsonify([item.to_dict() for item in items])

if __name__ == '__main__':
    with app.app_context():
        logging.info("Creating tables if not exist...")
        db.create_all()
    app.run(debug=True,port=5001)