const showCustomers = async (filterActive = false, searchQuery = '') => {
    try {
        // Create the HTML structure for displaying customers, filter, and search
        let customersHTML = `
            <div class="card">
                <div class="card-header" style="text-align: center;">
                    <div>
                        <label>
                            All Customers
                        </label>
                    </div>
                </div>
                <div>
                    >>Show active users only
                    <input type="checkbox" id="activeFilter" ${filterActive ? 'checked' : ''}>
                </div>
                <div class="card-body">
                    <!-- Search by name -->
                    <div class="mb-3">
                        <label for="searchInput" class="form-label">Search by Name:</label>
                        <input type="text" id="searchInput" class="form-control" placeholder="Enter customer name" value="${searchQuery}">
                    </div>
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
            // Filter the customers based on the active status and search query
            const filteredCustomers = response.data.filter(customer => {
                const matchesActive = filterActive ? customer.active : true;
                const matchesName = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesActive && matchesName;
            });

            if (filteredCustomers.length === 0) {
                customersHTML += `
                    <tr>
                        <td colspan="4" style="text-align: center;">No customers found matching the criteria</td>
                    </tr>
                `;
            } else {
                // Loop through the filtered customers and add them to the table
                filteredCustomers.forEach(customer => {
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

        // Add event listener to the filter checkbox
        document.getElementById('activeFilter').addEventListener('change', (event) => {
            showCustomers(event.target.checked, document.getElementById('searchInput').value);  // Re-render with the updated filter
        });

        // Add event listener to the search input
        document.getElementById('searchInput').addEventListener('input', (event) => {
            showCustomers(document.getElementById('activeFilter').checked, event.target.value);  // Re-render with the updated search query
        });

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