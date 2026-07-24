// Default User Profile state with BITS-HYD Mess Plan
const userProfile = {
    name: "Sai Pranav",
    height: 170, // cm
    targetWeight: 90,
    dailyWaterGoal: 4.0, // Liters
    waterIntake: 0.0,
    weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: 116 }],
    routine: {
        Morning: [
            { task: "Wake up before 7 AM", done: false },
            { task: "Drink Water", done: false },
            { task: "Stretching", done: false }
        ],
        College: [
            { task: "Attend Classes", done: false },
            { task: "Drink Water", done: false },
            { task: "Healthy Lunch", done: false },
            { task: "Walk 15 mins", done: false }
        ],
        Evening: [
            { task: "Gym (Weight Training)", done: false },
            { task: "Cardio (20 mins)", done: false },
            { task: "Protein Intake", done: false }
        ],
        Night: [
            { task: "Healthy Dinner", done: false },
            { task: "Sleep Before 11 PM", done: false }
        ]
    },
    habits: [
        { task: "10,000 Steps", done: false },
        { task: "No Sugar", done: false },
        { task: "Sleep 8 Hours", done: false },
        { task: "Meditation", done: false }
    ],
    weeklyDiet: {
        Monday: [
            { meal: "Breakfast", food: "Idli, Sambar & Milk", cals: 350, protein: 15, status: false },
            { meal: "Lunch", food: "Rajma Masala, Tori Sabzi, Salad, Curd, 2 Roti", cals: 500, protein: 22, status: false },
            { meal: "Dinner", food: "Dal, Salad, Curd, 2 Roti", cals: 400, protein: 16, status: false }
        ],
        Tuesday: [
            { meal: "Breakfast", food: "Uttapam, Sambar & Milk", cals: 350, protein: 14, status: false },
            { meal: "Lunch", food: "Moong Dal, Brinjal, Salad, Curd, 2 Chapati", cals: 450, protein: 18, status: false },
            { meal: "Dinner", food: "Mealmaker (Soya) Curry, Beans, Curd, 2 Roti", cals: 500, protein: 35, status: false }
        ],
        Wednesday: [
            { meal: "Breakfast", food: "Besan Chilla, Sambar & Milk", cals: 320, protein: 18, status: false },
            { meal: "Lunch", food: "Black Chana Masala, Veg Kolhapuri, Curd, 2 Chapati", cals: 500, protein: 20, status: false },
            { meal: "Dinner", food: "Dal Fry, Extra Paneer Curry, Salad, 2 Roti", cals: 600, protein: 32, status: false }
        ],
        Thursday: [
            { meal: "Breakfast", food: "Rawa Idli/Dosa, Milk", cals: 350, protein: 12, status: false },
            { meal: "Lunch", food: "Chole, Carrot Peas Dry, Salad, Curd, 2 Roti", cals: 550, protein: 22, status: false },
            { meal: "Dinner", food: "Dal Makhani, Bhindi Masala, Curd, 2 Roti", cals: 500, protein: 18, status: false }
        ],
        Friday: [
            { meal: "Breakfast", food: "Veg Upma, Milk", cals: 300, protein: 10, status: false },
            { meal: "Lunch", food: "Soya Chunks, Dal Makhani, Bottle Gourd, Curd, 2 Chapati", cals: 550, protein: 35, status: false },
            { meal: "Dinner", food: "Rajma Masala, Tomato Dal, Curd, 2 Roti", cals: 500, protein: 22, status: false }
        ],
        Saturday: [
            { meal: "Breakfast", food: "Veg Mini Uthappa, Milk", cals: 320, protein: 12, status: false },
            { meal: "Lunch", food: "Mixed Dal, Gobi Masala, Curd, 2 Roti", cals: 450, protein: 18, status: false },
            { meal: "Dinner", food: "Lobiya Sabzi, Dal, Curd, 2 Roti", cals: 480, protein: 20, status: false }
        ],
        Sunday: [
            { meal: "Breakfast", food: "Poha, Milk", cals: 300, protein: 10, status: false },
            { meal: "Lunch", food: "Gongura Dal, Tindly Masala, Curd, 2 Chapati", cals: 450, protein: 16, status: false },
            { meal: "Dinner", food: "Dal Tadka, Extra Paneer Curry, Curd, 2 Roti", cals: 600, protein: 32, status: false }
        ]
    },
    notes: { wins: "", challenges: "", plan: "" },
    lastResetDate: new Date().toISOString().split('T')[0]
};

// Load or Initialize State
let state = JSON.parse(localStorage.getItem('saiHealthState')) || userProfile;

// Data structure migration (If upgrading from previous version)
if (!state.weeklyDiet) {
    state.weeklyDiet = userProfile.weeklyDiet;
    delete state.diet; // Remove old format
    saveState();
}

// Reset daily tasks if it's a new day
const todayDate = new Date().toISOString().split('T')[0];
if (state.lastResetDate !== todayDate) {
    state.waterIntake = 0;
    Object.keys(state.routine).forEach(period => {
        state.routine[period].forEach(item => item.done = false);
    });
    state.habits.forEach(h => h.done = false);
    
    // Reset diet status for all days
    Object.keys(state.weeklyDiet).forEach(day => {
        state.weeklyDiet[day].forEach(item => item.status = false);
    });

    state.notes = { wins: "", challenges: "", plan: "" };
    state.lastResetDate = todayDate;
    saveState();
}

function saveState() {
    localStorage.setItem('saiHealthState', JSON.stringify(state));
    updateProgress();
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    renderDashboard();
    renderRoutine();
    renderHabits();
    renderDiet();
    loadNotes();
    initChart();
    updateProgress();
});

// Render Dashboard Metrics
function renderDashboard() {
    const latestWeight = state.weightHistory[state.weightHistory.length - 1].weight;
    const heightM = state.height / 100;
    const bmi = (latestWeight / (heightM * heightM)).toFixed(1);

    document.getElementById('val-weight').innerText = latestWeight;
    document.getElementById('val-bmi').innerText = bmi;
    updateWaterUI();
}

// Water Logic
function addWater(amount) {
    if (state.waterIntake < state.dailyWaterGoal) {
        state.waterIntake = Math.min(state.waterIntake + amount, state.dailyWaterGoal);
        saveState();
        updateWaterUI();
    }
}

function resetWater() {
    state.waterIntake = 0;
    saveState();
    updateWaterUI();
}

function updateWaterUI() {
    const pct = (state.waterIntake / state.dailyWaterGoal) * 100;
    const ring = document.getElementById('water-ring');
    ring.style.setProperty('--progress', `${pct}%`);
    document.getElementById('water-text').innerText = `${state.waterIntake.toFixed(2)}L`;
    updateProgress();
}

// Checklists Rendering
function renderRoutine() {
    const container = document.getElementById('routine-container');
    container.innerHTML = '';
    
    Object.keys(state.routine).forEach(period => {
        const div = document.createElement('div');
        div.className = 'routine-section';
        div.innerHTML = `<h4>${period}</h4>`;
        
        state.routine[period].forEach((item, index) => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleRoutine('${period}', ${index}, this.checked)">
                <span style="${item.done ? 'text-decoration: line-through; color: var(--text-secondary)' : ''}">${item.task}</span>
            `;
            div.appendChild(label);
        });
        container.appendChild(div);
    });
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    state.habits.forEach((item, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleHabit(${index}, this.checked)">
            <span style="${item.done ? 'text-decoration: line-through; color: var(--text-secondary)' : ''}">${item.task}</span>
        `;
        container.appendChild(label);
    });
}

function renderDiet() {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDiet = state.weeklyDiet[todayStr] || state.weeklyDiet['Monday'];

    const tbody = document.querySelector('#diet-table tbody');
    tbody.innerHTML = '';
    
    // Update the card title to show the current day
    document.querySelector('.diet-card h3').innerHTML = `<i class="fa-solid fa-leaf accent-green"></i> Diet Planner (${todayStr})`;

    todayDiet.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.meal}</td>
            <td>${item.food}</td>
            <td>${item.cals}</td>
            <td>${item.protein}g</td>
            <td>
                <input type="checkbox" ${item.status ? 'checked' : ''} onchange="toggleDiet('${todayStr}', ${index}, this.checked)">
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Toggle functions
function toggleRoutine(period, index, value) {
    state.routine[period][index].done = value;
    saveState(); renderRoutine();
}
function toggleHabit(index, value) {
    state.habits[index].done = value;
    saveState(); renderHabits();
}
function toggleDiet(day, index, value) {
    state.weeklyDiet[day][index].status = value;
    saveState(); renderDiet();
}

// Overall Progress Calculation & Confetti
function updateProgress() {
    let total = 0, completed = 0;
    
    // Routine
    Object.values(state.routine).forEach(period => {
        period.forEach(t => { total++; if (t.done) completed++; });
    });
    
    // Habits
    state.habits.forEach(h => { total++; if (h.done) completed++; });
    
    // Diet (Only calculate progress for TODAY'S diet)
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDiet = state.weeklyDiet[todayStr] || state.weeklyDiet['Monday'];
    todayDiet.forEach(d => { total++; if (d.status) completed++; });
    
    // Water
    total++; 
    if (state.waterIntake >= state.dailyWaterGoal) completed++;

    const pct = Math.round((completed / total) * 100);
    
    const ring = document.getElementById('main-progress-ring');
    ring.style.setProperty('--progress', `${pct}%`);
    document.getElementById('main-progress-text').innerText = `${pct}%`;
    
    // Confetti if 100%
    if (pct === 100) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#32d74b', '#0a84ff', '#ff9f0a'] });
    }
}

// Weight Logging & Chart.js
let weightChartInstance = null;
function initChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    const labels = state.weightHistory.map(entry => entry.date.slice(5)); // Show MM-DD
    const data = state.weightHistory.map(entry => entry.weight);

    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: data,
                borderColor: '#bf5af2',
                backgroundColor: 'rgba(191, 90, 242, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function logWeight() {
    const input = document.getElementById('new-weight');
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
        state.weightHistory.push({ date: new Date().toISOString().split('T')[0], weight: val });
        saveState();
        input.value = '';
        renderDashboard();
        
        weightChartInstance.data.labels.push(new Date().toISOString().split('T')[0].slice(5));
        weightChartInstance.data.datasets[0].data.push(val);
        weightChartInstance.update();
    }
}

// Journal logic
function loadNotes() {
    document.getElementById('journal-wins').value = state.notes.wins;
    document.getElementById('journal-challenges').value = state.notes.challenges;
    document.getElementById('journal-plan').value = state.notes.plan;
}
function saveNotes() {
    state.notes.wins = document.getElementById('journal-wins').value;
    state.notes.challenges = document.getElementById('journal-challenges').value;
    state.notes.plan = document.getElementById('journal-plan').value;
    saveState();
    alert("Journal saved!");
}

// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered!', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
