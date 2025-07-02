const foodData = {
  protein: [
    { name: "鮪魚", calories: 132, protein: 28, carbs: 0, fat: 1 },
    { name: "花枝", calories: 92, protein: 15, carbs: 3, fat: 1 },
    { name: "梅花肉", calories: 300, protein: 20, carbs: 0, fat: 24 },
    { name: "五花肉", calories: 395, protein: 14, carbs: 0, fat: 38 },
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


// 初始化食材選項
function loadFoodOptions() {
    const proteinSelect = document.getElementById('protein-food');
    const carbSelect = document.getElementById('carb-food');
    const fatSelect = document.getElementById('fat-food');

    // 蛋白質
    foodData.protein.forEach(food => {
        const div = document.createElement('div');
        div.classList.add('food-item');
        div.innerHTML = `
            <input type="checkbox" id="protein-${food.name}" value="${food.name}" data-category="protein">
            <label for="protein-${food.name}">${food.name} (每100克: ${food.calories} 大卡)</label>
        `;
        proteinSelect.appendChild(div);
    });

    // 碳水
    foodData.carbs.forEach(food => {
        const div = document.createElement('div');
        div.classList.add('food-item');
        div.innerHTML = `
            <input type="checkbox" id="carbs-${food.name}" value="${food.name}" data-category="carbs">
            <label for="carbs-${food.name}">${food.name} (每100克: ${food.calories} 大卡)</label>
        `;
        carbSelect.appendChild(div);
    });

    // 脂肪
    foodData.fat.forEach(food => {
        const div = document.createElement('div');
        div.classList.add('food-item');
        div.innerHTML = `
            <input type="checkbox" id="fat-${food.name}" value="${food.name}" data-category="fat">
            <label for="fat-${food.name}">${food.name} (每100克: ${food.calories} 大卡)</label>
        `;
        fatSelect.appendChild(div);
    });
}

// BMR 計算
function calculateBMR(weight, height, age, gender) {
    return gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
}

// TDEE 計算
function calculateTDEE(weight, height, age, gender, activityLevel) {
    return calculateBMR(weight, height, age, gender) * activityLevel;
}

// 熱量需求調整
function calculateCaloricNeeds(tdee, goal) {
    switch (goal) {
        case 'lose': return tdee - 500;
        case 'gain': return tdee + 500;
        default: return tdee;
    }
}

// 顯示三大營養素
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

    macroDiv.innerHTML = `
        <div class="macro-item">蛋白質：${proteinGrams} 克</div>
        <div class="macro-item">碳水化合物：${carbGrams} 克</div>
        <div class="macro-item">脂肪：${fatGrams} 克</div>
    `;
}

// 顯示食材份數
function displayFoodPortions(foodPortions) {
    const resultDiv = document.getElementById('food-portion-results');
    resultDiv.innerHTML = '';
    if (foodPortions.length === 0) {
        resultDiv.textContent = '請至少每類選一項食物。';
        return;
    }
    foodPortions.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('food-result-item');
        div.textContent = `${item.name} ${item.amount} 克`;
        resultDiv.appendChild(div);
    });
}

// 計算各食材應該攝取的克數
function calculateFoodPortionsByMacronutrient(selectedFoods, caloricNeeds, mode) {
    const modeRatios = {
        low: { carbs: 0.2, protein: 0.4, fat: 0.4 },
        medium: { carbs: 0.35, protein: 0.3, fat: 0.35 },
        high: { carbs: 0.5, protein: 0.3, fat: 0.2 }
    };

    const { carbs, protein, fat } = modeRatios[mode];

    const caloriesByGroup = {
        carbs: caloricNeeds * carbs,
        protein: caloricNeeds * protein,
        fat: caloricNeeds * fat
    };

    function averageDistribute(foods, totalCalories) {
        const perFoodCalories = totalCalories / foods.length;
        return foods.map(food => {
            const grams = 100 * (perFoodCalories / food.calories);
            return {
                name: food.name,
                amount: Math.round(grams)
            };
        });
    }

    return [
        ...averageDistribute(selectedFoods.carbs, caloriesByGroup.carbs),
        ...averageDistribute(selectedFoods.protein, caloriesByGroup.protein),
        ...averageDistribute(selectedFoods.fat, caloriesByGroup.fat)
    ];
}

// 表單送出事件處理
document.getElementById('calculator-form').addEventListener('submit', function (event) {
    event.preventDefault();
    document.getElementById('results').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // 顯示三大營養素
    displayMacronutrients(caloricNeeds, carbType);

    // 計算食材份量並顯示
    const portions = calculateFoodPortionsByMacronutrient(selectedFoods, caloricNeeds, carbType);
    displayFoodPortions(portions);
});

// 初始化
loadFoodOptions();
