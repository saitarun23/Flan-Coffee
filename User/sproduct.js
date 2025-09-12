// sproduct.js - Flipkart-style product details page

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Get product PID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const pid = urlParams.get('pid');
  if (!pid) return;

  // 2. Fetch product details from backend
  const res = await fetch(`/products/${pid}`);
  const product = await res.json();

  // 3. Prepare images array (main + sub images)
  let images = [];
  let mainImgSrc = '';
  if (product.image) {
    if (typeof product.image === 'string') {
      mainImgSrc = product.image.startsWith('data:image') ? product.image : `data:image/jpeg;base64,${product.image}`;
    } else {
      mainImgSrc = `data:image/jpeg;base64,${product.image}`;
    }
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images.map(img => `data:image/jpeg;base64,${img.image}`);
    if (mainImgSrc && !images.includes(mainImgSrc)) {
      images.unshift(mainImgSrc);
    }
  } else if (mainImgSrc) {
    images = [mainImgSrc];
  }

  // 4. Set default price and quantity
  let currentPrice = product.price_small || product.price || 0;
  let quantity = 1;

  // 5. Build product HTML (main image centered, thumbnails below, smaller buttons, description after buttons)
  document.getElementById('product').innerHTML = `
    <div class="flipkart-product-layout" style="display: flex; gap: 2.5rem; max-width: 1200px; margin: 40px auto; align-items: flex-start;">
      <div class="flipkart-gallery" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div class="flipkart-main-img" style="display: flex; justify-content: center; align-items: center; margin-bottom: 1rem;">
          <img id="MainImg" src="${images[0] || ''}" alt="Product Image" style="width: 350px; height: 350px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        </div>
        <div class="flipkart-thumbnails" style="display: flex; flex-direction: row; gap: 12px; margin-bottom: 1rem; justify-content: center;">
          ${images.map((img, i) => `
            <img src="${img}" class="thumb-img${i === 0 ? ' selected' : ''}" data-index="${i}" style="width: 60px; height: 60px; object-fit: cover; border: 2px solid #eee; border-radius: 8px; cursor: pointer; transition: border 0.2s;">
          `).join('')}
        </div>
      </div>
      <div class="flipkart-details" style="flex: 1; min-width: 320px;">
        <h1 class="product-title">${product.name || ''}</h1>
        <div class="product-price">MRP ₹${currentPrice} <span class="tax-info">(Incl. of all taxes)</span></div>
        <div class="product-selectors" style="margin-bottom: 1rem; display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 1.2rem;">
            <span>Size/Weight:</span>
            <label style="display: flex; align-items: center; gap: 0.2rem;">
              <input type="radio" name="product-size" value="Small" id="size-small" checked> Small
            </label>
            <label style="display: flex; align-items: center; gap: 0.2rem;">
              <input type="radio" name="product-size" value="Medium" id="size-medium"> Medium
            </label>
            <label style="display: flex; align-items: center; gap: 0.2rem;">
              <input type="radio" name="product-size" value="Large" id="size-large"> Large
            </label>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: 0.5rem;">
            <span>Qty:</span>
            <button type="button" id="qty-decrease" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid #ccc; background: #fff; font-size: 1.2rem; cursor: pointer;">-</button>
            <span id="product-qty" style="min-width: 24px; display: inline-block; text-align: center;">1</span>
            <button type="button" id="qty-increase" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid #ccc; background: #fff; font-size: 1.2rem; cursor: pointer;">+</button>
          </div>
        </div>
        <div style="margin-bottom: 0.5rem;">
          <div class="stock-status" style="color: #088178; font-size: 1rem; text-align: left; margin-bottom: 0.2rem;">
            <span class="in-stock-dot" style="display: inline-block; width: 10px; height: 10px; background: #2ecc40; border-radius: 50%; margin-right: 6px;"></span>
            In stock, ready to ship
          </div>
          <button id="add-to-cart-btn" class="add-to-cart-btn" style="display: block; width: 60%; padding: 8px 0; font-size: 1rem; border-radius: 6px; border: none; cursor: pointer; background: #fff; color: #222; border: 2px solid #088178; font-weight: 600; transition: background 0.2s, color 0.2s, box-shadow 0.2s; text-align: center; margin-left: 0; margin-bottom: 0.5rem;">Add to cart</button>
        </div>
  <button class="buy-now-btn" style="display: block; width: 60%; padding: 8px 0; font-size: 1rem; border-radius: 6px; border: none; cursor: pointer; background: #8ecae6; color: #222; font-weight: 600; margin-bottom: 1.5rem; text-align: center;">Buy it now</button>
        <div class="short-desc" style="margin-top: 1.2rem; color: #666; font-size: 1rem;">${product.short_description || ''}</div>
        <div class="flipkart-description" style="max-width: 100%; margin: 32px 0 0 0; padding: 1.5rem 0 0 0; font-size: 1.1rem; color: #444;">
          <h3 style="margin-bottom: 1rem; color: #222;">Product Description</h3>
          <div id="product-description-html"></div>
        </div>
      </div>
    </div>
  `;
  // Set formatted description immediately after rendering
  const descDiv = document.getElementById('product-description-html');
  if (descDiv) {
    descDiv.innerHTML = formatDescription(product.description);
  }

  // Add hover effect for add-to-cart button
  setTimeout(() => {
    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('mouseenter', function() {
        this.style.background = '#088178';
        this.style.color = '#fff';
        this.style.boxShadow = '0 2px 8px rgba(8,129,120,0.15)';
      });
      addBtn.addEventListener('mouseleave', function() {
        this.style.background = '#fff';
        this.style.color = '#222';
        this.style.boxShadow = 'none';
      });
    }
  }, 0);
  // 6. Main image and thumbnail click logic
  const mainImg = document.getElementById('MainImg');
  document.querySelectorAll('.thumb-img').forEach((img, i) => {
    img.addEventListener('click', function() {
      mainImg.src = this.src;
      document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // 7. Price and quantity logic
  const priceEl = document.querySelector('.product-price');
  const qtyEl = document.getElementById('product-qty');
  function updatePrice() {
    priceEl.innerHTML = `MRP ₹${currentPrice * quantity} <span class="tax-info">(Incl. of all taxes)</span>`;
  }
  // Size radio buttons logic
  document.querySelectorAll('input[name="product-size"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'Small' && product.price_small) currentPrice = product.price_small;
      if (this.value === 'Medium' && product.price_medium) currentPrice = product.price_medium;
      if (this.value === 'Large' && product.price_large) currentPrice = product.price_large;
      updatePrice();
    });
  });

  // Qty +/- logic
  const qtyDisplay = document.getElementById('product-qty');
  document.getElementById('qty-decrease').addEventListener('click', function() {
    if (quantity > 1) {
      quantity--;
      qtyDisplay.textContent = quantity;
      updatePrice();
    }
  });
  document.getElementById('qty-increase').addEventListener('click', function() {
    quantity++;
    qtyDisplay.textContent = quantity;
    updatePrice();
  });
  updatePrice();

  // 8. Add to cart functionality
  document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    const selectedSize = document.querySelector('input[name="product-size"]:checked').value;
    await fetch('http://localhost:4000/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pid,
        quantity,
        size: selectedSize,
        price: currentPrice,
        uid: localStorage.getItem('uid')
      })
    });
    alert('Added to cart!');
  });
});

// Format product description for user-friendly display
function formatDescription(desc) {
  if (!desc) return 'No description available.';
  let html = desc
    .replace(/Contents:/g, '<b>Contents:</b>')
    .replace(/Estate:/g, '<br><b>Estate:</b>')
    .replace(/Single estate:/g, '<br><b>Single estate:</b>')
    .replace(/Roast:/g, '<br><b>Roast:</b>')
    .replace(/Flavour notes:/g, '<br><b>Flavour notes:</b>')
    .replace(/Brewing methods:/g, '<br><b>Brewing methods:</b>')
    .replace(/Best enjoyed:/g, '<br><b>Best enjoyed:</b>')
    .replace(/Discover Our Signature Cold Coffee/g, '<br><br><b>Discover Our Signature Cold Coffee</b>')
    .replace(/Know Your Source/g, '<br><br><b>Know Your Source</b>')
    .replace(/\n/g, '<br>');
  return html;
}