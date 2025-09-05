// sproduct.js
// Fetch product details and display them dynamically

document.addEventListener('DOMContentLoaded', async () => {
  // Get product PID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const pid = urlParams.get('pid');

  if (!pid) return;

  // Fetch product details from backend
  const res = await fetch(`/products/${pid}`);
  const product = await res.json();

  // Set default price (small)
  let currentPrice = product.price_small || product.price || 0;
  let quantity = 1;
  const priceEl = document.getElementById('product-price');
  const qtyEl = document.getElementById('product-qty');

  function updatePrice() {
    priceEl.textContent = `Rs.${currentPrice * quantity}`;
  }

  // Listen for size change
  document.getElementById('product-size').addEventListener('change', function() {
    if (this.value === 'Small' && product.price_small) currentPrice = product.price_small;
    if (this.value === 'Medium' && product.price_medium) currentPrice = product.price_medium;
    if (this.value === 'Large' && product.price_large) currentPrice = product.price_large;
    updatePrice();
  });

  // Listen for quantity change
  qtyEl.addEventListener('input', function() {
    quantity = parseInt(this.value) || 1;
    updatePrice();
  });

  // Initial price display
  updatePrice();

  // Update product details in the page
  const mainImg = document.getElementById('MainImg');
  mainImg.src = product.image;
  mainImg.style.width = '250px';
  mainImg.style.height = '250px';
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-desc').textContent = product.description;

  // Optionally update category if available
  if (product.category) {
    document.getElementById('product-category').textContent = `Home / ${product.category}`;
  }

  // Thumbnails (if product.images is an array)
  // Remove thumbnails, show only single main image
  document.getElementById('small-img-group').innerHTML = '';

  // Add to cart functionality
  document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    await fetch('http://localhost:4000/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pid,
        quantity,
        size: document.getElementById('product-size').value,
        price: currentPrice,
        uid: localStorage.getItem('uid')
      })
    });
    alert('Added to cart!');
  });
});
