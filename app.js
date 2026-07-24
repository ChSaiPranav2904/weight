// Default User Profile state
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
            { task: "Stretching", done: false },
            { task: "Breakfast (High Protein)", done: false }
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
    diet: [
        { meal: "Breakfast", food: "Oats & Whey", cals: 400, protein: 35, status: false },
        { meal: "Lunch", food: "Soya Chunks & Quinoa", cals: 600, protein: 45, status: false },
        { meal: "Snack", food: "Greek Yogurt", cals: 150, protein: 15, status: false },
        { meal: "Dinner", food: "Paneer Tikka & Salad", cals: 500, protein: 30, status: false }
    ],
    notes: { wins: "", challenges: "", plan: "" },
    lastResetDate: new Date().toISOString().split('T')[0]
};

// Load or Initialize State
let state = JSON.parse(localStorage.getItem('saiHealthState')) || userProfile;

// Reset daily tasks if it's a new day
const todayDate = new Date().toISOString().split('T')[0];
if (state.lastResetDate !== todayDate) {
    state.waterIntake = 0;
    Object.keys(state.routine).forEach(period => {
        state.routine[period].forEach(item => item.done = false);
    });
    state.habits.forEach(h => h.done = false);
    state.diet.forEach(d => d.status = false);
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
    const tbody = document.querySelector('#diet-table tbody');
    tbody.innerHTML = '';
    state.diet.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.meal}</td>
            <td>${item.food}</td>
            <td>${item.cals}</td>
            <td>${item.protein}g</td>
            <td>
                <input type="checkbox" ${item.status ? 'checked' : ''} onchange="toggleDiet(${index}, this.checked)">
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
function toggleDiet(index, value) {
    state.diet[index].status = value;
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
    // Diet
    state.diet.forEach(d => { total++; if (d.status) completed++; });
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
