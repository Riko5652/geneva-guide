// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection, query, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Global State
let db, auth, storage, userId, unsubscribeChat;
let currentData = null; // This will hold all our dynamic data from Firestore
let map = null;
let currentCategoryFilter = 'all';
let currentTimeFilter = 'all';
let chatImageBase64 = null;
let suitcaseImageBase64 = null;
let itemsImageBase64 = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const response = await fetch('/api/get-config');
        if (!response.ok) throw new Error(`Failed to fetch Firebase config: ${await response.text()}`);
        const firebaseConfig = await response.json();

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        initializeAppLogic();
    } catch (error) {
        console.error("Critical Initialization Failed:", error);
        document.body.innerHTML = `<div style="padding: 2rem; text-align: center;"><h1>Application Error</h1><p>Could not initialize Firebase.</p><p><i>${error.message}</i></p></div>`;
    }
}

function initializeAppLogic() {
    onAuthStateChanged(auth, user => {
        if (user) {
            userId = user.uid;
            loadAndRenderAllData();
        } else {
            signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
        }
    });
}

// --- DATA LOADING & RENDERING ---
function loadAndRenderAllData() {
    const appId = "lipetztrip-guide";
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);

    onSnapshot(publicDataRef, (docSnap) => {
        if (docSnap.exists()) {
            currentData = docSnap.data();
            renderAllComponents();
        } else {
            console.error("Guide data not found. Run seed script.");
            document.querySelector('main').innerHTML = '<p class="text-center text-red-500 font-bold p-8">Data not found in database.</p>';
        }
    }, (error) => console.error("Error fetching guide data:", error));
}

function renderAllComponents() {
    if (!currentData) return;
    
    // Call all rendering functions
    fetchAndRenderWeather();
    renderActivities();
    renderItinerary(); 
    renderBookingInfo(); // Added this to render booking refs
    initMap();
    setupEventListeners();
    displayDailyAttraction();
    updateProgressBar();
    setInterval(updateProgressBar, 60000);
}

// --- DYNAMIC ITINERARY RENDERING ---
function renderItinerary() {
    if (!currentData || !currentData.itineraryData) return;
    const itineraryContainer = document.getElementById('plan');
    if (!itineraryContainer) return;

    const dayCardsContainer = itineraryContainer.querySelector('.space-y-8');
    if (!dayCardsContainer) return;

    dayCardsContainer.innerHTML = ''; // Clear static HTML

    currentData.itineraryData.forEach(dayInfo => {
        const dayCardHTML = createDayCard(dayInfo);
        dayCardsContainer.innerHTML += dayCardHTML;
    });
    
    // After rendering the itinerary, populate the details inside them
    populateItineraryDetails();
}

function createDayCard(dayInfo) {
    const createPlanSection = (plan) => {
        if (!plan || !plan.items || plan.items.length === 0) return '';
        return `
            <div class="border-t pt-4">
                <h4 class="font-semibold text-lg text-gray-600">${plan.title}</h4>
                <ul class="list-disc pr-5 mt-2 space-y-2 text-gray-700">
                    ${plan.items.map(item => `
                        <li>
                            <strong>${item.activityName || ''}</strong> ${item.description}
                            ${item.activityName ? `<div data-activity-details="${item.activityName}"></div>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>`;
    };

    return `
        <div class="bg-white p-6 rounded-xl shadow-lg border-r-4 border-accent" data-day-index="${dayInfo.dayIndex}">
            <h3 class="font-bold text-2xl mb-4 text-gray-800">יום ${dayInfo.day} (${dayInfo.dayName}): ${dayInfo.title}</h3>
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-lg text-accent">${dayInfo.mainPlan.title}</h4>
                    <ul class="list-disc pr-5 mt-2 space-y-2 text-gray-700">
                        ${dayInfo.mainPlan.items.map(item => `
                            <li>
                                <strong>${item.activityName}</strong>: ${item.description}
                                <div data-activity-details="${item.activityName}"></div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ${createPlanSection(dayInfo.alternativePlan)}
                ${createPlanSection(dayInfo.alternativePlan2)}
                <div class="border-t pt-4 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button class="btn-primary py-2 px-4 rounded-lg gemini-plan-btn">✨ תכנן בוקר</button>
                    <button class="bg-green-500 text-white py-2 px-4 rounded-lg gemini-summary-btn">✨ סכם לילדים</button>
                    <button class="bg-purple-500 text-white py-2 px-4 rounded-lg gemini-story-btn">✨ סיפור לילה טוב</button>
                </div>
                <div class="gemini-plan-result hidden"></div>
                <div class="border-t pt-4 mt-4 bg-yellow-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg text-yellow-800">💡 טיפ להורה סולו</h4>
                    <p class="mt-2 text-gray-700 text-sm">${dayInfo.soloTip}</p>
                </div>
            </div>
        </div>`;
}

// --- UI AND LOGIC FUNCTIONS ---

function renderBookingInfo() {
    if (!currentData || !currentData.flightData) return;
    const bookingRefEl = document.getElementById('booking-ref-display');
    if (bookingRefEl) {
        bookingRefEl.innerHTML = `<strong>מספר הזמנה:</strong> ${currentData.flightData.bookingRef}`;
    }
}

async function fetchAndRenderWeather() {
    const forecastContainer = document.getElementById('weather-forecast');
    if (!forecastContainer) return;
    forecastContainer.innerHTML = '<p class="text-center w-full col-span-full">טוען תחזית עדכנית...</p>';
    
    const startDate = '2025-08-24';
    const endDate = '2025-08-29';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=46.20&longitude=6.14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentData.weatherData = data; 
        const whatToWearBtn = document.getElementById('what-to-wear-btn');

        forecastContainer.innerHTML = '';
        data.daily.time.forEach((dateStr, i) => {
            const date = new Date(dateStr);
            const day = date.toLocaleDateString('he-IL', { weekday: 'long' });
            const dayMonth = `${date.getDate()}.${date.getMonth() + 1}`;
            const tempMax = Math.round(data.daily.temperature_2m_max[i]);
            const tempMin = Math.round(data.daily.temperature_2m_min[i]);
            const weather = getWeatherInfo(data.daily.weathercode[i]);

            forecastContainer.innerHTML += `
               <div class="bg-secondary text-center p-4 rounded-lg shadow flex-shrink-0 w-full sm:w-auto flex-1">
                   <div class="font-bold text-lg">${day}, ${dayMonth}</div>
                   <div class="text-4xl my-2">${weather.icon}</div>
                   <div class="font-semibold">${tempMin}°/${tempMax}°</div>
                   <div class="text-sm text-gray-600">${weather.description}</div>
               </div>`;
        });
        if(whatToWearBtn) whatToWearBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        forecastContainer.innerHTML = '<p class="text-center w-full col-span-full">לא ניתן היה לטעון את תחזית מזג האוויר.</p>';
    }
}

function getWeatherInfo(code) {
    const codes = {
        0: { description: "בהיר", icon: "☀️" }, 1: { description: "בהיר", icon: "☀️" },
        2: { description: "מעונן חלקית", icon: "🌤️" }, 3: { description: "מעונן", icon: "☁️" },
        45: { description: "ערפילי", icon: "🌫️" }, 48: { description: "ערפילי", icon: "🌫️" },
        51: { description: "טפטוף קל", icon: "🌦️" }, 53: { description: "טפטוף", icon: "🌦️" },
        55: { description: "טפטוף", icon: "🌦️" }, 61: { description: "גשם קל", icon: "🌧️" },
        63: { description: "גשם", icon: "🌧️" }, 65: { description: "גשם חזק", icon: "🌧️" },
        80: { description: "ממטרים", icon: "🌦️" }, 81: { description: "ממטרים", icon: "🌦️" },
        82: { description: "ממטרים", icon: "🌦️" }, 95: { description: "סופת רעמים", icon: "⛈️" },
    };
    return codes[code] || { description: "לא ידוע", icon: "🤷" };
}

function createActivityCard(activity) {
    const whatToBringList = activity.whatToBring ? `
       <div class="border-t pt-4 mt-4">
           <h4 class="font-semibold mb-2">🎒 מה להביא?</h4>
           <ul class="list-disc pr-5 space-y-1 text-sm text-gray-600">
               ${activity.whatToBring.map(item => `<li>${item}</li>`).join('')}
           </ul>
       </div>` : '';

    return `
       <div class="card activity-card" data-category="${activity.category}" data-time="${activity.time}">
           <div class="image-container">
               <img src="${activity.image}" alt="${activity.name}" class="w-full h-48 object-cover" onerror="this.closest('.card').classList.add('no-image');">
           </div>
           <div class="image-fallback">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>
           <div class="p-6 flex flex-col flex-grow">
               <div class="flex-grow">
                   <h3 class="text-xl font-bold mb-2">${activity.name}</h3>
                   <span class="text-sm font-semibold text-accent py-1 px-2 rounded-full bg-teal-50 mb-3 inline-block">${activity.category}</span>
                   <p class="text-gray-600 mb-4 text-sm">${activity.description}</p>
                   <div class="border-t pt-4 mt-4 space-y-3 text-sm">
                       <div class="flex items-start"><span class="w-6 text-center mt-1">🕒</span><p><strong>זמן הגעה:</strong> כ-${activity.time || 'לא ידוע'} דקות</p></div>
                       <div class="flex items-start"><span class="w-6 text-center mt-1">🚆</span><p><strong>דרך הגעה:</strong> ${activity.transport || 'לא ידוע'}</p></div>
                       <div class="flex items-start"><span class="w-6 text-center mt-1">💰</span><p><strong>עלות:</strong> ${activity.cost}</p></div>
                       <div class="flex items-start"><span class="w-6 text-center mt-1">📍</span><p><strong>כתובת:</strong> ${activity.address}</p></div>
                   </div>
                   ${whatToBringList}
               </div>
               <div class="flex space-x-2 space-x-reverse mt-4">
                   <a href="${activity.link || '#'}" target="_blank" class="flex-1 text-center btn-primary px-4 py-2 rounded-lg text-sm">לאתר הרשמי</a>
                   <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.address}" target="_blank" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">ניווט ב-Maps</a>
               </div>
           </div>
       </div>`;
}

function renderActivities() {
    if (!currentData || !currentData.activitiesData) return;
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;

    const filteredActivities = currentData.activitiesData.filter(activity => {
        if (activity.category === 'בית מרקחת') return false;
        const categoryMatch = currentCategoryFilter === 'all' || activity.category === currentCategoryFilter;
        let timeMatch = false;
        if (currentTimeFilter === 'all') { timeMatch = true; }
        else {
            const time = parseInt(currentTimeFilter);
            if (time === 20) timeMatch = activity.time <= 20;
            else if (time === 40) timeMatch = activity.time > 20 && activity.time <= 40;
            else if (time === 60) timeMatch = activity.time > 40;
        }
        return categoryMatch && timeMatch;
    });

    activitiesGrid.innerHTML = '';
    if (filteredActivities.length === 0) {
        activitiesGrid.innerHTML = `<p class="text-center col-span-full">לא נמצאו פעילויות התואמות את הסינון.</p>`;
    } else {
        filteredActivities.forEach(activity => {
            activitiesGrid.innerHTML += createActivityCard(activity);
        });
    }
}

function initMap() {
    if (map || !document.getElementById('map') || !L || !currentData.activitiesData) return;
    
    const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };
    map = L.map('map').setView([hotelLocation.lat, hotelLocation.lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const hotelIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
    const activityIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

    L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon }).addTo(map).bindTooltip(`<b>${hotelLocation.name}</b><br>נקודת המוצא שלכם!`).openTooltip();

    currentData.activitiesData.forEach(activity => {
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon], { icon: activityIcon }).addTo(map).bindTooltip(`<b>${activity.name}</b><br>כ-${activity.time} דקות נסיעה מהמלון`);
        }
    });
}

function updateProgressBar() {
    if (!currentData || !currentData.tripTimeline) return;
    
    const now = new Date();
    const start = new Date(currentData.tripTimeline[0].date);
    const end = new Date(currentData.tripTimeline[currentData.tripTimeline.length - 1].date);
    let progress = 0;
    let currentStatus = "לפני הטיול";
    let infoText = `הטיול מתחיל ב-${start.toLocaleDateString('he-IL')}`;

    if (now >= start && now <= end) {
        progress = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
        for (let i = currentData.tripTimeline.length - 1; i >= 0; i--) {
            if (now >= new Date(currentData.tripTimeline[i].date)) {
                currentStatus = currentData.tripTimeline[i].label;
                infoText = (i + 1 < currentData.tripTimeline.length) ? `השלב הבא: ${currentData.tripTimeline[i+1].label} ב-${new Date(currentData.tripTimeline[i+1].date).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}` : "נהנים מהרגעים האחרונים!";
                break;
            }
        }
    } else if (now > end) {
        progress = 100;
        currentStatus = "הטיול הסתיים";
        infoText = "מקווים שנהניתם!";
    }

    document.getElementById('progress-bar-fill').style.width = `${progress}%`;
    document.getElementById('progress-bar-text').textContent = currentStatus;
    document.getElementById('progress-bar-info').textContent = infoText;
}


function populateItineraryDetails() {
    if (!currentData || !currentData.activitiesData) return;
    document.querySelectorAll('[data-day-index]').forEach(dayElement => {
        const dayIndexOfTrip = parseInt(dayElement.dataset.dayIndex, 10);
        dayElement.querySelectorAll('[data-activity-details]').forEach(element => {
            const activityName = element.dataset.activityDetails;
            const activity = currentData.activitiesData.find(a => a.name === activityName);
            if (activity) {
                element.innerHTML = createActivitySnippetHTML(activity, dayIndexOfTrip);
            }
        });
    });
}

function createActivitySnippetHTML(activity, dayIndex) {
    if (!activity) return '';
    const hours = getOpeningHoursForDay(activity, dayIndex);
    return `
       <div class="activity-snippet text-sm text-gray-600 space-y-2">
           <div class="flex items-start"><span class="w-5 text-center">⏰</span><p>${hours}</p></div>
           <div class="flex items-start"><span class="w-5 text-center">🕒</span><p>כ-${activity.time} דקות</p></div>
           <div class="flex items-start"><span class="w-5 text-center">💰</span><p>${activity.cost}</p></div>
           <div class="flex items-start"><span class="w-5 text-center">📍</span><p>${activity.address}</p></div>
           <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lon}" target="_blank" class="inline-block text-accent font-semibold hover:underline">פתח ניווט</a>
       </div>`;
}

function getOpeningHoursForDay(activity, dayIndex) {
    const tripStartDate = new Date('2025-08-24T00:00:00');
    const currentDay = new Date(tripStartDate);
    currentDay.setDate(tripStartDate.getDate() + dayIndex);
    const dayOfWeek = currentDay.getDay(); 
    if (!activity.openingHours) return 'לא זמין';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[dayOfWeek];
    for (const key in activity.openingHours) {
        if (key.includes(todayName) || key.toLowerCase() === 'everyday') return `פתוח היום: ${activity.openingHours[key]}`;
        const days = key.split('-');
        if (days.length === 2) {
            const startDay = dayNames.indexOf(days[0]);
            const endDay = dayNames.indexOf(days[1]);
            if (dayOfWeek >= startDay && dayOfWeek <= endDay) return `פתוח היום: ${activity.openingHours[key]}`;
        }
    }
    return 'סגור היום';
}

function displayDailyAttraction() {
    if (!currentData || !currentData.dailySpecials) return;
    const container = document.getElementById('daily-special-content');
    const today = new Date();
    const tripDates = Object.keys(currentData.dailySpecials);
    const demoDate = tripDates[today.getDay() % tripDates.length]; 
    const special = currentData.dailySpecials[demoDate] || "טיפ יומי: ז'נבה מלאה בגני שעשועים נסתרים. חפשו אותם בסמטאות העיר העתיקה!";
    container.innerHTML = `<p>${special}</p>`;
}

// --- Event Listeners and Modal Logic ---
function setupEventListeners() {
    // Reset listeners to avoid duplicates
    const oldBody = document.body;
    const newBody = oldBody.cloneNode(true);
    oldBody.parentNode.replaceChild(newBody, oldBody);

    // Filter Buttons
    document.querySelectorAll('.btn-filter[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter[data-filter]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategoryFilter = button.dataset.filter;
            renderActivities();
        });
    });

    document.querySelectorAll('.btn-filter[data-time-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter[data-time-filter]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTimeFilter = button.dataset.timeFilter;
            renderActivities();
        });
    });
    document.querySelector('.btn-filter[data-time-filter="all"]').classList.add('active');

    // Mobile Menu
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });

    // All Modals
    const modals = {
        'packing-guide': { open: ['#open-packing-modal-btn', '#open-packing-modal-btn-mobile'], close: ['close-packing-modal-btn'], onOpen: setupPackingGuideModal },
        'nearby': { open: ['.nav-nearby-btn'], close: ['close-nearby-modal-btn'], onOpen: findAndDisplayNearby },
        'hotel-booking': { open: ['#open-hotel-modal-btn'], close: ['close-hotel-modal-btn'], onOpen: populateHotelDetails },
        'flights-details': { open: ['#open-flights-modal-btn'], close: ['close-flights-modal-btn'], onOpen: populateFlightDetails },
        'family-details': { open: ['.nav-family-btn'], close: ['close-family-modal-btn'], onOpen: populateFamilyDetails },
        'gemini-chat': { open: ['.nav-gemini-btn'], close: ['close-gemini-modal-btn'] },
        'story': { close: ['close-story-modal-btn'] },
        'text-response': { close: ['close-text-response-modal-btn'] },
        'boarding-pass': { close: ['close-boarding-pass-modal-btn'] }
    };

    for (const modalId in modals) {
        const modalElement = document.getElementById(`${modalId}-modal`);
        if (!modalElement) continue;
        const config = modals[modalId];
        if (config.open) {
            config.open.forEach(selector => {
                document.querySelectorAll(selector).forEach(btn => {
                    btn.addEventListener('click', () => {
                        modalElement.classList.remove('hidden');
                        modalElement.classList.add('flex');
                        if (config.onOpen) config.onOpen();
                    });
                });
            });
        }
        if (config.close) {
            config.close.forEach(selector => {
                const closeBtn = document.getElementById(selector);
                if(closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modalElement.classList.add('hidden');
                        modalElement.classList.remove('flex');
                    });
                }
            });
        }
    }
    
    // Specific buttons
    document.getElementById('show-boarding-passes-btn')?.addEventListener('click', showBoardingPasses);
    document.getElementById('what-to-wear-btn')?.addEventListener('click', handleWhatToWearRequest);
    document.getElementById('generate-custom-plan-btn')?.addEventListener('click', handleCustomPlanRequest);
    document.querySelectorAll('.gemini-plan-btn').forEach(button => button.addEventListener('click', handlePlanRequest));
    document.querySelectorAll('.gemini-story-btn').forEach(button => button.addEventListener('click', handleStoryRequest));
    document.querySelectorAll('.gemini-summary-btn').forEach(button => button.addEventListener('click', handleSummaryRequest));

    // Chat
    const chatInput = document.getElementById('chat-input');
    document.getElementById('chat-send-btn')?.addEventListener('click', handleChatSend);
    chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatSend(); });
    document.getElementById('chat-attach-btn')?.addEventListener('click', () => document.getElementById('chat-image-input').click());
    document.getElementById('chat-image-input')?.addEventListener('change', handleChatImageUpload);
    document.getElementById('chat-remove-image-btn')?.addEventListener('click', removeChatImage);

    // Itinerary details need to be populated after dynamic render
    populateItineraryDetails();
}

function setupPackingGuideModal() {
    if (!currentData) return;

    renderChecklist();
    renderLuggage();

    const modal = document.getElementById('packing-guide-modal');
    const accordionButtons = modal.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        if (!button.dataset.listenerAttached) {
            button.addEventListener('click', () => {
                const content = button.nextElementSibling;
                button.classList.toggle('open');
                content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
            });
            button.dataset.listenerAttached = true;
        }
    });
    
    updatePackingProgress();
    setupPackingAssistant();
}

function renderChecklist() {
    const container = document.getElementById('checklist-container');
    if (!container || !currentData.packingListData) return;
    let html = '';
    for (const category in currentData.packingListData) {
        if (Array.isArray(currentData.packingListData[category])) {
            html += `<div class="mb-4">
                <h4 class="font-bold text-lg mb-2 text-accent">${category}</h4>
                <div class="space-y-2">
                    ${currentData.packingListData[category].map(item => `
                        <label class="flex items-center">
                            <input type="checkbox" class="form-checkbox h-5 w-5 text-teal-600 rounded" ${item.checked ? 'checked' : ''} data-category="${category}" data-item="${item.name}">
                            <span class="mr-3 text-gray-700">${item.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>`;
        }
    }
    container.innerHTML = html;
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleChecklistItemToggle);
    });
}

async function handleChecklistItemToggle(event) {
    const { category, item } = event.target.dataset;
    const isChecked = event.target.checked;
    
    const categoryItems = currentData.packingListData[category];
    if (categoryItems) {
        const itemToUpdate = categoryItems.find(i => i.name === item);
        if (itemToUpdate) {
            itemToUpdate.checked = isChecked;
            const docRef = doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`);
            await updateDoc(docRef, { packingListData: currentData.packingListData });
        }
    }
}

function updatePackingProgress() {
    if (!currentData.packingListData) return;
    const progressBar = document.getElementById('packingProgressBar');
    if (!progressBar) return;
    let total = 0;
    let checked = 0;
    for (const category in currentData.packingListData) {
        if (Array.isArray(currentData.packingListData[category])) {
            total += currentData.packingListData[category].length;
            checked += currentData.packingListData[category].filter(item => item.checked).length;
        }
    }
    const percentage = total > 0 ? (checked / total) * 100 : 0;
    progressBar.style.width = percentage + '%';
}

function renderLuggage() {
    const container = document.getElementById('luggage-list-container');
    if (!container || !currentData.luggageData) return;
    container.innerHTML = currentData.luggageData.map(item => `
        <div class="bg-secondary p-4 rounded-lg">
            <h4 class="font-bold text-lg">${item.name}</h4>
            <p class="text-sm"><strong>אחראי/ת:</strong> ${item.owner}</p>
            <p class="text-sm"><strong>משקל:</strong> ${item.weight}</p>
            <p class="text-sm mt-1"><em>${item.notes}</em></p>
        </div>
    `).join('');
}

// --- MODAL POPULATION FUNCTIONS ---

function populateHotelDetails() {
    if (!currentData || !currentData.hotelData) return;
    const { hotelData } = currentData;
    const modal = document.getElementById('hotel-booking-modal');
    
    modal.querySelector('.grid-cols-2.gap-4.text-sm').innerHTML = `
        <div><strong>צ'ק-אין:</strong> ${hotelData.checkIn}</div>
        <div><strong>צ'ק-אאוט:</strong> ${hotelData.checkOut}</div>
        <div><strong>מספר הזמנה:</strong> ${hotelData.bookingRef}</div>
        <div><strong>הוזמן ע"י:</strong> ${hotelData.bookedBy}</div>`;
        
    modal.querySelector('img').src = hotelData.imageUrl;
    modal.querySelector('img').alt = hotelData.name;
    modal.querySelector('.font-semibold').textContent = hotelData.name;
    modal.querySelector('.text-sm').textContent = hotelData.address;
    modal.querySelector('#qr-code-img').src = hotelData.qrCodeUrl;
}

function populateFlightDetails() {
    if (!currentData || !currentData.flightData) return;
    const container = document.getElementById('flight-details-content');
    const { flightData } = currentData;
    const flightSections = [
        { title: `טיסות הלוך - ${flightData.outbound[0].date}`, flights: flightData.outbound, connection: flightData.connections.outbound },
        { title: `טיסות חזור - ${flightData.inbound[0].date}`, flights: flightData.inbound, connection: flightData.connections.inbound }
    ];

    let html = '';
    flightSections.forEach(section => {
        html += `
           <div>
               <h4 class="font-bold text-xl mb-3 border-b pb-2 text-accent">${section.title}</h4>
               <div class="space-y-4 text-sm">
                   ${section.flights.map((flight, index) => {
                       const flightKey = (section.title.includes('הלוך') ? 'outbound' : 'inbound') + (index + 1);
                       const seatKey = 'seat' + flightKey.charAt(0).toUpperCase() + flightKey.slice(1);
                       return `
                       <div class="p-2 rounded-lg hover:bg-gray-50 border-b">
                           <div class="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                               <div class="md:col-span-2">
                                   <p><strong>${flight.from} ← ${flight.to}</strong></p>
                                   <p class="text-gray-600">${flight.time} | ${flight.airline} ${flight.flightNum}</p>
                               </div>
                               <div class="text-center">
                                   <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(flight.status)}">${flight.status}</span>
                               </div>
                               <a href="${flight.checkin}" target="_blank" class="text-white bg-green-500 hover:bg-green-600 text-center py-1 px-2 rounded-md text-xs md:col-span-1">בצע צ'ק אין</a>
                           </div>
                           <div class="mt-3 pt-3 border-t text-xs">
                               <h5 class="font-semibold mb-1">נוסעים ומושבים:</h5>
                               <ul class="list-disc pr-4">
                                   ${flightData.passengers.map(p => `<li>${p.name}: <strong>${p[seatKey]}</strong></li>`).join('')}
                               </ul>
                           </div>
                       </div>
                   `}).join(`<p class="pl-4 border-r-2 border-gray-200 my-2"><strong>קונקשן באתונה:</strong> ${section.connection}</p>`)}
               </div>
           </div>
       `;
    });
    container.innerHTML = html;
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
    case 'on time': return 'bg-green-100 text-green-800';
    case 'delayed': return 'bg-red-100 text-red-800';
    case 'canceled': return 'bg-red-200 text-red-900 font-bold';
    default: return 'bg-gray-100 text-gray-800';
    }
}

function populateFamilyDetails() {
    if (!currentData || !currentData.familyData) return;
    const container = document.getElementById('family-details-content');
    container.innerHTML = currentData.familyData.map(member => `
       <div class="flex justify-between p-2 border-b">
           <span class="font-semibold">${member.name}:</span>
           <span>${member.passport}</span>
       </div>
   `).join('');
}

function showBoardingPasses() {
    if (!currentData || !currentData.flightData) return;
    const container = document.getElementById('boarding-pass-content');
    container.innerHTML = ''; 

    const { flightData } = currentData;
    const flights = [...flightData.outbound, ...flightData.inbound];
    const seatMapping = {
        outbound1: 'seatOutbound1', outbound2: 'seatOutbound2',
        inbound1: 'seatInbound1', inbound2: 'seatInbound2'
    };

    flights.forEach((flight, index) => {
        const flightKey = (index < 2 ? 'outbound' : 'inbound') + (index % 2 + 1);
        const seatKey = seatMapping[flightKey];

        flightData.passengers.forEach(passenger => {
            const qrData = `M1LIPETZ/${passenger.name.split(' ')[0]} E${passenger.ticket.replace(/-/g, '')} ${flight.from.substring(flight.from.length - 4, flight.from.length - 1)}${flight.to.substring(flight.to.length - 4, flight.to.length - 1)}${flight.airline.substring(0,2)}${flight.flightNum.padStart(4, '0')} 236Y028C0045 100`;

            container.innerHTML += `
                <div class="boarding-pass-wallet">
                    <div class="bp-main">
                        <div class="bp-header">
                            <span class="bp-airline">${flight.airline}</span>
                            <img src="https://placehold.co/40x40/FFFFFF/4A4A4A?text=${flight.airline.charAt(0)}" alt="Airline Logo" class="bp-logo">
                        </div>
                        <div class="bp-flight-info">
                            <div>
                                <span class="bp-label">${flight.from.substring(flight.from.length - 4, flight.from.length - 1)}</span>
                                <span class="bp-value-large">${flight.from.split(' (')[0]}</span>
                           </div>
                            <div class="bp-plane-icon">✈️</div>
                            <div>
                                <span class="bp-label">${flight.to.substring(flight.to.length - 4, flight.to.length - 1)}</span>
                                <span class="bp-value-large">${flight.to.split(' (')[0]}</span>
                           </div>
                       </div>
                        <div class="bp-passenger-info">
                            <span class="bp-label">נוסע/ת</span>
                            <span class="bp-value">${passenger.name}</span>
                        </div>
                    </div>
                    <div class="bp-stub">
                        <div class="bp-qr-code">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}" alt="QR Code">
                        </div>
                        <div class="bp-details">
                            <div><span class="bp-label">טיסה</span><span class="bp-value">${flight.flightNum}</span></div>
                            <div><span class="bp-label">מושב</span><span class="bp-value">${passenger[seatKey]}</span></div>
                            <div><span class="bp-label">תאריך</span><span class="bp-value">${flight.date}</span></div>
                            <div><span class="bp-label">שעת המראה</span><span class="bp-value">${flight.time.split(' - ')[0]}</span></div>
                       </div>
                   </div>
               </div>`;
        });
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findAndDisplayNearby() {
    if (!currentData || !currentData.activitiesData) return;
    const resultsContainer = document.getElementById('nearby-results');
    resultsContainer.innerHTML = '<p>מאתר את מיקומך...</p>';

    if (!navigator.geolocation) {
        resultsContainer.innerHTML = '<p>שירותי מיקום אינם נתמכים.</p>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const nearbyPlaces = currentData.activitiesData
                .filter(place => ['משחקייה', 'חוץ', 'בית מרקחת'].includes(place.category))
                .map(place => ({ ...place, calculatedDistance: calculateDistance(latitude, longitude, place.lat, place.lon) }))
                .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

            const playgrounds = nearbyPlaces.filter(p => ['משחקייה', 'חוץ'].includes(p.category)).slice(0, 5);
            const pharmacies = nearbyPlaces.filter(p => p.category === 'בית מרקחת').slice(0, 3);

            resultsContainer.innerHTML = `
               <div>
                   <h4 class="font-bold text-lg mb-2">משחקיות ופארקים קרובים:</h4>
                   <ul class="list-disc pr-5 space-y-1">${playgrounds.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance.toFixed(1)} ק"מ</li>`).join('')}</ul>
               </div>
               <div class="border-t pt-4 mt-4">
                   <h4 class="font-bold text-lg mb-2">בתי מרקחת קרובים:</h4>
                   <ul class="list-disc pr-5 space-y-1">${pharmacies.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance.toFixed(1)} ק"מ</li>`).join('')}</ul>
               </div>`;
        },
        () => {
            resultsContainer.innerHTML = '<p>לא ניתן היה לקבל את מיקומך.</p>';
        }
    );
}

// --- GEMINI & AI CALLS ---

function setupPackingAssistant() { /* ... Logic for packing assistant ... */ }
async function handlePackingSuggestion() { /* ... Logic to handle suggestion request ... */ }

async function handlePlanRequest(event) {
    const button = event.target;
    const planContainer = button.closest('[data-day-index]');
    const resultContainer = planContainer.querySelector('.gemini-plan-result');
    const mainActivityName = planContainer.querySelector('h3').textContent.split(': ')[1];
    
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';

    const prompt = `You are a creative trip planner for families. For a family with a 2 and 3-year-old in Geneva, suggest a short, fun morning plan based around the main activity: "${mainActivityName}". The plan should be a few simple steps. Keep it simple and toddler-friendly. Respond in Hebrew.`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    resultContainer.innerHTML = geminiResponse.replace(/\n/g, '<br>');
}

async function handleStoryRequest(event) {
    const mainActivityName = event.target.closest('[data-day-index]').querySelector('h3').textContent.split(': ')[1];
    const storyModal = document.getElementById('story-modal');
    const storyContent = document.getElementById('story-modal-content');

    storyContent.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>';
    storyModal.classList.remove('hidden');
    storyModal.classList.add('flex');

    const prompt = `You are a children's storyteller. Write a short, simple, and happy bedtime story in Hebrew for two toddlers, Bar (a girl) and Ran (a boy), ages 2 and 3. The story should be about their adventure today in Geneva, where they visited ${mainActivityName}. Make it magical and fun.`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    storyContent.innerHTML = geminiResponse.replace(/\n/g, '<br>');
}

function showTextResponseModal(title, content) {
    const modal = document.getElementById('text-response-modal');
    document.getElementById('text-response-modal-title').textContent = title;
    document.getElementById('text-response-modal-content').innerHTML = content.replace(/\n/g, '<br>');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function handleWhatToWearRequest() {
    if (!currentData.weatherData) {
        showTextResponseModal("שגיאה", "נתוני מזג האוויר עדיין לא נטענו. נסה שוב בעוד רגע.");
        return;
    }
    showTextResponseModal("✨ מה ללבוש היום? ✨", '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>');

    const todayWeather = currentData.weatherData.daily;
    const weatherDesc = getWeatherInfo(todayWeather.weathercode[0]).description;
    const tempMax = Math.round(todayWeather.temperature_2m_max[0]);
    const tempMin = Math.round(todayWeather.temperature_2m_min[0]);

    const prompt = `Based on the weather in Geneva today (${weatherDesc}, high of ${tempMax}°C, low of ${tempMin}°C), what should a family with a 2-year-old and a 3-year-old wear for a day out? Provide a simple, bulleted list in Hebrew, using emojis.`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    showTextResponseModal('✨ מה ללבוש היום? ✨', geminiResponse);
}

async function handleSummaryRequest(event) {
    const title = event.target.closest('[data-day-index]').querySelector('h3').textContent;
    const mainPlan = event.target.closest('[data-day-index]').querySelector('.space-y-4').textContent;

    showTextResponseModal(`✨ סיכום לילדים - ${title} ✨`, '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>');

    const prompt = `Please create a very short, fun, and exciting summary of this daily plan for a 2 and 3-year-old. Use simple Hebrew words and emojis. Plan: ${mainPlan}`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    showTextResponseModal(`✨ סיכום לילדים - ${title} ✨`, geminiResponse);
}
async function handleCustomPlanRequest() { /* ... */ }
async function handleChatSend() { /* ... */ }
function handleChatImageUpload(event) { /* ... */ }
function removeChatImage() { /* ... */ }

// --- API CALL ---
async function callGeminiWithParts(parts) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts }] })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "מצטער, לא הצלחתי להבין את הבקשה.";
    } catch (error) {
        console.error("Error calling Gemini function:", error);
        return "אופס, משהו השתבש. אנא נסה שוב מאוחר יותר.";
    }
}

