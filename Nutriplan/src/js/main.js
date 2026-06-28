const baseUrl = "https://nutriplan-api.vercel.app/api";
let selectedArea = "All Recipes";
let selectedCategory = "All Recipes";
let recipes = [];
let recipesCount = 0;
let searchQuery = "";
let loading = false;

const filterRecipes = () => {
  let filtered = recipes;

  if (selectedArea !== "All Recipes") {
    filtered = filtered.filter((recipe) => recipe.area === selectedArea);
  }

  if (selectedCategory !== "All Recipes") {
    filtered = filtered.filter(
      (recipe) => recipe.category === selectedCategory,
    );
  }

  if (searchQuery) {
    filtered = filtered.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.area?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  recipesCount = filtered.length;
  document.getElementById("recipes-count").innerText =
    `Showing ${recipesCount} recipes`;
  showRecipes(filtered);
};

// fetch cusines area
const fetchCusinesArea = async () => {
  const areas = await fetch(baseUrl + "/meals/areas");
  return areas.json();
};

const cusinesAreas = await fetchCusinesArea();
const areas = document.getElementById("areas");

cusinesAreas["results"].forEach((area) => {
  const btn = document.createElement("button");
  btn.innerText = area.name;
  btn.dataset.area = area.name;
  btn.className =
    "px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
  areas.appendChild(btn);
});
areas.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedArea = btn.dataset.area;
    areas.querySelectorAll("button").forEach((button) => {
      button.className =
        "px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
    });

    btn.className =
      "px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";
    filterRecipes();
  });
});

const fetchCategories = async () => {
  const categories = await fetch(baseUrl + "/meals/categories");
  return categories.json();
};

const categories = await fetchCategories();
const categoriesGrid = document.getElementById("categories-grid");

categories["results"].forEach((category) => {
  const wrapper = document.createElement("div");
  wrapper.className =
    "category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group";
  wrapper.dataset.category = category.name;
  wrapper.innerHTML = `
    <div class="flex items-center gap-2.5 overflow-hidden">
      <div class="flex-shrink-0 text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
        <img src="${category.thumbnail}" alt="${category.name}">
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-bold text-gray-900">${category.name}</h3>
      </div>
    </div>
  `;
  categoriesGrid.appendChild(wrapper);
});
categoriesGrid.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedCategory = card.dataset.category;
    categoriesGrid.querySelectorAll(".category-card").forEach((card) => {
      card.className =
        "category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group";
    });
    card.className =
      "category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-400 shadow-md cursor-pointer transition-all group";
    filterRecipes();
  });
});

const fetchMeals = async () => {
  const meals = await fetch(baseUrl + `/meals/search`);
  return meals.json();
};

const meals = await fetchMeals();
recipes = meals.results;
recipesCount = recipes.length;
document.getElementById("recipes-count").innerText =
  `Showing ${recipesCount} recipes`;
const recipesGrid = document.getElementById("recipes-grid");

const showRecipes = (meals = recipes) => {
  recipesGrid.innerHTML = "";
  meals.forEach((meal) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
    wrapper.dataset.mealId = meal.id;
    wrapper.innerHTML = `
  <div class="relative h-48 overflow-hidden">
    <img
      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      src="${meal.thumbnail}"
      alt="${meal.name}"
      loading="lazy"
    />
    <div class="absolute bottom-3 left-3 flex gap-2">
      <span
        class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
      >
        ${meal.category}
      </span>
      <span
        class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
      >
        ${meal.area}
      </span>
    </div>
  </div>
  <div class="p-4">
    <h3
      class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
    >
      ${meal.name}
    </h3>
    <p class="text-xs text-gray-600 mb-3 line-clamp-2">
      Delicious recipe to try!
    </p>
    <div class="flex items-center justify-between text-xs">
      <span class="font-semibold text-gray-900">
        <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
        ${meal.category}
      </span>
      <span class="font-semibold text-gray-500">
        <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
        ${meal.area}
      </span>
    </div>
  </div>
  `;

    wrapper.addEventListener("click", () => {
      console.log("clicked", meal);
      localStorage.setItem("meal", JSON.stringify(meal));
      window.location.href = "meal.html";
    });
    recipesGrid.appendChild(wrapper);
  });
};
showRecipes();

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  filterRecipes();
});
