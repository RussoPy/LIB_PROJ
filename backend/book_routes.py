from flask import request, jsonify
from models import Book, db

def register_book_routes(app):
    @app.route('/books', methods=['GET'])
    def view_books():
        # Get the query parameter 'name'
        book_name = request.args.get('name')

        if book_name:
            # Filter books by name (case-insensitive search)
            books = Book.query.filter(Book.name.ilike(f"%{book_name}%")).all()
        else:
            # Retrieve all books if no name is provided
            books = Book.query.all()

        return jsonify([{
            "id": book.id,
            "name": book.name,
            "author": book.author,
            "year_published": book.year_published,
            "type": book.type,
            "active": book.active
        } for book in books])


    @app.route('/books/add', methods=['POST'])
    def add_book():
        data = request.get_json()
        new_book = Book(
            name=data['name'],
            author=data['author'],
            year_published=data['year_published'],
            type=data['type'],
            active=data.get('active', True)
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify({"message": "Book added!"}), 201

    @app.route('/books/edit/<int:id>', methods=['PUT'])
    def edit_book(id):
        book = Book.query.get_or_404(id)
        data = request.get_json()
        book.name = data['name']
        book.author = data['author']
        book.year_published = data['year_published']
        book.type = data['type']
        book.active = data.get('active', book.active)
        db.session.commit()
        return jsonify({"message": "Book updated!"})

    @app.route('/books/delete/<int:id>', methods=['DELETE'])
    def delete_book(id):
        book = Book.query.get_or_404(id)
        book.active = False
        db.session.commit()
        return jsonify({"message": "Book status updated to inactive!"})
