// 引入資料
const foodDatabase = [
    // 蛋白質類
    { name: "雞胸肉", category: "protein", weightPerServing: 30, protein: 7, carb: 0, fat: 3, calories: 55 },
    { name: "鮭魚", category: "protein", weightPerServing: 35, protein: 7, carb: 0, fat: 5, calories: 75 },
    { name: "雞蛋 (大)", category: "protein", weightPerServing: 55, protein: 7, carb: 0.5, fat: 5, calories: 75 },
    { name: "豆腐 (板豆腐)", category: "protein", weightPerServing: 80, protein: 7, carb: 0, fat: 5, calories: 75 },
    { name: "希臘優格 (無糖)", category: "protein", weightPerServing: 210, protein: 8, carb: 12, fat: 8, calories: 150 },
    { name: "全脂奶", category: "protein", weightPerServing: 240, protein: 8, carb: 12, fat: 8, calories: 150 }, 
    { name: "豆漿 (無糖)", category: "protein", weightPerServing: 190, protein: 7, carb: 0, fat: 3, calories: 55 }, 
    // 碳水化合物類
    { name: "糙米飯", category: "carb", weightPerServing: 20, protein: 2, carb: 15, fat: 0, calories: 70 },
    { name: "地瓜", category: "carb", weightPerServing: 80, protein: 1.3, carb: 16, fat: 0, calories: 70 },
    { name: "全麥麵包", category: "carb", weightPerServing: 30, protein: 2, carb: 15, fat: 0, calories: 70 },
    { name: "馬鈴薯", category: "carb", weightPerServing: 90, protein: 2, carb: 15, fat: 0, calories: 70 },
    // 脂肪類
    { name: "酪梨", category: "fat", weightPerServing: 40, protein: 0, carb: 0, fat: 5, calories: 45 },
    { name: "橄欖油", category: "fat", weightPerServing: 5, protein: 0, carb: 0, fat: 5, calories: 45 },
    { name: "花生醬 (無糖)", category: "fat", weightPerServing: 9, protein: 0, carb: 0, fat: 5, calories: 45 },
    { name: "堅果 (杏仁)", category: "fat", weightPerServing: 7, protein: 0, carb: 0, fat: 5, calories: 45 },
];

// Define serving standards (grams of nutrient per serving)
const PROTEIN_PER_SERVING_G = 7;
const CARBS_PER_SERVING_G = 15;
const FAT_PER_SERVING_G = 5;

// 全局變數，用於儲存目標巨量營養素 (克)
let targetMacros = {
    protein: 0,
    carbs: 0,
    fat: 0,
    total: 0 // 目標總熱量
};

function calculateBMR(weight, height, age, gender) {
  return gender === 'male'
    ? 13.7 * weight + 5 * height - 6.8 * age + 66.5
    : 9.56 * weight + 1.85 * height - 4.7 * age + 655.1;
}

function calculateTDEE(weight, height, age, gender, activityLevel) {
  return calculateBMR(weight, height, age, gender) * activityLevel;
}

function calculateCaloricNeeds(tdee, goal) {
  switch (goal) {
    case 'lose': return tdee - 500;
    case 'gain': return tdee + 500;
    default: return tdee;
  }
}

// 顯示三大營養素的目標值
function displayMacronutrients(caloricNeeds, mode) {
  const macroDiv = document.getElementById('macro-summary');
  macroDiv.style.display = "block";
  const modeRatios = {
    low: { carbs: 0.2, protein: 0.4, fat: 0.4 },
    medium: { carbs: 0.4, protein: 0.3, fat: 0.3 },
    high: { carbs: 0.6, protein: 0.2, fat: 0.2 }
  };
  const ratio = modeRatios[mode];

  // 更新全局 targetMacros 變數
  targetMacros.protein = Math.round((caloricNeeds * ratio.protein) / 4);
  targetMacros.carbs = Math.round((caloricNeeds * ratio.carbs) / 4);
  targetMacros.fat = Math.round((caloricNeeds * ratio.fat) / 9);
  targetMacros.total = caloricNeeds; // 更新目標總熱量

  const calculatedTotalCalories = Math.round(targetMacros.protein * 4 + targetMacros.carbs * 4 + targetMacros.fat * 9);

  macroDiv.innerHTML = `
    <h3>目標三大營養素攝取量</h3>
    <div class="macro-item">蛋白質：${targetMacros.protein} 克</div>
    <div class="macro-item">碳水化合物：${targetMacros.carbs} 克</div>
    <div class="macro-item">脂肪：${targetMacros.fat} 克</div>
    <div class="macro-item"><strong>總熱量：${calculatedTotalCalories} 大卡</strong></div>
  `;
}

// --- 食物代換表相關的JS邏輯 ---

/**
 * 初始化食物表格，根據 foodDatabase 動態生成表格行。
 */
function initializeFoodExchangeTable() {
    const proteinBody = document.querySelector('#protein-foods tbody');
    const carbBody = document.querySelector('#carb-foods tbody');
    const fatBody = document.querySelector('#fat-foods tbody');

    // 清空現有內容，避免重複添加
    proteinBody.innerHTML = '';
    carbBody.innerHTML = '';
    fatBody.innerHTML = '';

    foodDatabase.forEach((food, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${food.name}</td>
            <td>${food.weightPerServing}</td>
            <td>${food.protein}</td>
            <td>${food.carb}</td>
            <td>${food.fat}</td>
            <td><input type="number" min="0" value="0" data-food-index="${index}"></td>
            <td class="total-protein">0</td>
            <td class="total-carb">0</td>
            <td class="total-fat">0</td>
            <td class="total-calories">0</td>
        `;

        if (food.category === 'protein') {
            proteinBody.appendChild(row);
        } else if (food.category === 'carb') {
            carbBody.appendChild(row);
        } else if (food.category === 'fat') {
            fatBody.appendChild(row);
        }
    });

    // 為所有份數輸入框添加事件監聽器，當輸入值改變時觸發計算
    document.querySelectorAll('.food-exchange-table input[type="number"]').forEach(input => {
        input.addEventListener('input', calculateFoodExchangeTotals);
    });
}

/**
 * 計算所有食物的總攝取量，並更新顯示。
 * 這個函數會在用戶輸入份數時被調用，同時更新目標份數的剩餘量。
 */
function calculateFoodExchangeTotals() {
    let grandTotalProtein = 0;
    let grandTotalCarb = 0;
    let grandTotalFat = 0;
    let grandTotalCalories = 0;

    document.querySelectorAll('.food-exchange-table tbody tr').forEach(row => {
        const inputElement = row.querySelector('input[type="number"]');
        if (!inputElement) return;

        const foodIndex = inputElement.dataset.foodIndex;
        const food = foodDatabase[foodIndex];
        const servings = parseFloat(inputElement.value) || 0;

        const totalProtein = food.protein * servings;
        const totalCarb = food.carb * servings;
        const totalFat = food.fat * servings;
        const totalCalories = food.calories ? food.calories * servings : (totalProtein * 4) + (totalCarb * 4) + (totalFat * 9);

        row.querySelector('.total-protein').textContent = totalProtein.toFixed(1);
        row.querySelector('.total-carb').textContent = totalCarb.toFixed(1);
        row.querySelector('.total-fat').textContent = totalFat.toFixed(1);
        row.querySelector('.total-calories').textContent = totalCalories.toFixed(1);

        grandTotalProtein += totalProtein;
        grandTotalCarb += totalCarb;
        grandTotalFat += totalFat;
        grandTotalCalories += totalCalories;
    });

    // 更新食物代換表的總計區域
    document.getElementById('total-protein').textContent = grandTotalProtein.toFixed(1);
    document.getElementById('total-carb').textContent = grandTotalCarb.toFixed(1);
    document.getElementById('total-fat').textContent = grandTotalFat.toFixed(1);
    document.getElementById('total-calories').textContent = grandTotalCalories.toFixed(1);

    // --- 計算並顯示剩餘份數 ---
    updateRemainingServingsDisplay(grandTotalProtein, grandTotalCarb, grandTotalFat);
}

/**
 * 根據已攝取量和目標量，更新剩餘份數的顯示。
 * 這個函數會在 TDEE 計算完成和食物份數輸入改變時被調用。
 * @param {number} consumedProtein_g - 已攝取蛋白質克數
 * @param {number} consumedCarb_g - 已攝取碳水化合物克數
 * @param {number} consumedFat_g - 已攝取脂肪克數
 */
function updateRemainingServingsDisplay(consumedProtein_g, consumedCarb_g, consumedFat_g) {
    const proteinTargetServingsEl = document.getElementById('protein-target-servings');
    const carbsTargetServingsEl = document.getElementById('carbs-target-servings');
    const fatTargetServingsEl = document.getElementById('fat-target-servings');

    // 計算剩餘克數
    const remainingProtein_g = targetMacros.protein - consumedProtein_g;
    const remainingCarb_g = targetMacros.carbs - consumedCarb_g;
    const remainingFat_g = targetMacros.fat - consumedFat_g;

    // 將剩餘克數轉換為份數
    const remainingProteinServings = remainingProtein_g / PROTEIN_PER_SERVING_G;
    const remainingCarbServings = remainingCarb_g / CARBS_PER_SERVING_G;
    const remainingFatServings = remainingFat_g / FAT_PER_SERVING_G;

    // 更新顯示
    if (proteinTargetServingsEl) {
        proteinTargetServingsEl.textContent = `(剩餘約 ${remainingProteinServings.toFixed(1)} 份)`;
    }
    if (carbsTargetServingsEl) {
        carbsTargetServingsEl.textContent = `(剩餘約 ${remainingCarbServings.toFixed(1)} 份)`;
    }
    if (fatTargetServingsEl) {
        fatTargetServingsEl.textContent = `(剩餘約 ${remainingFatServings.toFixed(1)} 份)`;
    }
}


// --- TDEE計算與渲染邏輯 ---
function calculateAndRenderTDEE() {
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const ageInput = document.getElementById('age');
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const activityLevelInput = document.getElementById('activity-level');
    const goalInput = document.getElementById('goal');
    const carbTypeInput = document.getElementById('carb-type');

    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const age = parseFloat(ageInput.value);
    const gender = genderInput ? genderInput.value : null;
    const activityLevel = parseFloat(activityLevelInput.value);
    const goal = goalInput.value;
    const carbType = carbTypeInput.value;

    // 確保所有必要輸入都有值且有效，才能進行計算和顯示結果
    if (isNaN(weight) || isNaN(height) || isNaN(age) || !gender || isNaN(activityLevel) || weight <= 0 || height <= 0 || age <= 0) {
        document.getElementById('results').style.display = 'none'; // 隱藏結果區塊
        document.getElementById('tdee-result').textContent = '';
        document.getElementById('caloric-needs-result').textContent = '';
        document.getElementById('macro-summary').style.display = 'none'; // 隱藏三大營養素目標

        // 清空目標/剩餘份數顯示
        updateRemainingServingsDisplay(0, 0, 0); // 將已攝取設為0，以顯示完整的目標份數
        return;
    }

    const tdee = calculateTDEE(weight, height, age, gender, activityLevel);
    const caloricNeeds = calculateCaloricNeeds(tdee, goal);

    document.getElementById('tdee-result').textContent = `TDEE: ${tdee.toFixed(2)} 大卡`;
    document.getElementById('caloric-needs-result').textContent = `熱量需求: ${caloricNeeds.toFixed(2)} 大卡`;
    document.getElementById('results').style.display = 'block'; // 顯示結果區塊

    // 顯示目標巨量營養素攝取量 (這個函數會更新全局 targetMacros)
    displayMacronutrients(caloricNeeds, carbType);

    // 在 TDEE 和目標巨量營養素更新後，重新計算食物代換表的總計，
    // 這將會間接觸發 updateRemainingServingsDisplay
    calculateFoodExchangeTotals();
}


// 在 DOM 內容完全載入後執行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化食物代換表
    initializeFoodExchangeTable();

    // 頁面載入時執行一次 TDEE 計算和渲染，以顯示預設值和初始目標份數
    calculateAndRenderTDEE();

    // 監聽 TDEE 計算器所有相關輸入欄位的變化事件，觸發即時計算和渲染
    document.getElementById('weight').addEventListener('input', calculateAndRenderTDEE);
    document.getElementById('height').addEventListener('input', calculateAndRenderTDEE);
    document.getElementById('age').addEventListener('input', calculateAndRenderTDEE);

    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', calculateAndRenderTDEE);
    });

    document.getElementById('activity-level').addEventListener('change', calculateAndRenderTDEE);
    document.getElementById('goal').addEventListener('change', calculateAndRenderTDEE);
    document.getElementById('carb-type').addEventListener('change', calculateAndRenderTDEE);

    // 移除原有的表單提交事件監聽器，因為現在是即時更新
    const form = document.getElementById('calculator-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // 防止表單真的提交，頁面刷新
    });
});