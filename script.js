// 引入資料
const foodData = {
  protein: [
    { name: "鮪魚", calories: 132, protein: 28 },
    { name: "花枝", calories: 92, protein: 15 },
    { name: "一般魚類", calories: 110, protein: 22 },
    { name: "雞胸", calories: 165, protein: 31 },
    { name: "豬肝", calories: 135, protein: 20 },
    { name: "雞蛋白", calories: 52, protein: 11 },
    { name: "無糖豆漿", calories: 45, protein: 3.5 },
    { name: "雞腿", calories: 180, protein: 25},
    { name: "雞蛋", calories: 155, protein: 13 },
    { name: "牛肉", calories: 250, protein: 26},
    { name: "高蛋白", calories: 120, protein: 24 }
  ],
  fat: [
    { name: "沙拉醬", calories: 600, fat: 66 },
    { name: "鮮奶油", calories: 340,fat: 36 },
    { name: "花生粉", calories: 570, fat: 45 },
    { name: "腰果", calories: 553,fat: 44 },
    { name: "油", calories: 884,  fat: 100 }
  ],
  carbs: [
    { name: "飯", calories: 130, carbs: 28 },
    { name: "麥片", calories: 380, carbs: 70 },
    { name: "拉麵", calories: 450, carbs: 65},
    { name: "馬鈴薯", calories: 77,  carbs: 17 },
    { name: "番薯", calories: 86, carbs: 20}
  ]
};

// Define serving standards (grams of nutrient per serving)
const PROTEIN_PER_SERVING_G = 7;
const CARBS_PER_SERVING_G = 15;
const FAT_PER_SERVING_G = 4;

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

// 修改 loadFoodOptions 函數以接受 targetMacros
function loadFoodOptions(targetMacros) {
  const proteinFoodDiv = document.getElementById('protein-food');
  const carbFoodDiv = document.getElementById('carb-food');
  const fatFoodDiv = document.getElementById('fat-food');

  // 清空之前的選項以避免重複
  proteinFoodDiv.innerHTML = '';
  carbFoodDiv.innerHTML = '';
  fatFoodDiv.innerHTML = '';

  const createOption = (el, idPrefix, list, category) => {
    list.forEach(food => {
      const div = document.createElement('div');
      div.classList.add('food-item');

      let singleNutrientInfo = '';
      let displayGramsPerServing = '';
      let caloriesPerServing = 0;
      let proteinPerServing = 0;
      let carbsPerServing = 0;
      let fatPerServing = 0;

      let primaryNutrientValueForServingCalc = 0;
      let servingUnitName = '';
      let targetNutrientGramsPerServing = 0; // The amount of the nutrient that constitutes one serving

      if (category === 'protein') {
        primaryNutrientValueForServingCalc = food.protein;
        targetNutrientGramsPerServing = PROTEIN_PER_SERVING_G;
        servingUnitName = '蛋白質';
      } else if (category === 'carbs') {
        primaryNutrientValueForServingCalc = food.carbs;
        targetNutrientGramsPerServing = CARBS_PER_SERVING_G;
        servingUnitName = '碳水化合物';
      } else if (category === 'fat') {
        primaryNutrientValueForServingCalc = food.fat;
        targetNutrientGramsPerServing = FAT_PER_SERVING_G;
        servingUnitName = '脂肪';
      }

      if (primaryNutrientValueForServingCalc > 0 && targetNutrientGramsPerServing > 0) {
        // Calculate how many grams of this specific food make up one standard serving of its primary nutrient
        const gramsOfFoodPerServing = (targetNutrientGramsPerServing / primaryNutrientValueForServingCalc) * 100;
        displayGramsPerServing = `${Math.round(gramsOfFoodPerServing)} 克/份`;

        // Calculate calories and other macronutrients for that amount of food
        caloriesPerServing = (food.calories / 100) * gramsOfFoodPerServing;
        proteinPerServing = (food.protein / 100) * gramsOfFoodPerServing;
        carbsPerServing = (food.carbs / 100) * gramsOfFoodPerServing;
        fatPerServing = (food.fat / 100) * gramsOfFoodPerServing;
      } else {
        displayGramsPerServing = '無法計算份量';
      }

      if (targetMacros) { // 只有當 targetMacros 有值時才計算單一營養素需求
        let primaryNutrientKey = '';
        let primaryNutrientLabel = '';
        let targetNutrientGramsTotal = 0;

        if (category === 'protein') {
          primaryNutrientKey = 'protein';
          primaryNutrientLabel = '蛋白質';
          targetNutrientGramsTotal = targetMacros.protein;
        } else if (category === 'carbs') {
          primaryNutrientKey = 'carbs';
          primaryNutrientLabel = '碳水化合物';
          targetNutrientGramsTotal = targetMacros.carbs;
        } else if (category === 'fat') {
          primaryNutrientKey = 'fat';
          primaryNutrientLabel = '脂肪';
          targetNutrientGramsTotal = targetMacros.fat;
        }

        if (targetNutrientGramsTotal > 0 && targetNutrientGramsPerServing > 0) {
          const servingsNeeded = Math.round(targetNutrientGramsTotal / targetNutrientGramsPerServing);
          singleNutrientInfo = `，約需 ${servingsNeeded} 份`;
        } else if (primaryNutrientValueForServingCalc === 0) {
          singleNutrientInfo = `，此食材不含主要${primaryNutrientLabel}`;
        }
      }

      const proteinDisplay = proteinPerServing > 0 ? `, 蛋白質:${proteinPerServing.toFixed(1)}g` : '';
      const carbsDisplay = carbsPerServing > 0 ? `, 碳水:${carbsPerServing.toFixed(1)}g` : '';
      const fatDisplay = fatPerServing > 0 ? `, 脂肪:${fatPerServing.toFixed(1)}g` : '';

      div.innerHTML = `
        <label id="${idPrefix}-${food.name}" value="${food.name}" data-category="${category}">
        <label for="${idPrefix}-${food.name}">${food.name} (${displayGramsPerServing}: ${caloriesPerServing.toFixed(1)} 大卡${proteinDisplay}${carbsDisplay}${fatDisplay})${singleNutrientInfo}</label>
      `;
      el.appendChild(div);
    });
  };

  createOption(proteinFoodDiv, 'protein', foodData.protein, 'protein');
  createOption(carbFoodDiv, 'carbs', foodData.carbs, 'carbs');
  createOption(fatFoodDiv, 'fat', foodData.fat, 'fat');
}

// 顯示三大營養素的目標值
function displayMacronutrients(caloricNeeds, mode) {
  const macroDiv = document.getElementById('macro-summary');
  macroDiv.style.display = "block";
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
    <h3>目標三大營養素攝取量</h3>
    <div class="macro-item">蛋白質：${proteinGrams} 克</div>
    <div class="macro-item">碳水化合物：${carbGrams} 克</div>
    <div class="macro-item">脂肪：${fatGrams} 克</div>
    <div class="macro-item"><strong>總熱量：${calculatedTotalCalories} 大卡</strong></div>
  `;
}

// 此函數現在將其區塊隱藏
function displayFoodPortions(foodPortions) {
  const resultDiv = document.getElementById('food-portion-results');
  resultDiv.style.display = 'none'; // 隱藏此區塊
  resultDiv.innerHTML = '';
}

// 新增一個函數來顯示單一食物來源的份量
function displaySingleSourcePortions(selectedFoods, targetMacros) {
    const singleSourceDiv = document.getElementById('single-source-portions');
    singleSourceDiv.innerHTML = '<h3>若單一食物滿足目標營養素所需份量</h3>';
    singleSourceDiv.style.display = 'block';

    const nutrientMap = {
        protein: { key: "protein", label: "蛋白質", servingGram: PROTEIN_PER_SERVING_G },
        carbs: { key: "carbs", label: "碳水化合物", servingGram: CARBS_PER_SERVING_G },
        fat: { key: "fat", label: "脂肪", servingGram: FAT_PER_SERVING_G }
    };

    let hasResults = false;

    // 檢查是否有任何食物被選中
    const anyFoodSelected = Object.values(selectedFoods).some(arr => arr.length > 0);

    if (!targetMacros || !anyFoodSelected) {
        singleSourceDiv.innerHTML = '<p>請輸入個人資訊並選擇食物以查看單一食物所需份量。</p>';
        return;
    }

    for (const group in selectedFoods) {
        const foods = selectedFoods[group];
        const { key, label, servingGram } = nutrientMap[group];
        const targetValue = targetMacros[key]; // 目標營養素的總克數

        if (targetValue === 0) continue; // 如果目標為0，則跳過

        foods.forEach(food => {
            if (food[key] > 0 && servingGram > 0) { // 確保該食物確實提供此營養素且份量定義有效
                const servingsNeeded = Math.round(targetValue / servingGram);
                const div = document.createElement('div');
                div.classList.add('food-result-item');
                div.innerHTML = `<strong>${food.name}</strong> (每100克: ${food.calories} 大卡, 蛋白質:${food.protein}g, 碳水:${food.carbs}g, 脂肪:${food.fat}g): 若單獨滿足 ${label} 目標，約需 <strong>${servingsNeeded} 份</strong>`;
                singleSourceDiv.appendChild(div);
                hasResults = true;
            } else {
                // 如果食物不提供該主要營養素，則顯示警告
                const macroTypeMap = {
                    protein: '蛋白質',
                    carbs: '碳水化合物',
                    fat: '脂肪'
                };
                const div = document.createElement('div');
                div.classList.add('food-result-item');
                div.style.color = 'orange';
                div.innerHTML = `<strong>⚠️ ${food.name}</strong> 不含此類型主要營養素 ${macroTypeMap[key]}。`;
                singleSourceDiv.appendChild(div);
                hasResults = true;
            }
        });
    }

    if (!hasResults) {
        singleSourceDiv.innerHTML = '<p>請選擇食物以查看單一食物所需份量。</p>';
    }
}


function calculateFoodPortionsSimple(selectedFoods, targetMacros, carbType, goal) {
  const result = [];
  const actualMacros = { protein: 0, carbs: 0, fat: 0, totalCalories: 0 };
  const nutrientMap = {
    protein: "protein",
    carbs: "carbs",
    fat: "fat"
  };

  const foodMaxLimit = {
    "沙拉醬": 60, "鮮奶油": 60, "花生粉": 60, "腰果": 60, "油": 40,
    "雞蛋": 100, "鮪魚": 350, "花枝": 350, "一般魚類": 350, "雞胸": 350, "豬肝": 200, "雞腿": 350, "牛肉": 350, "雞蛋白": 200, "無糖豆漿": 500, "高蛋白": 60,
    "飯": 350, "麥片": 100, "拉麵": 400, "馬鈴薯": 450, "番薯": 450
  };
  const DEFAULT_FOOD_LIMIT = 300;
  const UNLIMITED_GRAMS = 99999;

  const TARGET_CALORIES_THRESHOLD_FOR_MODERATE_INCREASE = 2500;
  const TARGET_CALORIES_THRESHOLD_FOR_SIGNIFICANT_INCREASE = 3500;
  let generalLimitMultiplier = 1;
  if (targetMacros.total > TARGET_CALORIES_THRESHOLD_FOR_SIGNIFICANT_INCREASE) {
      generalLimitMultiplier = 1.7;
  } else if (targetMacros.total > TARGET_CALORIES_THRESHOLD_FOR_MODERATE_INCREASE) {
      generalLimitMultiplier = 1.3;
  }

  const foodRoleMap = {
      "雞胸": 'main', "雞腿": 'main', "牛肉": 'main', "鮪魚": 'main', "一般魚類": 'main',
      "花枝": 'side', "豬肝": 'side', "雞蛋白": 'side', "無糖豆漿": 'side', "雞蛋": 'side', "高蛋白": 'side',
      "飯": 'main', "拉麵": 'main', "馬鈴薯": 'main', "番薯": 'main',
      "麥片": 'side',
      "沙拉醬": 'side', "鮮奶油": 'side', "花生粉": 'side', "腰果": 'side', "油": 'side'
  };
  const roleBasedMultiplier = { main: 1.1, side: 0.9 };

  for (const group in selectedFoods) {
    const foods = selectedFoods[group];
    const key = nutrientMap[group];
    const totalNeed = targetMacros[key];
    const totalValue = foods.reduce((sum, food) => sum + food[key], 0);

    foods.forEach(food => {
      if (food[key] === 0) {
        const macroTypeMap = { protein: '蛋白質', carbs: '碳水化合物', fat: '脂肪' };
        result.push({ name: `⚠️ ${food.name} 不提供 ${macroTypeMap[key]}，請選擇其他食物。`, amount: 0 });
        return;
      }

      const ratio = food[key] / totalValue;
      let gram = (totalNeed * 100 * ratio) / food[key];

      const foodRole = foodRoleMap[food.name] || 'main';
      let currentFoodLimit;

      if (foodRole === 'main' && key === 'protein') {
          if (carbType === 'low' || carbType === 'medium') {
              currentFoodLimit = UNLIMITED_GRAMS;
          } else {
              const baseLimit = foodMaxLimit[food.name] || DEFAULT_FOOD_LIMIT;
              const finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1);
              currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
          }
      } else if (foodRole === 'main' && key === 'carbs') {
          const baseLimit = foodMaxLimit[food.name] || DEFAULT_FOOD_LIMIT;
          let carbSpecificMultiplier = 1;
          if (carbType === 'high') {
              carbSpecificMultiplier = 1.5;
          } else if (carbType === 'medium') {
              carbSpecificMultiplier = 1.2;
          }
          const finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1) * carbSpecificMultiplier;
          currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
      } else {
          const baseLimit = foodMaxLimit[food.name] || DEFAULT_FOOD_LIMIT;
          const finalLimitMultiplier = generalLimitMultiplier * (roleBasedMultiplier[foodRole] || 1);
          currentFoodLimit = Math.round(baseLimit * finalLimitMultiplier);
      }

      gram = Math.min(gram, currentFoodLimit);

      result.push({ name: food.name, amount: Math.round(gram) });
      actualMacros[key] += (gram * food[key]) / 100;
      actualMacros.totalCalories += (gram * food.calories) / 100;
    });

    const macroTypeMap = { protein: '蛋白質', carbs: '碳水化合物', fat: '脂肪' };
    if (actualMacros[key] < totalNeed * 0.85 && totalNeed > 0) {
      result.push({ name: `⚠️ ${macroTypeMap[key]} 攝取不足，請考慮增加相關食物或調整目標。`, amount: 0 });
    }
  }

  const finalActualTotalCalories = Math.round(actualMacros.totalCalories);
  const finalTargetTotalCalories = Math.round(targetMacros.total);
  const CALORIE_ADJUSTMENT_TOLERANCE = 20;

  if (Math.abs(finalActualTotalCalories - finalTargetTotalCalories) > CALORIE_ADJUSTMENT_TOLERANCE) {
      if (finalActualTotalCalories !== 0) {
          const adjustmentFactor = finalTargetTotalCalories / finalActualTotalCalories;
          result.forEach(item => {
              if (item.amount > 0 && !item.name.startsWith('⚠️')) {
                  item.amount = Math.round(item.amount * adjustmentFactor);
              }
          });

          actualMacros.protein = 0; actualMacros.carbs = 0; actualMacros.fat = 0; actualMacros.totalCalories = 0;
          result.forEach(adjustedItem => {
              if (adjustedItem.amount > 0 && !adjustedItem.name.startsWith('⚠️')) {
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

  const MAX_BALANCING_ITERATIONS = 20;
  const ADJUSTMENT_STEP = 5;
  const MACRO_BALANCE_TOLERANCE_PERCENT = 10;
  const GAIN_CALORIE_HARD_UPPER_LIMIT = 4000;

  let currentPortions = result.filter(item => item.amount > 0 && !item.name.startsWith('⚠️'))
                              .map(item => ({ ...item }));

  for (let i = 0; i < MAX_BALANCING_ITERATIONS; i++) {
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

    const currentErrors = {
      protein: targetMacros.protein !== 0 ? ((tempActualMacros.protein - targetMacros.protein) / targetMacros.protein) * 100 : 0,
      carbs: targetMacros.carbs !== 0 ? ((tempActualMacros.carbs - targetMacros.carbs) / targetMacros.carbs) * 100 : 0,
      fat: targetMacros.fat !== 0 ? ((tempActualMacros.fat - targetMacros.fat) / targetMacros.fat) * 100 : 0,
    };

    if (Math.abs(currentErrors.protein) <= MACRO_BALANCE_TOLERANCE_PERCENT &&
        Math.abs(currentErrors.carbs) <= MACRO_BALANCE_TOLERANCE_PERCENT &&
        Math.abs(currentErrors.fat) <= MACRO_BALANCE_TOLERANCE_PERCENT) {
      break;
    }

    const macroDeviations = [
      { type: 'protein', error: currentErrors.protein },
      { type: 'carbs', error: currentErrors.carbs },
      { type: 'fat', error: currentErrors.fat },
    ].sort((a, b) => Math.abs(b.error) - Math.abs(a.error));

    let adjustedAny = false;

    for (const dev of macroDeviations) {
      const type = dev.type;
      const error = dev.error;

      if (error > MACRO_BALANCE_TOLERANCE_PERCENT) {
        const foodsToAdjust = currentPortions
                                .filter(item => {
                                    let originalFood = null;
                                    for (const category in foodData) {
                                        originalFood = foodData[category].find(f => f.name === item.name);
                                        if (originalFood) break;
                                    }
                                    return originalFood && originalFood[type] > 0 && item.amount > 0;
                                })
                                .sort((a, b) => {
                                    let foodA = null, foodB = null;
                                    for(const cat in foodData) {
                                        foodA = foodData[cat].find(f => f.name === a.name);
                                        if(foodA) break;
                                    }
                                    for(const cat in foodData) {
                                        foodB = foodData[cat].find(f => f.name === b.name);
                                        if(foodB) break;
                                    }
                                    if (type === 'fat' && a.name === '油') return -1;
                                    if (type === 'fat' && b.name === '油') return 1;
                                    return (foodB[type] / foodB.calories) - (foodA[type] / foodA.calories);
                                });


        for (const item of foodsToAdjust) {
            const amountToReduce = Math.min(ADJUSTMENT_STEP, item.amount);
            if (amountToReduce > 0) {
                item.amount -= amountToReduce;
                adjustedAny = true;
                break;
            }
        }
      } else if (error < -MACRO_BALANCE_TOLERANCE_PERCENT) {
        const foodsToAdjust = currentPortions
                                .filter(item => {
                                    let originalFood = null;
                                    for (const category in foodData) {
                                        originalFood = foodData[category].find(f => f.name === item.name);
                                        if (originalFood) break;
                                    }
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
                                .sort((a, b) => {
                                    let foodA = null, foodB = null;
                                    for(const cat in foodData) {
                                        foodA = foodData[cat].find(f => f.name === a.name);
                                        if(foodA) break;
                                    }
                                    for(const cat in foodData) {
                                        foodB = foodData[cat].find(f => f.name === b.name);
                                        if(foodB) break;
                                    }
                                    return (foodB[type] / foodB.calories) - (foodA[type] / foodA.calories);
                                });


        for (const item of foodsToAdjust) {
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
                break;
            }
        }
      }
    }

    if (!adjustedAny) {
        break;
    }

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
        let desiredTotalForReAdjust = finalTargetTotalCalories;

        if (goal === 'gain') {
            const currentTotal = tempTotalCaloriesAfterMacroAdjust;
            if (currentTotal >= finalTargetTotalCalories - CALORIE_ADJUSTMENT_TOLERANCE && currentTotal <= GAIN_CALORIE_HARD_UPPER_LIMIT) {
                desiredTotalForReAdjust = currentTotal;
            } else if (currentTotal > GAIN_CALORIE_HARD_UPPER_LIMIT) {
                desiredTotalForReAdjust = GAIN_CALORIE_HARD_UPPER_LIMIT;
            }
        }
        const reAdjustmentFactor = desiredTotalForReAdjust / tempTotalCaloriesAfterMacroAdjust;
        currentPortions.forEach(item => {
            if (item.amount > 0) {
                item.amount = Math.round(item.amount * reAdjustmentFactor);
            }
        });
    }
  }

  result.splice(0, result.length);
  currentPortions.forEach(item => result.push(item));

  const initialWarnings = [];
  for (const group in selectedFoods) {
      const foods = selectedFoods[group];
      const key = nutrientMap[group];
      const macroTypeMap = { protein: '蛋白質', carbs: '碳水化合物', fat: '脂肪' };
      foods.forEach(food => {
          if (food[key] === 0) {
              const warning = `⚠️ ${food.name} 不提供 ${macroTypeMap[key]}，請選擇其他食物。`;
              if (!initialWarnings.some(w => w.name === warning)) {
                  initialWarnings.push({ name: warning, amount: 0 });
              }
          }
      });
  }
  result.push(...initialWarnings);

  actualMacros.protein = 0; actualMacros.carbs = 0; actualMacros.fat = 0; actualMacros.totalCalories = 0;
  result.forEach(item => {
    if (item.amount > 0 && !item.name.startsWith('⚠️')) {
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

  return { portions: result, actualMacros };
}


// 此函數現在將其區塊隱藏
function displayEvaluation(errors, targetMacros, actualMacros, goal) {
  const summary = document.getElementById("balance-summary");
  summary.style.display = "none"; // 隱藏此區塊
  summary.innerHTML = '';
}

// 核心計算與渲染邏輯
function calculateAndRender() {
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

  // 獲取顯示「份」結果的元素
  const proteinServingsEl = document.getElementById('protein-target-servings');
  const carbsServingsEl = document.getElementById('carbs-target-servings');
  const fatServingsEl = document.getElementById('fat-target-servings');

  // 確保所有必要輸入都有值且有效，才能進行計算和顯示結果
  if (isNaN(weight) || isNaN(height) || isNaN(age) || !gender || isNaN(activityLevel) || weight <= 0 || height <= 0 || age <= 0) {
    document.getElementById('results').style.display = 'none'; // 隱藏結果區塊
    document.getElementById('tdee-result').textContent = '';
    document.getElementById('caloric-needs-result').textContent = '';
    loadFoodOptions(null); // Load options without single nutrient info

    // 清空「份」顯示結果
    if (proteinServingsEl) proteinServingsEl.textContent = '';
    if (carbsServingsEl) carbsServingsEl.textContent = '';
    if (fatServingsEl) fatServingsEl.textContent = '';
    return;
  }

  const tdee = calculateTDEE(weight, height, age, gender, activityLevel);
  const caloricNeeds = calculateCaloricNeeds(tdee, goal);

  document.getElementById('tdee-result').textContent = `TDEE: ${tdee.toFixed(2)} 大卡`;
  document.getElementById('caloric-needs-result').textContent = `熱量需求: ${caloricNeeds.toFixed(2)} 大卡`;
  document.getElementById('results').style.display = 'block'; // 顯示結果區塊

  const macroRatios = {
    low: { carbs: 0.2, protein: 0.4, fat: 0.4 },
    medium: { carbs: 0.35, protein: 0.3, fat: 0.35 },
    high: { carbs: 0.5, protein: 0.3, fat: 0.2 }
  };

  const targetRatio = macroRatios[carbType];
  const targetMacros = {
    total: caloricNeeds,
    protein: caloricNeeds * targetRatio.protein / 4,
    carbs: caloricNeeds * targetRatio.carbs / 4,
    fat: caloricNeeds * targetRatio.fat / 9
  };

  // 更新「份」顯示結果
  if (proteinServingsEl) {
    const proteinServings = targetMacros.protein / PROTEIN_PER_SERVING_G;
    proteinServingsEl.textContent = `(約 ${proteinServings.toFixed(1)} 份)`;
  }
  if (carbsServingsEl) {
    const carbsServings = targetMacros.carbs / CARBS_PER_SERVING_G;
    carbsServingsEl.textContent = `(約 ${carbsServings.toFixed(1)} 份)`;
  }
  if (fatServingsEl) {
    const fatServings = targetMacros.fat / FAT_PER_SERVING_G;
    fatServingsEl.textContent = `(約 ${fatServings.toFixed(1)} 份)`;
  }

  // 重新載入食物選項，並傳入目標營養素以顯示「滿足單一營養素需求」
  loadFoodOptions(targetMacros);

  // 顯示目標巨量營養素攝取量
  displayMacronutrients(caloricNeeds, carbType);

  // 獲取當前選中的食物
  const selectedProteins = Array.from(document.querySelectorAll('#protein-food input:checked')).map(input =>
    foodData.protein.find(f => f.name === input.value));
  const selectedCarbs = Array.from(document.querySelectorAll('#carb-food input:checked')).map(input =>
    foodData.carbs.find(f => f.name === input.value));
  const selectedFats = Array.from(document.querySelectorAll('#fat-food input:checked')).map(input =>
    foodData.fat.find(f => f.name === input.value));

  const selectedFoods = {
    protein: selectedProteins,
    carbs: selectedCarbs,
    fat: selectedFats
  };

  // 即使其他兩個顯示區塊被隱藏，我們仍可能需要這些計算結果
  // 如果有選中的食物，才執行完整的食物份量計算，避免空選單報錯
  if (selectedProteins.length > 0 || selectedCarbs.length > 0 || selectedFats.length > 0) {
      const { portions, actualMacros } = calculateFoodPortionsSimple(selectedFoods, targetMacros, carbType, goal);
      displayFoodPortions(portions);
  } else {
      document.getElementById('single-source-portions').style.display = 'none';
  }

  // 顯示單一食物滿足目標營養素所需份量
  displaySingleSourcePortions(selectedFoods, targetMacros);
}


// 在 DOM 內容完全載入後執行
document.addEventListener('DOMContentLoaded', () => {
  // 頁面載入時執行一次計算和渲染，以顯示預設值
  calculateAndRender();

  // 監聽所有相關輸入欄位的變化事件，觸發即時計算和渲染
  document.getElementById('weight').addEventListener('input', calculateAndRender);
  document.getElementById('height').addEventListener('input', calculateAndRender);
  document.getElementById('age').addEventListener('input', calculateAndRender);

  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', calculateAndRender);
  });

  document.getElementById('activity-level').addEventListener('change', calculateAndRender);
  document.getElementById('goal').addEventListener('change', calculateAndRender);
  document.getElementById('carb-type').addEventListener('change', calculateAndRender);

  // 監聽食物選擇 (checkboxes) 的變化，因為這也會影響 calculateAndRender 中的 selectedFoods 邏輯
  document.getElementById('protein-food').addEventListener('change', calculateAndRender);
  document.getElementById('carb-food').addEventListener('change', calculateAndRender);
  document.getElementById('fat-food').addEventListener('change', calculateAndRender);

  // 移除原有的表單提交事件監聽器，因為現在是即時更新
  const form = document.getElementById('calculator-form');
  // 如果您之前有 form.addEventListener('submit', ...) 這樣的程式碼，請確保它被移除或不再觸發主要計算邏輯
  // 由於我們將所有核心邏輯移入 calculateAndRender 並使用 input/change 事件，原有的 submit 監聽器會變得冗餘
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表單真的提交，頁面刷新
    // 這裡可以選擇性地調用 calculateAndRender()，但因為已經有即時更新，這行會是多餘的
  });
});