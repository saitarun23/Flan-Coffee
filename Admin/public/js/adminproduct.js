// Client-side product management script (updated to hit new API paths)

function getFormData() {
  return {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: parseFloat(document.getElementById('price').value) || 0,
    weight: document.getElementById('weight').value,
    quantity: parseInt(document.getElementById('quantity').value, 10) || 0
  };
}

function fillForm(id, name, description, price, weight, quantity, image_url) {
  const idEl = document.getElementById('productId');
  if (idEl) idEl.value = id;
  document.getElementById('name').value = name || '';
  document.getElementById('description').value = description || '';
  document.getElementById('price').value = price || '';
  document.getElementById('weight').value = weight || '';
  document.getElementById('quantity').value = quantity || '';
  const imgEl = document.getElementById('image_url');
  if (imgEl) imgEl.value = image_url || '';
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  const txt = await res.text();
  try { return JSON.parse(txt || '{}'); } catch (_) { return {}; }
}

async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    products.forEach(p => {
      const tile = document.createElement('article');
      tile.className = 'tile';
      tile.dataset.id = p.id;

      const title = document.createElement('div'); title.className = 'title'; title.textContent = p.name || 'Untitled';
      const desc = document.createElement('div'); desc.className = 'meta'; desc.textContent = p.description || '';
      const price = document.createElement('div'); price.className = 'price'; price.textContent = '₹' + (p.price ?? 0);
      const qty = document.createElement('div'); qty.className = 'qty'; qty.textContent = 'Qty: ' + (p.quantity ?? 0);

      const actions = document.createElement('div'); actions.className = 'tile-actions';
      const editBtn = document.createElement('button'); editBtn.className = 'icon-btn'; editBtn.title='Edit'; editBtn.innerText='✏️';
      const delBtn = document.createElement('button'); delBtn.className = 'icon-btn danger'; delBtn.title='Delete'; delBtn.innerText='🗑️';

      editBtn.addEventListener('click', (e)=>{ e.stopPropagation(); fillForm(p.id, p.name, p.description, p.price, p.weight, p.quantity, p.image_url); window.scrollTo({top:0,behavior:'smooth'}); });
      delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); document.getElementById('productId').value = p.id; if (confirm('Delete this product?')) deleteProduct(); });

      actions.appendChild(editBtn); actions.appendChild(delBtn);

      tile.appendChild(title); tile.appendChild(desc); tile.appendChild(price); tile.appendChild(qty); tile.appendChild(actions);
      grid.appendChild(tile);
    });
  } catch (err) {
    console.error('fetchProducts error:', err);
    alert('Failed to load products: ' + err.message);
  }
}

async function addProduct() {
  try {
    const product = getFormData();
    const form = new FormData();
    form.append('name', product.name);
    form.append('description', product.description);
    form.append('price', product.price);
    form.append('weight', product.weight);
    form.append('quantity', product.quantity);
    const fileInput = document.getElementById('image');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      form.append('image', fileInput.files[0]);
    }
    const res = await fetch('/api/products', { method: 'POST', body: form });
    await handleResponse(res);
    await fetchProducts();
  } catch (err) {
    console.error('addProduct error:', err);
    alert('Failed to add product: ' + err.message);
  }
}

async function updateProduct() {
  try {
    const idEl = document.getElementById('productId');
    const id = idEl ? idEl.value : null;
    if (!id) return alert('Select a product to update');
    const product = getFormData();
    const form = new FormData();
    form.append('name', product.name);
    form.append('description', product.description);
    form.append('price', product.price);
    form.append('weight', product.weight);
    form.append('quantity', product.quantity);
    const fileInput = document.getElementById('image');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      form.append('image', fileInput.files[0]);
    }
    const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: form });
    await handleResponse(res);
    await fetchProducts();
  } catch (err) {
    console.error('updateProduct error:', err);
    alert('Failed to update product: ' + err.message);
  }
}

async function deleteProduct() {
  try {
    const idEl = document.getElementById('productId');
    const id = idEl ? idEl.value : null;
    if (!id) return alert('Select a product to delete');
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    await handleResponse(res);
    await fetchProducts();
  } catch (err) {
    console.error('deleteProduct error:', err);
    alert('Failed to delete product: ' + err.message);
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

// wire buttons
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn'); if (addBtn) addBtn.addEventListener('click', addProduct);
    const updateBtn = document.getElementById('updateBtn'); if (updateBtn) updateBtn.addEventListener('click', updateProduct);
    const deleteBtn = document.getElementById('deleteBtn'); if (deleteBtn) deleteBtn.addEventListener('click', deleteProduct);
    const addSubmit = document.getElementById('addSubmit'); if (addSubmit) addSubmit.addEventListener('click', addProduct);
    const updateSubmit = document.getElementById('updateSubmit'); if (updateSubmit) updateSubmit.addEventListener('click', updateProduct);
    fetchProducts();
  });
} else {
  const addBtn = document.getElementById('addBtn'); if (addBtn) addBtn.addEventListener('click', addProduct);
  const updateBtn = document.getElementById('updateBtn'); if (updateBtn) updateBtn.addEventListener('click', updateProduct);
  const deleteBtn = document.getElementById('deleteBtn'); if (deleteBtn) deleteBtn.addEventListener('click', deleteProduct);
  const addSubmit = document.getElementById('addSubmit'); if (addSubmit) addSubmit.addEventListener('click', addProduct);
  const updateSubmit = document.getElementById('updateSubmit'); if (updateSubmit) updateSubmit.addEventListener('click', updateProduct);
  fetchProducts();
}
