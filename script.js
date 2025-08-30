// =================================================================================
// IMPORTS and FIREBASE SETUP
// =================================================================================
import { doc, getDoc, setDoc, updateDoc } from "[https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js)";

// This should be populated by Netlify's environment variables
// Using a fallback for local development
const firebaseConfigString = import.meta.env.VITE_FIREBASE_CONFIG || '{}';
let firebaseConfig = {};
let app, db, tripDocRef;

try {
    firebaseConfig = JSON.parse(firebaseConfigString);
    // Initialize Firebase
    app = window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.getFirestore(app);
    // Document reference (assuming one document holds all trip data)
    tripDocRef = doc(db, "trips", "geneva2025"); 
} catch(e) {
    console.error("Firebase initialization failed. Make sure VITE_FIREBASE_CONFIG is set.", e);
    document.body.innerHTML = '<div class="p-4 bg-red-100 text-red-800">Failed to initialize Firebase. Please check console.</div>';
}


// =================================================================================
// GLOBAL STATE
// =================================================================================
let tripData = {}; // This will hold all data fetched from Firebase
let currentWeatherData = null;
let chatImageBase64 = null;
let map = null;
let visibleActivitiesCount = 6;
const activitiesIncrement = 6;
let currentCategoryFilter = 'all';
let currentTimeFilter = 'all';

// =================================================================================
// INITIALIZATION
// =================================================================================

document.addEventListener('DOMContentLoaded', async () => {
    if(!db) return; // Stop if firebase failed
    await loadTripData(); 
    
    // Once data is loaded, render the page
    fetchAndRenderWeather();
    renderActivities();
    initMap();
    setupEventListeners();
    displayDailyAttraction();
    populateItineraryDetails();
    updateProgressBar();
    displayCurrentActions();
    renderEmbeddedPhotoAlbum();
    
    setInterval(updateProgressBar, 60000); 
});

// =================================================================================
// DATA HANDLING (FIREBASE)
// =================================================================================

async function loadTripData() {
    try {
        const docSnap = await getDoc(tripDocRef);
        if (docSnap.exists()) {
            tripData = docSnap.data();
            console.log("Trip data loaded successfully!");
        } else {
            console.error("No trip data found in Firestore! Please create the document using the initial-data.json file.");
            document.body.innerHTML = '<div class="p-4 bg-red-100 text-red-800">Error: Trip data document not found in Firestore. Please follow the setup guide to create it.</div>';
        }
    } catch (error) {
        console.error("Error loading trip data:", error);
        document.body.innerHTML = '<div class="p-4 bg-red-100 text-red-800">Error loading data from Firebase. Check console for details.</div>';
    }
}

async function saveTripData(newData) {
    try {
        await updateDoc(tripDocRef, newData);
        console.log("Trip data updated successfully!", newData);
    } catch (error) {
        console.error("Error updating trip data:", error);
    }
}

// =================================================================================
// NEW & UPDATED CORE FEATURES
// =================================================================================

async function handlePhotoAlbumLoad() {
    const embedInput = document.getElementById('photos-embed-input');
    const embedCode = embedInput.value.trim();
    const srcRegex = /src="([^"]+)"/;
    const match = embedCode.match(srcRegex);

    if (!match || !match[1] || !match[1].startsWith('[https://docs.google.com/presentation/](https://docs.google.com/presentation/)')) {
        alert('אנא הזינו קוד הטמעה תקין מ-Google Slides.');
        return;
    }

    const slideUrl = match[1];

    tripData.photoAlbumEmbed = slideUrl;
    await saveTripData({ photoAlbumEmbed: slideUrl });

    renderEmbeddedPhotoAlbum();
    embedInput.value = '';
}

function renderEmbeddedPhotoAlbum() {
    const photosContainer = document.getElementById('photos-container');
    
    if (tripData && tripData.photoAlbumEmbed) {
        photosContainer.innerHTML = ''; // Clear placeholder

        const iframeWrapper = document.createElement('div');
        iframeWrapper.className = 'relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden';
        
        const iframe = document.createElement('iframe');
        iframe.src = tripData.photoAlbumEmbed;
        iframe.frameBorder = '0';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.allowFullscreen = true;
        
        iframeWrapper.appendChild(iframe);
        
        const fullscreenButton = document.createElement('button');
        fullscreenButton.id = 'open-photos-fullscreen-btn';
        fullscreenButton.className = 'absolute bottom-4 left-4 bg-black/50 text-white py-2 px-4 rounded-lg hover:bg-black/75 transition';
        fullscreenButton.textContent = 'הצג במסך מלא';
        
        photosContainer.appendChild(iframeWrapper);
        photosContainer.appendChild(fullscreenButton);
    }
}


function initMap() {
    if (map || !tripData.activities) return; 

    const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };
    map = L.map('map').setView([hotelLocation.lat, hotelLocation.lon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="[https://www.openstreetmap.org/copyright](https://www.openstreetmap.org/copyright)">OpenStreetMap</a> contributors'
    }).addTo(map);

    const hotelIcon = L.icon({
        iconUrl: '[https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png](https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png)',
        shadowUrl: '[https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png](https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png)',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const activityIcon = L.icon({
        iconUrl: '[https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png](https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png)',
        shadowUrl: '[https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png](https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png)',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon })
        .addTo(map)
        .bindTooltip(`<b>${hotelLocation.name}</b><br>נקודת המוצא שלכם!`).openTooltip();

    tripData.activities.forEach(activity => {
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon], { icon: activityIcon })
                .addTo(map)
                .bindTooltip(`<b>${activity.name}</b><br>כ-${activity.time} דקות נסיעה מהמלון`);
        }
    });
}

function updateProgressBar() {
    const tripTimeline = [
        { date: '2025-08-22T00:00:00', label: 'ההכנות בעיצומן' },
        { date: '2025-08-24T11:00:00', label: 'בדרך לשדה התעופה' },
        { date: '2025-08-24T14:00:00', label: 'טיסה ראשונה לאתונה' },
        { date: '2025-08-24T16:15:00', label: 'קונקשן באתונה' },
        { date: '2025-08-24T20:45:00', label: 'טיסה שנייה לז\'נבה' },
        { date: '2025-08-24T22:45:00', label: 'ברוכים הבאים לז\'נבה!' },
        { date: '2025-08-29T04:00:00', label: 'בדרך לשדה התעופה בחזרה' },
        { date: '2025-08-29T06:20:00', label: 'טיסה חזרה לאתונה' },
        { date: '2025-08-29T10:05:00', label: 'קונקשן באתונה' },
        { date: '2025-08-29T12:00:00', label: 'טיסה חזרה לתל אביב' },
        { date: '2025-08-29T14:00:00', label: 'נחיתה! ברוכים השבים' },
        { date: '2025-08-30T00:00:00', label: 'הטיול הסתיים' }
    ];

    const now = new Date();
    const start = new Date(tripTimeline[0].date);
    const end = new Date(tripTimeline[tripTimeline.length - 1].date);

    let progress = 0;
    let currentStatus = "לפני הטיול";
    let infoText = `הטיול מתחיל ב-${start.toLocaleDateString('he-IL')}`;

    if (now >= start && now <= end) {
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        progress = (elapsed / totalDuration) * 100;

        for (let i = tripTimeline.length - 1; i >= 0; i--) {
            if (now >= new Date(tripTimeline[i].date)) {
                currentStatus = tripTimeline[i].label;
                if (i + 1 < tripTimeline.length) {
                    const nextEventDate = new Date(tripTimeline[i + 1].date);
                    infoText = `השלב הבא: ${tripTimeline[i+1].label} ב-${nextEventDate.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}`;
                } else {
                    infoText = "נהנים מהרגעים האחרונים!";
                }
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

function displayCurrentActions() {
    const timeSensitiveActions = [
        { start: -30, end: -8, title: "⏳ חודש לטיסה: משימות חשובות", content: "<ul class='list-disc pr-5 text-left'><li>ודאו שכל הדרכונים בתוקף לפחות ל-6 חודשים מיום החזרה.</li><li>צלמו את כל המסמכים החשובים ושמרו עותק בענן (Google Drive, Dropbox).</li><li>רכשו פרנקים שוויצריים ואירו (לצרפת).</li><li>בדקו את מלאי התרופות וציוד העזרה הראשונה.</li></ul>" },
        { start: -7, end: -3, title: "⏰ שבוע לטיסה: מתחילים לארוז!", content: "<ul class='list-disc pr-5 text-left'><li>התחילו לרכז את כל הפריטים מרשימת האריזה.</li><li>כבסו את כל הבגדים שאתם מתכננים לקחת.</li><li>רכשו חטיפים וצעצועים קטנים להעסיק את הילדים בטיסה.</li></ul>" },
        { start: -2, end: -1, title: "✈️ יומיים לטיסה: צ'ק-אין ואריזות אחרונות", content: "<ul class='list-disc pr-5 text-left'><li>בצעו צ'ק-אין אונליין לטיסות. האפשרות נפתחת בדרך כלל 24-48 שעות לפני הטיסה.</li><li>ארזו את המזוודות ושקלו אותן כדי לוודא שאתם עומדים במגבלות.</li><li>הטעינו את כל המכשירים האלקטרוניים והמטענים הניידים.</li></ul>" },
        { start: 0, end: 0, title: "☀️ יום הטיסה: יצאנו לדרך!", content: "<ul class='list-disc pr-5 text-left'><li>זכרו לקחת את תיק המסמכים והדרכונים!</li><li>בדקו שוב ששום דבר חיוני לא נשכח בבית.</li><li>הגיעו לשדה התעופה לפחות 3 שעות לפני ההמראה. נסיעה טובה!</li></ul>" }
    ];
    
    const now = new Date();
    const flightDate = new Date('2025-08-24T00:00:00');
    const daysUntilFlight = Math.ceil((flightDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const action = timeSensitiveActions.find(a => daysUntilFlight <= a.end && daysUntilFlight >= a.start);
    const container = document.getElementById('current-actions');

    if (action) {
        document.getElementById('current-actions-title').textContent = action.title;
        document.getElementById('current-actions-content').innerHTML = action.content;
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function showBoardingPasses() {
    const container = document.getElementById('boarding-pass-content');
    container.innerHTML = ''; 
    if (!tripData.flightData) return;

    const { flightData } = tripData;
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
                            <img src="[https://placehold.co/40x40/FFFFFF/4A4A4A?text=$](https://placehold.co/40x40/FFFFFF/4A4A4A?text=$){flight.airline.charAt(0)}" alt="Airline Logo" class="bp-logo">
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
                            <img src="[https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=$](https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=$){encodeURIComponent(qrData)}" alt="QR Code">
                        </div>
                        <div class="bp-details">
                            <div><span class="bp-label">טיסה</span><span class="bp-value">${flight.flightNum}</span></div>
                            <div><span class="bp-label">מושב</span><span class="bp-value">${passenger[seatKey]}</span></div>
                            <div><span class="bp-label">תאריך</span><span class="bp-value">${flight.date}</span></div>
                            <div><span class="bp-label">שעת המראה</span><span class="bp-value">${flight.time.split(' - ')[0]}</span></div>
                        </div>
                    </div>
                </div>
            `;
        });
    });
    
    document.getElementById('boarding-pass-modal').classList.remove('hidden');
}

// =================================================================================
// UI RENDERING & EVENT HANDLING
// =================================================================================

function renderActivities() {
    if (!tripData.activities) return;
    const activitiesGrid = document.getElementById('activities-grid');
    const filteredActivities = tripData.activities.filter(activity => {
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

    const activitiesToShow = filteredActivities.slice(0, visibleActivitiesCount);
    activitiesGrid.innerHTML = '';

    if (activitiesToShow.length === 0) {
        activitiesGrid.innerHTML = '<p class="text-center col-span-full">לא נמצאו פעילויות התואמות את הסינון.</p>';
    } else {
        activitiesToShow.forEach(activity => {
            activitiesGrid.innerHTML += createActivityCard(activity);
        });
    }

    const loadMoreContainer = document.getElementById('load-more-container');
    if (filteredActivities.length > visibleActivitiesCount) {
        loadMoreContainer.classList.remove('hidden');
    } else {
        loadMoreContainer.classList.add('hidden');
    }
}

const createActivityCard = (activity) => {
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
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex-grow">
                    <h3 class="text-xl font-bold mb-2">${activity.name}</h3>
                    <span class="text-sm font-semibold text-accent py-1 px-2 rounded-full bg-teal-50 mb-3 inline-block">${activity.category}</span>
                    <p class="text-gray-600 mb-4 text-sm">${activity.description}</p>
                    
                    <div class="border-t pt-4 mt-4 space-y-3 text-sm">
                        <div class="flex items-start">
                            <span class="w-6 text-center mt-1">🕒</span>
                            <p><strong>זמן הגעה:</strong> כ-${activity.time || 'לא ידוע'} דקות</p>
                        </div>
                         <div class="flex items-start">
                            <span class="w-6 text-center mt-1">🚆</span>
                            <p><strong>דרך הגעה:</strong> ${activity.transport || 'לא ידוע'}</p>
                        </div>
                        <div class="flex items-start">
                            <span class="w-6 text-center mt-1">💰</span>
                            <p><strong>עלות:</strong> ${activity.cost}</p>
                        </div>
                        <div class="flex items-start">
                            <span class="w-6 text-center mt-1">📍</span>
                            <p><strong>כתובת:</strong> ${activity.address}</p>
                        </div>
                    </div>
                    ${whatToBringList}
                </div>
                <div class="flex space-x-2 space-x-reverse mt-4">
                    <a href="${activity.link || '#'}" target="_blank" class="flex-1 text-center btn-primary px-4 py-2 rounded-lg text-sm">לאתר הרשמי</a>
                    <a href="[https://www.google.com/maps/dir/?api=1&destination=$](https://www.google.com/maps/dir/?api=1&destination=$){activity.address}" target="_blank" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">ניווט ב-Maps</a>
                </div>
            </div>
        </div>
    `;
};


function setupEventListeners() {
    // Activity Filters
    document.querySelectorAll('.btn-filter[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter[data-filter]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategoryFilter = button.dataset.filter;
            visibleActivitiesCount = 6;
            renderActivities();
        });
    });

    document.querySelectorAll('.btn-filter[data-time-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter[data-time-filter]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTimeFilter = button.dataset.timeFilter;
            visibleActivitiesCount = 6;
            renderActivities();
        });
    });
    
    document.getElementById('load-more-btn').addEventListener('click', () => {
        visibleActivitiesCount += activitiesIncrement;
        renderActivities();
    });

    // Mobile Menu
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });

    // Modal Openers
    document.querySelectorAll('[id^=open-][id$=-btn], [id^=open-][id$=-btn-mobile], .nav-family-btn, .nav-nearby-btn, .nav-gemini-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let modalId;
            if(e.currentTarget.id) {
                 modalId = e.currentTarget.id.replace('open-', '').replace('-btn-mobile', '').replace('-btn', '') + '-modal';
            } else if (e.currentTarget.classList.contains('nav-family-btn')) {
                modalId = 'family-details-modal';
                populateFamilyDetails();
            } else if (e.currentTarget.classList.contains('nav-nearby-btn')) {
                modalId = 'nearby-modal';
                findAndDisplayNearby();
            } else if (e.currentTarget.classList.contains('nav-gemini-btn')) {
                modalId = 'gemini-chat-modal';
            }
             if(modalId === 'packing-guide-modal') {
                setupPackingGuideModal();
            }
            if(modalId) document.getElementById(modalId).classList.remove('hidden');
        });
    });

    document.getElementById('show-boarding-passes-btn').addEventListener('click', showBoardingPasses);

    // Dynamic Modal Opener for Fullscreen Photos
    document.body.addEventListener('click', e => {
        if (e.target.id === 'open-photos-fullscreen-btn') {
            const modal = document.getElementById('photos-fullscreen-modal');
            const content = document.getElementById('photos-fullscreen-content');
            content.innerHTML = `<iframe src="${tripData.photoAlbumEmbed}" class="w-full h-full" frameborder="0"></iframe>`;
            modal.classList.remove('hidden');
        }
    });

    // General Modal Closers
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });

    // Chat
    const chatInput = document.getElementById('chat-input');
    document.getElementById('chat-send-btn').addEventListener('click', handleChatSend);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatSend(); });
    document.getElementById('chat-attach-btn').addEventListener('click', () => document.getElementById('chat-image-input').click());
    document.getElementById('chat-image-input').addEventListener('change', handleChatImageUpload);
    document.getElementById('chat-remove-image-btn').addEventListener('click', removeChatImage);

    // AI Buttons
    document.querySelectorAll('.gemini-plan-btn').forEach(button => button.addEventListener('click', handlePlanRequest));
    document.querySelectorAll('.gemini-summary-btn').forEach(button => button.addEventListener('click', handleSummaryRequest));
    document.querySelectorAll('.gemini-story-btn').forEach(button => button.addEventListener('click', handleStoryRequest));
    document.getElementById('what-to-wear-btn').addEventListener('click', handleWhatToWearRequest);
    document.getElementById('generate-custom-plan-btn').addEventListener('click', handleCustomPlanRequest);
    
    // Photo Album
    document.getElementById('load-photos-btn').addEventListener('click', handlePhotoAlbumLoad);
}

function populateFamilyDetails() {
    if (!tripData.familyData) return;
    const container = document.getElementById('family-details-content');
    container.innerHTML = tripData.familyData.map(member => `
        <div class="flex justify-between p-2 border-b">
            <span class="font-semibold">${member.name}:</span>
            <span>${member.passport}</span>
        </div>
    `).join('');
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'on time': return 'bg-green-100 text-green-800';
        case 'delayed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function populateFlightDetails() {
    if (!tripData.flightData) return;
    const { flightData } = tripData;
    const container = document.getElementById('flight-details-content');
    const flightSections = [
        { title: 'טיסות הלוך - יום ראשון, 24 באוגוסט 2025', flights: flightData.outbound, connection: flightData.connections.outbound },
        { title: 'טיסות חזור - יום שישי, 29 באוגוסט 2025', flights: flightData.inbound, connection: flightData.connections.inbound }
    ];
    let html = '';
    flightSections.forEach(section => {
        html += `
            <div>
                <h4 class="font-bold text-xl mb-3 border-b pb-2 text-accent">${section.title}</h4>
                <div class="space-y-4 text-sm">
                    ${section.flights.map((flight) => `
                        <div class="p-2 rounded-lg hover:bg-gray-50 border-b">
                            <div class="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                                <div class="md:col-span-3">
                                    <p><strong>${flight.from} ← ${flight.to}</strong></p>
                                    <p class="text-gray-600">${flight.time} | ${flight.airline} ${flight.flightNum}</p>
                                </div>
                                <div class="text-center">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(flight.status)}">${flight.status}</span>
                                </div>
                                <a href="${flight.checkin}" target="_blank" class="text-white bg-green-500 hover:bg-green-600 text-center py-1 px-2 rounded-md text-xs">בצע צ'ק אין</a>
                            </div>
                        </div>
                    `).join(`<p class="pl-4 border-r-2 border-gray-200 my-2"><strong>קונקשן באתונה:</strong> ${section.connection}</p>`)}
                </div>
            </div>
        `;
    });
     html += `
        <div>
            <h4 class="font-bold text-xl mb-3 border-b pb-2 text-accent">כבודה</h4>
            <ul class="list-disc pr-5 space-y-1 text-sm">
                ${flightData.passengers.map(p => `<li><strong>${p.name}:</strong> ${p.baggage}</li>`).join('')}
            </ul>
        </div>
    `;
    container.innerHTML = html;
}

function displayDailyAttraction() {
    const dailySpecials = {
        '2025-08-24': 'ברוכים הבאים! אחרי התמקמות, צאו לשיט רגוע באגם עם סירות ה-"Mouettes Genevoises" הצהובות.',
        '2025-08-25': 'טיפ יומי: קחו את הרכבת המיניאטורית ב-Jardin Anglais. היא חוויה נהדרת לפעוטות ומציעה תצפית יפה על שעון הפרחים.',
        '2025-08-26': 'פנינה נסתרת: גלו את Parc des Franchises, פארק ענק עם מתקני משחקים פנטסטיים, אהוב במיוחד על משפחות מקומיות.',
        '2025-08-27': 'היום יום שוק! בקרו בשוק פלנפלה (Plainpalais Market) בבוקר כדי ליהנות מתוצרת טרייה, מטעמים מקומיים ואווירה תוססת.',
        '2025-08-28': 'אירוע מיוחד: ב-Bains des Pâquis מתקיימת היום שעת סיפור לילדים בבוקר. התחלה מושלמת ליום על שפת האגם!',
        '2025-08-29': 'פינוק ליום האחרון: לפני הנסיעה לשדה התעופה, אל תשכחו לקנות שוקולד טעים מאחת השוקולטריות המקומיות כמו Favarger או Auer.'
    };
    const container = document.getElementById('daily-special-content');
    const today = new Date();
    const tripDates = Object.keys(dailySpecials);
    const demoDate = tripDates[today.getDay() % tripDates.length]; 
    const special = dailySpecials[demoDate] || "טיפ יומי: ז'נבה מלאה בגני שעשועים נסתרים. חפשו אותם בסמטאות העיר העתיקה!";
    container.innerHTML = `<p>${special}</p>`;
}

function populateItineraryDetails() {
    if (!tripData.activities) return;
    document.querySelectorAll('[data-day-index]').forEach(dayElement => {
        const dayIndexOfTrip = parseInt(dayElement.dataset.dayIndex, 10);
        dayElement.querySelectorAll('[data-activity-details]').forEach(element => {
            const activityName = element.dataset.activityDetails;
            const activity = tripData.activities.find(a => a.name === activityName);
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
            <a href="[https://www.google.com/maps/dir/?api=1&destination=$](https://www.google.com/maps/dir/?api=1&destination=$){activity.lat},${activity.lon}" target="_blank" class="inline-block text-accent font-semibold hover:underline">פתח ניווט</a>
        </div>
    `;
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

function setupPackingGuideModal() {
    if (!tripData.packingListData || !tripData.luggageData) return;
    renderChecklist();
    renderLuggage();
}

function renderChecklist() {
    const container = document.getElementById('checklist-container');
    if (!container || !tripData.packingListData) return;
    let html = '';
    for (const category in tripData.packingListData) {
        html += `<div class="mb-4"><h4 class="font-bold text-lg mb-2 text-accent">${category}</h4><div class="space-y-2">${tripData.packingListData[category].map(item => `<label class="flex items-center"><input type="checkbox" class="form-checkbox h-5 w-5 text-teal-600 rounded"><span class="mr-3 text-gray-700">${item}</span></label>`).join('')}</div></div>`;
    }
    container.innerHTML = html;
}

function renderLuggage() {
    const container = document.getElementById('luggage-list-container');
    if (!container || !tripData.luggageData) return;
    container.innerHTML = tripData.luggageData.map(item => `
        <div class="bg-secondary p-4 rounded-lg">
            <h4 class="font-bold text-lg">${item.name}</h4>
            <p class="text-sm"><strong>אחראי/ת:</strong> ${item.owner}</p>
            <p class="text-sm"><strong>משקל:</strong> ${item.weight}</p>
            <p class="text-sm mt-1"><em>${item.notes}</em></p>
        </div>
    `).join('');
}


// =================================================================================
// GEMINI API & AI FEATURES
// =================================================================================

const API_URL = `/.netlify/functions/gemini`;

async function callGeminiWithParts(parts, jsonSchema = null) {
    try {
        const payload = { contents: [{ role: "user", parts: parts }] };
        if (jsonSchema) {
            payload.generationConfig = { responseMimeType: "application/json", responseSchema: jsonSchema };
        }
        // This assumes you have a Netlify function named 'gemini'
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.candidates?.[0]?.content.parts?.[0]) {
            return result.candidates[0].content.parts[0].text;
        }
        return jsonSchema ? "[]" : "מצטער, לא הצלחתי להבין את הבקשה.";
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return jsonSchema ? "[]" : "אופס, משהו השתבש. אנא נסה שוב מאוחר יותר.";
    }
}


async function handleChatSend() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatLoader = document.getElementById('chat-loader');
    const userMessage = chatInput.value.trim();

    if (!userMessage && !chatImageBase64) return;
    chatInput.value = '';
    
    let userBubbleHTML = `<div class="chat-bubble user">${userMessage}`;
    if(chatImageBase64) {
        userBubbleHTML += `<img src="data:image/jpeg;base64,${chatImageBase64}" class="rounded-md mt-2 max-w-full h-auto" />`;
    }
    userBubbleHTML += `</div>`;
    
    chatMessages.innerHTML += userBubbleHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatLoader.classList.remove('hidden');
    chatLoader.classList.add('flex');

    const prompt = `You are a friendly and knowledgeable Geneva local, helping a family with two toddlers (ages 2 and 3). You can identify landmarks, food, or signs from images. Answer their question concisely and helpfully, in Hebrew. Here is their question: "${userMessage}"`;
    
    const parts = [{ text: prompt }];
    if(chatImageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: chatImageBase64 } });
    }

    const geminiResponse = await callGeminiWithParts(parts);

    chatLoader.classList.add('hidden');
    chatLoader.classList.remove('flex');
    chatMessages.innerHTML += `<div class="chat-bubble gemini">${geminiResponse.replace(/\n/g, '<br>')}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    removeChatImage();
}

async function handlePlanRequest(event) {
    const button = event.target;
    const planContainer = button.closest('[data-day-index]');
    const resultContainer = planContainer.querySelector('.gemini-plan-result');
    const mainActivityElement = planContainer.querySelector('ul li strong');
    if (!mainActivityElement) return;

    const mainActivityName = mainActivityElement.textContent;
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';

    const prompt = `You are a creative trip planner for families. For a family with a 2 and 3-year-old in Geneva, suggest a short, fun morning plan based around the main activity: "${mainActivityName}". The plan should be a few simple steps. Keep it simple and toddler-friendly. Respond in Hebrew.`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    resultContainer.innerHTML = geminiResponse.replace(/\n/g, '<br>');
}

async function handleStoryRequest(event) {
    const button = event.target;
    const planContainer = button.closest('[data-day-index]');
    const mainActivityElement = planContainer.querySelector('ul li strong');
    const storyModal = document.getElementById('story-modal');
    const storyContent = document.getElementById('story-modal-content');

    if (!mainActivityElement) return;
    const mainActivityName = mainActivityElement.textContent;

    storyContent.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>';
    storyModal.classList.remove('hidden');

    const prompt = `You are a children's storyteller. Write a short, simple, and happy bedtime story in Hebrew for two toddlers, Bar (a girl) and Ran (a boy), ages 2 and 3. The story should be about their adventure today in Geneva, where they visited ${mainActivityName}. Make it magical and fun.`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    storyContent.innerHTML = geminiResponse.replace(/\n/g, '<br>');
}

async function handleWhatToWearRequest() {
    if (!currentWeatherData) {
        showTextResponseModal("שגיאה", "נתוני מזג האוויר עדיין לא נטענו. נסה שוב בעוד רגע.");
        return;
    }
    showTextResponseModal("✨ מה ללבוש היום? ✨", '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>');

    const todayWeather = currentWeatherData.daily;
    const weatherDesc = getWeatherInfo(todayWeather.weathercode[0]).description;
    const tempMax = Math.round(todayWeather.temperature_2m_max[0]);
    const tempMin = Math.round(todayWeather.temperature_2m_min[0]);

    const prompt = `Based on the weather in Geneva today (${weatherDesc}, high of ${tempMax}°C, low of ${tempMin}°C), what should a family with a 2-year-old and a 3-year-old wear for a day out? Provide a simple, bulleted list in Hebrew, using emojis.`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    showTextResponseModal('✨ מה ללבוש היום? ✨', geminiResponse);
}

async function handleSummaryRequest(event) {
    const button = event.target;
    const planContainer = button.closest('[data-day-index]');
    const title = planContainer.querySelector('h3').textContent;
    const mainPlan = planContainer.querySelector('h4').nextElementSibling.textContent;

    showTextResponseModal(`✨ סיכום לילדים - ${title} ✨`, '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>');

    const prompt = `Please create a very short, fun, and exciting summary of this daily plan for a 2 and 3-year-old. Use simple Hebrew words and emojis. Plan: ${mainPlan}`;
    const geminiResponse = await callGeminiWithParts([{ text: prompt }]);
    showTextResponseModal(`✨ סיכום לילדים - ${title} ✨`, geminiResponse);
}

async function handleCustomPlanRequest() {
    const promptInput = document.getElementById('custom-plan-prompt');
    const resultContainer = document.getElementById('custom-plan-result');
    const userPrompt = promptInput.value.trim();

    if (!userPrompt) {
        resultContainer.innerHTML = '<p class="text-red-500 text-center">אנא ספרו לי מה תרצו לעשות.</p>';
        return;
    }

    resultContainer.innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';

    const availableActivities = tripData.activities.map(a => `- ${a.name} (${a.category}): ${a.description}`).join('\n');
    const fullPrompt = `You are a creative trip planner for a family with a 2 and 3-year-old in Geneva. Their hotel is near the Zimeysa train station. They want a plan for a day that feels like: "${userPrompt}". \n\n    Here is a list of available activities:\n    ${availableActivities}\n\n    Create a simple, step-by-step, half-day or full-day itinerary (morning, lunch, afternoon). Suggest 2-3 real, relevant activities from the list and a suitable, simple lunch spot. Provide travel times between locations using public transport. Respond in Hebrew.`;

    const geminiResponse = await callGeminiWithParts([{ text: fullPrompt }]);
    resultContainer.innerHTML = `<div class="gemini-plan-result">${geminiResponse.replace(/\n/g, '<br>')}</div>`;
}

function handleChatImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result;
        chatImageBase64 = base64String.split(',')[1];
        
        document.getElementById('chat-image-preview').src = base64String;
        document.getElementById('chat-image-preview-container').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function removeChatImage() {
    chatImageBase64 = null;
    document.getElementById('chat-image-preview-container').classList.add('hidden');
    document.getElementById('chat-image-input').value = '';
}


function showTextResponseModal(title, content) {
    const modal = document.getElementById('text-response-modal');
    document.getElementById('text-response-modal-title').textContent = title;
    document.getElementById('text-response-modal-content').innerHTML = content.replace(/\n/g, '<br>');
    modal.classList.remove('hidden');
}

function findAndDisplayNearby() {
    const resultsContainer = document.getElementById('nearby-results');
    resultsContainer.innerHTML = '<p>מאתר את מיקומך...</p>';

    if (!navigator.geolocation) {
        resultsContainer.innerHTML = '<p>שירותי מיקום אינם נתמכים.</p>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const nearbyPlaces = tripData.activities
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
                </div>
            `;
        },
        () => {
            resultsContainer.innerHTML = '<p>לא ניתן היה לקבל את מיקומך.</p>';
        }
    );
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

async function fetchAndRenderWeather() {
    const forecastContainer = document.getElementById('weather-forecast');
    const whatToWearBtn = document.getElementById('what-to-wear-btn');
    const startDate = '2025-08-24';
    const endDate = '2025-08-29';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=46.20&longitude=6.14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentWeatherData = data; 

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
                </div>
            `;
        });
        whatToWearBtn.classList.remove('hidden');
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

