const CSV_PATH = 'data/data.csv';

let products = []; // <-- global array to hold all products
let currentProduct = null;
const cart = [];

const dialog = document.getElementById('product-modal');
const backdrop = document.getElementById('modal-backdrop');
const cancelBtn = document.getElementById('modal-cancel');

function openModal() {
  backdrop.classList.remove('hidden');
  dialog.showModal();
}

function closeModal() {
  dialog.close();
  backdrop.classList.add('hidden');
}

cancelBtn.addEventListener('click', closeModal);
dialog.addEventListener('cancel', closeModal);
backdrop.addEventListener('click', closeModal);

async function fetchCSV(path) {
  const res = await fetch(path);
  const text = await res.text();
  return parseCSV(text);
}

function parseCSV(data) {
  const [headerLine, ...lines] = data.trim().split('\n');
  const headers = headerLine.split(',');
  return lines.map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i] ? values[i].trim() : '';
      return obj;
    }, {});
  });
}

function setupCategoryLinks() {
  document.querySelectorAll('#category-links a[data-category]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const selected = link.dataset.category;
      const filtered = selected === 'All' ? products : products.filter(p => p.category === selected);
      renderProductList(filtered);
    });
  });
}

function renderProductList(productList) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  productList.forEach(product => container.appendChild(createProductCard(product)));
}

function createProductCard(product) {
  const div = document.createElement('div');
  div.className = 'card bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow';

  div.innerHTML = `
    <figure class="p-4">
      <img 
        src="${product.image}" 
        alt="${product.name}" 
        class="mx-auto object-contain h-48 w-full border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
      />
    </figure>
    <div class="px-4 pb-4 text-center">
      <h2 class="font-semibold text-lg">${product.name}</h2>
      <p class="text-gray-500 text-sm mt-1">${product.description}</p>
      <p class="text-indigo-600 font-bold text-base mt-2">$${parseFloat(product.price).toFixed(2)}</p>
      <button
        class="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow transition-all duration-150"
        type="button"
      >
        View Details
      </button>
    </div>
  `;

  const btn = div.querySelector('button');
  btn.addEventListener('click', () => showProductDetail(product));

  return div;
}

function showProductDetail(product) {
  currentProduct = product;

  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-price').textContent = `$${parseFloat(product.price).toFixed(2)}`;
  document.getElementById('modal-description').textContent = product.description;
  document.getElementById('modal-image').src = product.image;
  document.getElementById('quantity').value = 1;

  const modal = document.getElementById('product-modal');
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    alert('Your browser does not support the dialog element.');
  }
}

function saveCart() {
  localStorage.setItem('myCart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('myCart');
  if (saved) {
    const parsed = JSON.parse(saved);
    cart.length = 0;
    parsed.forEach(item => cart.push(item));
  }
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const countElem = document.getElementById('cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems > 0) {
    countElem.textContent = totalItems;
    countElem.classList.remove('hidden');
  } else {
    countElem.classList.add('hidden');
  }
  saveCart();
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Cart is currently empty.</p>';
    return;
  }

  cart.forEach(item => {
    const itemElem = document.createElement('div');
    itemElem.className = 'flex items-center justify-between mb-4';

    itemElem.innerHTML = `
      <div>
        <p class="font-semibold">${item.name}</p>
        <p class="text-sm text-gray-600">${item.quantity} × $${parseFloat(item.price).toFixed(2)}</p>
      </div>
      <p class="font-semibold">$${(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
    `;

    container.appendChild(itemElem);
  });

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const totalElem = document.createElement('p');
  totalElem.className = 'font-bold mt-4 text-right text-indigo-700 text-lg';
  totalElem.textContent = `Total: $${total.toFixed(2)}`;
  container.appendChild(totalElem);
}

function addToCart(quantity) {
  if (!currentProduct) return;

  const qty = parseInt(quantity);
  if (!qty || qty < 1) {
    alert('Please enter a valid quantity.');
    return;
  }

  const existingIndex = cart.findIndex(item => item.id === currentProduct.id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({ ...currentProduct, quantity: qty });
  }

  updateCartCount();
  renderCartItems();
  alert(`${qty} x "${currentProduct.name}" added to cart!`);
  currentProduct = null;
}

function toggleCartPanel() {
  const panel = document.getElementById('cart-panel');
  panel.classList.toggle('translate-x-full');
  panel.classList.toggle('translate-x-0');
}

function closeCartPanel() {
  const panel = document.getElementById('cart-panel');
  if (!panel.classList.contains('translate-x-full')) {
    panel.classList.add('translate-x-full');
    panel.classList.remove('translate-x-0');
  }
}

function setupEventListeners() {
  document.getElementById('cart-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleCartPanel();
  });

  document.body.addEventListener('click', () => {
    closeCartPanel();
  });

  document.getElementById('cart-panel').addEventListener('click', e => {
    e.stopPropagation();
  });

  const form = document.querySelector('#product-modal form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const qty = document.getElementById('quantity').value;
    addToCart(qty);
    closeModal();
  });

  // Add listener for cart panel "Go to Checkout" button
  document.getElementById('go-to-checkout').addEventListener('click', () => {
    window.location.href = 'http://localhost:3000/checkout.html';
  });
}

// NEW: Load categories dynamically and add an "All" category manually
async function loadCategories() {
  const csv = await fetch(CSV_PATH).then(res => res.text());
  const lines = csv.trim().split('\n').slice(1);
  const categories = new Set();

  lines.forEach(line => {
    const fields = line.split(',');
    if (fields.length >= 6) {
      categories.add(fields[5].trim());
    }
  });

  const nav = document.getElementById('category-links');
  nav.innerHTML = ''; 

  // Add "All" category manually
  const allLink = document.createElement('a');
  allLink.href = '#';
  allLink.dataset.category = 'All';
  allLink.className = 'category-link hover:text-indigo-900 relative px-2 after:block after:h-0.5 after:bg-indigo-300 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left';
  allLink.textContent = 'All';
  nav.appendChild(allLink);

  categories.forEach(cat => {
    const link = document.createElement('a');
    link.href = '#';
    link.dataset.category = cat;
    link.className = 'category-link hover:text-indigo-900 relative px-2 after:block after:h-0.5 after:bg-indigo-300 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left';
    link.textContent = cat;
    nav.appendChild(link);
  });

  setupCategoryLinks();
}

async function loadProducts() {
  products = await fetchCSV(CSV_PATH);
  renderProductList(products);
  await loadCategories();
  loadCart();
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', loadProducts);

