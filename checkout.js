const stripe = Stripe("pk_test_51RpoJd2OmJYdIauYgwXqJXcJoMCQhcKbfm8FWh9FhuS6Pk72kjDc0DqC1t3orkO0mpcOt3embabRvcwVpEEFUCT800MUysCMdx");

document.addEventListener("DOMContentLoaded", function() {
    console.log('checkout.js loaded and DOMContentLoaded fired');

    const cartItemsContainer = document.getElementById("cart-items");
    const checkoutButton = document.getElementById("checkout-button");
    const clearCartButton = document.getElementById("clear-cart-button");
    const emptyCartMessage = document.getElementById("empty-cart-message");

    if (!cartItemsContainer || !emptyCartMessage || !checkoutButton || !clearCartButton) {
        console.error('One or more DOM elements not found', {
            cartItemsContainer: !!cartItemsContainer,
            emptyCartMessage: !!emptyCartMessage,
            checkoutButton: !!checkoutButton,
            clearCartButton: !!clearCartButton
        });
        alert('Error: Page elements not found. Check console for details.');
        return;
    }
    console.log('DOM elements found');

    let cart = [];
    try {
        const savedCart = localStorage.getItem("myCart");
        console.log('Raw cart data from localStorage:', savedCart);
        cart = savedCart ? JSON.parse(savedCart) : [];
        console.log('Parsed cart data:', cart);
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }

    if (cart.length === 0) {
        console.log('Cart is empty');
        emptyCartMessage.textContent = "Your cart is empty.";
        checkoutButton.disabled = true;
        clearCartButton.disabled = true;
        clearCartButton.classList.add("hidden");
        return;
    }

    console.log('Cart has items, rendering...');
    emptyCartMessage.style.display = "none";
    renderCartItems(cart, cartItemsContainer);
    checkoutButton.disabled = false; // Enable checkout for all users if cart has items
    clearCartButton.disabled = false;
    clearCartButton.classList.remove("hidden");
    setupEventListeners(cart, checkoutButton, clearCartButton);
});

function renderCartItems(cart, container) {
    console.log('Rendering cart items:', cart);
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        if (price <= 0 || quantity <= 0) {
            console.warn('Skipping invalid item:', item);
            return; // Skip invalid items
        }

        const itemDiv = document.createElement("div");
        itemDiv.className = "flex items-center gap-4 border-b py-4";
        itemDiv.setAttribute("role", "listitem");

        const img = document.createElement("img");
        img.src = item.image || 'placeholder.jpg';
        img.alt = item.name || 'Product Image';
        img.className = "w-20 h-20 object-cover rounded";

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "flex-1";
        detailsDiv.innerHTML = `
            <h2 class="font-semibold text-indigo-700">${item.name || 'Unnamed Product'}</h2>
            <p class="text-sm text-gray-500">Price: $${price.toFixed(2)}</p>
            <p class="text-sm text-gray-500">Quantity: <span class="font-medium">${quantity}</span></p>
        `;

        const itemTotal = price * quantity;
        const totalSpan = document.createElement("span");
        totalSpan.className = "text-gray-800 font-semibold";
        totalSpan.textContent = `$${itemTotal.toFixed(2)}`;

        itemDiv.appendChild(img);
        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(totalSpan);
        container.appendChild(itemDiv);

        total += itemTotal;
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "flex justify-between items-center border-t pt-4 mt-4 font-bold text-lg";
    totalDiv.innerHTML = `
        <span>Total:</span>
        <span>$${total.toFixed(2)}</span>
    `;
    container.appendChild(totalDiv);
    console.log('Cart rendering complete, total:', total);
}

function setupEventListeners(cart, checkoutButton, clearCartButton) {
    console.log('Setting up event listeners for buttons');
    checkoutButton.addEventListener("click", async function() {
        try {
            console.log('Checkout button clicked, initiating Stripe process');
            checkoutButton.disabled = true;
            checkoutButton.textContent = "Processing...";

            const response = await fetch('http://localhost:36793/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create checkout session: ${response.status}`);
            }

            const data = await response.json();
            if (data.sessionId) {
                console.log('Received Stripe session ID:', data.sessionId);
                const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
                if (result.error) {
                    throw new Error(result.error.message);
                }
            } else {
                throw new Error('No session ID returned from server');
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert(`Checkout failed: ${error.message}. Please try again or contact support.`);
        } finally {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Proceed to Payment";
            console.log('Checkout process completed or failed, button re-enabled');
        }
    });

    // Clear cart button
    clearCartButton.addEventListener("click", function() {
        console.log('Clear cart button clicked');
        if (confirm("Are you sure you want to clear your cart?")) {
            try {
                localStorage.removeItem("myCart");
                console.log('Cart cleared from localStorage');
                location.reload();
            } catch (error) {
                console.error("Error clearing cart:", error);
                alert("Failed to clear cart. Please try again.");
            }
        }
    });
}
