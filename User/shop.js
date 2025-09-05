async function loadProducts() {
  try {
    let response = await fetch("http://localhost:4000/products"); // backend API
    let products = await response.json();

    let container = document.getElementById("product-list");
    container.innerHTML = "";

    products.forEach(p => {
      container.innerHTML += `
        <div class="pro" onclick="window.location.href='sproduct.html?pid=${p.pid}'">
          <img src="${p.image}" alt="${p.name}">
          <div class="des">
            <h5>${p.name}</h5>
            <div class="star">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star-half-alt"></i>
            </div>
            <h4>₹${p.price_small}</h4>
          </div>
          <a href="#"><i class="fal fa-shopping-cart cart"></i></a>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

loadProducts();
