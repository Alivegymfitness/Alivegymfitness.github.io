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

function calculateFoodPortionsSimple(selectedFoods, targetMacros, carbType, goal) { // 新增 goal 參數
  const result = [];
  const actualMacros = { protein: 0, carbs: 0, fat: 0, totalCalories: 0 }; // 新增 totalCalories
  const nutrientMap = {
    protein: "protein",
    carbs: "carbs",
    fat: "fat"
  };

  const foodMaxLimit = {
    // 脂肪類食物的建議上限 (高熱量密度，建議較低)
    "沙拉醬": 60,
    "油": 40, // 將油的基礎上限從 60 調整為 40
    "腰果": 60,
    "花生粉": 60,
    "鮮奶油": 60,

    // 蛋白質類食物的建議上限 (為增加差異性而細化)
    "雞蛋": 100,       // 約2顆雞蛋
    "豬肝": 200,       // 內臟類份量通常較少
    "雞腿": 270,
    "雞蛋白": 350,     // 雞蛋白可大量攝取
    "無糖豆漿": 500,   // 約500ml
    "高蛋白": 60,     // 約2勺

    // 碳水化合物類食物的建議上限 (細化)

    "拉麵": 400,
    "馬鈴薯": 450,     // 澱粉根莖類可較多
    "番薯": 450
  };

  // 預設食物上限，用於未在 foodMaxLimit 中特別指定的食物
  const DEFAULT_FOOD_LIMIT = 300; 
  const UNLIMITED_GRAMS = 99999; // 定義一個足夠大的數字，作為「無上限」

  // --- 動態份量上限調整邏輯 ---
  const TARGET_CALORIES_THRESHOLD_FOR_MODERATE_INCREASE = 2500; // 中度增加的熱量門檻
  const TARGET_CALORIES_THRESHOLD_FOR_SIGNIFICANT_INCREASE = 3500; // 顯著增加的熱量門檻

  let generalLimitMultiplier = 1; // 預設通用乘數為 1

  if (targetMacros.total > TARGET_CALORIES_THRESHOLD_FOR_SIGNIFICANT_INCREASE) {
      generalLimitMultiplier = 1.7; // 如果總熱量非常高，通用上限提高 70%
  } else if (targetMacros.total > TARGET_CALORIES_THRESHOLD_FOR_MODERATE_INCREASE) {
      generalLimitMultiplier = 1.3; // 如果總熱量較高，通用上限提高 30%
  }

  // 食物角色分類 (主食 vs 配菜/輔助)
  const foodRoleMap = {
      // 主食類的蛋白質 (通常是主要肉品)
      "雞胸": 'main', "雞腿": 'main', "牛肉": 'main', "鮪魚": 'main', "一般魚類": 'main',
      // 配菜或輔助類的蛋白質 (通常份量較小或作為補充)
      "花枝": 'side', "豬肝": 'side', "雞蛋白": 'side', "無糖豆漿": 'side', "雞蛋": 'side', "高蛋白": 'side',

      // 主食類的碳水化合物
      "飯": 'main', "拉麵": 'main', "馬鈴薯": 'main', "番薯": 'main',
      // 配菜類的碳水化合物 (或份量相對較少的主食)
      "麥片": 'side', 

      // 脂肪通常是配菜/調味
      "沙拉醬": 'side', "鮮奶油": 'side', "花生粉": 'side', "腰果": 'side', "油": 'side'
  };

  // 根據食物角色給予不同的額外份量彈性
  const roleBasedMultiplier = {
      main: 1.1, // 主食類在通用乘數基礎上再額外放寬 10%
      side: 0.9  // 配菜類在通用乘數基礎上略為限制 10%
  };
  // --- 動態份量上限調整邏輯結束 ---


  for (const group in selectedFoods) {
    const foods = selectedFoods[group];
    const key = nutrientMap[group];
    const totalNeed = targetMacros[key];
    const totalValue = foods.reduce((sum, food) => sum + food[key], 0);

    foods.forEach(food => {
      // 避免除以零
      if (food[key] === 0) {
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

      // 獲取食物的角色
      const foodRole = foodRoleMap[food.name] || 'main'; 
      let currentFoodLimit; // 最終的單一食物上限

      // --- 根據碳水比例和食物角色調整上限 ---
      if (foodRole === 'main' && key === 'protein') {
          // 主菜類蛋白質
          if (carbType === 'low' || carbType === 'medium') {
              // 低/中碳飲食下，主菜蛋白質無上限
              currentFoodLimit = UNLIMITED_GRAMS;
          } else {
              // 高碳飲食下，主菜蛋白質仍受總熱量和角色乘數影響
              const baseLimit = foodMaxLimit[food.name] || DEFAULT_FOOD_LIMIT;
              const finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1);
              currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
          }
      } else if (foodRole === 'main' && key === 'carbs') {
          // 主食類碳水
          const baseLimit = foodMaxLimit[food.name] || DEFAULT_FOOD_LIMIT;
          let carbSpecificMultiplier = 1;
          if (carbType === 'high') {
              carbSpecificMultiplier = 1.5; // 高碳飲食下，主食碳水上限再額外放寬 50%
          } else if (carbType === 'medium') {
              carbSpecificMultiplier = 1.2; // 中碳飲食下，主食碳水上限放寬 20%
          }
          const finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1) * carbSpecificMultiplier;
          currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
      } else {
          // 其他食物（配菜、脂肪等），沿用原來的動態上限邏輯
          const baseLimit = foodMaxLimit[food.name] || DEFAULT_FOOD_LIMIT;
          const finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1);
          currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
      }
      // --- 上限調整邏輯結束 ---
      
      gram = Math.min(gram, currentFoodLimit);

      result.push({ name: food.name, amount: Math.round(gram) });
      actualMacros[key] += (gram * food[key]) / 100;
      // 計算實際總熱量
      actualMacros.totalCalories += (gram * food.calories) / 100; // 新增這行
    });

    const macroTypeMap = {
        protein: '蛋白質',
        carbs: '碳水化合物',
        fat: '脂肪'
    };

    if (actualMacros[key] < totalNeed * 0.85 && totalNeed > 0) {
      result.push({ name: `⚠️ ${macroTypeMap[key]} 攝取不足，請考慮增加相關食物或調整目標。`, amount: 0 });
    }
  }

  // --- 最終熱量精確調整 (強制總熱量符合目標，或在增重目標範圍內) ---
  const finalActualTotalCalories = Math.round(actualMacros.totalCalories);
  const finalTargetTotalCalories = Math.round(targetMacros.total); // TDEE + 500 或 TDEE - 500
  const CALORIE_ADJUSTMENT_TOLERANCE = 20; // 允許的最終熱量誤差

  // 只有當實際熱量與目標熱量偏差較大時才進行調整
  if (Math.abs(finalActualTotalCalories - finalTargetTotalCalories) > CALORIE_ADJUSTMENT_TOLERANCE) {
      if (finalActualTotalCalories !== 0) { // 避免除以零
          const adjustmentFactor = finalTargetTotalCalories / finalActualTotalCalories;
          
          // 應用調整因子到每個食物的份量
          result.forEach(item => {
              // 只有當不是警告訊息且份量大於0時才調整
              if (item.amount > 0 && !item.name.startsWith('⚠️')) {
                  item.amount = Math.round(item.amount * adjustmentFactor);
              }
          });

          // 重新計算實際巨量營養素和總熱量，因為份量已被調整
          actualMacros.protein = 0;
          actualMacros.carbs = 0;
          actualMacros.fat = 0;
          actualMacros.totalCalories = 0; // 重置以便重新計算

          // 遍歷已調整份量的項目，重新計算三大營養素和總熱量
          result.forEach(adjustedItem => {
              if (adjustedItem.amount > 0 && !adjustedItem.name.startsWith('⚠️')) { // 排除警告訊息
                  // 從 foodData 中找到原始食物數據
                  let originalFood = null;
                  for (const category in foodData) {
                      originalFood = foodData[category].find(f => f.name === adjustedItem.name);
                      if (originalFood) break;
                  }

                  if (originalFood) {
                      actualMacros.protein += (adjustedItem.amount * originalFood.protein) / 100;
                      actualMacros.carbs += (adjustedItem.amount * originalFood.carbs) / 100;
                      actualMacros.fat += (adjustedItem.amount * originalFood.fat) / 100;
                      actualMacros.totalCalories += (adjustedItem.amount * originalFood.calories) / 100;
                  }
              }
          });
      }
  }
  // --- 最終熱量精確調整結束 ---

  // --- 新增：迭代式三大營養素平衡調整 ---
  const MAX_BALANCING_ITERATIONS = 20; // 調整次數
  const ADJUSTMENT_STEP = 5; // 每次微調的克數
  const MACRO_BALANCE_TOLERANCE_PERCENT = 10; // 允許三大營養素最終的百分比誤差

  // 增重目標的熱量上限
  const GAIN_CALORIE_HARD_UPPER_LIMIT = 4000;

  let currentPortions = result.filter(item => item.amount > 0 && !item.name.startsWith('⚠️'))
                              .map(item => ({ ...item })); // 複製一份並過濾掉警告和0份量
  
  // 由於在循環內部會持續計算和調整總熱量，這裡不再需要複製 actualMacros，
  // 因為每次都會從 currentPortions 重新計算

  for (let i = 0; i < MAX_BALANCING_ITERATIONS; i++) {
    // 重新計算當前份量下的實際巨量營養素和總熱量
    let tempActualMacros = { protein: 0, carbs: 0, fat: 0, totalCalories: 0 };
    currentPortions.forEach(item => {
        let originalFood = null;
        for (const category in foodData) {
            originalFood = foodData[category].find(f => f.name === item.name);
            if (originalFood) break;
        }
        if (originalFood) {
            tempActualMacros.protein += (item.amount * originalFood.protein) / 100;
            tempActualMacros.carbs += (item.amount * originalFood.carbs) / 100;
            tempActualMacros.fat += (item.amount * originalFood.fat) / 100;
            tempActualMacros.totalCalories += (item.amount * originalFood.calories) / 100;
        }
    });

    // 計算當前巨量營養素的誤差百分比
    const currentErrors = {
      protein: targetMacros.protein !== 0 ? ((tempActualMacros.protein - targetMacros.protein) / targetMacros.protein) * 100 : 0,
      carbs: targetMacros.carbs !== 0 ? ((tempActualMacros.carbs - targetMacros.carbs) / targetMacros.carbs) * 100 : 0,
      fat: targetMacros.fat !== 0 ? ((tempActualMacros.fat - targetMacros.fat) / targetMacros.fat) * 100 : 0,
    };

    // 檢查是否已達到足夠的平衡 (所有誤差都在容忍範圍內)
    if (Math.abs(currentErrors.protein) <= MACRO_BALANCE_TOLERANCE_PERCENT &&
        Math.abs(currentErrors.carbs) <= MACRO_BALANCE_TOLERANCE_PERCENT &&
        Math.abs(currentErrors.fat) <= MACRO_BALANCE_TOLERANCE_PERCENT) {
      break; // 達到平衡，退出循環
    }

    // 進行調整：優先處理誤差最大的營養素
    const macroDeviations = [
      { type: 'protein', error: currentErrors.protein },
      { type: 'carbs', error: currentErrors.carbs },
      { type: 'fat', error: currentErrors.fat },
    ].sort((a, b) => Math.abs(b.error) - Math.abs(a.error)); // 按誤差絕對值降序排列

    let adjustedAny = false; // 標記本輪是否有任何調整

    for (const dev of macroDeviations) {
      const type = dev.type;
      const error = dev.error;

      // 如果該營養素過高
      if (error > MACRO_BALANCE_TOLERANCE_PERCENT) {
        // 嘗試減少該營養素的食物份量
        // 優先減少該營養素含量高且熱量密度高的食物 (如脂肪中的油)
        const foodsToAdjust = currentPortions
                                .filter(item => {
                                    let originalFood = null;
                                    for (const category in foodData) {
                                        originalFood = foodData[category].find(f => f.name === item.name);
                                        if (originalFood) break;
                                    }
                                    return originalFood && originalFood[type] > 0 && item.amount > 0;
                                })
                                .sort((a, b) => { // 嘗試基於營養素密度和熱量密度排序
                                    let foodA = null, foodB = null;
                                    for(const cat in foodData) {
                                        foodA = foodData[cat].find(f => f.name === a.name);
                                        if(foodA) break;
                                    }
                                    for(const cat in foodData) {
                                        foodB = foodData[cat].find(f => f.name === b.name);
                                        if(foodB) break;
                                    }
                                    // 優先減少單一高密度營養素食物 (如油)
                                    if (type === 'fat' && a.name === '油') return -1; // 油排最前
                                    if (type === 'fat' && b.name === '油') return 1;
                                    // 然後是該營養素密度高的食物 (每卡路里包含的該營養素更多)
                                    return (foodB[type] / foodB.calories) - (foodA[type] / foodA.calories); 
                                });


        for (const item of foodsToAdjust) {
            const amountToReduce = Math.min(ADJUSTMENT_STEP, item.amount);
            if (amountToReduce > 0) {
                item.amount -= amountToReduce;
                adjustedAny = true;
                break; // 每次只調整一種食物，避免過度調整
            }
        }
      } 
      // 如果該營養素過低
      else if (error < -MACRO_BALANCE_TOLERANCE_PERCENT) {
        // 嘗試增加該營養素的食物份量
        const foodsToAdjust = currentPortions
                                .filter(item => {
                                    let originalFood = null;
                                    for (const category in foodData) {
                                        originalFood = foodData[category].find(f => f.name === item.name);
                                        if (originalFood) break;
                                    }
                                    // 確保食物提供該營養素，且未達到其動態上限
                                    const foodRole = foodRoleMap[item.name] || 'main'; 
                                    let baseLimit = foodMaxLimit[item.name] || DEFAULT_FOOD_LIMIT;
                                    let finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1);
                                    if (foodRole === 'main' && type === 'carbs') {
                                        let carbSpecificMultiplier = 1;
                                        if (carbType === 'high') carbSpecificMultiplier = 1.5;
                                        else if (carbType === 'medium') carbSpecificMultiplier = 1.2;
                                        finalLimitMultiplier *= carbSpecificMultiplier;
                                    } else if (foodRole === 'main' && type === 'protein' && (carbType === 'low' || carbType === 'medium')) {
                                        baseLimit = UNLIMITED_GRAMS;
                                    }
                                    const currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);

                                    return originalFood && originalFood[type] > 0 && item.amount < currentFoodLimit;
                                })
                                .sort((a, b) => { // 嘗試基於營養素密度排序，優先增加效率高的
                                    let foodA = null, foodB = null;
                                    for(const cat in foodData) {
                                        foodA = foodData[cat].find(f => f.name === a.name);
                                        if(foodA) break;
                                    }
                                    for(const cat in foodData) {
                                        foodB = foodData[cat].find(f => f.name === b.name);
                                        if(foodB) break;
                                    }
                                    return (foodB[type] / foodB.calories) - (foodA[type] / foodA.calories); // 密度高的優先
                                });


        for (const item of foodsToAdjust) {
            // 需要重新計算該食物的動態上限，確保不會超限
            const foodRole = foodRoleMap[item.name] || 'main'; 
            let baseLimit = foodMaxLimit[item.name] || DEFAULT_FOOD_LIMIT;
            let finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1);
            if (foodRole === 'main' && type === 'carbs') {
                let carbSpecificMultiplier = 1;
                if (carbType === 'high') carbSpecificMultiplier = 1.5;
                else if (carbType === 'medium') carbSpecificMultiplier = 1.2;
                finalLimitMultiplier *= carbSpecificMultiplier;
            } else if (foodRole === 'main' && type === 'protein' && (carbType === 'low' || carbType === 'medium')) {
                baseLimit = UNLIMITED_GRAMS;
            }
            const currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
            
            const amountToAdd = Math.min(ADJUSTMENT_STEP, currentFoodLimit - item.amount);
            if (amountToAdd > 0) {
                item.amount += amountToAdd;
                adjustedAny = true;
                break; // 每次只調整一種食物
            }
        }
      }
    }

    if (!adjustedAny) { // 如果本輪沒有任何調整，說明無法再優化了
        break;
    }

    // 每次調整後，重新確保總熱量符合目標 (這很重要，因為單一營養素調整會影響總熱量)
    let tempTotalCaloriesAfterMacroAdjust = 0;
    currentPortions.forEach(item => {
        let originalFood = null;
        for (const category in foodData) {
            originalFood = foodData[category].find(f => f.name === item.name);
            if (originalFood) break;
        }
        if (originalFood) {
            tempTotalCaloriesAfterMacroAdjust += (item.amount * originalFood.calories) / 100;
        }
    });

    if (tempTotalCaloriesAfterMacroAdjust !== 0) {
        let desiredTotalForReAdjust = finalTargetTotalCalories; // 預設目標為 TDEE +/- 500

        // *** 增重目標的熱量彈性邏輯 ***
        if (goal === 'gain') {
            const currentTotal = tempTotalCaloriesAfterMacroAdjust;
            // 如果當前熱量已經在目標範圍內 (例如 3462.69 到 4000)
            if (currentTotal >= finalTargetTotalCalories - CALORIE_ADJUSTMENT_TOLERANCE && currentTotal <= GAIN_CALORIE_HARD_UPPER_LIMIT) {
                desiredTotalForReAdjust = currentTotal; // 允許它保持在這個較高但合規的熱量上
            } else if (currentTotal > GAIN_CALORIE_HARD_UPPER_LIMIT) {
                desiredTotalForReAdjust = GAIN_CALORIE_HARD_UPPER_LIMIT; // 如果超過硬上限，則拉回到硬上限
            }
            // 如果低於 finalTargetTotalCalories - tolerance，則 desiredTotalForReAdjust 仍為 finalTargetTotalCalories，會將其拉升
        }
        // *** 增重目標的熱量彈性邏輯結束 ***

        const reAdjustmentFactor = desiredTotalForReAdjust / tempTotalCaloriesAfterMacroAdjust;
        currentPortions.forEach(item => {
            if (item.amount > 0) { // 只調整實際有份量的食物
                item.amount = Math.round(item.amount * reAdjustmentFactor);
            }
        });
    }
  }

  // 將最終的調整結果賦值給 result 和 actualMacros
  // 清空原始 result 中的食物項目，並添加調整後的 items
  result.splice(0, result.length); // 清空現有結果（不包括警告，警告會後續添加）
  currentPortions.forEach(item => result.push(item)); // 添加所有調整後的食物

  // 將最初因「不提供某種營養素」而生成的警告訊息重新加入
  const initialWarnings = [];
  for (const group in selectedFoods) {
      const foods = selectedFoods[group];
      const key = nutrientMap[group];
      const macroTypeMap = { protein: '蛋白質', carbs: '碳水化合物', fat: '脂肪' };
      foods.forEach(food => {
          if (food[key] === 0) {
              const warning = `⚠️ ${food.name} 不提供 ${macroTypeMap[key]}，請選擇其他食物。`;
              // 避免重複添加相同的警告
              if (!initialWarnings.some(w => w.name === warning)) {
                  initialWarnings.push({ name: warning, amount: 0 });
              }
          }
      });
  }
  result.push(...initialWarnings); // 將警告添加到結果中

  // 最後再計算一次 actualMacros，確保它是最終結果
  actualMacros.protein = 0;
  actualMacros.carbs = 0;
  actualMacros.fat = 0;
  actualMacros.totalCalories = 0;
  result.forEach(item => {
    if (item.amount > 0 && !item.name.startsWith('⚠️')) { // 排除警告訊息
        let originalFood = null;
        for (const category in foodData) {
            originalFood = foodData[category].find(f => f.name === item.name);
            if (originalFood) break;
        }
        if (originalFood) {
            actualMacros.protein += (item.amount * originalFood.protein) / 100;
            actualMacros.carbs += (item.amount * originalFood.carbs) / 100;
            actualMacros.fat += (item.amount * originalFood.fat) / 100;
            actualMacros.totalCalories += (item.amount * originalFood.calories) / 100;
        }
    }
  });

// --- 迭代式三大營養素平衡調整結束 ---

  return { portions: result, actualMacros };
}


function evaluateMacronutrientMatch(actual, target, goal) { // 新增 goal 參數
  const errors = {};
  errors.protein = target.protein !== 0 ? Math.round(((actual.protein - target.protein) / target.protein) * 100) : 0;
  errors.carbs = target.carbs !== 0 ? Math.round(((actual.carbs - target.carbs) / target.carbs) * 100) : 0;
  errors.fat = target.fat !== 0 ? Math.round(((actual.fat - target.fat) / target.fat) * 100) : 0;
  return errors;
}

// 修改 displayEvaluation 函數，顯示實際值
function displayEvaluation(errors, targetMacros, actualMacros, goal) {
  const summary = document.getElementById("balance-summary");
  summary.innerHTML = ''; // 清空原有內容
  let html = "<h3>實際巨量營養素攝取量</h3>";
  html += "<ul style='padding-left:1em;'>";
  html += `<li class="macro-item">蛋白質：${Math.round(actualMacros.protein)} 克 (目標: ${Math.round(targetMacros.protein)} 克)</li>`;
  html += `<li class="macro-item">碳水化合物：${Math.round(actualMacros.carbs)} 克 (目標: ${Math.round(targetMacros.carbs)} 克)</li>`;
  html += `<li class="macro-item">脂肪：${Math.round(actualMacros.fat)} 克 (目標: ${Math.round(targetMacros.fat)} 克)</li>`;
  html += `<li class="macro-item"><strong>總熱量：${Math.round(actualMacros.totalCalories)} 大卡 (目標: ${Math.round(targetMacros.total)} 大卡)</strong></li>`;
  html += "</ul>";

  // --- 熱量目標達成檢查 ---
  const actualTotalCalories = Math.round(actualMacros.totalCalories);
  const targetTotalCalories = Math.round(targetMacros.total); // TDEE +/- 500
  const calorieDifference = actualTotalCalories - targetTotalCalories;
  const tolerance = 20; // 允許的熱量偏差容忍度

  html += "<h3>熱量目標達成狀況</h3>";
  html += "<ul style='padding-left:1em;'>";

  if (goal === 'lose') {
    // 減重目標：實際熱量應等於或低於目標
    if (calorieDifference > tolerance) { // 實際熱量顯著高於目標，發出警告
      html += `<li style='color: red;'><strong>⚠️ 警告：您的實際總熱量 (${actualTotalCalories} 大卡) 超出了減重目標熱量 (${targetTotalCalories} 大卡) 約 ${calorieDifference} 大卡。</strong></li>`;
      html += `<li>為了有效減重，您需要嚴格保持熱量赤字。請考慮：</li>`;
      html += `<ul><li>減少所選食物的份量，特別是脂肪類食物。</li><li>重新選擇熱量密度較低的食物。</li><li>調整您的巨量營養素比例設定。</li></ul>`;
    } else { // 實際熱量等於或低於目標，符合減重需求
      html += `<li>✅ 您的實際總熱量 (${actualTotalCalories} 大卡) 符合減重目標，甚至更低（目標: ${targetTotalCalories} 大卡），有利於體重下降。</li>`;
    }
  } else if (goal === 'gain') {
    // 增重目標：實際熱量應等於或高於 TDEE + 500 大卡，且不超過 4000 大卡
    const GAIN_CALORIE_HARD_UPPER_LIMIT = targetTotalCalories+500; // 增重目標的熱量硬上限

    if (actualTotalCalories < targetTotalCalories - tolerance) { // 實際熱量顯著低於目標（TDEE+500），發出警告
      html += `<li style='color: red;'><strong>⚠️ 警告：您的實際總熱量 (${actualTotalCalories} 大卡) 低於增重目標熱量 (${targetTotalCalories} 大卡) 約 ${-calorieDifference} 大卡。</strong></li>`;
      html += `<li>為了有效增重，您需要確保熱量攝取充足。請考慮：</li>`;
      html += `<ul><li>增加所選食物的份量，特別是主食和蛋白質。</li><li>重新選擇熱量密度較高的食物。</li><li>調整您的巨量營養素比例設定。</li></ul>`;
    } else if (actualTotalCalories > GAIN_CALORIE_HARD_UPPER_LIMIT + tolerance) { // 實際熱量顯著高於 4000 大卡上限，發出警告
      html += `<li style='color: orange;'>⚠️ 您的實際總熱量 (${actualTotalCalories} 大卡) 超出了建議的增重上限（${GAIN_CALORIE_HARD_UPHEN_LIMIT} 大卡）。</li>`;
      html += `<li>雖然增重需要熱量盈餘，但過度攝取可能導致不必要的脂肪增加。請考慮：</li>`;
      html += `<ul><li>稍微減少所選食物的份量。</li><li>重新評估您的巨量營養素比例設定。</li></ul>`;
    }
    else { // 實際熱量在 TDEE+500 到 4000 之間（或略有浮動），符合增重需求
      html += `<li>✅ 您的實際總熱量 (${actualTotalCalories} 大卡) 符合增重目標，甚至更高（目標: ${targetTotalCalories} 大卡，建議上限 ${GAIN_CALORIE_HARD_UPPER_LIMIT} 大卡），有利於體重增加。</li>`;
    }
  } else { // Maintain
    if (Math.abs(calorieDifference) > tolerance * 2) { // 稍微放寬維持目標的容忍度
      html += `<li style='color: orange;'>⚠️ 您的實際總熱量 (${actualTotalCalories} 大卡) 與維持目標熱量 (${targetTotalCalories} 大卡) 存在 ${Math.abs(calorieDifference)} 大卡的偏差。</li>`;
      html += `<li>如果您需要更精確地維持體重，請考慮調整食物份量。</li>`;
    } else {
      html += `<li>✅ 您的實際總熱量 (${actualTotalCalories} 大卡) 符合維持目標 (${targetTotalCalories} 大卡)。</li>`;
    }
  }
  html += "</ul>";
  // --- 熱量目標達成檢查結束 ---


  html += "<h3>各營養素與目標的誤差</h3>";
  html += "<ul style='padding-left:1em;'>";
  const warnList = [];

  const assess = (val, name, key) => {
    // val 是計算出來的百分比誤差，有正負號
    if (Math.abs(val) <= 10) {
      html += `<li>✅ ${name} 接近目標（誤差 ${val}%）</li>`;
    } else if (val > 10) { // 誤差為正且大於 10，表示過高
      html += `<li>⚠️ ${name} 過高（+${val}%）。考慮減少相關食物份量。`;
      if (key === 'fat') {
          html += `<strong style='color: red;'> 特別是高熱量密度的油、沙拉醬、堅果等。</strong>`;
      }
      html += `</li>`;
      if (val > 30) warnList.push(key); // 誤差超過 30% 納入嚴重警告列表
    } else { // 誤差為負且小於 -10 (因為不是 Math.abs <= 10 也不是 val > 10)，表示過低
      html += `<li>⚠️ ${name} 過低（${val}%）。考慮增加相關食物份量。</li>`;
      if (val < -30) warnList.push(key); // 誤差低於 -30% 納入嚴重警告列表
    }
  };

  assess(errors.protein, "蛋白質", "protein");
  assess(errors.carbs, "碳水化合物", "carbs");
  assess(errors.fat, "脂肪", "fat");
  html += "</ul>";

  // --- 特定不平衡警告 (脂肪過高但蛋白/碳水不足) ---
  const hasHighFat = errors.fat > 15; // 脂肪偏差超過 15% 視為過高
  const hasLowProtein = errors.protein < -15; // 蛋白質偏差低於 -15% 視為不足
  const hasLowCarbs = errors.carbs < -15; // 碳水化合物偏差低於 -15% 視為不足

  if (hasHighFat && (hasLowProtein || hasLowCarbs)) {
      html += "<p style='color: red; font-weight: bold;'>🚨 嚴重不平衡警告：您的脂肪攝取量過高，但同時蛋白質或碳水化合物攝取量不足！</p>";
      html += "<ul>";
      html += "<li>這會嚴重影響您的健康和減重/增重目標。強烈建議您：</li>";
      html += "<ul>";
      html += "<li><strong>大幅減少高脂肪食物（如油、沙拉醬、腰果等）的份量。</strong></li>";
      html += "<li>增加蛋白質（如雞胸肉、魚類、豆漿）和碳水化合物（如米飯、馬鈴薯、番薯）的攝取。</li>";
      html += "<li>重新檢查您的食物選擇，確保各類食物均衡。</li>";
      html += "<li>如果問題持續，請考慮調整您的巨量營養素比例設定。</li>";
      html += "</ul>";
      html += "</ul>";
  }
  // --- 特定不平衡警告結束 ---


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

  const { portions, actualMacros } = calculateFoodPortionsSimple(selectedFoods, targetMacros, carbType, goal); // 傳遞 carbType 和 goal
  const errors = evaluateMacronutrientMatch(actualMacros, targetMacros, goal); // 傳遞 goal

  // 調整顯示順序
  displayMacronutrients(caloricNeeds, carbType); // 顯示目標值
  displayEvaluation(errors, targetMacros, actualMacros, goal); // 顯示實際值和評估
  displayFoodPortions(portions); // 顯示食物份量
});

loadFoodOptions();
