// cart.js
// Fetch cart items and handle payment

document.addEventListener('DOMContentLoaded', () => {
  console.log('initCart event attached');
  initCart();
});

async function initCart() {
  const uid = localStorage.getItem('uid');
  const res = await fetch(`/cart/${uid}`);
  const cartItems = await res.json();

  const cartContainer = document.getElementById('cart-list');
  const cartTotal = document.getElementById('cart-total');
  const payBtn = document.getElementById('pay-btn');
  const paymentResult = document.getElementById('payment-result');

  let total = 0;
  if (cartItems.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = '';
    payBtn.disabled = true;
    return;
  }

  cartItems.forEach(item => {
    cartContainer.innerHTML += `
      <div class="cart-item" id="cart-item-${item.cart_id}" data-cart-id="${item.cart_id}" data-base-price="${item.price}">
        <img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;">
        <span>${item.name}</span>
        <span>Size: ${item.size}</span>
        <button class="btn-dec" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
        <span id="qty-${item.cart_id}">Qty: ${item.quantity}</span>
        <button class="btn-inc">+</button>
        <span id="price-${item.cart_id}">Price: Rs.${item.price}</span>
        <span id="total-${item.cart_id}">Total: Rs.${item.price * item.quantity}</span>
        <button class="btn-remove">Remove</button>
      </div>
    `;
  });
  updateCartTotal(); // <-- ensure total is shown after rendering

  payBtn.disabled = false;
  payBtn.onclick = async () => {
    // 1. Place order in DB
    const res = await fetch('/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    const data = await res.json();
    if (data.oid) {
      // 2. Create Razorpay Order
      const total = parseFloat(document.getElementById('cart-total').textContent.replace(/[^\d.]/g, ''));
      const res2 = await fetch('/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, oid: data.oid })
      });
      const orderData = await res2.json();
      openRazorpay(orderData, data.oid, total);
    } else {
      paymentResult.textContent = 'Order creation failed.';
    }
  };

  cartContainer.addEventListener('click', async (e) => {
    console.log('cartContainer click event fired');
    const btn = e.target.closest('.btn-inc, .btn-dec, .btn-remove');
    if (!btn) return; // not one of our buttons

    const row = btn.closest('.cart-item');
    const cartId = row.dataset.cartId;
    const basePrice = Number(row.dataset.basePrice);

    const qtyEl = document.getElementById(`qty-${cartId}`);
    // parse current qty from "Qty: N"
    const currentQty = parseInt((qtyEl.textContent.match(/\d+/) || ['1'])[0], 10);
    console.log('Button:', btn.className, 'CartID:', cartId, 'Current Qty:', currentQty);

    if (btn.classList.contains('btn-dec')) {
      updateCartItem(cartId, currentQty - 1, basePrice);
    } else if (btn.classList.contains('btn-inc')) {
      updateCartItem(cartId, currentQty + 1, basePrice);
    } else if (btn.classList.contains('btn-remove')) {
      removeFromCart(cartId);
    }
  });
} // End of DOMContentLoaded

function updateCartItem(cart_id, newQty, basePrice) {
  if (newQty < 1) return; // don't allow qty less than 1

  fetch(`/cart/${cart_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: newQty })
  }).then(() => {
    // Always recalc based on qty
    const itemTotal = basePrice * newQty;

    // Update DOM
    document.getElementById(`qty-${cart_id}`).textContent = `Qty: ${newQty}`;
    // FIX: keep Price as the unit price, not multiplied
    document.getElementById(`price-${cart_id}`).textContent = `Price: Rs.${basePrice}`;
    // Total = unit price × qty
    document.getElementById(`total-${cart_id}`).textContent = `Total: Rs.${itemTotal}`;

    // Update cart grand total
    updateCartTotal();
  });
}

function updateCartTotal() {
  let total = 0;
  document.querySelectorAll('[id^="total-"]').forEach(el => {
    const val = el.textContent.match(/Rs\.([\d.]+)/);
    if (val) total += parseFloat(val[1]);
  });
  document.getElementById('cart-total').textContent = `Total: Rs.${total.toFixed(2)}`;
}

async function removeFromCart(cart_id) {
  await fetch(`/cart/${cart_id}`, { method: 'DELETE' });
  location.reload();
}

function openRazorpay(orderData, oid, total) {
  const options = {
    key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key_id or inject from backend
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Flan Coffee",
    description: "Order Payment",
    order_id: orderData.id,
    handler: async function (response) {
      // 3. Verify payment
      await fetch("/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          oid,
          amount: total,
          method: "RAZORPAY"
        })
      });
      alert("Payment Successful!");
      window.location.href = "thankyou.html";
    },
    theme: {
      color: "#3399cc"
    }
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
}
