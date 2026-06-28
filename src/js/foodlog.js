const loggedItemsList = document.getElementById("logged-items-list");
const clearBtn = document.getElementById("clear-foodlog");

const GOALS = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

const MEAL_NUTRIENTS = { calories: 485, protein: 50, carbs: 250, fat: 65 };

const getEntryNutrients = (entry) => {
  if (entry.type === "product" && entry.nutrients) {
    return {
      calories: entry.nutrients.calories ?? 0,
      protein: entry.nutrients.protein ?? 0,
      carbs: entry.nutrients.carbs ?? 0,
      fat: entry.nutrients.fat ?? 0,
    };
  }
  return { ...MEAL_NUTRIENTS };
};

const sumNutrients = (entries) =>
  entries.reduce(
    (acc, entry) => {
      const n = getEntryNutrients(entry);
      acc.calories += n.calories;
      acc.protein += n.protein;
      acc.carbs += n.carbs;
      acc.fat += n.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

const updateProgressBar = (selector, value, goal, unit) => {
  const section = document.querySelector(selector);
  if (!section) return;
  // The value span is the second <span> inside the flex row
  const spans = section.querySelectorAll(".flex span");
  if (spans[1]) spans[1].textContent = `${Math.round(value)} / ${goal} ${unit}`;
  // The fill bar is the inner div of the progress track
  const fill = section.querySelector(".bg-gray-200 div");
  if (fill) fill.style.width = `${Math.min((value / goal) * 100, 100)}%`;
};

const gradeClass = (g = "") =>
  ({
    a: "bg-green-500",
    b: "bg-lime-500",
    c: "bg-yellow-500",
    d: "bg-orange-500",
    e: "bg-red-500",
  })[g.toLowerCase()] ?? "bg-gray-400";

const renderFoodLog = () => {
  const today = new Date().toISOString().split("T")[0];
  const foodLog = JSON.parse(localStorage.getItem("foodLog")) || {};
  const entries = foodLog[today] || [];
  const totals = sumNutrients(entries);

  updateProgressBar(".bg-emerald-50", totals.calories, GOALS.calories, "kcal");
  updateProgressBar(".bg-blue-50", totals.protein, GOALS.protein, "g");
  updateProgressBar(".bg-amber-50", totals.carbs, GOALS.carbs, "g");
  updateProgressBar(".bg-purple-50", totals.fat, GOALS.fat, "g");

  document.querySelector("#foodlog-today-section h4").textContent =
    `Logged Items (${entries.length})`;

  loggedItemsList.innerHTML = "";

  if (!entries.length) {
    clearBtn.style.display = "none";
    loggedItemsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>`;
    return;
  }

  clearBtn.style.display = "block";

  entries.forEach((entry, index) => {
    const nutrients = getEntryNutrients(entry);
    const isProduct = entry.type === "product";
    const item = document.createElement("div");

    item.className =
      "flex items-center justify-between bg-gray-50 rounded-xl p-3";

    const thumbHtml = entry.thumbnail
      ? `<img src="${entry.thumbnail}" class="w-14 h-14 rounded-lg object-cover" />`
      : `<div class="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
           <i class="fa-solid fa-${isProduct ? "box" : "utensils"} text-gray-400 text-xl"></i>
         </div>`;

    const subtitleHtml = isProduct
      ? `<p class="text-sm text-gray-500">${entry.brand || "Packaged Product"}</p>
         ${
           entry.nutritionGrade
             ? `<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase ${gradeClass(entry.nutritionGrade)}">
                Nutri-Score ${entry.nutritionGrade.toUpperCase()}
              </span>`
             : ""
         }`
      : `<p class="text-sm text-gray-500">${entry.category ?? ""} ${entry.area ? "• " + entry.area : ""}</p>`;

    item.innerHTML = `
      <div class="flex items-center gap-3">
        ${thumbHtml}
        <div>
          <h4 class="font-semibold text-gray-900">${entry.name}</h4>
          ${subtitleHtml}
          <p class="text-sm font-semibold text-emerald-600 mt-0.5">
            ${Math.round(nutrients.calories)} kcal
            <span class="text-gray-400 font-normal text-xs ml-2">
              P ${Math.round(nutrients.protein)}g · C ${Math.round(nutrients.carbs)}g · F ${Math.round(nutrients.fat)}g
            </span>
          </p>
        </div>
      </div>
      <button class="remove-entry text-red-500 hover:text-red-600 ml-3 shrink-0" data-index="${index}">
        <i class="fa-solid fa-trash"></i>
      </button>`;

    loggedItemsList.appendChild(item);
  });

  document.querySelectorAll(".remove-entry").forEach((btn) => {
    btn.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      const foodLog = JSON.parse(localStorage.getItem("foodLog")) || {};

      foodLog[today].splice(Number(btn.dataset.index), 1);

      if (foodLog[today].length === 0) delete foodLog[today];

      localStorage.setItem("foodLog", JSON.stringify(foodLog));
      renderFoodLog();
      renderWeeklyOverview();
    });
  });
};

clearBtn.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  const foodLog = JSON.parse(localStorage.getItem("foodLog")) || {};
  delete foodLog[today];
  localStorage.setItem("foodLog", JSON.stringify(foodLog));
  renderFoodLog();
  renderWeeklyOverview();
});

const renderWeeklyOverview = () => {
  const foodLog = JSON.parse(localStorage.getItem("foodLog")) || {};
  const container = document.getElementById("weekly-days");
  container.innerHTML = "";

  const today = new Date();
  let totalWeekCalories = 0;
  let totalItems = 0;
  let daysOnGoal = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const entries = foodLog[key] || [];
    const totals = sumNutrients(entries);

    totalWeekCalories += totals.calories;
    totalItems += entries.length;

    if (totals.calories > 0 && totals.calories <= GOALS.calories) daysOnGoal++;

    const isToday = key === today.toISOString().split("T")[0];
    const card = document.createElement("div");

    card.className = `rounded-2xl p-4 text-center transition ${
      isToday ? "bg-indigo-100 border border-indigo-200" : ""
    }`;

    card.innerHTML = `
      <p class="text-gray-500 text-sm">${date.toLocaleDateString("en-US", { weekday: "short" })}</p>
      <p class="font-bold text-lg">${date.getDate()}</p>
      <p class="text-4xl font-bold mt-4 ${isToday ? "text-emerald-600" : "text-gray-300"}">
        ${Math.round(totals.calories)}
      </p>
      <p class="text-gray-400">kcal</p>
      <p class="text-gray-500 mt-2">${entries.length} ${entries.length === 1 ? "item" : "items"}</p>`;

    container.appendChild(card);
  }

  document.getElementById("weekly-average").textContent =
    `${Math.round(totalWeekCalories / 7)} kcal`;
  document.getElementById("weekly-items").textContent = `${totalItems} items`;
  document.getElementById("days-on-goal").textContent = `${daysOnGoal} / 7`;
};

document.getElementById("today-date").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

renderFoodLog();
renderWeeklyOverview();
