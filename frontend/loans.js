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

const fetchAndDisplayLoans = async (filter) => {
    try {
        let url = 'http://localhost:5000/loans';
        if (filter === 'active') url = 'http://localhost:5000/loans?active=true';
        else if (filter === 'late') url = 'http://localhost:5000/loans/late';

        const response = await axios.get(url);
        console.log('Fetched Loans:', response.data);

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
            tableHTML += `
                <tr>
                    <td>${loan.customer_name || 'Not Found'}</td>
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


async function returnLoan() {
    document.getElementById("content").innerHTML = `
        <div class="card">
            <div class="card-header">Return a Loan</div>
            <div class="card-body">
                <h5 class="card-title">Return loan form here...</h5>
                <p class="card-text">Select the loan you want to return:</p>
                <div class="mb-3">
                    <label for="loanSelect" class="form-label">Select Loan</label>
                    <select id="loanSelect" class="form-select">
                        <!-- Options will be dynamically populated here -->
                    </select>
                </div>
                <button id="returnLoanBtn" class="btn btn-primary">Return Loan</button>
            </div>
        </div>
    `;

    // Fetch active loans from the backend
    try {
        const response = await axios.get('http://localhost:5000/loans');
        const loans = response.data;

        // Populate the loan select dropdown
        const loanSelect = document.getElementById("loanSelect");
        loans.forEach(loan => {
            if (loan.active) {
                const option = document.createElement("option");
                option.value = `${loan.cust_id}-${loan.book_id}`;
                option.textContent = `${loan.customer_name} - ${loan.book_name}`;
                loanSelect.appendChild(option);
            }
        });

        // Add event listener for return button
        document.getElementById("returnLoanBtn").addEventListener("click", async () => {
            const selectedLoan = document.getElementById("loanSelect").value;
            if (selectedLoan) {
                const [cust_id, book_id] = selectedLoan.split('-');
                try {
                    await axios.put(`http://localhost:5000/loans/return/${cust_id}/${book_id}`);
                    alert("Loan returned successfully!");
                } catch (error) {
                    console.error("Error returning loan:", error);
                    alert("Failed to return loan.");
                }
            } else {
                alert("Please select a loan to return.");
            }
        });
    } catch (error) {
        console.error("Error fetching loans:", error);
        alert("Failed to load loans.");
    }
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
                <div class="mb-3">
                    <label for="customerName" class="form-label">Customer Name:</label>
                    <input type="text" class="form-control" id="customerName" placeholder="Enter customer name">
                </div>
                <div class="mb-3">
                    <label for="bookName" class="form-label">Book Name:</label>
                    <input type="text" class="form-control" id="bookName" placeholder="Enter book name">
                </div>
                <button class="btn btn-primary" onclick="fetchLoanBySearch()">Search</button>
                <div id="searchResult"></div>
            </div>
        </div>
    `;
}

async function fetchLoanBySearch() {
    const customerName = document.getElementById('customerName').value;
    const bookName = document.getElementById('bookName').value;

    let url = 'http://localhost:5000/loans/search?';
    if (customerName) url += `customer_name=${customerName}&`;
    if (bookName) url += `book_name=${bookName}&`;

    // Remove the trailing '&' if present
    url = url.slice(0, -1);

    try {
        const response = await axios.get(url);
        const loans = response.data;

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

        loans.forEach(loan => {
            tableHTML += `
                <tr>
                    <td>${loan.customer_name || 'Not Found'}</td>
                    <td>${loan.book_name || 'Not Found'}</td>
                    <td>${loan.loan_date}</td>
                    <td>${loan.return_date || 'N/A'}</td>
                    <td>${loan.active ? 'Yes' : 'No'}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        document.getElementById('searchResult').innerHTML = tableHTML;
    } catch (error) {
        console.error('Error searching loans:', error);
        document.getElementById('searchResult').innerHTML = `<p>Error searching loans: ${error.message}</p>`;
    }
}
