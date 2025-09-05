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
      row.innerHTML = `
        <td>${p.pid}</td>
        <td>${p.name}</td>
        <td>${p.description}</td>
        <td>Small: ₹${p.price_small}<br>Medium: ₹${p.price_medium}<br>Large: ₹${p.price_large}</td>
        <td>Small: ${p.quantity_small}<br>Medium: ${p.quantity_medium}<br>Large: ${p.quantity_large}</td>
        <td><img src="${imageSrc}" width="60" height="60"></td>
        <td>
          <button onclick="editProduct(${p.pid}, '${p.name}', '${p.description}', ${p.price_small}, ${p.price_medium}, ${p.price_large}, ${p.quantity_small}, ${p.quantity_medium}, ${p.quantity_large}, '${p.image}')">✏️ Edit</button>
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
function editProduct(pid, name, description, price_small, price_medium, price_large, quantity_small, quantity_medium, quantity_large, image) {
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
async function deleteProduct(pid) {
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
