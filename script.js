// 引入資料
const foodData = {
  protein: [
    { name: "鮪魚", calories: 132, protein: 28, carbs: 0, fat: 1 },
    { name: "花枝", calories: 92, protein: 15, carbs: 3, fat: 1 },
    { name: "一般魚類", calories: 110, protein: 22, carbs: 0, fat: 2 },
    { name: "雞胸", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "豬肝", calories: 135, protein: 20, carbs: 2, fat: 4 },
    { name: "雞蛋白", calories: 52, protein: 11, carbs: 1, fat: 0.2 },
    { name: "無糖豆漿", calories: 45, protein: 3.5, carbs: 2, fat: 2 },
    { name: "雞腿", calories: 180, protein: 25, carbs: 0, fat: 8 },
    { name: "雞蛋", calories: 155, protein: 13, carbs: 1, fat: 11 },
    { name: "牛肉", calories: 250, protein: 26, carbs: 0, fat: 17 },
    { name: "高蛋白", calories: 120, protein: 24, carbs: 2, fat: 2 }
  ],
  fat: [
    { name: "沙拉醬", calories: 600, protein: 0, carbs: 3, fat: 66 },
    { name: "鮮奶油", calories: 340, protein: 2, carbs: 3, fat: 36 },
    { name: "花生粉", calories: 570, protein: 25, carbs: 20, fat: 45 },
    { name: "腰果", calories: 553, protein: 18, carbs: 30, fat: 44 },
    { name: "油", calories: 884, protein: 0, carbs: 0, fat: 100 }
  ],
  carbs: [
    { name: "飯", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    { name: "麥片", calories: 380, protein: 10, carbs: 70, fat: 6 },
    { name: "拉麵", calories: 450, protein: 9, carbs: 65, fat: 15 },
    { name: "馬鈴薯", calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    { name: "番薯", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 }
  ]
};

function loadFoodOptions() {
  const createOption = (el, idPrefix, list, category) => {
    list.forEach(food => {
      const div = document.createElement('div');
      div.classList.add('food-item');
      div.innerHTML = `
        <input type="checkbox" id="${idPrefix}-${food.name}" value="${food.name}" data-category="${category}">
        <label for="${idPrefix}-${food.name}">${food.name} (每100克: ${food.calories} 大卡)</label>
      `;
      el.appendChild(div);
    });
  };
  createOption(document.getElementById('protein-food'), 'protein', foodData.protein, 'protein');
  createOption(document.getElementById('carb-food'), 'carbs', foodData.carbs, 'carbs');
  createOption(document.getElementById('fat-food'), 'fat', foodData.fat, 'fat');
}

function calculateBMR(weight, height, age, gender) {
  return gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
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

// 修改 displayMacronutrients 函數，顯示目標值
function displayMacronutrients(caloricNeeds, mode) {
  const macroDiv = document.getElementById('macro-summary');
  const modeRatios = {
    low: { carbs: 0.2, protein: 0.4, fat: 0.4 },
    medium: { carbs: 0.35, protein: 0.3, fat: 0.35 },
    high: { carbs: 0.5, protein: 0.3, fat: 0.2 }
  };
  const ratio = modeRatios[mode];
  const proteinGrams = Math.round((caloricNeeds * ratio.protein) / 4);
  const carbGrams = Math.round((caloricNeeds * ratio.carbs) / 4);
  const fatGrams = Math.round((caloricNeeds * ratio.fat) / 9);

  const calculatedTotalCalories = Math.round(proteinGrams * 4 + carbGrams * 4 + fatGrams * 9);

  macroDiv.innerHTML = `
    <h3>目標巨量營養素攝取量</h3>
    <div class="macro-item">蛋白質：${proteinGrams} 克</div>
    <div class="macro-item">碳水化合物：${carbGrams} 克</div>
    <div class="macro-item">脂肪：${fatGrams} 克</div>
    <div class="macro-item"><strong>總熱量：${calculatedTotalCalories} 大卡</strong></div>
  `;
}

function displayFoodPortions(foodPortions) {
  const resultDiv = document.getElementById('food-portion-results');
  resultDiv.innerHTML = '';
  if (foodPortions.length === 0) {
    resultDiv.textContent = '請至少每類選一項食物。';
    return;
  }
  resultDiv.innerHTML += '<h3>各食物建議份量</h3>'; // 新增標題
  foodPortions.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('food-result-item');
    // 如果是警告訊息 (amount 為 0 且名稱包含 '⚠️')，則不顯示 '0 克'
    if (item.amount === 0 && item.name.startsWith('⚠️')) {
      div.textContent = `${item.name}`;
    } else {
      div.textContent = `${item.name} ${item.amount} 克`;
    }
    resultDiv.appendChild(div);
  });
}

function calculateFoodPortionsSimple(selectedFoods, targetMacros) {
  const result = [];
  const actualMacros = { protein: 0, carbs: 0, fat: 0 };
  const nutrientMap = {
    protein: "protein",
    carbs: "carbs",
    fat: "fat"
  };

  const foodMaxLimit = { // 這些限制將主要應用於脂肪類食物
    "沙拉醬": 60,
    "油": 60,
    "腰果": 60,
    "花生粉": 60,
    "鮮奶油": 60
  };

  // 定義一個非常大的數字，作為蛋白質和碳水化合物的「無限制」上限
  const UNLIMITED_GRAMS = 50000; // 50公斤，實際應用中可視為無限

  for (const group in selectedFoods) {
    const foods = selectedFoods[group];
    const key = nutrientMap[group];
    const totalNeed = targetMacros[key];
    const totalValue = foods.reduce((sum, food) => sum + food[key], 0);

    foods.forEach(food => {
      // 避免除以零
      if (food[key] === 0) {
        // 使用 macroTypeMap 確保警告訊息是中文
        const macroTypeMap = {
            protein: '蛋白質',
            carbs: '碳水化合物',
            fat: '脂肪'
        };
        result.push({ name: `⚠️ ${food.name} 不提供 ${macroTypeMap[key]}，請選擇其他食物。`, amount: 0 });
        return;
      }

      const ratio = food[key] / totalValue;
      let gram = (totalNeed * 100 * ratio) / food[key];

      let limit;
      // 如果是蛋白質或碳水化合物，設定一個非常高的上限，使其幾乎無限制
      if (key === 'protein' || key === 'carbs') {
          limit = UNLIMITED_GRAMS;
      } else { // 否則，套用脂肪類的現有限制或預設 300g
          limit = foodMaxLimit[food.name] || 300;
      }
      
      gram = Math.min(gram, limit);

      result.push({ name: food.name, amount: Math.round(gram) });
      actualMacros[key] += (gram * food[key]) / 100;
    });

    // 將 macroType 轉換為中文 (為了下面的警告訊息)
    const macroTypeMap = {
        protein: '蛋白質',
        carbs: '碳水化合物',
        fat: '脂肪'
    };

    // 若實際攝取量遠低於需求，提示使用者增加其他食材 (更新為全中文)
    if (actualMacros[key] < totalNeed * 0.85 && totalNeed > 0) {
      result.push({ name: `⚠️ ${macroTypeMap[key]} 攝取不足，請考慮增加相關食物或調整目標。`, amount: 0 });
    }
  }

  return { portions: result, actualMacros };
}


function evaluateMacronutrientMatch(actual, target) {
  const errors = {};
  errors.protein = target.protein !== 0 ? Math.round(((actual.protein - target.protein) / target.protein) * 100) : 0;
  errors.carbs = target.carbs !== 0 ? Math.round(((actual.carbs - target.carbs) / target.carbs) * 100) : 0;
  errors.fat = target.fat !== 0 ? Math.round(((actual.fat - target.fat) / target.fat) * 100) : 0;
  return errors;
}

// 修改 displayEvaluation 函數，顯示實際值
function displayEvaluation(errors, targetMacros, actualMacros) {
  const summary = document.getElementById("balance-summary");
  summary.innerHTML = ''; // 清空原有內容
  let html = "<h3>實際巨量營養素攝取量</h3>";
  html += "<ul style='padding-left:1em;'>";
  html += `<li class="macro-item">蛋白質：${Math.round(actualMacros.protein)} 克 (目標: ${Math.round(targetMacros.protein)} 克)</li>`;
  html += `<li class="macro-item">碳水化合物：${Math.round(actualMacros.carbs)} 克 (目標: ${Math.round(targetMacros.carbs)} 克)</li>`;
  html += `<li class="macro-item">脂肪：${Math.round(actualMacros.fat)} 克 (目標: ${Math.round(targetMacros.fat)} 克)</li>`;
  html += `<li class="macro-item"><strong>總熱量：${Math.round(actualMacros.totalCalories)} 大卡 (目標: ${Math.round(targetMacros.total)} 大卡)</strong></li>`;
  html += "</ul>";

  html += "<h3>各營養素與目標的誤差</h3>";
  html += "<ul style='padding-left:1em;'>";
  const warnList = [];

  const assess = (val, name, key) => {
    if (Math.abs(val) <= 10) {
      html += `<li>✅ ${name} 接近目標（誤差 ${val}%）</li>`;
    } else if (val > 10) {
      html += `<li>⚠️ ${name} 過高（+${val}%）。考慮減少相關食物份量。`;
      if (key === 'fat') {
          html += `<strong style='color: red;'> 特別是高熱量密度的油、沙拉醬、堅果等。</strong>`;
      }
      html += `</li>`;
      if (val > 30) warnList.push(key);
    } else {
      html += `<li>⚠️ ${name} 過低（${val}%）。考慮增加相關食物份量。</li>`;
      if (val < -30) warnList.push(key);
    }
  };

  assess(errors.protein, "蛋白質", "protein");
  assess(errors.carbs, "碳水化合物", "carbs");
  assess(errors.fat, "脂肪", "fat");
  html += "</ul>";

  if (warnList.length > 0) {
    html += "<p><strong>調整建議：</strong></p>";
    html += "<ul>";
    if (warnList.includes('protein')) {
      html += "<li>您的蛋白質攝取量與目標差距較大，請檢查所選蛋白質食物的份量或考慮選擇更多不同種類的蛋白質來源。</li>";
    }
    if (warnList.includes('carbs')) {
      html += "<li>您的碳水化合物攝取量與目標差距較大，請檢查所選碳水食物的份量或考慮調整碳水類型 (低/中/高)。</li>";
    }
    if (warnList.includes('fat')) {
      html += "<li>您的脂肪攝取量與目標差距較大，特別是如果脂肪過高，請<strong style='color: red;'>務必注意減少高熱量密度的油、沙拉醬、堅果等份量</strong>，或替換為脂肪含量較低的食材。</li>";
    }
    html += "<li>如果持續難以達成目標，您可能需要：</li>";
    html += "<ul>";
    html += "<li>選擇更多不同種類的食物，以提供更豐富的營養素來源。</li>";
    html += "<li>重新評估您的熱量需求或巨量營養素比例設定。</li>";
    html += "</ul>";
    html += "</ul>";
  } else {
    html += "<p>您的飲食巨量營養素比例良好，請繼續保持！</p>";
  }

  summary.innerHTML = html;
  summary.style.display = "block";
}

const form = document.getElementById('calculator-form');
form.addEventListener('submit', function (event) {
  event.preventDefault();
  document.getElementById('results').style.display = 'block';
  const summaryDiv = document.getElementById('balance-summary');
  if (summaryDiv) summaryDiv.style.display = "none"; // 隱藏舊的評估區塊

  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const age = parseFloat(document.getElementById('age').value);
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const activityLevel = parseFloat(document.getElementById('activity-level').value);
  const goal = document.getElementById('goal').value;
  const carbType = document.getElementById('carb-type').value;

  const tdee = calculateTDEE(weight, height, age, gender, activityLevel);
  const caloricNeeds = calculateCaloricNeeds(tdee, goal);
  document.getElementById('tdee-result').textContent = `TDEE: ${tdee.toFixed(2)} 大卡`;
  document.getElementById('caloric-needs-result').textContent = `熱量需求: ${caloricNeeds.toFixed(2)} 大卡`;

  const selectedProteins = Array.from(document.querySelectorAll('#protein-food input:checked')).map(input =>
    foodData.protein.find(f => f.name === input.value));
  const selectedCarbs = Array.from(document.querySelectorAll('#carb-food input:checked')).map(input =>
    foodData.carbs.find(f => f.name === input.value));
  const selectedFats = Array.from(document.querySelectorAll('#fat-food input:checked')).map(input =>
    foodData.fat.find(f => f.name === input.value));

  if (!selectedProteins.length || !selectedCarbs.length || !selectedFats.length) {
    alert("請至少每類選擇一種食物（碳水、蛋白質、脂肪）");
    return;
  }

  const selectedFoods = {
    protein: selectedProteins,
    carbs: selectedCarbs,
    fat: selectedFats
  };

  // 先計算出實際巨量營養素和誤差，再根據順序顯示
  const macroRatios = {
    low: { carbs: 0.2, protein: 0.4, fat: 0.4 },
    medium: { carbs: 0.35, protein: 0.3, fat: 0.35 },
    high: { carbs: 0.5, protein: 0.3, fat: 0.2 }
  };

  const target = macroRatios[carbType];
  const targetMacros = {
    total: caloricNeeds,
    protein: caloricNeeds * target.protein / 4,
    carbs: caloricNeeds * target.carbs / 4,
    fat: caloricNeeds * target.fat / 9
  };

  const { portions, actualMacros } = calculateFoodPortionsSimple(selectedFoods, targetMacros);
  const errors = evaluateMacronutrientMatch(actualMacros, targetMacros);

  // 調整顯示順序
  displayMacronutrients(caloricNeeds, carbType); // 顯示目標值
  displayEvaluation(errors, targetMacros, actualMacros); // 顯示實際值和評估
  displayFoodPortions(portions); // 顯示食物份量
});

loadFoodOptions();