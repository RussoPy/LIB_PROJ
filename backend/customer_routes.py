from flask import request, jsonify
from models import Customer, db

def register_customer_routes(app):
    @app.route('/customers', methods=['GET'])
    def view_customers():
        # Get the query parameter 'name'
        customer_name = request.args.get('name')

        if customer_name:
            # Filter customers by name (case-insensitive search)
            customers = Customer.query.filter(Customer.name.ilike(f"%{customer_name}%")).all()
        else:
            # Retrieve all customers if no name is provided
            customers = Customer.query.all()

        return jsonify([{
            "id": customer.id,
            "name": customer.name,
            "city": customer.city,
            "age": customer.age,
            "active": customer.active
        } for customer in customers])

    @app.route('/customers/add', methods=['POST'])
    def add_customer():
        data = request.get_json()
        new_customer = Customer(
            name=data['name'],
            city=data['city'],
            age=data['age'],
            active=data.get('active', True)
        )
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({"message": "Customer added!"}), 201

    @app.route('/customers/edit/<int:id>', methods=['PUT'])
    def edit_customer(id):
        customer = Customer.query.get_or_404(id)
        data = request.get_json()
        customer.name = data['name']
        customer.city = data['city']
        customer.age = data['age']
        customer.active = data.get('active', customer.active)
        db.session.commit()
        return jsonify({"message": "Customer updated!"})

    @app.route('/customers/delete/<int:id>', methods=['DELETE'])
    def delete_customer(id):
        customer = Customer.query.get_or_404(id)
        customer.active = False
        db.session.commit()
        return jsonify({"message": "Customer status updated to inactive!"})
