const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const productCount = document.getElementById("productCount");
const noProducts = document.getElementById("noProducts");

const detailsSection = document.getElementById("detailsSection");
const productDetails = document.getElementById("productDetails");
const backButton = document.getElementById("backButton");
const homeLink = document.getElementById("homeLink");

let products = [];

// Load products from the backend API
async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Unable to load product data.");
        }

        products = await response.json();

        populateCategories();
        displayProducts(products);
    } catch (error) {
        console.error(error);

        productGrid.innerHTML = `
            <p>Unable to load products.
            Please run the project using a local web server.</p>
        `;

        productCount.textContent = "";
    }
}

// Populate category dropdown using API data
function populateCategories() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ].sort();

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}

// Format price in Indian Rupees
function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);
}

// Display product cards
function displayProducts(productList) {
    productGrid.innerHTML = "";

    productCount.textContent =
        `${productList.length} product${productList.length !== 1 ? "s" : ""}`;

    noProducts.hidden = productList.length !== 0;

    productList.forEach(product => {
        const card = document.createElement("article");

        card.className = "product-card";

        const image = document.createElement("img");
        image.className = "product-image";
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.onerror = () => {
            image.onerror = null;
            image.src =
                "https://placehold.co/600x400/f0f0f5/555555?text=Image+Unavailable";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.category;

        const title = document.createElement("h3");
        title.textContent = product.name;

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.description;

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = formatPrice(product.price);

        const button = document.createElement("button");
        button.className = "details-button";
        button.textContent = "View Details";
        button.type = "button";

        button.addEventListener("click", () => {
            showProductDetails(product.id);
        });

        bottom.append(price, button);
        info.append(category, title, description, bottom);
        card.append(image, info);

        productGrid.appendChild(card);
    });
}

// Search and category filtering
function filterProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const matchesSearch = [
            product.name,
            product.description,
            product.category
        ].some(value => value.toLowerCase().includes(query));

        const matchesCategory =
            category === "All" || product.category === category;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

// Show product details retrieved from the backend
async function showProductDetails(productId) {
    let product;

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error("Unable to load product details.");
        }
        product = await response.json();
    } catch (error) {
        console.error(error);
        return;
    }

    const image = document.createElement("img");
    image.className = "details-image";
    image.src = product.image;
    image.alt = product.name;

    image.onerror = () => {
        image.onerror = null;
        image.src =
            "https://placehold.co/600x400/f0f0f5/555555?text=Image+Unavailable";
    };

    const info = document.createElement("div");
    info.className = "details-info";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;

    const title = document.createElement("h1");
    title.textContent = product.name;

    const label = document.createElement("p");
    label.className = "details-label";
    label.textContent = "Product description";

    const description = document.createElement("p");
    description.className = "details-description";
    description.textContent = product.description;

    const price = document.createElement("p");
    price.className = "details-price";
    price.textContent = formatPrice(product.price);

    info.append(category, title, label, description, price);

    const card = document.createElement("div");
    card.className = "details-card";
    card.append(image, info);

    productDetails.replaceChildren(card);

    document.querySelector(".container").hidden = true;
    document.querySelector(".hero").hidden = true;
    detailsSection.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Return to the product listing
function showProductListing() {
    detailsSection.hidden = true;
    document.querySelector(".container").hidden = false;
    document.querySelector(".hero").hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Event listeners
searchInput.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);

backButton.addEventListener("click", showProductListing);

homeLink.addEventListener("click", event => {
    event.preventDefault();

    showProductListing();
});

// Initialize application
loadProducts();
