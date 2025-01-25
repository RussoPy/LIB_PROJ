import sys
from flask import Flask, request
from flask_cors import CORS 
from loguru import logger
from models import db
from utils import create_database
from book_routes import register_book_routes
from customer_routes import register_customer_routes
from loan_routes import register_loan_routes

app = Flask(__name__)
CORS(app)

# Logger setup
logger.remove()
logger.add(sys.stdout, level="DEBUG", format="{time} {level} {message}")
logger.add("../../../Logs/Lib_proj.txt", rotation="1 day", retention="7 days", level="DEBUG", format="{time} {level} {message}")

@app.before_request
def log_request_info():
    logger.info(f"Request: method={request.method}, path={request.path}, args={request.args}, from IP={request.remote_addr}")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Register routes
register_book_routes(app)
register_customer_routes(app)
register_loan_routes(app)


if __name__ == '__main__':
    create_database(app)
    app.run(debug=True)
