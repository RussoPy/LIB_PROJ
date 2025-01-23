from flask import request, jsonify
from datetime import datetime, timedelta
from models import Loan, Book, Customer, db

def register_loan_routes(app):
    @app.route('/loans', methods=['GET'])
    def get_loans():
        filter_active = request.args.get('active')  # Optional query parameter
        if filter_active == 'true':
            loans = Loan.query.filter_by(active=True).all()  # Active loans
        else:
            loans = Loan.query.all()  # All loans

        loan_list = []
        for loan in loans:
            customer = Customer.query.get(loan.cust_id)
            book = Book.query.get(loan.book_id)

            loan_data = {
                'cust_id': loan.cust_id,
                'book_id': loan.book_id,
                'customer_name': customer.name if customer else "Unknown",
                'book_name': book.name if book else "Unknown",
                'loan_date': loan.loan_date.strftime('%Y-%m-%d'),
                'return_date': loan.return_date.strftime('%Y-%m-%d') if loan.return_date else None,
                'active': loan.active
            }
            loan_list.append(loan_data)

        return jsonify(loan_list)

    

    @app.route('/loans/add', methods=['POST'])
    def add_loan():
        data = request.get_json()
        book = Book.query.get_or_404(data['book_id'])
        customer = Customer.query.get_or_404(data['cust_id'])

        if not book.active:
            return jsonify({"error": "Book is inactive!"}), 400
        if not customer.active:
            return jsonify({"error": "Customer is inactive!"}), 400

        # Determine return date based on book type
        days_allowed = {1: 10, 2: 5, 3: 2}.get(book.type, 10)
        loan_date = datetime.strptime(data['loan_date'], '%Y-%m-%d')
        return_date = loan_date + timedelta(days=days_allowed)

        new_loan = Loan(
            cust_id=customer.id,
            book_id=book.id,
            loan_date=loan_date,
            return_date=return_date,
            active=True
        )
        db.session.add(new_loan)
        db.session.commit()
        return jsonify({"message": "Loan added!"}), 201

    @app.route('/loans/return/<int:cust_id>/<int:book_id>', methods=['PUT'])
    def return_loan(cust_id, book_id):
        loan = Loan.query.filter_by(cust_id=cust_id, book_id=book_id, active=True).first_or_404()
        loan.active = False
        db.session.commit()
        return jsonify({"message": "Loan marked as returned!"})

    

    @app.route('/loans/late', methods=['GET'])
    def late():
        today = datetime.today().date()  # Get today's date
        print(f"today is ------------------    {today}")
        late_loans = Loan.query.filter(
            Loan.active == True,  # Ensure the loan is active
            Loan.return_date < today  # Ensure the return_date has passed
        ).all()
        print(f"Today's Date: {today}")
        print(f"Late Loans Query: {late_loans}")
        # Return the late loans in the desired format
        return jsonify([{
            "cust_id": loan.cust_id,
            "book_id": loan.book_id,
            "customer_name": loan.customer.name if loan.customer else "Unknown",
            "book_name": loan.book.name if loan.book else "Unknown",
            "loan_date": loan.loan_date.strftime('%Y-%m-%d'),
            "return_date": loan.return_date.strftime('%Y-%m-%d'),
            "active": loan.active
        } for loan in late_loans])


    
    @app.route('/loans/edit/<int:cust_id>/<int:book_id>', methods=['PUT'])
    def edit_loan(cust_id, book_id):
        loan = Loan.query.filter_by(cust_id=cust_id, book_id=book_id).first_or_404()
        data = request.get_json()
        if 'cust_id' in data:
            customer = Customer.query.get_or_404(data['cust_id'])
            if not customer.active:
                return jsonify({"error": "Customer is inactive!"}), 400
            loan.cust_id = data['cust_id']

        if 'book_id' in data:
            book = Book.query.get_or_404(data['book_id'])
            if not book.active:
                return jsonify({"error": "Book is inactive!"}), 400
            loan.book_id = data['book_id']

        if 'loan_date' in data:
            loan.loan_date = datetime.strptime(data['loan_date'], '%Y-%m-%d')

        if 'return_date' in data:
            loan.return_date = datetime.strptime(data['return_date'], '%Y-%m-%d')

        if 'active' in data:
            loan.active = data['active']

        db.session.commit()

        return jsonify({"message": "Loan updated successfully!"})
    
    @app.route('/loans/search', methods=['GET'])
    def search_loans():
        customer_name = request.args.get('customer_name')
        book_name = request.args.get('book_name')
        
        query = Loan.query

        if customer_name:
            query = query.join(Customer).filter(Customer.name.ilike(f"%{customer_name}%"))
        
        if book_name:
            query = query.join(Book).filter(Book.name.ilike(f"%{book_name}%"))
        
        loans = query.all()
        
        loan_list = []
        for loan in loans:
            customer = Customer.query.get(loan.cust_id)
            book = Book.query.get(loan.book_id)
            loan_data = {
                'cust_id': loan.cust_id,
                'book_id': loan.book_id,
                'customer_name': customer.name if customer else "Unknown",
                'book_name': book.name if book else "Unknown",
                'loan_date': loan.loan_date.strftime('%Y-%m-%d'),
                'return_date': loan.return_date.strftime('%Y-%m-%d') if loan.return_date else None,
                'active': loan.active
            }
            loan_list.append(loan_data)

        return jsonify(loan_list)

