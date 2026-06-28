const BASE_URL = "https://nutriplan-api.vercel.app/api";

let allProducts = [];
let activeGrade = "";

const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");
const searchInput = document.getElementById("product-search-input");
const searchBtn = document.getElementById("search-product-btn");
const barcodeInput = document.getElementById("barcode-input");
const lookupBtn = document.getElementById("lookup-barcode-btn");
const nutriFilters = document.querySelectorAll(".nutri-score-filter");
const categoryBtns = document.querySelectorAll(".product-category-btn");

const searchProducts = async (query) => {
  const res = await fetch(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  return data.results || [];
};

const lookupBarcode = async (code) => {
  const res = await fetch(
    `${BASE_URL}/products/barcode/${encodeURIComponent(code)}`,
  );
  const data = await res.json();
  return data.result || null;
};

const fetchByCategory = async (category) => {
  const res = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}?limit=24`,
  );
  const data = await res.json();
  return data.results || [];
};

const gradeClass = (g) =>
  ({
    a: "bg-green-500",
    b: "bg-lime-500",
    c: "bg-yellow-500",
    d: "bg-orange-500",
    e: "bg-red-500",
  })[g] ?? "bg-gray-400";

const renderProducts = (products) => {
  allProducts = products;
  applyGradeFilter();
};

const applyGradeFilter = () => {
  const filtered = activeGrade
    ? allProducts.filter((p) => p.nutritionGrade?.toLowerCase() === activeGrade)
    : allProducts;

  productsGrid.innerHTML = "";

  if (!filtered.length) {
    productsGrid.innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-400">
        <i class="fa-solid fa-box-open text-5xl mb-4"></i>
        <p class="text-lg font-medium">No products found</p>
        <p class="text-sm">Try a different search or filter</p>
      </div>`;
    productsCount.textContent = "0 products";
    return;
  }

  filtered.forEach((product) => {
    const grade = product.nutritionGrade?.toLowerCase() ?? "?";
    const card = document.createElement("div");
    card.className =
      "product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
    card.dataset.barcode = product.barcode;

    const imgHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}"
             class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />`
      : `<i class="fa-solid fa-box text-6xl text-gray-300"></i>`;

    card.innerHTML = `
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        ${imgHtml}
        <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold uppercase ${gradeClass(grade)} text-white">
          Nutri-Score ${grade.toUpperCase()}
        </div>
        ${
          product.novaGroup != null
            ? `<div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  title="NOVA ${product.novaGroup}">${product.novaGroup}</div>`
            : ""
        }
      </div>
      <div class="p-4">
        ${
          product.brand
            ? `<p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand}</p>`
            : ""
        }
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          ${product.name}
        </h3>
        <p class="text-xs text-gray-400 mb-3">Barcode: ${product.barcode}</p>
        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="bg-orange-50 rounded p-1.5">
            <p class="text-xs font-bold text-orange-700">${product.nutrients?.calories ?? "—"}</p>
            <p class="text-[10px] text-gray-500">kcal</p>
          </div>
          <div class="bg-emerald-50 rounded p-1.5">
            <p class="text-xs font-bold text-emerald-700">${product.nutrients?.protein ?? "—"}g</p>
            <p class="text-[10px] text-gray-500">Protein</p>
          </div>
          <div class="bg-blue-50 rounded p-1.5">
            <p class="text-xs font-bold text-blue-700">${product.nutrients?.carbs ?? "—"}g</p>
            <p class="text-[10px] text-gray-500">Carbs</p>
          </div>
          <div class="bg-purple-50 rounded p-1.5">
            <p class="text-xs font-bold text-purple-700">${product.nutrients?.fat ?? "—"}g</p>
            <p class="text-[10px] text-gray-500">Fat</p>
          </div>
        </div>
        <button class="add-to-log-btn mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all">
          <i class="fa-solid fa-plus mr-1"></i>Add to Food Log
        </button>
      </div>`;

    card.querySelector(".add-to-log-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToFoodLog(product);
    });

    productsGrid.appendChild(card);
  });

  productsCount.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;
};

const setLoading = (msg = "Searching...") => {
  productsGrid.innerHTML = `
    <div class="col-span-full text-center py-16 text-gray-400">
      <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 text-emerald-500"></i>
      <p class="font-medium">${msg}</p>
    </div>`;
  productsCount.textContent = "";
};

const addToFoodLog = (product) => {
  const today = new Date().toISOString().split("T")[0];
  const foodLog = JSON.parse(localStorage.getItem("foodLog")) || {};

  if (!foodLog[today]) foodLog[today] = [];

  foodLog[today].push({
    type: "product",
    barcode: product.barcode,
    name: product.name,
    brand: product.brand || "",
    thumbnail: product.image || "",
    nutritionGrade: product.nutritionGrade || "?",
    nutrients: product.nutrients || {},
  });

  localStorage.setItem("foodLog", JSON.stringify(foodLog));

  if (window.Swal) {
    Swal.fire({
      icon: "success",
      title: "Added to Food Log!",
      html: `<b>${product.name}</b> has been added to today's log.`,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  } else {
    alert(`✅ "${product.name}" added to today's food log!`);
  }
};

const handleSearch = async () => {
  const query = searchInput.value.trim();
  if (!query) return;
  setLoading("Searching products...");
  try {
    const results = await searchProducts(query);
    renderProducts(results);
  } catch {
    productsGrid.innerHTML = `<div class="col-span-full text-center py-16 text-red-400"><p>Failed to fetch products. Please try again.</p></div>`;
  }
};

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

lookupBtn.addEventListener("click", async () => {
  const code = barcodeInput.value.trim();
  if (!code) return;
  setLoading("Looking up barcode...");
  try {
    const result = await lookupBarcode(code);
    if (!result) {
      productsGrid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400"><p>No product found for barcode <b>${code}</b>.</p></div>`;
      productsCount.textContent = "";
    } else {
      renderProducts([result]);
    }
  } catch {
    productsGrid.innerHTML = `<div class="col-span-full text-center py-16 text-red-400"><p>Failed to lookup barcode. Please try again.</p></div>`;
  }
});

barcodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") lookupBtn.click();
});

const CATEGORY_MAP = {
  Snacks: "snacks",
  Beverages: "beverages",
  Breakfast: "breakfast-cereals",
  Desserts: "desserts",
  Dairy: "dairy",
};

categoryBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    categoryBtns.forEach((b) =>
      b.classList.remove("ring-2", "ring-offset-1", "ring-emerald-500"),
    );
    btn.classList.add("ring-2", "ring-offset-1", "ring-emerald-500");

    const label = btn.textContent.trim();
    const category = CATEGORY_MAP[label] ?? label.toLowerCase();

    setLoading(`Loading ${label}...`);
    try {
      const results = await fetchByCategory(category);
      renderProducts(results);
    } catch {
      productsGrid.innerHTML = `<div class="col-span-full text-center py-16 text-red-400"><p>Failed to load category.</p></div>`;
    }
  });
});

nutriFilters.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeGrade = btn.dataset.grade;

    nutriFilters.forEach((b) => {
      b.classList.remove("ring-2", "ring-offset-1", "ring-gray-700");
    });
    btn.classList.add("ring-2", "ring-offset-1", "ring-gray-700");

    applyGradeFilter();
  });
});

productsGrid.innerHTML = `
  <div class="col-span-full text-center py-16 text-gray-400">
    <i class="fa-solid fa-barcode text-5xl mb-4"></i>
    <p class="text-lg font-medium">Search for a product or scan a barcode</p>
    <p class="text-sm">Or browse by category below</p>
  </div>`;
productsCount.textContent = "Search for products to see results";
