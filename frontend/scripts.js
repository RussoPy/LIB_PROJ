

const showBooks = async () => {
    try {
        // Fetch books data from your API
        const response = await fetch('http://localhost:5000/books');
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        // Get books data in JSON format
        const books = await response.json();
        // Start creating the table HTML
        let tableHTML = `
            <div class = "card">
            <div class="card-header" style="text-align: center;">Books List</div>
            <div class = " card-body"> </div>
            
            <table class="table table-striped table-hover table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Author</th>
                        <th>Year Published</th>
                        <th>Days to Loan</th>
                        <th>Available</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Loop through books and create a table row for each book
        books.forEach(book => {
            let daysToLoan;
            switch (book.type) {
                case 1: daysToLoan = '10 days'; break;
                case 2: daysToLoan = '5 days'; break;
                case 3: daysToLoan = '2 days'; break;
                default: daysToLoan = 'Unknown'; break;
            }

            tableHTML += `
                <tr>
                    <td style ="text-align: center;">${book.name}</td>
                    <td style ="text-align: center;">${book.author}</td>
                    <td style ="text-align: center;">${book.year_published}</td>
                    <td style ="text-align: center;">${daysToLoan}</td>
                    <td style ="text-align: center;">${book.active ? 'Yes' : 'No'}</td>
                </tr>
            `;
        });

        // End the table HTML
        tableHTML += `
                </tbody>
            </table>
            </div> 
        `;

        // Set the HTML content inside the #content div
        document.getElementById('content').innerHTML = tableHTML;

    } catch (error) {
        console.error('Error fetching books:', error);
        document.getElementById('content').innerHTML = `<p>Error loading books: ${error.message}</p>`;
    }
};

// ---------------------------------------------------------------------------------------------------------------

// addBook function to display inputs and handle adding a book
const addBook = () => {
    // Create the HTML for adding a book
    const addBookHTML = `
        <div class="card">
            <div class="card-header" style="text-align: center;">Add a New Book</div>
            <div class="card-body">
                <div class="mb-3">
                    <label for="name" class="form-label">Book Name</label>
                    <input type="text" id="name" class="form-control" placeholder="Enter book name">
                </div>
                <div class="mb-3">
                    <label for="author" class="form-label">Author</label>
                    <input type="text" id="author" class="form-control" placeholder="Enter author name">
                </div>
                <div class="mb-3">
                    <label for="year_published" class="form-label">Year Published</label>
                    <input type="number" id="year_published" class="form-control" placeholder="Enter year published">
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Book Type</label>
                    <select id="type" class="form-select">
                        <option value="1">10 days loan</option>
                        <option value="2">5 days loan</option>
                        <option value="3">2 days loan</option>
                    </select>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" id="active" class="form-check-input" checked>
                    <label for="active" class="form-check-label">Active</label>
                </div>
                <button id="submitBook" class="btn btn-primary">Add Book</button>
            </div>
        </div>
    `;

    // Display the form in the #content div
    document.getElementById('content').innerHTML = addBookHTML;

    // Add event listener to the submit button
    document.getElementById('submitBook').addEventListener('click', async () => {
        // Get the input values
        const name = document.getElementById('name').value;
        const author = document.getElementById('author').value;
        const yearPublished = document.getElementById('year_published').value;
        const type = document.getElementById('type').value;
        const active = document.getElementById('active').checked;

        // Create the book object to send to the server
        const newBook = {
            name: name,
            author: author,
            year_published: parseInt(yearPublished),
            type: parseInt(type),
            active: active
        };

        try {
            // Send the data using Axios
            const response = await axios.post('http://localhost:5000/books/add', newBook);

            // Alert success message
            alert(response.data.message);
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Error adding book: ' + (error.response?.data?.message || error.message));
        }
    });
}



// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------



const searchAndEditBook = async () => {
    // Create the HTML structure for the search form
    let searchHTML = `
        <div class="card">
            <div class="card-header" style="text-align: center;">Search for a Book</div>
            <div class="card-body">
                <label for="bookName">Enter the name of the book to edit:</label>
                <input type="text" id="bookName" class="form-control" placeholder="Book Name" />
                <button onclick="searchBook()" class="btn btn-primary mt-3">Search</button>
            </div>
        </div>
    `;
    document.getElementById('content').innerHTML = searchHTML;

    // Function to handle the search process
    window.searchBook = async () => {
        const bookName = document.getElementById('bookName').value;

        if (!bookName) {
            alert("Please enter a book name.");
            return;
        }

        try {
            // Search for the book using Axios
            const response = await axios.get(`http://localhost:5000/books`);
            const book = response.data.find(b => b.name.toLowerCase() === bookName.toLowerCase());

            if (!book) {
                alert("Book not found.");
                return;
            }

            // Create the HTML for editing the book
            let editHTML = `
                <div class="card">
                    <div class="card-header" style="text-align: center;">Edit Book</div>
                    <div class="card-body">
                        <label for="editName">Name:</label>
                        <input type="text" id="editName" class="form-control" value="${book.name}" />
                        
                        <label for="editAuthor" class="mt-2">Author:</label>
                        <input type="text" id="editAuthor" class="form-control" value="${book.author}" />
                        
                        <label for="editYear" class="mt-2">Year Published:</label>
                        <input type="number" id="editYear" class="form-control" value="${book.year_published}" />
                        
                        <label for="editType" class="mt-2">Book Type (1, 2, 3):</label>
                        <input type="number" id="editType" class="form-control" value="${book.type}" />
                        
                        <label for="editActive" class="mt-2">Available:</label>
                        <input type="checkbox" id="editActive" ${book.active ? 'checked' : ''} />
                        
                        <button onclick="updateBook(${book.id})" class="btn btn-success mt-3">Update Book</button>
                    </div>
                </div>
            `;
            document.getElementById('content').innerHTML = editHTML;

        } catch (error) {
            console.error('Error fetching books:', error);
            alert('Error fetching books: ' + error.message);
        }
    };


    // Function to handle the update process
    window.updateBook = async (id) => {
        const updatedBook = {
            name: document.getElementById('editName').value,
            author: document.getElementById('editAuthor').value,
            year_published: document.getElementById('editYear').value,
            type: parseInt(document.getElementById('editType').value),
            active: document.getElementById('editActive').checked
        };

        try {
            const updateResponse = await axios.put(`http://localhost:5000/books/edit/${id}`, updatedBook);
            console.log('Book updated:', updateResponse.data.message);
            alert(updateResponse.data.message); // Show success message

            // Optionally, you can reload the search form after updating
            searchAndEditBook();
        } catch (error) {
            console.error('Error updating book:', error);
            alert('Error updating book: ' + error.message);
        }
    };
};

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------


const showCustomers = async () => {
    try {
        // Create the HTML structure for displaying customers
        let customersHTML = `
            <div class="card">
                <div class="card-header" style="text-align: center;">Customer List</div>
                <div class="card-body">
                    <table class="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>City</th>
                                <th>Age</th>
                                <th>Active</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Fetch customers data from your API
        const response = await axios.get('http://localhost:5000/customers');
        
        if (!response.data || response.data.length === 0) {
            customersHTML += `
                <tr>
                    <td colspan="4" style="text-align: center;">No customers found</td>
                </tr>
            `;
        } else {
            // Loop through the customers and add them to the table
            response.data.forEach(customer => {
                customersHTML += `
                    <tr>
                        <td style="text-align: center;">${customer.name}</td>
                        <td style="text-align: center;">${customer.city}</td>
                        <td style="text-align: center;">${customer.age}</td>
                        <td style="text-align: center;">${customer.active ? 'Yes' : 'No'}</td>
                    </tr>
                `;
            });
        }

        // Close the table and card HTML
        customersHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Insert the HTML content into the page
        document.getElementById('content').innerHTML = customersHTML;

    } catch (error) {
        console.error('Error fetching customers:', error);
        document.getElementById('content').innerHTML = `<p>Error loading customers: ${error.message}</p>`;
    }
};


// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

const addCustomer = async () => {
    // Create the HTML structure for the customer form
    let formHTML = `
        <div class="card">
            <div class="card-header" style="text-align: center;">Add Customer</div>
            <div class="card-body">
                <form id="customerForm">
                    <div class="mb-3">
                        <label for="name" class="form-label">Name:</label>
                        <input type="text" class="form-control" id="name" required>
                    </div>
                    <div class="mb-3">
                        <label for="city" class="form-label">City:</label>
                        <input type="text" class="form-control" id="city" required>
                    </div>
                    <div class="mb-3">
                        <label for="age" class="form-label">Age:</label>
                        <input type="number" class="form-control" id="age" required>
                    </div>
                    <div class="mb-3">
                        <label for="active" class="form-label">Active:</label>
                        <select class="form-control" id="active">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Add Customer</button>
                </form>
            </div>
        </div>
    `;
    
    // Insert the form HTML into the page
    document.getElementById('content').innerHTML = formHTML;

    // Handle form submission
    document.getElementById('customerForm').onsubmit = async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const city = document.getElementById('city').value;
        const age = document.getElementById('age').value;
        const active = document.getElementById('active').value === 'true';

        const customerData = {
            name,
            city,
            age,
            active
        };

        try {
            // Send POST request to add the new customer
            const response = await axios.post('http://localhost:5000/customers/add', customerData);

            alert(response.data.message);  // Success message
            // Optionally, reload the list of customers after adding
            showCustomers();  // Assuming you have a function to display customers
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('There was an error saving the customer data');
        }
    };
};

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------


const displayDeleteCustomer = async () => {
    // HTML content with the search input and delete button
    const htmlContent = `
        <div class="card">
            <div class="card-header" style="text-align: center;">Delete Customer</div>
            <div class="card-body">
                <input type="text" id="customerName" class="form-control" placeholder="Enter Customer Name to Delete" />
                <button class="btn btn-danger mt-3" onclick="deleteCustomerByName()">Delete Customer</button>
            </div>
        </div>
    `;

    // Inject the HTML content into the page
    document.getElementById('content').innerHTML = htmlContent;
};

const deleteCustomerByName = async () => {
    // Get the customer name to search for
    const customerName = document.getElementById('customerName').value;

    if (!customerName) {
        alert('Please enter a customer name');
        return;
    }

    try {
        // Fetch customers based on the search name
        const response = await axios.get(`http://localhost:5000/customers?name=${customerName}`);

        // Check if the customer exists
        if (response.data.length === 0) {
            alert('No customer found with that name');
            return;
        }

        // Assuming there's only one customer, or you want to delete the first matching customer
        const customerToDelete = response.data[0]; // You can modify this if you want to delete multiple or choose one

        // Send DELETE request to update the customer's status to inactive
        const deleteResponse = await axios.delete(`http://localhost:5000/customers/delete/${customerToDelete.id}`);

        alert(deleteResponse.data.message); // Show success message

    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('There was an error deleting the customer');
    }
};
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

const displayLoans = async () => {
    // HTML for the loan filter options and the table display
    const htmlContent = `
        <div class="card">
            <div class="card-header" style="text-align: center;">Loans List</div>
            <div class="card-body">
                <div class="mb-3">
                    <label for="loanFilter" class="form-label">Filter Loans:</label>
                    <select id="loanFilter" class="form-select" onchange="filterLoans()">
                        <option value="all">All Loans</option>
                        <option value="active">Active Loans</option>
                        <option value="late">Late Loans</option>
                    </select>
                </div>
                <div id="loanTable"></div>
            </div>
        </div>
    `;

    // Inject HTML content into the page
    document.getElementById('content').innerHTML = htmlContent;

    // Initially, fetch and display all loans
    fetchAndDisplayLoans('all');
};

const filterLoans = () => {
    // Get the selected filter option
    const filter = document.getElementById('loanFilter').value;

    // Fetch and display loans based on the selected filter
    fetchAndDisplayLoans(filter);
};

fetchAndDisplayLoans = async (filter) => {
    try {
        let url = 'http://localhost:5000/loans';
        if (filter === 'active') url = 'http://localhost:5000/loans';
        else if (filter === 'late') url = 'http://localhost:5000/loans/late';

        const response = await axios.get(url);
        console.log('Fetched Loans:', response.data); // Debug backend data

        let tableHTML = `
            <table class="table table-striped table-hover table-bordered">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Book Name</th>
                        <th>Loan Date</th>
                        <th>Return Date</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
        `;

        response.data.forEach(loan => {
            console.log('Loan Entry:', loan); // Debug each loan entry
            tableHTML += `
                <tr>
                    <td>${loan.customer_name || 'Not Found'}</td> <!-- Display Customer Name -->
                    <td>${loan.book_name || 'Not Found'}</td>
                    <td>${loan.loan_date}</td>
                    <td>${loan.return_date || 'N/A'}</td>
                    <td>${loan.active ? 'Yes' : 'No'}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        document.getElementById('loanTable').innerHTML = tableHTML;
    } catch (error) {
        console.error('Error fetching loans:', error);
        document.getElementById('loanTable').innerHTML = `<p>Error loading loans: ${error.message}</p>`;
    }
};




// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------


function returnLoan() {
    document.getElementById("content").innerHTML = `
        <div class="card">
            <div class="card-header">Return a Loan</div>
            <div class="card-body">
                <h5 class="card-title">Return loan form here...</h5>
                <p class="card-text">Select the loan you want to return.</p>
            </div>
        </div>
    `;
}
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------


function searchLoan() {
    document.getElementById("content").innerHTML = `
        <div class="card">
            <div class="card-header">Search for a Loan</div>
            <div class="card-body">
                <h5 class="card-title">Search for a loan by details.</h5>
                <p class="card-text">Enter search criteria to find a loan.</p>
            </div>
        </div>
    `;
}
