document.addEventListener("DOMContentLoaded", function() {
  // =============== PRODUCT IMAGES UPLOAD & GALLERY ===============
  if (document.getElementById("imageForm")) {
    document.getElementById("imageForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const pid = document.getElementById("imgPid").value;
      const formData = new FormData();
      Array.from(document.getElementById("images").files).forEach(f => formData.append("images", f));
      const res = await fetch(`/api/v1/product/${pid}/images`, { method: "POST", body: formData });
      const data = await res.json();
      document.getElementById("uploadMsg").textContent = data.message || data.error;
      loadGallery(pid);
    });
  }

  window.loadGallery = async function loadGallery(pid) {
    const images = await fetch(`/api/v1/product/${pid}/images`).then(res => res.json());
    const thumbnails = document.getElementById("thumbnails");
    const mainImage = document.getElementById("mainImage");
    thumbnails.innerHTML = "";
    if (images.length > 0) {
      mainImage.src = `data:image/jpeg;base64,${images[0].image}`;
      images.forEach((img, idx) => {
      const thumb = document.createElement("img");
      thumb.src = `data:image/jpeg;base64,${img.image}`;
      thumb.style.width = "60px";
      thumb.style.margin = "5px";
      thumb.style.cursor = "pointer";
      thumb.onclick = () => { mainImage.src = thumb.src; };
      thumbnails.appendChild(thumb);
    });
  } else {
    mainImage.src = "";
  }
}
const API_URL = "http://localhost:5000/api/v1/product";

// =============== GET ALL PRODUCTS ===============
async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/getall`);
    const data = await res.json();

    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    data.data.forEach((p) => {
      const row = document.createElement("tr");
      // Convert blob data to a data URL
      const imageSrc = p.image ? `data:image/jpeg;base64,${p.image}` : '';
      // Escape single/double quotes and backticks for JS string literals
      const esc = s => String(s).replace(/['"`\\]/g, c => '\\' + c).replace(/\r?\n/g, "\\n");
      // Render description with line breaks
      const renderDesc = s => esc(s).replace(/\\n/g, '<br>');
      row.innerHTML = `
        <td>${p.pid}</td>
        <td>${esc(p.name)}</td>
        <td><div style="white-space:pre-wrap;margin:0;">${renderDesc(p.description)}</div></td>
        <td>Small: ₹${p.price_small}<br>Medium: ₹${p.price_medium}<br>Large: ₹${p.price_large}</td>
        <td>Small: ${p.quantity_small}<br>Medium: ${p.quantity_medium}<br>Large: ${p.quantity_large}</td>
        <td><img src="${imageSrc}" width="60" height="60"></td>
        <td>
          <button onclick="editProduct(${p.pid}, '${esc(p.name)}', '${esc(p.description)}', ${p.price_small}, ${p.price_medium}, ${p.price_large}, ${p.quantity_small}, ${p.quantity_medium}, ${p.quantity_large}, '${esc(p.image)}')">✏️ Edit</button>
          <button onclick="deleteProduct(${p.pid})">🗑️ Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

// =============== GET PRODUCT BY ID (not shown in UI, for testing) ===============
async function getProductById(pid) {
  try {
    const res = await fetch(`${API_URL}/get/${pid}`);
    const data = await res.json();
    console.log("Product by ID:", data);
  } catch (err) {
    console.error("Error fetching product by id:", err);
  }
}

// =============== CREATE OR UPDATE PRODUCT ===============
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pid = document.getElementById("productId").value;
  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("price_small", document.getElementById("price_small").value);
  formData.append("price_medium", document.getElementById("price_medium").value);
  formData.append("price_large", document.getElementById("price_large").value);
  formData.append("quantity_small", document.getElementById("quantity_small").value);
  formData.append("quantity_medium", document.getElementById("quantity_medium").value);
  formData.append("quantity_large", document.getElementById("quantity_large").value);
  
  const imageFile = document.getElementById("image").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    if (pid) {
      // Update
      await fetch(`${API_URL}/update/${pid}`, {
        method: "PUT",
        body: formData,
      });
      alert("✅ Product updated!");
    } else {
      // Create
      await fetch(`${API_URL}/create`, {
        method: "POST",
        body: formData,
      });
      alert("✅ Product created!");
    }

    e.target.reset();
    document.getElementById("productId").value = "";
    document.querySelector("#productForm button").textContent = "Save Product";
    document.getElementById("form-title").textContent = "Add Product";
    document.getElementById('image-preview').style.display = 'none';
    getProducts();
  } catch (err) {
    console.error("Error saving product:", err);
  }
});

document.getElementById('image').addEventListener('change', function(event) {
    const [file] = event.target.files;
    if (file) {
        const preview = document.getElementById('image-preview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

// =============== EDIT PRODUCT (prefill form) ===============
window.editProduct = function editProduct(pid, name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large, image) {
  document.getElementById("productId").value = pid;
  document.getElementById("name").value = name;
  document.getElementById("description").value = description;
  document.getElementById("price_small").value = price_small;
  document.getElementById("price_medium").value = price_medium;
  document.getElementById("price_large").value = price_large;
  document.getElementById("quantity_small").value = quantity_small;
  document.getElementById("quantity_medium").value = quantity_medium;
  document.getElementById("quantity_large").value = quantity_large;
  
  const preview = document.getElementById('image-preview');
  if (image) {
    preview.src = `data:image/jpeg;base64,${image}`;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  document.querySelector("#productForm button").textContent = "Update Product";
  document.getElementById("form-title").textContent = "Update Product";
}

// =============== DELETE PRODUCT ===============
window.deleteProduct = async function deleteProduct(pid) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await fetch(`${API_URL}/delete/${pid}`, { method: "DELETE" });
      alert("🗑️ Product deleted!");
      getProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  }
}

// =============== INITIAL LOAD ===============

getProducts();
// =============== PRODUCT IMAGES CRUD ===============

const IMAGES_API_URL = "/api/v1/product/images";

async function getProductImages() {
  try {
    const res = await fetch(IMAGES_API_URL);
    const data = await res.json();
    const tbody = document.getElementById("productImagesTableBody");
    if (!tbody) return; // Prevent error if element is missing
    tbody.innerHTML = "";
    data.forEach(img => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${img.img_id}</td>
        <td>${img.pid}</td>
        <td><img src="data:image/jpeg;base64,${img.image}" width="60" height="60"></td>
        <td>
          <button onclick="editProductImage(${img.img_id}, ${img.pid})">✏️ Edit</button>
          <button onclick="deleteProductImage(${img.img_id})">🗑️ Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error fetching product images:", err);
  }
}

window.editProductImage = function editProductImage(img_id, pid) {
  // For simplicity, just prompt for a new image file and update
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = async function() {
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await fetch(`${IMAGES_API_URL}/${img_id}`, { method: 'PUT', body: formData });
      alert('✅ Image updated!');
      getProductImages();
      if (pid) loadGallery(pid);
    } catch (err) {
      alert('Error updating image');
    }
  };
  fileInput.click();
}

window.deleteProductImage = async function deleteProductImage(img_id) {
  if (confirm("Are you sure you want to delete this image?")) {
    try {
      await fetch(`${IMAGES_API_URL}/${img_id}`, { method: 'DELETE' });
      alert('🗑️ Image deleted!');
      getProductImages();
    } catch (err) {
      alert('Error deleting image');
    }
  }
}

// Initial load for product images table
getProductImages();
});
