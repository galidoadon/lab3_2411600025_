var menuItems = [
    { id: 1, name: 'Hungarian Beef', price: 550, stock: 12 },
    { id: 2, name: 'Premium Overload Burger', price: 420, stock: 18 },
    { id: 3, name: 'Refreshments', price: 180, stock: 25 },
    { id: 4, name: 'Coke', price: 120, stock: 30 },
    { id: 5, name: 'Beef Steak', price: 650, stock: 14 },
    { id: 6, name: 'Iced Tea', price: 90, stock: 40 },
    { id: 7, name: 'Grilled Chicken', price: 320, stock: 16 },
    { id: 8, name: 'Soft Drinks', price: 110, stock: 34 }
];

var orders = [
    { id: 1, table: 'Table 1', customer: 'Walk-in Guest', items: 'Hungarian Beef, Iced Tea', bill: '₱640', status: 'Pending', badge: 'bg-danger' },
    { id: 2, table: 'Table 4', customer: 'Reserved (Party)', items: 'Premium Overload Burger, Refreshments', bill: '₱600', status: 'Preparing', badge: 'bg-warning text-dark' },
    { id: 3, table: 'Table 7', customer: 'Walk-in Guest', items: 'Grilled Chicken, Coke', bill: '₱440', status: 'Served', badge: 'bg-success' },
    { id: 4, table: 'Table 0', customer: 'Adonis Eugenio', items: 'Beef Steak, Soft Drinks', bill: '₱760', status: 'Pending', badge: 'bg-danger' }
];

var reservations = [];

var cart = [];

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
    populateMenuOptions();
    populateRestockOptions();
    loadStats();
    loadTableData();
    loadReservationData();
    renderProductChart();
    renderCart();
    updateTotalBill();

    document.getElementById('addToCartBtn').addEventListener('click', addItemToCart);
    document.getElementById('addOrderBtn').addEventListener('click', addNewOrder);
    document.getElementById('addProductBtn').addEventListener('click', addNewProductToMenu);
    document.getElementById('restockBtn').addEventListener('click', addStockToProduct);
    document.getElementById('addReservationBtn').addEventListener('click', addReservation);
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    document.getElementById('orderTableBody').addEventListener('click', handleOrderAction);
    document.getElementById('reservationTableBody').addEventListener('click', handleReservationDelete);
    document.getElementById('cartItems').addEventListener('click', handleCartItemDelete);
    document.getElementById('productSelect').addEventListener('change', updateTotalBill);
    document.getElementById('quantityInput').addEventListener('input', updateTotalBill);
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

    greetingElement.textContent = greetingText + (name || 'Manager') + '! Ready for shift service?';
}

function populateMenuOptions() {
    var productSelect = document.getElementById('productSelect');
    productSelect.innerHTML = '';

    menuItems.forEach(function(item) {
        var option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name + ' - ₱' + item.price + ' (Stock: ' + item.stock + ')';
        productSelect.appendChild(option);
    });
}

function populateRestockOptions() {
    var restockSelect = document.getElementById('restockProductSelect');
    restockSelect.innerHTML = '';

    menuItems.forEach(function(item) {
        var option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name + ' - Current Stock: ' + item.stock;
        restockSelect.appendChild(option);
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0
    }).format(value);
}

function renderProductChart() {
    var ctx = document.getElementById('productStockChart');
    if (!ctx || typeof Chart === 'undefined') return;

    var labels = menuItems.map(function(item) {
        return item.name;
    });
    var data = menuItems.map(function(item) {
        return item.stock;
    });

    if (window.productStockChartInstance) {
        window.productStockChartInstance.destroy();
    }

    window.productStockChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Available Stock',
                data: data,
                backgroundColor: ['#8b0000', '#c03f3f', '#d97706', '#f59e0b', '#2563eb', '#10b981', '#14b8a6', '#a78bfa'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 20
                    }
                }
            }
        }
    });
}

function calculateCartTotal() {
    return cart.reduce(function(total, item) {
        return total + (item.price * item.quantity);
    }, 0);
}

function addItemToCart() {
    var productSelect = document.getElementById('productSelect');
    var quantityInput = document.getElementById('quantityInput');
    var selectedProductId = Number(productSelect.value);
    var selectedQuantity = Number(quantityInput.value) || 1;

    if (selectedQuantity < 1) {
        alert('Please enter a valid quantity.');
        return;
    }

    var selectedProduct = menuItems.find(function(item) {
        return item.id === selectedProductId;
    });

    if (!selectedProduct) {
        alert('Please select a valid menu item.');
        return;
    }

    if (selectedQuantity > selectedProduct.stock) {
        alert('Not enough stock available for ' + selectedProduct.name + '. Available stock: ' + selectedProduct.stock);
        return;
    }

    var existingItem = cart.find(function(item) {
        return item.id === selectedProduct.id;
    });

    var cartQuantity = existingItem ? existingItem.quantity : 0;
    var totalRequestedQuantity = cartQuantity + selectedQuantity;

    if (totalRequestedQuantity > selectedProduct.stock) {
        alert('This would exceed the available stock for ' + selectedProduct.name + '. Available stock: ' + selectedProduct.stock);
        return;
    }

    if (existingItem) {
        existingItem.quantity += selectedQuantity;
    } else {
        cart.push({
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: selectedQuantity
        });
    }

    quantityInput.value = 1;
    renderCart();
    updateTotalBill();
}

function renderCart() {
    var cartItems = document.getElementById('cartItems');
    var cartCount = document.getElementById('cartCount');

    if (cart.length === 0) {
        cartItems.innerHTML = 'No items added yet.';
        cartCount.textContent = '0 items';
        return;
    }

    var totalQty = cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);

    cartCount.textContent = totalQty + ' items';
    cartItems.innerHTML = cart.map(function(item) {
        return '<div class="d-flex justify-content-between align-items-center border-bottom py-2 gap-2">' +
            '<span>' + item.name + ' x ' + item.quantity + '</span>' +
            '<div class="d-flex align-items-center gap-2">' +
                '<span class="fw-semibold">' + formatCurrency(item.price * item.quantity) + '</span>' +
                '<button class="btn btn-sm btn-outline-danger" data-cart-id="' + item.id + '">Remove</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

function handleCartItemDelete(event) {
    var target = event.target;
    if (!target.matches('button')) return;

    var itemId = Number(target.getAttribute('data-cart-id'));
    cart = cart.filter(function(item) {
        return item.id !== itemId;
    });

    renderCart();
    updateTotalBill();
}

function updateTotalBill() {
    var totalBillInput = document.getElementById('totalBill');
    var productSelect = document.getElementById('productSelect');
    var quantityInput = document.getElementById('quantityInput');

    if (cart.length === 0) {
        var selectedProduct = menuItems.find(function(item) {
            return item.id === Number(productSelect.value);
        });
        var previewQuantity = Number(quantityInput.value) || 1;
        totalBillInput.value = selectedProduct ? formatCurrency(selectedProduct.price * previewQuantity) : '₱0';
        return;
    }

    totalBillInput.value = formatCurrency(calculateCartTotal());
}

function loadStats() {
    document.getElementById('stat1-title').textContent = 'Total Orders Today';
    document.getElementById('stat1-value').textContent = orders.length;

    var revenue = orders.reduce(function(total, order) {
        var numericValue = Number(String(order.bill).replace(/[^\d]/g, ''));
        return total + numericValue;
    }, 0);

    document.getElementById('stat2-title').textContent = "Today's Revenue";
    document.getElementById('stat2-value').textContent = formatCurrency(revenue);

    var pendingCount = orders.filter(function(order) {
        return order.status === 'Pending';
    }).length;
    document.getElementById('stat3-title').textContent = 'Pending Orders';
    document.getElementById('stat3-value').textContent = pendingCount;

    document.getElementById('stat4-title').textContent = 'Tables Occupied';
    document.getElementById('stat4-value').textContent = orders.length + ' / 12';
}

function getStatusBadge(status) {
    if (status === 'Pending') return 'bg-danger';
    if (status === 'Preparing') return 'bg-warning text-dark';
    return 'bg-success';
}

function loadTableData() {
    var tableBody = document.getElementById('orderTableBody');
    tableBody.innerHTML = '';

    orders.forEach(function(order) {
        var preparingButtonDisabled = order.status !== 'Pending';
        var servedButtonDisabled = order.status !== 'Preparing';

        var row = '<tr>' +
            '<td class="fw-bold">' + order.table + '</td>' +
            '<td>' + order.customer + '</td>' +
            '<td>' + order.items + '</td>' +
            '<td>' + order.bill + '</td>' +
            '<td><span class="badge ' + getStatusBadge(order.status) + '">' + order.status + '</span></td>' +
            '<td>' +
                '<button class="btn btn-sm btn-warning me-2" data-action="preparing" data-id="' + order.id + '" ' + (preparingButtonDisabled ? 'disabled' : '') + '>Preparing</button>' +
                '<button class="btn btn-sm btn-success" data-action="served" data-id="' + order.id + '" ' + (servedButtonDisabled ? 'disabled' : '') + '>Served</button>' +
            '</td>' +
            '</tr>';

        tableBody.innerHTML += row;
    });
}

function handleOrderAction(event) {
    var target = event.target;
    if (!target.matches('button')) return;

    var action = target.getAttribute('data-action');
    var orderId = Number(target.getAttribute('data-id'));
    var order = orders.find(function(item) {
        return item.id === orderId;
    });

    if (!order) return;

    if (action === 'preparing') {
        order.status = 'Preparing';
        order.badge = 'bg-warning text-dark';
    }

    if (action === 'served') {
        order.status = 'Served';
        order.badge = 'bg-success';
    }

    loadTableData();
    loadStats();
}

function loadReservationData() {
    var reservationBody = document.getElementById('reservationTableBody');
    reservationBody.innerHTML = '';

    reservations.forEach(function(reservation) {
        var row = '<tr>' +
            '<td>' + reservation.customer + '</td>' +
            '<td>' + reservation.date + '</td>' +
            '<td>' + reservation.time + '</td>' +
            '<td>' + reservation.guests + '</td>' +
            '<td>' + reservation.table + '</td>' +
            '<td><button class="btn btn-sm btn-outline-danger" data-reservation-id="' + reservation.id + '">Delete</button></td>' +
            '</tr>';

        reservationBody.innerHTML += row;
    });
}

function handleReservationDelete(event) {
    var target = event.target;
    if (!target.matches('button')) return;

    var reservationId = Number(target.getAttribute('data-reservation-id'));
    reservations = reservations.filter(function(reservation) {
        return reservation.id !== reservationId;
    });

    loadReservationData();
}

function addReservation() {
    var customer = document.getElementById('reservationCustomer').value.trim();
    var date = document.getElementById('reservationDate').value;
    var time = document.getElementById('reservationTime').value;
    var guests = Number(document.getElementById('reservationGuests').value) || 1;
    var table = document.getElementById('reservationTable').value.trim();

    if (!customer || !date || !time || !table) {
        alert('Please fill in all reservation fields.');
        return;
    }

    reservations.push({
        id: Date.now(),
        customer: customer,
        date: date,
        time: time,
        guests: guests,
        table: table
    });

    document.getElementById('reservationForm').reset();
    document.getElementById('reservationGuests').value = 2;
    loadReservationData();
    alert('Reservation added successfully.');
}

function addNewOrder() {
    var orderTypeInput = document.getElementById('orderType').value;
    var tableInput = document.getElementById('tableName').value.trim();
    var customerInput = document.getElementById('customerName').value.trim();
    var totalBillValue = calculateCartTotal();

    if (orderTypeInput === 'Dine In' && tableInput === '') {
        alert('Please enter a table number for dine-in orders.');
        return;
    }

    if (customerInput === '' || cart.length === 0) {
        alert('Please enter customer name and at least one item in the cart.');
        return;
    }

    cart.forEach(function(cartItem) {
        var item = menuItems.find(function(menuItem) {
            return menuItem.id === cartItem.id;
        });

        if (item) {
            item.stock = Math.max(0, item.stock - cartItem.quantity);
        }
    });

    var orderText = cart.map(function(item) {
        return item.name + ' x' + item.quantity;
    }).join(', ');

    var tableLabel = orderTypeInput === 'Take Out' ? 'Take Out' : tableInput;

    var newOrder = {
        id: Date.now(),
        orderType: orderTypeInput,
        table: tableLabel,
        customer: customerInput,
        items: orderText,
        bill: formatCurrency(totalBillValue),
        status: 'Pending',
        badge: 'bg-danger'
    };

    orders.push(newOrder);

    cart = [];
    document.getElementById('orderType').value = 'Dine In';
    document.getElementById('tableName').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('quantityInput').value = 1;
    populateMenuOptions();
    populateRestockOptions();
    renderProductChart();
    renderCart();
    updateTotalBill();
    loadTableData();
    loadStats();
}

function addNewProductToMenu() {
    var productName = document.getElementById('newProductName').value.trim();
    var productPrice = Number(document.getElementById('newProductPrice').value);
    var productStock = Number(document.getElementById('newProductStock').value) || 0;

    if (!productName || productPrice <= 0) {
        alert('Please enter a valid product name and price.');
        return;
    }

    var duplicate = menuItems.some(function(item) {
        return item.name.toLowerCase() === productName.toLowerCase();
    });

    if (duplicate) {
        alert('This product already exists in the menu.');
        return;
    }

    var newProduct = {
        id: Date.now(),
        name: productName,
        price: productPrice,
        stock: productStock
    };

    menuItems.push(newProduct);
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductStock').value = 0;

    populateMenuOptions();
    populateRestockOptions();
    renderProductChart();
    updateTotalBill();
    alert('New product added to the menu.');
}

function addStockToProduct() {
    var productId = Number(document.getElementById('restockProductSelect').value);
    var addQuantity = Number(document.getElementById('restockQuantity').value) || 0;

    if (addQuantity <= 0) {
        alert('Please enter a valid quantity greater than zero.');
        return;
    }

    var item = menuItems.find(function(menuItem) {
        return menuItem.id === productId;
    });

    if (!item) {
        alert('Product not found.');
        return;
    }

    item.stock += addQuantity;
    document.getElementById('restockQuantity').value = 10;
    populateMenuOptions();
    populateRestockOptions();
    renderProductChart();
    updateTotalBill();
    alert('Added ' + addQuantity + ' more units to ' + item.name + '. New stock: ' + item.stock);
}

function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
