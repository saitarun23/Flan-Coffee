// Client-side product management script

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
  const idEl = document.getElementById('id') || document.getElementById('productId');
  if (idEl) idEl.value = id;
  document.getElementById('name').value = name || '';
  document.getElementById('description').value = description || '';
  document.getElementById('price').value = price || '';
  document.getElementById('weight').value = weight || '';
  document.getElementById('quantity').value = quantity || '';
  const imgEl = document.getElementById('image_url');
  if (imgEl) imgEl.value = image_url || '';
}

function handleResponse(res) {
  if (!res.ok) {
    return res.text().then(text => {
      const message = text || `${res.status} ${res.statusText}`;
      throw new Error(message);
    });
  }
  // Some endpoints return empty body; try json, fallback to {}
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : {};
}

function fetchProducts() {
  fetch('/products')
    .then(handleResponse)
    .then(products => {
      let table = '';
      products.forEach(p => {
        const name = JSON.stringify(p.name || '');
        const desc = JSON.stringify(p.description || '');
        const weight = JSON.stringify(p.weight || '');
        const img = JSON.stringify(p.image_url || '');
        const priceVal = p.price != null ? p.price : 0;
        const qtyVal = p.quantity != null ? p.quantity : 0;

        table += `\n<tr onclick="fillForm(${p.id}, ${name}, ${desc}, ${priceVal}, ${weight}, ${qtyVal}, ${img})">\n` +
                 `  <td>${p.id}</td>\n  <td>${escapeHtml(p.name) || '-'}</td>\n  <td>${escapeHtml(p.description) || '-'}</td>\n  <td>${p.price ?? 0}</td>\n  <td>${escapeHtml(p.weight) || '-'}</td>\n  <td>${p.quantity ?? 0}</td>\n  <td>${p.image_url ? `<img src="${escapeAttr(p.image_url)}" width="50"/>` : ''}</td>\n</tr>`;
      });
      const tbody = document.getElementById('productTable');
      if (tbody) tbody.innerHTML = table;
    })
    .catch(err => {
      console.error('fetchProducts error:', err);
      alert('Failed to load products: ' + err.message);
    });
}

function addProduct() {
  const product = getFormData();
  const form = new FormData();
  form.append('name', product.name);
  form.append('description', product.description);
  form.append('price', product.price);
  form.append('weight', product.weight);
  form.append('quantity', product.quantity);
  // file input
  const fileInput = document.getElementById('image');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    form.append('image', fileInput.files[0]);
  }

  fetch('/products', {
    method: 'POST',
    body: form
  })
    .then(handleResponse)
    .then(() => { fetchProducts(); })
    .catch(err => {
      console.error('addProduct error:', err);
      alert('Failed to add product: ' + err.message);
    });
}

function updateProduct() {
  const idEl = document.getElementById('id') || document.getElementById('productId');
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
  fetch(`/products/${id}`, {
    method: 'PUT',
    body: form
  })
    .then(handleResponse)
    .then(() => { fetchProducts(); })
    .catch(err => {
      console.error('updateProduct error:', err);
      alert('Failed to update product: ' + err.message);
    });
}

function deleteProduct() {
  const idEl = document.getElementById('id') || document.getElementById('productId');
  const id = idEl ? idEl.value : null;
  if (!id) return alert('Select a product to delete');
  if (!confirm('Are you sure?')) return;
  fetch(`/products/${id}`, { method: 'DELETE' })
    .then(handleResponse)
    .then(() => { fetchProducts(); })
    .catch(err => {
      console.error('deleteProduct error:', err);
      alert('Failed to delete product: ' + err.message);
    });
}

// small helper to escape HTML in table cells
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

// initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchProducts);
} else {
  fetchProducts();
}