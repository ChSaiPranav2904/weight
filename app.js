// Pre-load Sound Effect for micro-interactions
const popSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
popSound.volume = 0.5;

function playCheckSound() {
    popSound.currentTime = 0; // Reset sound to start
    popSound.play().catch(e => console.log("Audio play blocked by browser until user interacts."));
}

// Gamification Rank Tiers
const RANKS = [
    { name: "Bronze", minXp: 0, color: "#cd7f32" },
    { name: "Silver", minXp: 500, color: "#c0c0c0" },
    { name: "Gold", minXp: 1200, color: "#ffd700" },
    { name: "Platinum", minXp: 2500, color: "#00ced1" },
    { name: "Diamond", minXp: 4000, color: "#b9f2ff" },
    { name: "Crown", minXp: 6500, color: "#ff69b4" },
    { name: "Ace", minXp: 10000, color: "#ff4500" },
    { name: "Conqueror", minXp: 15000, color: "#ff0000" }
];

const userProfile = {
    name: "Sai Pranav",
    height: 170,
    targetWeight: 90,
    dailyWaterGoal: 4.0,
    waterIntake: 0.0,
    totalXP: 0, // NEW: Tracks overall progression
    weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: 116 }],
    routine: {
        Morning: [ { task: "Wake up before 7 AM", done: false }, { task: "Drink Water", done: false }, { task: "Stretching", done: false } ],
        College: [ { task: "Attend Classes", done: false }, { task: "Drink Water", done: false }, { task: "Healthy Lunch", done: false } ],
        Evening: [ { task: "Gym (Weight Training)", done: false }, { task: "Cardio (20 mins)", done: false }, { task: "Protein Intake", done: false } ],
        Night: [ { task: "Healthy Dinner", done: false }, { task: "Sleep Before 11 PM", done: false } ]
    },
    habits: [
        { task: "10,000 Steps", done: false }, { task: "No Sugar", done: false }, { task: "Sleep 8 Hours", done: false }, { task: "Meditation", done: false }
    ],
    weeklyDiet: {
        Monday: [ { meal: "Breakfast", food: "Idli, Sambar", cals: 350, status: false }, { meal: "Lunch", food: "Rajma, Roti", cals: 500, status: false }, { meal: "Dinner", food: "Dal, Curd", cals: 400, status: false } ],
        Tuesday: [ { meal: "Breakfast", food: "Uttapam, Sambar", cals: 350, status: false }, { meal: "Lunch", food: "Moong Dal, Roti", cals: 450, status: false }, { meal: "Dinner", food: "Soya Curry, Roti", cals: 500, status: false } ],
        Wednesday: [ { meal: "Breakfast", food: "Besan Chilla", cals: 320, status: false }, { meal: "Lunch", food: "Chana Masala", cals: 500, status: false }, { meal: "Dinner", food: "Dal Fry, Paneer", cals: 600, status: false } ],
        Thursday: [ { meal: "Breakfast", food: "Rawa Idli", cals: 350, status: false }, { meal: "Lunch", food: "Chole, Roti", cals: 550, status: false }, { meal: "Dinner", food: "Dal Makhani", cals: 500, status: false } ],
        Friday: [ { meal: "Breakfast", food: "Veg Upma", cals: 300, status: false }, { meal: "Lunch", food: "Soya Chunks, Dal", cals: 550, status: false }, { meal: "Dinner", food: "Rajma Masala", cals: 500, status: false } ],
        Saturday: [ { meal: "Breakfast", food: "Veg Uthappa", cals: 320, status: false }, { meal: "Lunch", food: "Mixed Dal, Gobi", cals: 450, status: false }, { meal: "Dinner", food: "Lobiya Sabzi", cals: 480, status: false } ],
        Sunday: [ { meal: "Breakfast", food: "Poha", cals: 300, status: false }, { meal: "Lunch", food: "Gongura Dal", cals: 450, status: false }, { meal: "Dinner", food: "Dal Tadka, Paneer", cals: 600, status: false } ]
    },
    lastResetDate: new Date().toISOString().split('T')[0]
};

let state = JSON.parse(localStorage.getItem('saiHealthState')) || userProfile;

// Data migration check for totalXP
if (state.totalXP === undefined) { state.totalXP = 0; saveState(); }

const todayDate = new Date().toISOString().split('T')[0];
if (state.lastResetDate !== todayDate) {
    state.waterIntake = 0;
    Object.keys(state.routine).forEach(p => state.routine[p].forEach(i => i.done = false));
    state.habits.forEach(h => h.done = false);
    Object.keys(state.weeklyDiet).forEach(d => state.weeklyDiet[d].forEach(i => i.status = false));
    state.lastResetDate = todayDate;
    saveState();
}

function saveState() {
    localStorage.setItem('saiHealthState', JSON.stringify(state));
    updateProgress();
    updateRankUI();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    renderDashboard(); renderRoutine(); renderHabits(); renderDiet(); initChart();
    updateProgress(); updateRankUI();
});

// RANK & XP LOGIC
function updateRankUI() {
    let currentRank = RANKS[0];
    let nextRank = RANKS[1];
    
    // Determine current rank
    for (let i = 0; i < RANKS.length; i++) {
        if (state.totalXP >= RANKS[i].minXp) {
            currentRank = RANKS[i];
            nextRank = RANKS[i + 1] || RANKS[i]; // Cap at max rank
        }
    }

    const badge = document.getElementById('rank-badge');
    badge.innerText = currentRank.name;
    badge.style.background = `linear-gradient(135deg, ${currentRank.color} 0%, rgba(0,0,0,0.8) 100%)`;
    badge.style.border = `1px solid ${currentRank.color}`;
    badge.style.color = currentRank.name === 'Silver' ? '#000' : '#fff'; // Contrast fix

    document.getElementById('current-xp').innerText = state.totalXP;
    
    if (currentRank.name === "Conqueror") {
        document.getElementById('next-rank-xp').innerText = "MAX";
        document.getElementById('xp-bar').style.width = '100%';
    } else {
        document.getElementById('next-rank-xp').innerText = nextRank.minXp;
        const xpInCurrentTier = state.totalXP - currentRank.minXp;
        const tierSize = nextRank.minXp - currentRank.minXp;
        const progressPct = (xpInCurrentTier / tierSize) * 100;
        document.getElementById('xp-bar').style.width = `${progressPct}%`;
    }
}

function addXP(amount) {
    state.totalXP += amount;
    if (state.totalXP < 0) state.totalXP = 0;
}

// TOGGLE FUNCTIONS (Now with Audio & XP)
function toggleRoutine(period, index, value) {
    if (value) { playCheckSound(); addXP(15); } else { addXP(-15); }
    state.routine[period][index].done = value;
    saveState(); renderRoutine();
}

function toggleHabit(index, value) {
    if (value) { playCheckSound(); addXP(25); } else { addXP(-25); }
    state.habits[index].done = value;
    saveState(); renderHabits();
}

function toggleDiet(day, index, value) {
    if (value) { playCheckSound(); addXP(20); } else { addXP(-20); }
    state.weeklyDiet[day][index].status = value;
    saveState(); renderDiet();
}

function addWater(amount) {
    if (state.waterIntake < state.dailyWaterGoal) {
        playCheckSound();
        addXP(10); // 10 XP per water entry
        state.waterIntake = Math.min(state.waterIntake + amount, state.dailyWaterGoal);
        saveState();
        updateWaterUI();
    }
}

function resetWater() {
    state.waterIntake = 0;
    saveState(); updateWaterUI();
}

// RENDERING (Same as before)
function renderDashboard() {
    const latestWeight = state.weightHistory[state.weightHistory.length - 1].weight;
    const heightM = state.height / 100;
    document.getElementById('val-weight').innerText = latestWeight;
    document.getElementById('val-bmi').innerText = (latestWeight / (heightM * heightM)).toFixed(1);
    updateWaterUI();
}

function updateWaterUI() {
    const pct = (state.waterIntake / state.dailyWaterGoal) * 100;
    document.getElementById('water-ring').style.setProperty('--progress', `${pct}%`);
    document.getElementById('water-text').innerText = `${state.waterIntake.toFixed(2)}L`;
    updateProgress();
}

function renderRoutine() {
    const container = document.getElementById('routine-container');
    container.innerHTML = '';
    Object.keys(state.routine).forEach(period => {
        const div = document.createElement('div'); div.className = 'routine-section'; div.innerHTML = `<h4>${period}</h4>`;
        state.routine[period].forEach((item, index) => {
            div.innerHTML += `<label class="checkbox-item"><input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleRoutine('${period}', ${index}, this.checked)"><span style="${item.done ? 'text-decoration: line-through; color: var(--text-secondary)' : ''}">${item.task}</span></label>`;
        });
        container.appendChild(div);
    });
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    state.habits.forEach((item, index) => {
        container.innerHTML += `<label class="checkbox-item"><input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleHabit(${index}, this.checked)"><span style="${item.done ? 'text-decoration: line-through; color: var(--text-secondary)' : ''}">${item.task}</span></label>`;
    });
}

function renderDiet() {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDiet = state.weeklyDiet[todayStr] || state.weeklyDiet['Monday'];
    const tbody = document.querySelector('#diet-table tbody');
    tbody.innerHTML = '';
    document.querySelector('.diet-card h3').innerHTML = `<i class="fa-solid fa-leaf accent-green"></i> Diet Planner (${todayStr}) (+20 XP)`;
    
    todayDiet.forEach((item, index) => {
        tbody.innerHTML += `<tr><td>${item.meal}</td><td>${item.food}</td><td>${item.cals}</td><td><input type="checkbox" ${item.status ? 'checked' : ''} onchange="toggleDiet('${todayStr}', ${index}, this.checked)"></td></tr>`;
    });
}

function updateProgress() {
    let total = 0, completed = 0;
    Object.values(state.routine).forEach(period => period.forEach(t => { total++; if (t.done) completed++; }));
    state.habits.forEach(h => { total++; if (h.done) completed++; });
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDiet = state.weeklyDiet[todayStr] || state.weeklyDiet['Monday'];
    todayDiet.forEach(d => { total++; if (d.status) completed++; });
    total++; if (state.waterIntake >= state.dailyWaterGoal) completed++;

    const pct = Math.round((completed / total) * 100);
    document.getElementById('main-progress-ring').style.setProperty('--progress', `${pct}%`);
    document.getElementById('main-progress-text').innerText = `${pct}%`;
    
    if (pct === 100) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#32d74b', '#0a84ff', '#ff9f0a'] });
}

let weightChartInstance = null;
function initChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: state.weightHistory.map(e => e.date.slice(5)), datasets: [{ data: state.weightHistory.map(e => e.weight), borderColor: '#bf5af2', backgroundColor: 'rgba(191, 90, 242, 0.1)', borderWidth: 3, fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { color: '#94a3b8' } } } }
    });
}

function logWeight() {
    const input = document.getElementById('new-weight');
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
        state.weightHistory.push({ date: new Date().toISOString().split('T')[0], weight: val });
        saveState(); input.value = ''; renderDashboard();
        weightChartInstance.data.labels.push(new Date().toISOString().split('T')[0].slice(5));
        weightChartInstance.data.datasets[0].data.push(val);
        weightChartInstance.update();
    }
}
