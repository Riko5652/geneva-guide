// =================================================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// =================================================================================

// Firebase SDKs are imported from the inline script in index.html
const { 
    initializeApp 
} = window.firebase.app;
const { 
    getFirestore, doc, getDoc, setDoc, collection, addDoc, onSnapshot, serverTimestamp 
} = window.firebase.firestore;


// This function will be called by the DOMContentLoaded event
async function initializeFirebase() {
    // These variables are placeholders and will be replaced by your Netlify environment variables
    const firebaseConfig = {
        apiKey: "__FIREBASE_API_KEY__",
        authDomain: "__FIREBASE_AUTH_DOMAIN__",
        projectId: "__FIREBASE_PROJECT_ID__",
        storageBucket: "__FIREBASE_STORAGE_BUCKET__",
        messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
        appId: "__FIREBASE_APP_ID__"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Make db instance globally available
    window.db = db;
}

// =================================================================================
// GLOBAL STATE & VARIABLES
// =================================================================================

let tripData = {}; // Will hold all data from Firestore
let currentWeatherData = null;
let chatImageBase64 = null;
let map = null;

const CURRENCY_RATES = {
    "CHF": { "ILS": 4.15, "EUR": 1.02, "CHF": 1 },
    "EUR": { "ILS": 4.05, "CHF": 0.98, "EUR": 1 },
    "ILS": { "CHF": 0.24, "EUR": 0.25, "ILS": 1 }
};

// =================================================================================
// MAIN APP LOGIC
// =================================================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeFirebase();
        await loadTripData();
        initializeAppUI();
    } catch (error) {
        console.error("Initialization failed:", error);
        document.getElementById('loading-overlay').innerHTML = '<p class="text-red-500">שגיאה בטעינת האתר. אנא בדוק את הגדרות ה-Firebase שלך.</p>';
    }
});

async function loadTripData() {
    const docRef = doc(db, "trips", "geneva2025");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        tripData = docSnap.data();
    } else {
        console.error("Trip data not found in Firestore!");
        document.getElementById('loading-overlay').innerHTML = '<p class="text-red-500">לא נמצא מידע על הטיול בבסיס הנתונים.</p>';
        throw new Error("Data not found");
    }
}

function initializeAppUI() {
    renderItinerary();
    renderActivities();
    renderPackingGuide();
    setupEventListeners();
    updateProgressBar();
    displayCurrentActions();
    fetchAndRenderWeather();
    initMap();
    loadPhotoAlbum();
    setupRealtimeListeners();
    document.getElementById('loading-overlay').style.display = 'none';
}

function setupRealtimeListeners() {
    const messagesCol = collection(db, "trips/geneva2025/messages");
    onSnapshot(messagesCol, (snapshot) => {
        tripData.messages = [];
        snapshot.forEach(doc => tripData.messages.push({ id: doc.id, ...doc.data() }));
        renderMessages();
    });

    const expensesCol = collection(db, "trips/geneva2025/expenses");
    onSnapshot(expensesCol, (snapshot) => {
        tripData.expenses = [];
        snapshot.forEach(doc => tripData.expenses.push({ id: doc.id, ...doc.data() }));
        renderExpenses();
    });
}


// =================================================================================
// RENDERING FUNCTIONS
// =================================================================================

function renderItinerary() {
    const container = document.getElementById('itinerary-container');
    container.innerHTML = '';
    if (!tripData.itinerary) return;

    tripData.itinerary.sort((a,b) => a.dayIndex - b.dayIndex).forEach(day => {
        const dayHtml = `
            <div class="bg-white p-6 rounded-xl shadow-lg border-r-4 border-accent" data-day-index="${day.dayIndex}">
                <h3 class="font-bold text-2xl mb-4 text-gray-800">${day.title}</h3>
                <div>
                    <h4 class="font-semibold text-lg text-accent">${day.mainPlan.title}</h4>
                    <p class="mt-2 text-gray-700">${day.mainPlan.description}</p>
                    ${day.mainPlan.activities.map(act => `<div data-activity-details="${act.name}"></div>`).join('')}
                </div>
                <div class="border-t pt-4 mt-4">
                    <h4 class="font-semibold text-lg text-gray-600">${day.alternativePlan.title}</h4>
                    <p class="mt-2 text-gray-700">${day.alternativePlan.description}</p>
                     ${day.alternativePlan.activities.map(act => `<div data-activity-details="${act.name}"></div>`).join('')}
                </div>
                <div class="border-t pt-4 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button class="btn-secondary gemini-plan-btn">✨ תכנון בוקר</button>
                    <button class="btn-secondary gemini-summary-btn">👦 סיכום לילדים</button>
                    <button class="btn-secondary whatsapp-share-btn">🔗 שתף ב-WhatsApp</button>
                    <button class="btn-secondary gcal-add-btn">📅 הוסף ליומן</button>
                </div>
                <div class="gemini-plan-result hidden mt-4"></div>
            </div>`;
        container.innerHTML += dayHtml;
    });
    populateItineraryDetails();
}

function renderActivities() {
    const grid = document.getElementById('activities-grid');
    const filterContainer = document.querySelector('#activities .flex-wrap');
    if (!grid || !filterContainer || !tripData.activities) return;

    grid.innerHTML = '';
    filterContainer.innerHTML = '<button class="btn-filter active px-4 py-2 rounded-full" data-filter="all">הכל</button>';
    
    const categories = [...new Set(tripData.activities.map(a => a.category))];
    categories.forEach(cat => {
        if(cat !== 'בית מרקחת') {
             filterContainer.innerHTML += `<button class="btn-filter px-4 py-2 rounded-full" data-filter="${cat}">${cat}</button>`;
        }
    });

    const currentFilter = document.querySelector('.btn-filter.active').dataset.filter;
    const filteredActivities = (currentFilter === 'all')
        ? tripData.activities.filter(a => a.category !== 'בית מרקחת')
        : tripData.activities.filter(a => a.category === currentFilter);

    filteredActivities.forEach(activity => grid.innerHTML += createActivityCard(activity));
    
    document.querySelectorAll('#activities .btn-filter').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('#activities .btn-filter').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderActivities();
        });
    });
}

function createActivityCard(activity) {
     return `
        <div class="card">
            <img src="${activity.image}" alt="${activity.name}" class="w-full h-48 object-cover">
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-xl font-bold mb-2">${activity.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${activity.description}</p>
                <div class="mt-auto flex space-x-2 space-x-reverse">
                    <a href="${activity.link}" target="_blank" class="flex-1 text-center btn-primary px-4 py-2 rounded-lg text-sm">לאתר הרשמי</a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.address}" target="_blank" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">ניווט</a>
                </div>
            </div>
        </div>`;
}

function populateItineraryDetails() {
    document.querySelectorAll('[data-activity-details]').forEach(element => {
        const activityName = element.dataset.activityDetails;
        const activity = tripData.activities.find(a => a.name === activityName);
        if (activity) element.innerHTML = createActivitySnippetHTML(activity);
    });
}

function createActivitySnippetHTML(activity) {
     return `
        <div class="activity-snippet text-sm text-gray-600 space-y-2 mt-2">
            <p class="flex items-center"><span class="w-5 text-center">🕒</span> <strong>זמן הגעה:</strong> כ-${activity.time} דקות</p>
            <p class="flex items-center"><span class="w-5 text-center">📍</span> <strong>כתובת:</strong> ${activity.address}</p>
        </div>`;
}

function renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    if(!tripData.messages) return;
    
    tripData.messages.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds).forEach(msg => {
        const date = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString('he-IL') : '...';
        container.innerHTML += `
            <div class="p-3 bg-white rounded-lg shadow-sm">
                <p>${msg.text}</p>
                <p class="text-xs text-gray-500 text-left mt-1"><strong>${msg.author}</strong> - ${date}</p>
            </div>`;
    });
    container.scrollTop = container.scrollHeight;
}

function renderExpenses() {
    const list = document.getElementById('expenses-list');
    const totalEl = document.getElementById('expenses-total');
    list.innerHTML = '';
    if (!tripData.expenses) return;

    let totalILS = 0;
    tripData.expenses.forEach(exp => {
        list.innerHTML += `<div class="flex justify-between items-center p-2 bg-white rounded"><span>${exp.description}</span><span>${exp.amount.toFixed(2)} ${exp.currency}</span></div>`;
        totalILS += exp.amount * (CURRENCY_RATES[exp.currency]?.ILS || 1);
    });
    totalEl.innerHTML = `סך הכל (מוערך): ₪${totalILS.toFixed(2)}`;
}

function renderPackingGuide() {
    const container = document.getElementById('packing-modal-content');
    if(!container || !tripData.packingGuide) return;
    container.innerHTML = tripData.packingGuide.htmlContent; // Assuming HTML is stored directly
}


// =================================================================================
// FEATURE-SPECIFIC LOGIC
// =================================================================================

function loadPhotoAlbum() {
    const embedUrl = tripData.photoAlbumUrl;
    if (embedUrl) {
        const container = document.getElementById('photos-container');
        const placeholder = document.getElementById('photos-placeholder');
        container.innerHTML = `
            <div class="relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden group">
                <iframe src="${embedUrl}" frameborder="0" width="100%" height="100%" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
                <button id="fullscreen-photos-btn" class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                    <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5" /></svg>
                </button>
            </div>`;
        placeholder.classList.add('hidden');
        document.getElementById('fullscreen-photos-btn').addEventListener('click', openPhotosFullscreen);
    }
}

async function handlePhotoAlbumLoad() {
    const input = document.getElementById('photos-embed-input');
    let url = input.value.trim();
    
    // Extract src from iframe tag if pasted
    if (url.startsWith('<iframe')) {
        const match = url.match(/src="([^"]+)"/);
        if (match && match[1]) {
            url = match[1];
        } else {
            alert('קוד ההטמעה שהדבקת לא תקין.');
            return;
        }
    }

    if (!url.startsWith('https://docs.google.com/presentation/')) {
        alert('אנא הזינו קישור הטמעה תקין מ-Google Slides.');
        return;
    }
    
    const docRef = doc(db, "trips", "geneva2025");
    try {
        await setDoc(docRef, { photoAlbumUrl: url }, { merge: true });
        tripData.photoAlbumUrl = url;
        loadPhotoAlbum();
        input.value = '';
        alert('אלבום התמונות עודכן בהצלחה!');
    } catch (error) {
        console.error("Error updating photo album:", error);
        alert('שגיאה בעדכון אלבום התמונות.');
    }
}

async function handleSendMessage() {
    const textInput = document.getElementById('message-input');
    const authorInput = document.getElementById('message-author');
    if (!textInput.value.trim() || !authorInput.value.trim()) return;

    const messagesCol = collection(db, "trips/geneva2025/messages");
    try {
        await addDoc(messagesCol, {
            text: textInput.value,
            author: authorInput.value,
            timestamp: serverTimestamp()
        });
        textInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function handleAddExpense() {
    const descInput = document.getElementById('expense-desc');
    const amountInput = document.getElementById('expense-amount');
    const currencySelect = document.getElementById('expense-currency');

    if (!descInput.value.trim() || !amountInput.value) return;
    
    const expensesCol = collection(db, "trips/geneva2025/expenses");
     try {
        await addDoc(expensesCol, {
            description: descInput.value,
            amount: parseFloat(amountInput.value),
            currency: currencySelect.value,
            timestamp: serverTimestamp()
        });
        descInput.value = '';
        amountInput.value = '';
    } catch (error) {
        console.error("Error adding expense:", error);
    }
}

function handleCurrencyConversion() {
    const amount = parseFloat(document.getElementById('amount-from').value) || 0;
    const from = document.getElementById('currency-from').value;
    const resultEl = document.getElementById('conversion-result');
    
    let resultText = '';
    if (from === 'ILS') {
        resultText = `${(amount * CURRENCY_RATES.ILS.CHF).toFixed(2)} CHF | ${(amount * CURRENCY_RATES.ILS.EUR).toFixed(2)} EUR`;
    } else if (from === 'CHF') {
        resultText = `${(amount * CURRENCY_RATES.CHF.ILS).toFixed(2)} ILS | ${(amount * CURRENCY_RATES.CHF.EUR).toFixed(2)} EUR`;
    } else { // EUR
        resultText = `${(amount * CURRENCY_RATES.EUR.ILS).toFixed(2)} ILS | ${(amount * CURRENCY_RATES.EUR.CHF).toFixed(2)} CHF`;
    }
    resultEl.textContent = resultText;
}

function handleWhatsAppShare(event) {
    const dayElement = event.target.closest('[data-day-index]');
    const dayIndex = parseInt(dayElement.dataset.dayIndex);
    const dayData = tripData.itinerary.find(d => d.dayIndex === dayIndex);
    if (!dayData) return;
    
    let text = `*תוכנית ליום ${dayIndex}: ${dayData.title}*\n\n`;
    text += `*תוכנית עיקרית:* ${dayData.mainPlan.activities.map(a => a.name).join(', ')}\n`;
    text += `*תוכנית חלופית:* ${dayData.alternativePlan.activities.map(a => a.name).join(', ')}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function handleGCalAdd(event) {
    const dayElement = event.target.closest('[data-day-index]');
    const dayIndex = parseInt(dayElement.dataset.dayIndex);
    const dayData = tripData.itinerary.find(d => d.dayIndex === dayIndex);
    if (!dayData) return;

    const tripStartDate = new Date(tripData.tripDates.start);
    const eventDate = new Date(tripStartDate);
    eventDate.setDate(tripStartDate.getDate() + dayIndex - 1);
    const dateString = eventDate.toISOString().split('T')[0].replace(/-/g, '');

    let details = `תוכנית עיקרית: ${dayData.mainPlan.activities.map(a => a.name).join(', ')}. \n`;
    details += `תוכנית חלופית: ${dayData.alternativePlan.activities.map(a => a.name).join(', ')}.`;

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(dayData.title)}&dates=${dateString}/${dateString}&details=${encodeURIComponent(details)}&location=Geneva, Switzerland`;
    
    window.open(url, '_blank');
}

// =================================================================================
// EVENT LISTENERS SETUP
// =================================================================================

function setupEventListeners() {
    // Menu
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    document.querySelectorAll('.nav-link, #mobile-menu button').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
    
    // Modals
    document.querySelectorAll('[id^="open-"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.id.replace('open-', '').replace('-btn-mobile', '') + '-modal';
            const modal = document.getElementById(modalId);
            if(modal) modal.classList.remove('hidden');
        });
    });
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden'));
    });

    // Features
    document.getElementById('load-photos-btn').addEventListener('click', handlePhotoAlbumLoad);
    document.getElementById('send-message-btn').addEventListener('click', handleSendMessage);
    document.getElementById('add-expense-btn').addEventListener('click', handleAddExpense);
    document.getElementById('currency-from').addEventListener('change', handleCurrencyConversion);
    document.getElementById('amount-from').addEventListener('input', handleCurrencyConversion);
    handleCurrencyConversion();
    
    // Delegated Itinerary Buttons
    document.getElementById('itinerary-container').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        if (target.classList.contains('whatsapp-share-btn')) handleWhatsAppShare(e);
        if (target.classList.contains('gcal-add-btn')) handleGCalAdd(e);
    });
    
    // Gemini Chat
    const chatInput = document.getElementById('chat-input');
    document.getElementById('chat-send-btn').addEventListener('click', handleChatSend);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatSend(); });
    document.getElementById('chat-attach-btn').addEventListener('click', () => document.getElementById('chat-image-input').click());
    document.getElementById('chat-image-input').addEventListener('change', handleChatImageUpload);
}


// =================================================================================
// UTILITY & PREVIOUSLY EXISTING FUNCTIONS
// =================================================================================

async function fetchAndRenderWeather() {
    const startDate = tripData.tripDates.start.split('T')[0];
    const endDate = tripData.tripDates.end.split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=46.20&longitude=6.14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&start_date=${startDate}&end_date=${endDate}`;
    try {
        const response = await fetch(url);
        currentWeatherData = await response.json();
        const forecastContainer = document.getElementById('weather-forecast');
        if (!forecastContainer || !currentWeatherData.daily) return;
        forecastContainer.innerHTML = '';
        currentWeatherData.daily.time.forEach((dateStr, i) => {
             const date = new Date(dateStr);
            const day = date.toLocaleDateString('he-IL', { weekday: 'short' });
            const dayMonth = `${date.getDate()}.${date.getMonth() + 1}`;
            const tempMax = Math.round(currentWeatherData.daily.temperature_2m_max[i]);
            const tempMin = Math.round(currentWeatherData.daily.temperature_2m_min[i]);
            const weather = getWeatherInfo(currentWeatherData.daily.weathercode[i]);
            forecastContainer.innerHTML += `
                <div class="bg-secondary text-center p-2 rounded-lg shadow flex-shrink-0 w-full sm:w-auto flex-1">
                    <div class="font-bold">${day}, ${dayMonth}</div>
                    <div class="text-3xl my-1">${weather.icon}</div>
                    <div class="font-semibold">${tempMin}°/${tempMax}°</div>
                </div>`;
        });
    } catch (error) {
        console.error("Failed to fetch weather:", error);
    }
}

function getWeatherInfo(code) {
    const codes = {
        0: { description: "בהיר", icon: "☀️" }, 1: { description: "בהיר", icon: "☀️" },
        2: { description: "מעונן חלקית", icon: "🌤️" }, 3: { description: "מעונן", icon: "☁️" },
        61: { description: "גשם קל", icon: "🌧️" }, 63: { description: "גשם", icon: "🌧️" },
    };
    return codes[code] || { description: "לא ידוע", icon: "🤷" };
}

function initMap() {
    if (map || !tripData.activities) return;
    const hotelLocation = { lat: 46.2183, lon: 6.0744 };
    map = L.map('map').setView([hotelLocation.lat, hotelLocation.lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    const hotelIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
    L.marker([hotelLocation.lat, hotelLocation.lon], {icon: hotelIcon}).addTo(map).bindTooltip("Mercure Hotel Meyrin").openTooltip();
    
    tripData.activities.forEach(activity => {
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon]).addTo(map).bindTooltip(activity.name);
        }
    });
}

function updateProgressBar() {
    const { tripTimeline } = tripData;
    const now = new Date();
    const start = new Date(tripTimeline[0].date);
    const end = new Date(tripTimeline[tripTimeline.length - 1].date);
    let progress = 0;
    let currentStatus = "לפני הטיול";

    if (now >= start && now <= end) {
        progress = ((now - start) / (end - start)) * 100;
        for (let i = tripTimeline.length - 1; i >= 0; i--) {
            if (now >= new Date(tripTimeline[i].date)) {
                currentStatus = tripTimeline[i].label;
                break;
            }
        }
    } else if (now > end) {
        progress = 100;
        currentStatus = "הטיול הסתיים";
    }

    document.getElementById('progress-bar-fill').style.width = `${progress}%`;
    document.getElementById('progress-bar-text').textContent = currentStatus;
}

function displayCurrentActions() {
    const now = new Date();
    const flightDate = new Date(tripData.tripDates.start);
    const daysUntilFlight = Math.ceil((flightDate - now) / (1000 * 60 * 60 * 24));
    
    const action = tripData.timeSensitiveActions.find(a => daysUntilFlight <= a.endDays && daysUntilFlight >= a.startDays);
    const container = document.getElementById('current-actions');
    if (action) {
        document.getElementById('current-actions-title').textContent = action.title;
        document.getElementById('current-actions-content').innerHTML = action.content;
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

async function handleChatSend() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    if (!userMessage && !chatImageBase64) return;
    
    let prompt;
    const parts = [];

    if (chatImageBase64) {
        prompt = "You are a helpful assistant. The user uploaded an image of a menu. Please translate it to Hebrew, keeping the original structure as much as possible, and add a short, friendly opening. If the image is not a menu, describe it briefly and ask how you can help.";
        parts.push({ text: prompt });
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: chatImageBase64 } });
    } else {
        prompt = `You are a Geneva travel expert for families with toddlers. Answer the following question in Hebrew, keeping the answer concise and helpful: "${userMessage}"`;
        parts.push({ text: prompt });
    }

    // This is a placeholder for the actual Gemini API call.
    // In a real scenario, you would send `parts` to your backend/serverless function.
    const geminiResponse = "זוהי תשובה לדוגמה מהמומחה שלכם בז\'נבה. האינטגרציה עם Gemini API תושלם בשרת.";
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `<div class="chat-bubble user">${userMessage}</div>`;
    chatMessages.innerHTML += `<div class="chat-bubble gemini">${geminiResponse}</div>`;
    chatInput.value = '';
    chatImageBase64 = null; // Reset image
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function handleChatImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => chatImageBase64 = e.target.result.split(',')[1];
    reader.readAsDataURL(file);
}

function openPhotosFullscreen() {
    const modal = document.getElementById('photos-fullscreen-modal');
    const content = document.getElementById('photos-fullscreen-content');
    content.innerHTML = `<iframe src="${tripData.photoAlbumUrl}" class="w-full h-full" frameborder="0"></iframe>`;
    modal.classList.remove('hidden');
}

