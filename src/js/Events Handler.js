import { 
    db, storage, userId, currentData, 
    setCurrentCategoryFilter, setCurrentTimeFilter, 
    setDisplayedActivitiesCount, displayedActivitiesCount, ACTIVITIES_INCREMENT 
} from './main.js';
import { 
    renderActivities, openModal, setupPackingGuideModal, populateFlightDetails, 
    populateHotelDetails, populateFamilyDetails, showBoardingPasses,
    showTextResponseModal
} from './ui.js';
import { 
    callGeminiWithParts, createActivityPrompt, createPackingPrompt, analyzePackingImages 
} from './gemini.js';
import { findAndDisplayNearby } from './map.js';
import { doc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// --- SETUP FUNCTION ---
export function setupEventListeners() {
    if (document.body.dataset.listenersAttached) return;

    document.body.addEventListener('click', handleDelegatedClicks);
    document.body.addEventListener('change', handleDelegatedChanges);
    
    document.body.dataset.listenersAttached = 'true';
}

// --- DELEGATED CLICK HANDLERS ---
function handleDelegatedClicks(e) {
    // --- Modals ---
    if (e.target.closest('#open-packing-modal-btn, #open-packing-modal-btn-mobile')) openModal('packing-guide-modal', setupPackingGuideModal);
    if (e.target.closest('#open-integrations-modal-btn, #open-integrations-modal-btn-mobile')) openModal('integrations-modal');
    if (e.target.closest('.nav-gemini-btn')) openModal('gemini-chat-modal');
    if (e.target.closest('#open-flights-modal-btn')) openModal('flights-details-modal', populateFlightDetails);
    if (e.target.closest('#open-hotel-modal-btn')) openModal('hotel-booking-modal', populateHotelDetails);
    if (e.target.closest('.nav-family-btn')) openModal('family-details-modal', populateFamilyDetails);
    if (e.target.closest('#find-nearby-btn')) handleFindNearby();
    if (e.target.closest('.modal-close-btn')) e.target.closest('.modal').classList.add('hidden');
    if (e.target.closest('#menu-btn')) document.getElementById('mobile-menu')?.classList.toggle('hidden');
    if (e.target.closest('#mobile-menu a, #mobile-menu button')) document.getElementById('mobile-menu')?.classList.add('hidden');

    // --- Main Actions ---
    if (e.target.closest('#load-more-btn')) handleLoadMore();
    if (e.target.closest('#image-upload-btn')) document.getElementById('image-upload-input').click();
    if (e.target.closest('#bulletin-post-btn')) handlePostBulletinMessage();
    if (e.target.closest('#add-expense-btn')) handleAddExpense();
    if (e.target.closest('#share-whatsapp-btn')) handleShareWhatsApp();
    if (e.target.closest('#add-to-calendar-btn')) handleAddToCalendar();
    if (e.target.closest('#show-boarding-passes-btn')) showBoardingPasses();

    // --- Itinerary ---
    if (e.target.closest('.swap-activity-btn')) handleSwapActivity(e.target.closest('.swap-activity-btn'));
    if (e.target.closest('.gemini-plan-btn')) handlePlanRequest(e);
    if (e.target.closest('.gemini-summary-btn')) handleSummaryRequest(e);
    if (e.target.closest('.gemini-story-btn')) handleStoryRequest(e);

    // --- Packing ---
    if (e.target.closest('#add-item-btn')) handleAddPackingItem();
    if (e.target.closest('#update-list-by-theme-btn')) handleUpdateListByTheme();
    if (e.target.closest('.remove-item-btn')) handleRemovePackingItem(e.target.closest('.remove-item-btn'));
    if (e.target.closest('.upload-item-image-btn')) e.target.closest('.visual-packing-item').querySelector('.item-image-input').click();
    if (e.target.closest('#add-luggage-btn')) handleAddLuggage();
    if (e.target.closest('.remove-luggage-btn')) handleRemoveLuggage(e);
    if (e.target.closest('#recalculate-packing-plan-btn')) handleRecalculatePackingPlan();
    if (e.target.closest('#get-packing-suggestion-btn')) handlePackingSuggestion();
    if (e.target.closest('#upload-suitcase-btn')) document.getElementById('suitcase-image-input').click();
    if (e.target.closest('#upload-items-btn')) document.getElementById('items-image-input').click();

    // --- Carousel ---
    if (e.target.closest('#carousel-next')) handleCarousel('next');
    if (e.target.closest('#carousel-prev')) handleCarousel('prev');

    // --- Filters ---
    if (e.target.matches('.btn-filter[data-filter]')) {
        document.querySelectorAll('.btn-filter[data-filter]').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        setCurrentCategoryFilter(e.target.dataset.filter);
        setDisplayedActivitiesCount(6);
        renderActivities();
    }
    if (e.target.matches('.btn-filter[data-time-filter]')) {
        document.querySelectorAll('.btn-filter[data-time-filter]').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        setCurrentTimeFilter(e.target.dataset.timeFilter);
        setDisplayedActivitiesCount(6);
        renderActivities();
    }
}

// --- DELEGATED CHANGE HANDLERS ---
function handleDelegatedChanges(e) {
    if (e.target.matches('#image-upload-input')) handleImageUpload(e);
    if (e.target.matches('#currency-chf')) handleCurrencyConversion(e);
    if (e.target.matches('.packing-item-checkbox')) handleChecklistItemToggle(e);
    if (e.target.matches('.item-image-input')) handlePackingItemImageUpload(e);
}

// -------------------- HANDLER IMPLEMENTATIONS --------------------

// --- Upload Images ---
async function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    const status = document.getElementById('upload-status');
    if (status) { status.textContent = `מעלה ${files.length} תמונות...`; status.classList.remove('hidden', 'text-red-500'); }

    const results = await Promise.all(files.map(file => {
        const timestamp = Date.now();
        const storageRef = ref(storage, `trip-photos/${userId}/${timestamp}-${file.name}`);
        return uploadBytes(storageRef, file)
            .then(() => getDownloadURL(storageRef))
            .then(url => updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { photoAlbum: arrayUnion({ url, uploadedAt: timestamp, owner: userId }) }))
            .catch(e => ({ error: true, file: file.name }));
    }));

    const successCount = results.filter(r => !r?.error).length;
    const failCount = results.length - successCount;
    if (status) {
        status.textContent = failCount ? `הסתיימה ההעלאה. ${successCount} הצלחות, ${failCount} כישלונות.` : `כל ${successCount} התמונות הועלו בהצלחה!`;
        if(failCount > 0) status.classList.add('text-red-500');
        if (!failCount) setTimeout(() => status.classList.add('hidden'), 5000);
    }
}

// --- Load More Activities ---
async function handleLoadMore() {
    const btn = document.getElementById('load-more-btn');
    const filtered = currentData.activitiesData.filter(a => {
        const catMatch = currentCategoryFilter === 'all' || a.category === currentCategoryFilter;
        const timeMatch = currentTimeFilter === 'all' || (parseInt(currentTimeFilter) === 20 ? a.time <= 20 : parseInt(currentTimeFilter) === 40 ? a.time > 20 && a.time <= 40 : a.time > 40);
        return catMatch && timeMatch;
    });
    if (filtered.length > displayedActivitiesCount) { setDisplayedActivitiesCount(displayedActivitiesCount + ACTIVITIES_INCREMENT); renderActivities(); }
    else { btn.disabled = true; btn.innerHTML = '<div class="loader mx-auto"></div>'; await handleFindMoreWithGemini(); }
}

// --- Gemini AI Helpers ---
async function handleFindMoreWithGemini() {
    const prompt = createActivityPrompt(currentData.activitiesData.map(a => a.name));
    const btn = document.getElementById('load-more-btn');
    try {
        const resText = await callGeminiWithParts([{ text: prompt }]);
        const jsonString = resText.replace(/```json/g, '').replace(/```/g, '').trim();
        const newActivities = JSON.parse(jsonString);
        if (!Array.isArray(newActivities)) throw new Error("Invalid AI response");

        currentData.activitiesData.push(...newActivities);
        const stored = JSON.parse(localStorage.getItem('ai_added_activities')) || [];
        localStorage.setItem('ai_added_activities', JSON.stringify([...stored, ...newActivities]));
        setDisplayedActivitiesCount(currentData.activitiesData.length);
        renderActivities();
    } catch (e) { console.error("Gemini error:", e); alert("לא הצלחנו למצוא פעילויות נוספות כרגע."); }
    finally { if (btn) { btn.textContent = 'מצא הצעות נוספות עם AI ✨'; btn.disabled = false; } }
}

// --- Carousel ---
function handleCarousel(direction) {
    const carousel = document.getElementById('carousel-inner');
    if (!carousel || !currentData?.photoAlbum?.length) return;
    const matrix = new DOMMatrix(getComputedStyle(carousel).transform);
    const index = Math.round(Math.abs(matrix.m41) / carousel.clientWidth);
    const newIndex = direction === 'next' ? (index + 1) % currentData.photoAlbum.length : (index - 1 + currentData.photoAlbum.length) % currentData.photoAlbum.length;
    carousel.style.transform = `translateX(-${newIndex * 100}%)`;
}

// --- Itinerary Handlers ---
async function handleSwapActivity(button) {
    const { dayIndex, planType, itemIndex } = button.dataset;
    const plannedIds = new Set(currentData.itineraryData.flatMap(d => [...d.mainPlan.items, ...(d.alternativePlan?.items||[]), ...(d.alternativePlan2?.items||[])].map(i=>i.activityId)));
    const available = currentData.activitiesData.filter(a => !plannedIds.has(a.id) && a.category!=='בית מרקחת');
    if (!available.length) return alert("לא נמצאו פעילויות חלופיות!");
    const list = document.getElementById('swap-activity-list');
    list.innerHTML = available.map(a => `<button class="w-full text-right p-3 hover:bg-teal-100 rounded-md" data-id="${a.id}"><strong>${a.name}</strong> (${a.category})</button>`).join('');
    list.onclick = async e => {
        const btn = e.target.closest('button'); if (!btn) return;
        const newAct = available.find(a => a.id == btn.dataset.id);
        const updated = JSON.parse(JSON.stringify(currentData.itineraryData));
        updated[dayIndex-1][planType].items[itemIndex] = { activityId: newAct.id, description: newAct.description };
        await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { itineraryData: updated });
        document.getElementById('swap-activity-modal').classList.add('hidden');
    };
    openModal('swap-activity-modal');
}

async function handlePlanRequest(event) {
    const container = event.target.closest('[data-day-index]');
    const result = container.querySelector('.gemini-plan-result');
    const mainActivity = container.querySelector('h3')?.textContent.split(': ')[1] || '';
    result.classList.remove('hidden'); result.innerHTML = '<div class="loader"></div>';
    try { result.innerHTML = (await callGeminiWithParts([{ text: `Suggest a short, fun morning plan for a family with toddlers in Geneva, based around "${mainActivity}". Respond in Hebrew.` }])).replace(/\n/g,'<br>'); }
    catch(e){ result.innerHTML = 'שגיאה ביצירת התכנית.'; console.error(e); }
}

async function handleSummaryRequest(event) {
    const plan = event.target.closest('[data-day-index]').querySelector('.space-y-4')?.textContent || '';
    showTextResponseModal("סיכום לילדים", '<div class="loader"></div>');
    try {
        const prompt = `Summarize this daily plan for a 2 and 3-year-old. Use simple Hebrew and emojis. Plan: ${plan}`;
        document.getElementById('text-response-modal-content').innerHTML = (await callGeminiWithParts([{ text: prompt }])).replace(/\n/g,'<br>');
    } catch(e) { console.error(e); document.getElementById('text-response-modal-content').innerHTML = 'שגיאה בסיכום.'; }
}

async function handleStoryRequest(event) {
    const activity = event.target.closest('[data-day-index]').querySelector('h3')?.textContent.split(': ')[1] || '';
    openModal('story-modal', async () => {
        const content = document.getElementById('story-modal-content');
        content.innerHTML = '<div class="loader"></div>';
        try { content.innerHTML = (await callGeminiWithParts([{ text: `Write a short, happy bedtime story in Hebrew for toddlers Bar and Ran about their adventure at ${activity} in Geneva.` }])).replace(/\n/g,'<br>'); }
        catch(e){ content.innerHTML='שגיאה ביצירת הסיפור'; console.error(e); }
    });
}

// --- Packing Handlers ---
async function handleAddPackingItem() {
    const input = document.getElementById('new-item-input'); const category = document.getElementById('new-item-category-select')?.value; const name = input.value.trim();
    if (!name || !category) return;
    await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { [`packingListData.${category}`]: arrayUnion({ name, checked:false, imageUrl:null }) });
    input.value='';
}

async function handleRemovePackingItem(button) {
    const { category, name } = button.dataset;
    const newItems = currentData.packingListData[category].filter(i=>i.name!==name);
    await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { [`packingListData.${category}`]: newItems });
}

async function handleChecklistItemToggle(event) {
    const { category, name } = event.target.dataset;
    const items = [...currentData.packingListData[category]];
    const item = items.find(i=>i.name===name); if(item) item.checked=event.target.checked;
    await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { [`packingListData.${category}`]: items });
}

async function handlePackingItemImageUpload(event) {
    const file = event.target.files[0]; const { category, name } = event.target.dataset; if(!file || !userId) return;
    const btn = event.target.closest('.visual-packing-item').querySelector('.upload-item-image-btn');
    btn.innerHTML = '<div class="loader-small"></div>';
    try {
        const storageRef = ref(storage, `packing-item-images/${userId}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const items = [...currentData.packingListData[category]];
        const item = items.find(i=>i.name===name); if(item) item.imageUrl=url;
        await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { [`packingListData.${category}`]: items });
    } catch(e){ console.error(e); alert("העלאת התמונה נכשלה"); }
    finally{ btn.innerHTML = '<i class="fas fa-camera fa-2x"></i>'; }
}

async function handleUpdateListByTheme() {
    const theme = document.getElementById('theme-input')?.value.trim(); if(!theme) return;
    showTextResponseModal("עדכון חכם", '<div class="loader"></div>');
    try {
        const prompt = createPackingPrompt(currentData.packingListData, null, theme);
        const res = await callGeminiWithParts([{ text: prompt }]);
        const newItems = JSON.parse(res.replace(/```json/g,'').replace(/```/g,'').trim());
        const updates = {...currentData.packingListData};
        for(const cat in newItems){ if(!updates[cat]) updates[cat]=[]; newItems[cat].forEach(name=>{ if(!updates[cat].some(i=>i.name===name)) updates[cat].push({ name, checked:false, imageUrl:null }); }); }
        await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { packingListData: updates });
        showTextResponseModal("הרשימה עודכנה!", "ההצעות נוספו לרשימה שלך.");
    } catch(e){ console.error(e); showTextResponseModal("שגיאה", "לא ניתן היה לעדכן את הרשימה."); }
}

async function handleAddLuggage() {
    const name = document.getElementById('new-luggage-name')?.value.trim();
    const owner = document.getElementById('new-luggage-owner')?.value.trim();
    const size = document.getElementById('new-luggage-size')?.value.trim();
    if(!name || !owner) return alert("אנא מלאו שם ואחראי.");
    await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { luggageData: arrayUnion({ name, owner, size }) });
    document.getElementById('new-luggage-name').value='';
    document.getElementById('new-luggage-owner').value='';
    document.getElementById('new-luggage-size').value='';
}

async function handleRemoveLuggage(event) {
    const index = parseInt(event.currentTarget.dataset.index,10);
    const item = currentData.luggageData[index];
    if(item) await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { luggageData: arrayRemove(item) });
}

async function handleRecalculatePackingPlan() {
    const result = document.getElementById('packing-suggestion-result'); result.innerHTML='<div class="loader"></div>';
    const luggage = currentData.luggageData.map(l=>({name:l.name,owner:l.owner,size:l.size}));
    const prompt = createPackingPrompt(currentData.packingListData, luggage);
    try { result.innerHTML = (await callGeminiWithParts([{ text: prompt }])).replace(/### (.*?)\n/g,'<h4>$1</h4>').replace(/-\s(.*?)\n/g,'<li>$1</li>'); }
    catch(e){ console.error(e); result.innerHTML='<p class="text-red-500">שגיאה ביצירת התכנית.</p>'; }
}

async function handlePackingSuggestion() {
    const result = document.getElementById('packing-suggestion-result');
    const suitcaseFile = document.getElementById('suitcase-image-input')?.files[0];
    const itemsFile = document.getElementById('items-image-input')?.files[0];
    if(!suitcaseFile || !itemsFile) return;
    result.innerHTML='<div class="loader"></div>';
    try { result.innerHTML = (await analyzePackingImages(suitcaseFile, itemsFile)).replace(/\n/g,'<br>'); }
    catch(e){ console.error(e); result.innerHTML='<p class="text-red-500">שגיאה בקבלת ההצעה.</p>'; }
}

// --- Nearby Handler ---
function handleFindNearby() {
    openModal('nearby-modal', () => {
        const results = document.getElementById('nearby-results');
        results.innerHTML='<p>מאתר מיקום...</p>';
        if(!navigator.geolocation){ results.innerHTML='<p>שירותי מיקום אינם נתמכים.</p>'; return; }
        navigator.geolocation.getCurrentPosition(pos=>findAndDisplayNearby(pos.coords.latitude,pos.coords.longitude),()=>results.innerHTML='<p>לא ניתן היה לקבל את מיקומך.</p>');
    });
}

// --- Misc Handlers ---
async function handlePostBulletinMessage() {
    const input = document.getElementById('bulletin-input'); const text = input.value.trim(); if(!text) return;
    await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { bulletinBoard: arrayUnion({ text, timestamp: Date.now() }) });
    input.value='';
}

async function handleAddExpense() {
    const desc = document.getElementById('expense-desc')?.value.trim(); const amount = document.getElementById('expense-amount')?.value.trim();
    if(!desc || !amount) return;
    await updateDoc(doc(db, `artifacts/lipetztrip-guide/public/genevaGuide`), { expenses: arrayUnion({ desc, amount: parseFloat(amount), category: "General", timestamp: Date.now() }) });
    document.getElementById('expense-desc').value=''; document.getElementById('expense-amount').value='';
}

function handleCurrencyConversion(e) { document.getElementById('currency-ils').value = (e.target.value*4.1).toFixed(2); }
function handleShareWhatsApp() { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`תכנון הטיול שלנו לז'נבה: ${window.location.href}`)}`,'_blank'); }
function handleAddToCalendar() {
    const params = new URLSearchParams({ action:'TEMPLATE', text:'טיול משפחתי לז\'נבה', dates:'20250824/20250830', details:`קישור למדריך: ${window.location.href}`, location:'Geneva, Switzerland' });
    window.open(`https://www.google.com/calendar/render?${params.toString()}`,'_blank');
}

