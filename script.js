// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Global State
let db, auth, storage, userId, unsubscribeChat;
let currentData = {
    activitiesData: [],
    flightData: {},
    familyData: [],
    packingListData: [],
    luggageData: [],
    dailySpecials: {},
    itineraryData: [],
    packingAssistant: {}
};
let map = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    fetchAndRenderWeather();
    setupEventListeners();
    updateProgressBar();
    setInterval(updateProgressBar, 60000);
});

async function initFirebase() {
    try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        onAuthStateChanged(auth, user => {
            if (user) {
                userId = user.uid;
                loadAndRenderAllData();
                loadChatHistory(userId);
            } else {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
            }
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

// --- DATA LOADING & RENDERING ---

function loadAndRenderAllData() {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);

    onSnapshot(publicDataRef, (docSnap) => {
        if (docSnap.exists()) {
            currentData = { ...currentData, ...docSnap.data() };
            renderAllComponents();
        } else {
            console.log("No guide data found in Firestore.");
        }
    }, (error) => console.error("Error fetching guide data:", error));
}

function renderAllComponents() {
    renderActivities();
    renderItinerary();
    renderChecklist();
    renderLuggage();
    displayDailyAttraction();
    populateFlightDetails();
    populateFamilyDetails();
    renderPackingAssistant();
    initMap();
}

// ... (Add all individual render functions here: renderActivities, renderItinerary, etc.)
// Example:
function renderActivities() {
    const grid = document.getElementById('activities-grid');
    // ... logic to filter and render currentData.activitiesData
}

// ... other render functions

// --- FIRESTORE UPDATE FUNCTIONS ---

async function updatePackingListItem(itemId, isChecked) {
    const updatedList = currentData.packingListData.map(item =>
        item.id === itemId ? { ...item, checked: isChecked } : item
    );
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    await updateDoc(publicDataRef, { packingListData: updatedList });
}

async function updatePackingAssistant(suggestionText, suitcaseImageURL, itemsImageURL) {
     const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    await updateDoc(publicDataRef, {
        packingAssistant: {
            suggestionText,
            suitcaseImageURL,
            itemsImageURL
        }
    });
}

// --- EVENT HANDLERS & LOGIC ---

// ... (Add all event handlers like handleChatSend, handlePackingSuggestion, etc.)
// Example:
async function handlePackingSuggestion() {
    // ... logic to get images, call Gemini, and then call updatePackingAssistant
}

// --- API CALLS ---
async function callGeminiWithParts(parts) {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts }] })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result.text;
    } catch (error) {
        console.error("Error calling serverless function:", error);
        return "אופס, משהו השתבש. אנא נסה שוב מאוחר יותר.";
    }
}

