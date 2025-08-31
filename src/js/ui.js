import { currentData, map, currentCategoryFilter, currentTimeFilter, displayedActivitiesCount } from './main.js';
import { setMap } from './main.js';
import { fetchAndRenderWeather } from './services.js';

export function renderAllComponents() {
    if (!currentData) return;
    
    fetchAndRenderWeather();
    renderActivities();
    renderItinerary(); 
    renderBookingInfo();
    renderPhotoAlbum();
    renderBulletinBoard();
    renderExpenses();
    initMap();
    displayDailyAttraction();
    updateProgressBar();
    setInterval(updateProgressBar, 60000);
}

// ---------------- ITINERARY ----------------
export function renderItinerary() {
    if (!currentData?.itineraryData) return;
    const itineraryContainer = document.getElementById('plan');
    if (!itineraryContainer) return;

    const dayCardsContainer = itineraryContainer.querySelector('.space-y-8');
    if (!dayCardsContainer) return;

    dayCardsContainer.innerHTML = currentData.itineraryData.map(dayInfo => createDayCard(dayInfo)).join('');
    populateItineraryDetails();
}

function createDayCard(dayInfo) {
    const createPlanSection = (plan, planType, dayIndex) => {
        if (!plan?.items?.length) return '';
        return `
            <div class="border-t pt-4">
                <h4 class="font-semibold text-lg text-gray-600">${plan.title}</h4>
                <ul class="list-disc pr-5 mt-2 space-y-2 text-gray-700">
                    ${plan.items.map((item, itemIndex) => {
                        const activity = currentData.activitiesData?.find(a => a.id === item.activityId) || { name: item.activityName ?? "פעילות מיוחדת" };
                        return `
                        <li class="flex justify-between items-center">
                            <span>
                                <strong>${activity.name}</strong>: ${item.description ?? ''}
                                <div data-activity-details="${activity.name}"></div>
                            </span>
                            <button class="swap-activity-btn text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-full" 
                                data-day-index="${dayIndex}" data-plan-type="${planType}" data-item-index="${itemIndex}">
                                החלף <i class="fas fa-exchange-alt"></i>
                            </button>
                        </li>`;
                    }).join('')}
                </ul>
            </div>`;
    };

    return `
        <div class="bg-white p-6 rounded-xl shadow-lg border-r-4 border-accent" data-day-index="${dayInfo.dayIndex}">
            <h3 class="font-bold text-2xl mb-4 text-gray-800">יום ${dayInfo.day} (${dayInfo.dayName})${dayInfo.title ? `: ${dayInfo.title}` : ''}</h3>
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-lg text-accent">${dayInfo.mainPlan?.title ?? ''}</h4>
                    <ul class="list-disc pr-5 mt-2 space-y-2 text-gray-700">
                        ${dayInfo.mainPlan?.items?.map((item, itemIndex) => {
                            const activity = currentData.activitiesData?.find(a => a.id === item.activityId) || { name: item.activityName ?? "פעילות מיוחדת" };
                            return `
                            <li class="flex justify-between items-center">
                                <span>
                                    <strong>${activity.name}</strong>: ${item.description ?? ''}
                                    <div data-activity-details="${activity.name}"></div>
                                </span>
                                <button class="swap-activity-btn text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-full" 
                                    data-day-index="${dayInfo.dayIndex}" data-plan-type="mainPlan" data-item-index="${itemIndex}">
                                    החלף <i class="fas fa-exchange-alt"></i>
                                </button>
                            </li>`;
                        }).join('')}
                    </ul>
                </div>
                ${createPlanSection(dayInfo.alternativePlan, 'alternativePlan', dayInfo.dayIndex)}
                ${createPlanSection(dayInfo.alternativePlan2, 'alternativePlan2', dayInfo.dayIndex)}
                <div class="border-t pt-4 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button class="btn-primary py-2 px-4 rounded-lg gemini-plan-btn">✨ תכנן בוקר</button>
                    <button class="bg-green-500 text-white py-2 px-4 rounded-lg gemini-summary-btn">✨ סכם לילדים</button>
                    <button class="bg-purple-500 text-white py-2 px-4 rounded-lg gemini-story-btn">✨ סיפור לילה טוב</button>
                </div>
                <div class="gemini-plan-result hidden"></div>
                <div class="border-t pt-4 mt-4 bg-yellow-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg text-yellow-800">💡 טיפ להורה סולו</h4>
                    <p class="mt-2 text-gray-700 text-sm">${dayInfo.soloTip ?? ''}</p>
                </div>
            </div>
        </div>`;
}

// ---------------- ACTIVITIES ----------------
export function renderActivities() {
    if (!currentData?.activitiesData) return;
    const activitiesGrid = document.getElementById('activities-grid');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!activitiesGrid || !loadMoreContainer || !loadMoreBtn) return;

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

    const activitiesToDisplay = filteredActivities.slice(0, displayedActivitiesCount);
    activitiesGrid.innerHTML = activitiesToDisplay.length === 0 
        ? `<p class="text-center col-span-full">לא נמצאו פעילויות התואמות את הסינון.</p>`
        : activitiesToDisplay.map(a => createActivityCard(a)).join('');

    if (filteredActivities.length > displayedActivitiesCount) {
        loadMoreContainer.classList.remove('hidden');
        loadMoreBtn.textContent = 'טען עוד פעילויות 🎈';
        loadMoreBtn.disabled = false;
    } else {
        loadMoreContainer.classList.remove('hidden');
        loadMoreBtn.textContent = 'מצא הצעות נוספות עם AI ✨';
        loadMoreBtn.disabled = false;
    }
}

function createActivityCard(activity) {
    if (!activity) return '';
    const imageUrl = activity.image ?? `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(activity.name ?? 'Activity')}`;
    const whatToBringList = activity.whatToBring?.length 
        ? `<div class="border-t pt-4 mt-4"><h4 class="font-semibold mb-2">🎒 מה להביא?</h4>
           <ul class="list-disc pr-5 space-y-1 text-sm text-gray-600">
           ${activity.whatToBring.map(i => `<li>${i}</li>`).join('')}</ul></div>` 
        : '';

    return `
       <div class="card activity-card" data-category="${activity.category}" data-time="${activity.time}">
           <div class="image-container"><img src="${imageUrl}" alt="${activity.name}" class="w-full h-48 object-cover" onerror="this.src='https://placehold.co/600x400/e2e8f0/94a3b8?text=Image+not+found';"></div>
           <div class="p-6 flex flex-col flex-grow">
               <div class="flex-grow">
                   <h3 class="text-xl font-bold mb-2">${activity.name}</h3>
                   <span class="text-sm font-semibold text-accent py-1 px-2 rounded-full bg-teal-50 mb-3 inline-block">${activity.category}</span>
                   <p class="text-gray-600 mb-4 text-sm">${activity.description ?? ''}</p>
                   <div class="border-t pt-4 mt-4 space-y-3 text-sm">
                       <div class="flex items-start"><span class="w-6 text-center mt-1">🕒</span><p>כ-${activity.time ?? 'לא ידוע'} דקות</p></div>
                       <div class="flex items-start"><span class="w-6 text-center mt-1">🚆</span><p>${activity.transport ?? 'לא ידוע'}</p></div>
                       <div class="flex items-start"><span class="w-6 text-center mt-1">💰</span><p>${activity.cost ?? 'לא ידוע'}</p></div>
                       <div class="flex items-start"><span class="w-6 text-center mt-1">📍</span><p>${activity.address ?? 'לא ידוע'}</p></div>
                   </div>
                   ${whatToBringList}
               </div>
               <div class="flex space-x-2 space-x-reverse mt-4">
                   <a href="${activity.link ?? '#'}" target="_blank" class="flex-1 text-center btn-primary px-4 py-2 rounded-lg text-sm">לאתר הרשמי</a>
                   <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.address ?? ''}" target="_blank" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">ניווט ב-Maps</a>
               </div>
           </div>
       </div>`;
}

// ---------------- PHOTO ALBUM ----------------
export function renderPhotoAlbum() {
    if (!currentData?.photoAlbum) return;
    const carouselInner = document.getElementById('carousel-inner');
    if (!carouselInner) return;

    carouselInner.innerHTML = currentData.photoAlbum.length === 0 
        ? `<div class="w-full flex-shrink-0 h-64 bg-gray-200 flex items-center justify-center"><span class="text-gray-500">העלו תמונות מהטיול!</span></div>` 
        : currentData.photoAlbum.map(photo => `
            <div class="w-full flex-shrink-0">
                <img src="${photo.url}" class="w-full h-64 object-contain">
            </div>`).join('');
}

// ---------------- BULLETIN BOARD ----------------
export function renderBulletinBoard() {
    if (!currentData?.bulletinBoard) return;
    const messagesContainer = document.getElementById('bulletin-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = currentData.bulletinBoard.slice().sort((a,b) => b.timestamp - a.timestamp).map(msg => `
        <div class="bg-yellow-100 p-3 rounded-md shadow-sm">
            <p class="text-sm">${msg.text}</p>
            <p class="text-xs text-gray-500 text-left mt-1">${new Date(msg.timestamp).toLocaleString('he-IL')}</p>
        </div>`).join('');
}

// ---------------- EXPENSES ----------------
export function renderExpenses() {
    if (!currentData?.expenses) return;
    const expenseList = document.getElementById('expense-list');
    const expenseTotal = document.getElementById('expense-total');
    if (!expenseList || !expenseTotal) return;

    let total = 0;
    expenseList.innerHTML = currentData.expenses.map(exp => {
        total += Number(exp.amount ?? 0);
        return `<div class="flex justify-between items-center p-2 border-b">
            <span>${exp.desc ?? ''} <span class="text-xs text-gray-500">(${exp.category ?? ''})</span></span>
            <span>${exp.amount ?? 0} CHF</span>
        </div>`;
    }).join('');
    expenseTotal.textContent = `${total.toFixed(2)} CHF`;
}

// ---------------- BOOKING ----------------
export function renderBookingInfo() {
    if (!currentData?.flightData) return;
    const bookingRefEl = document.getElementById('booking-ref-display');
    if (bookingRefEl) {
        bookingRefEl.innerHTML = `<strong>מספר הזמנה:</strong> ${currentData.flightData.bookingRef ?? ''}`;
    }
}

// ---------------- MAP ----------------
export function initMap() {
    if (!L) return;
    let localMap = map;

    if (localMap) { 
        localMap.eachLayer(layer => { if (!!layer.toGeoJSON) localMap.removeLayer(layer); });
    } else {
        if (!document.getElementById('map')) return;
        localMap = L.map('map');
        setMap(localMap);
    }

    const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };
    localMap.setView([hotelLocation.lat, hotelLocation.lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(localMap);

    const hotelIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
    const activityIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

    L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon }).addTo(localMap).bindTooltip(`<b>${hotelLocation.name}</b><br>נקודת המוצא שלכם!`).openTooltip();

    currentData?.activitiesData?.forEach(activity => {
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon], { icon: activityIcon })
              .addTo(localMap)
              .bindTooltip(`<b>${activity.name ?? ''}</b><br>כ-${activity.time ?? '?'} דקות נסיעה מהמלון`);
        }
    });
}

// ---------------- PROGRESS BAR ----------------
export function updateProgressBar() {
    if (!currentData?.tripTimeline?.length) return;
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressBarText = document.getElementById('progress-bar-text');
    const progressBarInfo = document.getElementById('progress-bar-info');
    if (!progressBarFill || !progressBarText || !progressBarInfo) return;

    const now = new Date();
    const start = new Date(currentData.tripTimeline[0].date);
    const end = new Date(currentData.tripTimeline[currentData.tripTimeline.length-1].date);
    let progress = 0, currentStatus = "לפני הטיול", infoText = `הטיול מתחיל ב-${start.toLocaleDateString('he-IL')}`;

    if (now >= start && now <= end) {
        progress = ((now.getTime()-start.getTime()) / (end.getTime()-start.getTime()))*100;
        for (let i=currentData.tripTimeline.length-1;i>=0;i--) {
            if (now >= new Date(currentData.tripTimeline[i].date)) {
                currentStatus = currentData.tripTimeline[i].label ?? '';
                infoText = (i+1<currentData.tripTimeline.length) ? 
                    `השלב הבא: ${currentData.tripTimeline[i+1].label ?? ''} ב-${new Date(currentData.tripTimeline[i+1].date).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}` 
                    : "נהנים מהרגעים האחרונים!";
                break;
            }
        }
    } else if (now > end) { progress = 100; currentStatus="הטיול הסתיים"; infoText="מקווים שנהניתם!"; }

    progressBarFill.style.width = `${progress}%`;
    progressBarText.textContent = currentStatus;
    progressBarInfo.textContent = infoText;
}

// ---------------- ITINERARY DETAILS ----------------
function populateItineraryDetails() {
    if (!currentData?.activitiesData) return;
    document.querySelectorAll('[data-day-index]').forEach(dayElement => {
        const dayIndexOfTrip = parseInt(dayElement.dataset.dayIndex, 10);
        dayElement.querySelectorAll('[data-activity-details]').forEach(element => {
            const activityName = element.dataset.activityDetails;
            const activity = currentData.activitiesData.find(a => a.name === activityName);
            if (activity) element.innerHTML = createActivitySnippetHTML(activity, dayIndexOfTrip);
        });
    });
}

function createActivitySnippetHTML(activity, dayIndex) {
    if (!activity) return '';
    const hours = getOpeningHoursForDay(activity, dayIndex);
    return `
       <div class="activity-snippet text-sm text-gray-600 space-y-2">
           <div class="flex items-start"><span class="w-5 text-center">⏰</span><p>${hours}</p></div>
           <div class="flex items-start"><span class="w-5 text-center">🕒</span><p>כ-${activity.time ?? 'לא ידוע'} דקות</p></div>
           <div class="flex items-start"><span class="w-5 text-center">💰</span><p>${activity.cost ?? 'לא ידוע'}</p></div>
           <div class="flex items-start"><span class="w-5 text-center">📍</span><p>${activity.address ?? 'לא ידוע'}</p></div>
           <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.lat ?? 0},${activity.lon ?? 0}" target="_blank" class="inline-block text-accent font-semibold hover:underline">פתח ניווט</a>
       </div>`;
}

function getOpeningHoursForDay(activity, dayIndex) {
    if (!activity?.openingHours) return 'לא זמין';
    const tripStartDate = currentData?.tripTimeline?.[0]?.date ?? '2025-08-24';
    const currentDay = new Date(tripStartDate);
    currentDay.setDate(currentDay.getDate() + dayIndex);
    const dayOfWeek = currentDay.getDay();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = dayNames[dayOfWeek];

    for (const key in activity.openingHours) {
        if (!activity.openingHours.hasOwnProperty(key)) continue;
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

// ---------------- DAILY SPECIAL ----------------
export function displayDailyAttraction() {
    if (!currentData?.dailySpecials) return;
    const container = document.getElementById('daily-special-content');
    if (!container) return;

    const today = new Date();
    const tripDates = Object.keys(currentData.dailySpecials);
    const demoDate = tripDates[today.getDay() % tripDates.length]; 
    const special = currentData.dailySpecials[demoDate] ?? "טיפ יומי: ז'נבה מלאה בגני שעשועים נסתרים. חפשו אותם בסמטאות העיר העתיקה!";
    container.innerHTML = `<p>${special}</p>`;
}

// ---------------- MODALS ----------------
export function showTextResponseModal(title, content) {
    const modal = document.getElementById('text-response-modal');
    if (!modal) return;
    const titleEl = document.getElementById('text-response-modal-title');
    const contentEl = document.getElementById('text-response-modal-content');
    if (!titleEl || !contentEl) return;

    titleEl.textContent = title;
    contentEl.innerHTML = content?.replace(/\n/g,'<br>') ?? '';
    openModal('text-response-modal');
}

export function openModal(modalId, onOpenCallback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (onOpenCallback) onOpenCallback();
}

// ---------------- PACKING LIST ----------------
export function renderPackingGuide() {
    const container = document.getElementById('checklist-container');
    if (!container || !currentData?.packingListData) return;
    container.innerHTML = '';

    Object.entries(currentData.packingListData).forEach(([category, items]) => {
        if (!Array.isArray(items)) return;

        const categorySection = document.createElement('div');
        categorySection.className = 'mb-6';
        categorySection.innerHTML = `<h4 class="font-bold text-lg mb-3 text-accent border-b pb-2">${category}</h4>`;

        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';
        itemsGrid.innerHTML = items.map(item => {
            const placeholderText = item.name ? encodeURIComponent(item.name) : 'Item';
            const imageUrl = item.imageUrl || `https://placehold.co/150x150/e2e8f0/94a3b8?text=${placeholderText}`;
            return `
            <div class="visual-packing-item text-center">
                <div class="relative w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-2 group border">
                    <img src="${imageUrl}" alt="${item.name}" class="w-full h-full object-cover">
                    <button class="upload-item-image-btn absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" data-category="${category}" data-name="${item.name}">
                        <i class="fas fa-camera fa-2x"></i>
                    </button>
                    <input type="file" accept="image/*" class="item-image-input hidden" data-category="${category}" data-name="${item.name}">
                </div>
                <div class="flex items-center justify-center gap-x-2">
                    <input type="checkbox" class="packing-item-checkbox form-checkbox h-4 w-4 text-teal-600 rounded shrink-0" ${item.checked ? 'checked' : ''} data-category="${category}" data-name="${item.name}">
                    <span class="text-sm text-gray-700 truncate" title="${item.name}">${item.name}</span>
                    <button class="remove-item-btn text-red-400 hover:text-red-600 text-xs" data-category="${category}" data-name="${item.name}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>`;
        }).join('');
        categorySection.appendChild(itemsGrid);
        container.appendChild(categorySection);
    });
}

export function updatePackingProgress() {
    if (!currentData?.packingListData) return;
    const progressBar = document.getElementById('packingProgressBar');
    const progressText = document.getElementById('packingProgressText');
    if (!progressBar || !progressText) return;

    let total = 0, checked = 0;
    Object.values(currentData.packingListData).forEach(items => {
        if (!Array.isArray(items)) return;
        total += items.length;
        checked += items.filter(i => i.checked).length;
    });
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `הושלמו ${percentage}% (${checked}/${total})`;
}

// ---------------- LUGGAGE ----------------
export function renderLuggageManagement() {
    const container = document.getElementById('luggage-list-container');
    if (!container || !currentData?.luggageData) return;
    container.innerHTML = currentData.luggageData.map((item, index) => `
        <div class="bg-secondary p-4 rounded-lg flex justify-between items-start">
            <div>
                <h4 class="font-bold text-lg">${item.name ?? 'מטען'}</h4>
                <p class="text-sm"><strong>אחראי/ת:</strong> ${item.owner ?? 'לא ידוע'}</p>
                ${item.size ? `<p class="text-sm"><strong>גודל:</strong> ${item.size}</p>` : ''}
            </div>
            <button class="remove-luggage-btn text-red-400 hover:text-red-600" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
}

// ---------------- HOTEL ----------------
export function populateHotelDetails() {
    if (!currentData?.hotelData) return;
    const modal = document.getElementById('hotel-booking-modal');
    if (!modal) return;
    const { hotelData } = currentData;

    const grid = modal.querySelector('.grid-cols-2.gap-4.text-sm');
    if (grid) grid.innerHTML = `
        <div><strong>צ'ק-אין:</strong> ${hotelData.checkIn ?? ''}</div>
        <div><strong>צ'ק-אאוט:</strong> ${hotelData.checkOut ?? ''}</div>
        <div><strong>מספר הזמנה:</strong> ${hotelData.bookingRef ?? ''}</div>
        <div><strong>הוזמן ע"י:</strong> ${hotelData.bookedBy ?? ''}</div>`;

    const img = modal.querySelector('img');
    if (img) { img.src = hotelData.imageUrl ?? ''; img.alt = hotelData.name ?? 'Hotel'; }

    const pName = modal.querySelector('.font-semibold');
    if (pName) pName.textContent = hotelData.name ?? '';
    const pAddress = pName?.nextElementSibling;
    if (pAddress) pAddress.textContent = hotelData.address ?? '';

    const qrImg = modal.querySelector('#qr-code-img');
    if (qrImg) qrImg.src = hotelData.qrCodeUrl ?? '';
    const roomTypeEl = modal.querySelector('#room-type');
    if (roomTypeEl) roomTypeEl.textContent = hotelData.roomType ?? '';
    const guestsEl = modal.querySelector('#guests');
    if (guestsEl) guestsEl.textContent = hotelData.guests ?? '';
}

// ---------------- FLIGHTS ----------------
export function populateFlightDetails() {
    if (!currentData?.flightData) return;
    const container = document.getElementById('flight-details-content');
    if (!container) return;
    const { flightData } = currentData;

    const sections = [
        { title: `טיסות הלוך - ${flightData.outbound?.[0]?.date ?? ''}`, flights: flightData.outbound ?? [], connection: flightData.connections?.outbound ?? '' },
        { title: `טיסות חזור - ${flightData.inbound?.[0]?.date ?? ''}`, flights: flightData.inbound ?? [], connection: flightData.connections?.inbound ?? '' }
    ];

    container.innerHTML = sections.map(section => {
        return `
        <div>
            <h4 class="font-bold text-xl mb-3 border-b pb-2 text-accent">${section.title}</h4>
            <div class="space-y-4 text-sm">
                ${section.flights.map((flight, index) => {
                    const key = (section.title.includes('הלוך') ? 'outbound' : 'inbound') + (index + 1);
                    const seatKey = 'seat' + key.charAt(0).toUpperCase() + key.slice(1);
                    return `
                    <div class="p-2 rounded-lg hover:bg-gray-50 border-b">
                        <div class="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                            <div class="md:col-span-2">
                                <p><strong>${flight.from ?? ''} ← ${flight.to ?? ''}</strong></p>
                                <p class="text-gray-600">${flight.time ?? ''} | ${flight.airline ?? ''} ${flight.flightNum ?? ''}</p>
                            </div>
                            <div class="text-center">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(flight.status)}">${flight.status ?? 'לא ידוע'}</span>
                            </div>
                            <a href="${flight.checkin ?? '#'}" target="_blank" class="text-white bg-green-500 hover:bg-green-600 text-center py-1 px-2 rounded-md text-xs md:col-span-1">בצע צ'ק אין</a>
                        </div>
                        <div class="mt-3 pt-3 border-t text-xs">
                            <h5 class="font-semibold mb-1">נוסעים ומושבים:</h5>
                            <ul class="list-disc pr-4">
                                ${flightData.passengers?.map(p => `<li>${p.name ?? ''}: <strong>${p[seatKey] ?? 'לא ידוע'}</strong></li>`).join('')}
                            </ul>
                        </div>
                    </div>`;
                }).join(`<p class="pl-4 border-r-2 border-gray-200 my-2"><strong>קונקשן באתונה:</strong> ${section.connection}</p>`)}
            </div>
        </div>`;
    }).join('');
}

function getStatusClass(status) {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
        case 'on time': return 'bg-green-100 text-green-800';
        case 'delayed': return 'bg-red-100 text-red-800';
        case 'canceled': return 'bg-red-200 text-red-900 font-bold';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// ---------------- FAMILY ----------------
export function populateFamilyDetails() {
    if (!currentData?.familyData) return;
    const container = document.getElementById('family-details-content');
    if (!container) return;

    container.innerHTML = currentData.familyData.map(member => `
       <div class="flex justify-between p-2 border-b">
           <span class="font-semibold">${member.name ?? 'נוסע/ת'}</span>
           <span>${member.passport ?? ''}</span>
       </div>`).join('');
}

// ---------------- BOARDING PASSES ----------------
export function showBoardingPasses() {
    if (!currentData?.flightData) return;
    const container = document.getElementById('boarding-pass-content');
    if (!container) return;
    container.innerHTML = '';

    const { flightData } = currentData;
    const flights = [...(flightData.outbound ?? []), ...(flightData.inbound ?? [])];
    const seatMapping = { outbound1: 'seatOutbound1', outbound2: 'seatOutbound2', inbound1: 'seatInbound1', inbound2: 'seatInbound2' };

    flights.forEach((flight, index) => {
        const flightKey = (index < 2 ? 'outbound' : 'inbound') + (index % 2 + 1);
        const seatKey = seatMapping[flightKey];
        (flightData.passengers ?? []).forEach(passenger => {
            const qrData = `M1LIPETZ/${passenger.name?.split(' ')[0] ?? ''} E${passenger.ticket?.replace(/-/g,'') ?? ''} ${flight.from?.slice(-4,-1) ?? ''}${flight.to?.slice(-4,-1) ?? ''}${flight.airline?.slice(0,2) ?? ''}${flight.flightNum?.padStart(4,'0') ?? ''} 236Y028C0045 100`;

            container.innerHTML += `
            <div class="boarding-pass-wallet">
                <div class="bp-main">
                    <div class="bp-header">
                        <span class="bp-airline">${flight.airline ?? ''}</span>
                        <img src="https://placehold.co/40x40/FFFFFF/4A4A4A?text=${flight.airline?.charAt(0) ?? 'A'}" alt="Airline Logo" class="bp-logo">
                    </div>
                    <div class="bp-flight-info">
                        <div>
                            <span class="bp-label">${flight.from?.slice(-4,-1) ?? ''}</span>
                            <span class="bp-value-large">${flight.from?.split(' (')[0] ?? ''}</span>
                       </div>
                        <div class="bp-plane-icon">✈️</div>
                        <div>
                            <span class="bp-label">${flight.to?.slice(-4,-1) ?? ''}</span>
                            <span class="bp-value-large">${flight.to?.split(' (')[0] ?? ''}</span>
                       </div>
                   </div>
                    <div class="bp-passenger-info">
                        <span class="bp-label">נוסע/ת</span>
                        <span class="bp-value">${passenger.name ?? ''}</span>
                    </div>
                </div>
                <div class="bp-stub">
                    <div class="bp-qr-code">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}" alt="QR Code">
                    </div>
                    <div class="bp-details">
                        <div><span class="bp-label">טיסה</span><span class="bp-value">${flight.flightNum ?? ''}</span></div>
                        <div><span class="bp-label">מושב</span><span class="bp-value">${passenger[seatKey] ?? ''}</span></div>
                        <div><span class="bp-label">תאריך</span><span class="bp-value">${flight.date ?? ''}</span></div>
                        <div><span class="bp-label">שעת המראה</span><span class="bp-value">${flight.time?.split(' - ')[0] ?? ''}</span></div>
                   </div>
               </div>
           </div>`;
        });
    });
    openModal('boarding-pass-modal');
}

// ---------------- NEARBY PLACES ----------------
export function findAndDisplayNearby(latitude, longitude) {
    if (!currentData?.activitiesData) return;
    const resultsContainer = document.getElementById('nearby-results');
    if (!resultsContainer) return;

    const nearbyPlaces = (currentData.activitiesData ?? [])
        .filter(place => ['משחקייה', 'חוץ', 'בית מרקחת'].includes(place.category) && place.lat && place.lon)
        .map(place => ({ ...place, calculatedDistance: calculateDistance(latitude, longitude, place.lat, place.lon) }))
        .sort((a,b) => a.calculatedDistance - b.calculatedDistance);

    const playgrounds = nearbyPlaces.filter(p => ['משחקייה','חוץ'].includes(p.category)).slice(0,5);
    const pharmacies = nearbyPlaces.filter(p => p.category==='בית מרקחת').slice(0,3);

    resultsContainer.innerHTML = `
       <div>
           <h4 class="font-bold text-lg mb-2">משחקיות ופארקים קרובים:</h4>
           <ul class="list-disc pr-5 space-y-1">${playgrounds.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance?.toFixed(1) ?? '?'} ק"מ</li>`).join('')}</ul>
       </div>
       <div class="border-t pt-4 mt-4">
           <h4 class="font-bold text-lg mb-2">בתי מרקחת קרובים:</h4>
           <ul class="list-disc pr-5 space-y-1">${pharmacies.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance?.toFixed(1) ?? '?'} ק"מ</li>`).join('')}</ul>
       </div>`;
}

// ---------------- HELPER ----------------
function calculateDistance(lat1, lon1, lat2, lon2) {
    if ([lat1,lon1,lat2,lon2].some(v => v == null)) return 0;
    const R = 6371; 
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

