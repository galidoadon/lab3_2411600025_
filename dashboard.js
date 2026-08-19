var orders = [
    { table: 'Table 01', customer: 'Walk-in Guest', items: '2x Beef Steak, 1x Iced Tea', bill: '₱1,250', status: 'Served', badge: 'bg-success' },
    { table: 'Table 04', customer: 'Reserved (Party)', items: '1x Seafood Pasta, 2x Fresh Juice', bill: '₱980', status: 'Preparing', badge: 'bg-warning text-dark' },
    { table: 'Table 07', customer: 'Walk-in Guest', items: '3x Grilled Chicken, 3x Soft Drinks', bill: '₱1,420', status: 'Pending', badge: 'bg-danger' },
    { table: 'Table 10', customer: 'Adonis Eugenio', items: '1x Chef Special Burger, 1x Coffee', bill: '₱450', status: 'Served', badge: 'bg-success' }
];

document.addEventListener('DOMContentLoaded', function() {

    var isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }


    var username = localStorage.getItem('user');
    if (username) {
        document.getElementById('userName').textContent = 'Manager: ' + username;
    }

    setGreeting(username);

    loadStats();
    loadTableData();

    var addOrderBtn = document.getElementById('addOrderBtn');
    addOrderBtn.addEventListener('click', function() {
        addNewOrder();
    });

    var logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        // Clear login credentials from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

function setGreeting(name) {
    var greetingElement = document.getElementById('greeting');
    var hour = new Date().getHours();
    var greetingText = '';

    if (hour < 12) {
        greetingText = 'Good Morning, ';
    } else if (hour < 18) {
        greetingText = 'Good Afternoon, ';
    } else {
        greetingText = 'Good Evening, ';
    }

    greetingElement.textContent = greetingText + name + '! Ready for shift service?';
}

function loadStats() {
    document.getElementById('stat1-title').textContent = 'Total Orders Today';
    document.getElementById('stat1-value').textContent = orders.length;

    document.getElementById('stat2-title').textContent = "Today's Revenue";
    document.getElementById('stat2-value').textContent = '₱24,850';

    document.getElementById('stat3-title').textContent = 'Pending Orders';
    document.getElementById('stat3-value').textContent = '3';

    document.getElementById('stat4-title').textContent = 'Tables Occupied';
    document.getElementById('stat4-value').textContent = '8 / 12';
}


function loadTableData() {
    var tableBody = document.getElementById('orderTableBody');
    tableBody.innerHTML = '';

    
    for (var i = 0; i < orders.length; i++) {
        var row = '<tr>' +
            '<td class="fw-bold">' + orders[i].table + '</td>' +
            '<td>' + orders[i].customer + '</td>' +
            '<td>' + orders[i].items + '</td>' +
            '<td>' + orders[i].bill + '</td>' +
            '<td><span class="badge ' + orders[i].badge + '">' + orders[i].status + '</span></td>' +
            '</tr>';
        
        tableBody.innerHTML += row;
    }
}

function addNewOrder() {
    var tableInput = document.getElementById('tableName').value;
    var customerInput = document.getElementById('customerName').value;
    var itemsInput = document.getElementById('orderItems').value;
    var billInput = document.getElementById('totalBill').value;
    var statusInput = document.getElementById('orderStatus').value;

    // Simple validation
    if (tableInput === '' || customerInput === '' || itemsInput === '' || billInput === '') {
        alert('Please fill out all fields before adding an order.');
        return;
    }

    var badgeClass = 'bg-success';
    if (statusInput === 'Pending') {
        badgeClass = 'bg-danger';
    } else if (statusInput === 'Preparing') {
        badgeClass = 'bg-warning text-dark';
    }

    var newOrder = {
        table: tableInput,
        customer: customerInput,
        items: itemsInput,
        bill: billInput,
        status: statusInput,
        badge: badgeClass
    };

    orders.push(newOrder);

    loadTableData();
    loadStats();

    document.getElementById('tableName').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('orderItems').value = '';
    document.getElementById('totalBill').value = '';
}