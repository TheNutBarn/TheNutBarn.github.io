
// Cart functionality
let cart = [];
let cartTotal = 0;

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update nav active state
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
}

function addToCart(productName, price, productId) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }

    updateCartDisplay();

    // Show brief confirmation
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.background = '#4CAF50';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#8B4513';
    }, 1000);
}

function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    document.getElementById('cart-count').textContent = cartCount;

    const cartItems = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div>
                            <strong>${item.name}</strong><br>
                            Quantity: ${item.quantity}
                        </div>
                        <div>
                            $${(item.price * item.quantity).toFixed(2)}
                            <button onclick="removeFromCart('${item.id}')" style="background: #ff4444; color: white; border: none; padding: 0.3rem 0.6rem; margin-left: 0.5rem; border-radius: 3px; cursor: pointer;">Remove</button>
                        </div>
                    </div>
                `).join('');
    }

    document.getElementById('cart-total').textContent = `Total: $${cartTotal.toFixed(2)}`;

    // Update order summary
    updateOrderSummary();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    toggleCart();
    showSection('contact');
}

function updateOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');

    if (cart.length === 0) {
        summaryItems.innerHTML = 'Your cart is empty';
        summaryTotal.textContent = 'Total: $0.00';
    } else {
        summaryItems.innerHTML = cart.map(item => `
                    <div>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</div>
                `).join('');

        const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        summaryTotal.textContent = `Total: $${total.toFixed(2)}`;
    }
}

// Form submission
document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert('Please add items to your cart before submitting an order.');
        return;
    }

    // Get form data
    const formData = new FormData(this);
    const orderData = {
        customer: {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip')
        },
        paymentMethod: formData.get('payment-method'),
        specialInstructions: formData.get('special-instructions'),
        items: cart,
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString(),
        orderNumber: 'NB' + Date.now()
    };

    // Create email content for order notification
    const emailContent = `
NEW ORDER RECEIVED - ${orderData.orderNumber}

Site Version: v${TNB_ENV.version}

Customer Information:
Name: ${orderData.customer.firstName} ${orderData.customer.lastName}
Email: ${orderData.customer.email}
Phone: ${orderData.customer.phone}

Shipping Address:
${orderData.customer.address}
${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zip}

Order Details:
${orderData.items.map(item => `${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: ${orderData.total.toFixed(2)}
Payment Method: ${orderData.paymentMethod}

Special Instructions:
${orderData.specialInstructions || 'None'}

Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}

---
FULFILLMENT CHECKLIST:
□ Contact customer to confirm payment
□ Prepare ${orderData.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
□ Package items securely
□ Print shipping label
□ Send tracking information to customer
□ Ship order
            `.trim();

    // Create mailto link for order notification
    const subject = encodeURIComponent(`New Order ${orderData.orderNumber} - The Nut Barn`);
    const body = encodeURIComponent(emailContent);
    const mailtoLink = `mailto:thenutbarnllc@gmail.com?subject=${subject}&body=${body}`;

    // Open email client
    window.open(mailtoLink, '_blank');

    // Show success message
    document.getElementById('success-message').style.display = 'block';

    // Reset form and cart
    this.reset();
    cart = [];
    updateCartDisplay();

    // Scroll to success message
    document.getElementById('success-message').scrollIntoView({ behavior: 'smooth' });
});

// Close cart modal when clicking outside
document.getElementById('cart-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleCart();
    }
});

/* From V2:

// Cart functionality
let cart = [];
let cartCount = 0;
let cartTotal = 0;

function changeQuantity(productId, change) {
    const qtyInput = document.getElementById(productId + '-qty');
    let currentQty = parseInt(qtyInput.value);
    currentQty += change;
    if (currentQty < 1) currentQty = 1;
    qtyInput.value = currentQty;
}

function addToCart(productId, productName, price) {
    const qtyInput = document.getElementById(productId + '-qty');
    const quantity = parseInt(qtyInput.value);

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity
        });
    }

    updateCartDisplay();

    // Reset quantity to 1
    qtyInput.value = 1;

    // Show success message
    alert(`${productName} added to cart!`);
}

function updateCartDisplay() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    document.getElementById('cart-count').textContent = cartCount;
    document.getElementById('cart-total').textContent = `Total: $${cartTotal.toFixed(2)}`;

    const cartItemsDiv = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div>
                            <strong>${item.name}</strong><br>
                            $${item.price.toFixed(2)} x ${item.quantity}
                        </div>
                        <div>
                            <button onclick="removeFromCart('${item.id}')" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remove</button>
                        </div>
                    </div>
                `).join('');
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Create order summary
    const orderSummary = cart.map(item =>
        `${item.name} - Quantity: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const orderTotal = `\nTotal: $${cartTotal.toFixed(2)}`;

    // For now, we'll create a mailto link with the order
    const subject = 'Nut Barn Online Order';
    const body = `Hello! I'd like to place an order:\n\n${orderSummary}${orderTotal}\n\nPlease let me know how to proceed with payment and shipping. Thank you!`;

    const mailtoLink = `mailto:thenutbarnllc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    // Clear cart after checkout
    cart = [];
    updateCartDisplay();
    toggleCart();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Close cart when clicking outside
document.getElementById('cart-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleCart();
    }
});
*/