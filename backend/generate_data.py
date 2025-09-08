from faker import Faker
from app import app, db, Item

fake = Faker()

def seed(n=100):
    with app.app_context():
        # Clear existing data
        db.session.query(Item).delete()
        
        # Add new data
        for _ in range(n):
            name = fake.word().capitalize() + ' ' + fake.word().capitalize()
            db.session.add(Item(name=name))
        
        db.session.commit()
        print(f"Seeded {n} items.")
        
        # Show some examples
        sample_items = Item.query.limit(5).all()
        print("Sample items:")
        for item in sample_items:
            print(f"  {item.id}: {item.name}")

if __name__ == '__main__':
    seed(200)