
const stripe = Stripe("pk_test_51RpoJd2OmJYdIauYgwXqJXcJoMCQhcKbfm8FWh9FhuS6Pk72kjDc0DqC1t3orkO0mpcOt3embabRvcwVpEEFUCT800MUysCMdx");

document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("myCart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p class='text-center text-gray-500'>Your cart is empty.</p>";
    document.getElementById("checkout-button").disabled = true;
    document.getElementById("clear-cart-button").style.display = "none";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "flex items-center gap-4 border-b py-4";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.className = "w-20 h-20 object-cover rounded";

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "flex-1";

    detailsDiv.innerHTML = `
      <h2 class="font-semibold text-indigo-700">${item.name}</h2>
      <p class="text-sm text-gray-500">Price: $${parseFloat(item.price).toFixed(2)}</p>
      <p class="text-sm text-gray-500">Quantity: <span class="font-medium">${item.quantity}</span></p>
    `;

    const itemTotal = parseFloat(item.price) * item.quantity;
    const totalSpan = document.createElement("span");
    totalSpan.className = "text-gray-800 font-semibold";
    totalSpan.textContent = `$${itemTotal.toFixed(2)}`;

    itemDiv.appendChild(img);
    itemDiv.appendChild(detailsDiv);
    itemDiv.appendChild(totalSpan);
    cartItemsContainer.appendChild(itemDiv);

    total += itemTotal;
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "flex justify-between items-center border-t pt-4 mt-4 font-bold text-lg";
  totalDiv.innerHTML = `
    <span>Total:</span>
    <span>$${total.toFixed(2)}</span>
  `;
  cartItemsContainer.appendChild(totalDiv);

  // Checkout button
  document.getElementById("checkout-button").addEventListener("click", () => {
    fetch('http://localhost:36793/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionId) {
          return stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          alert("Checkout failed.");
        }
      })
      .catch((err) => {
        console.error("Error creating checkout session:", err);
        alert("Something went wrong.");
      });
  });

  // Clear cart button
  document.getElementById("clear-cart-button").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      localStorage.removeItem("myCart");
      location.reload();
    }
  });
});

