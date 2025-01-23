const showBooks = async (searchQuery = '') => {
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
            <div class="card">
                <div class="card-header" style="text-align: center;">Books List</div>
                <div class="card-body">
                    <!-- Search by book name -->
                    <div class="mb-3">
                        <label for="searchInput" class="form-label">Search by Name:</label>
                        <input type="text" id="searchInput" class="form-control" placeholder="Enter book name" value="${searchQuery}">
                    </div>
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

        // Filter books based on the search query
        const filteredBooks = books.filter(book => {
            return book.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        // If no books match the search query
        if (filteredBooks.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="5" style="text-align: center;">No books found matching the search criteria</td>
                </tr>
            `;
        } else {
            // Loop through the filtered books and create a table row for each book
            filteredBooks.forEach(book => {
                let daysToLoan;
                switch (book.type) {
                    case 1: daysToLoan = '10 days'; break;
                    case 2: daysToLoan = '5 days'; break;
                    case 3: daysToLoan = '2 days'; break;
                    default: daysToLoan = 'Unknown'; break;
                }

                tableHTML += `
                    <tr>
                        <td style="text-align: center;">${book.name}</td>
                        <td style="text-align: center;">${book.author}</td>
                        <td style="text-align: center;">${book.year_published}</td>
                        <td style="text-align: center;">${daysToLoan}</td>
                        <td style="text-align: center;">${book.active ? 'Yes' : 'No'}</td>
                    </tr>
                `;
            });
        }

        // End the table HTML
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        // Set the HTML content inside the #content div
        document.getElementById('content').innerHTML = tableHTML;

        // Add event listener to the search input
        document.getElementById('searchInput').addEventListener('input', (event) => {
            showBooks(event.target.value);  // Re-render with the updated search query
        });

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