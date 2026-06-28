let selectedRecipe = JSON.parse(localStorage.getItem("meal"));

const mealImage = document.getElementById("meal-image");
const mealName = document.getElementById("meal-name");
const mealCategory = document.getElementById("meal-category");
const mealArea = document.getElementById("meal-area");

const ingredientsGrid = document.getElementById("ingredients-grid");
const instructionsGrid = document.getElementById("instructions-grid");

const mealVideo = document.getElementById("meal-video");

const backBtn = document.getElementById("back-to-meals-btn");
backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

const logMealBtn = document.getElementById("log-meal-btn");
logMealBtn.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];

  const foodLog = JSON.parse(localStorage.getItem("foodLog")) || {};

  if (!foodLog[today]) {
    foodLog[today] = [];
  }

  foodLog[today].push(selectedRecipe);

  localStorage.setItem("foodLog", JSON.stringify(foodLog));

  alert("Meal logged successfully! ✅");
});

window.addEventListener("load", () => {
  selectedRecipe = JSON.parse(localStorage.getItem("meal"));
  mealImage.src = selectedRecipe.thumbnail;
  mealName.textContent = selectedRecipe.name;
  mealCategory.textContent = selectedRecipe.category;
  mealArea.textContent = selectedRecipe.area;

  document.getElementById("ingredients-count").innerText =
    selectedRecipe.ingredients.length + "items";

  selectedRecipe.ingredients.forEach((ingredient) => {
    const ingredientsWrapper = document.createElement("div");
    ingredientsWrapper.className =
      "flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors";
    ingredientsWrapper.innerHTML = `
        <input
          type="checkbox"
          class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
        />
        <span class="text-gray-700">
          <span class="font-medium text-gray-900">${ingredient.measure}</span>
          ${ingredient.ingredient}
        </span>
      `;
    ingredientsGrid.appendChild(ingredientsWrapper);
  });

  selectedRecipe.instructions.forEach((instruction, i) => {
    const instructionsWrapper = document.createElement("div");
    instructionsWrapper.className =
      "flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors";
    instructionsWrapper.innerHTML = `
        <div
          class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
        >
          ${i + 1}
        </div>
        <p class="text-gray-700 leading-relaxed pt-2">
          ${instruction}
        </p>
      `;
    instructionsGrid.appendChild(instructionsWrapper);
  });

  mealVideo.src = `https://www.youtube.com/embed/${selectedRecipe.youtube.split("v=")[1]}`;
});
