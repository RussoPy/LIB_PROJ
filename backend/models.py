from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Book Model
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    year_published = db.Column(db.Integer, nullable=False)
    type = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=True)
    loans = db.relationship('Loan', backref='book', lazy=True)

# Customer Model
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=True)
    loans = db.relationship('Loan', backref='customer', lazy=True)

# Loan Model
class Loan(db.Model):
    cust_id = db.Column(db.Integer, db.ForeignKey('customer.id'), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), primary_key=True)
    loan_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    active = db.Column(db.Boolean, default=True)
