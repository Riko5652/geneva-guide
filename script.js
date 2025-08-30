// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Global State
let db, auth, storage, userId, unsubscribeChat;
let currentData = null; // Initialize as null
let map = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Fetch the configuration from our secure serverless function using the API redirect
        const response = await fetch('/api/get-config');
        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Failed to fetch Firebase config: ${err.error}`);
        }
        const firebaseConfig = await response.json();

        // Now initialize Firebase with the fetched config
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        // All other initializations are now chained after successful connection
        initializeAppLogic();

    } catch (error) {
        console.error("Critical Initialization Failed:", error);
        document.body.innerHTML = `<div style="padding: 2rem; text-align: center;"><h1>Application Error</h1><p>Could not initialize Firebase. Please ensure environment variables are set correctly in Netlify and redeploy.</p><p><i>${error.message}</i></p></div>`;
    }
}

function initializeAppLogic() {
    onAuthStateChanged(auth, user => {
        if (user) {
            userId = user.uid;
            // Load all data from Firestore and then render the UI
            loadAndRenderAllData();
            loadChatHistory(userId);
        } else {
            signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
        }
    });

    // These setups can happen once the page loads, as they don't depend on data initially
    setupEventListeners();
    fetchAndRenderWeather();
    setInterval(updateProgressBar, 60000);
}


// --- DATA LOADING & RENDERING ---
function loadAndRenderAllData() {
    const appId = "lipetztrip-guide"; // This should match the app_id from your seed script
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);

    onSnapshot(publicDataRef, (docSnap) => {
        if (docSnap.exists()) {
            currentData = docSnap.data();
            // This function is now called only when data is available
            renderAllComponents();
        } else {
            console.error("Guide data document not found in Firestore. Did you run the seed script?");
            document.getElementById('itinerary-container').innerText = 'Data not found.';
            document.getElementById('activities-grid').innerText = 'Data not found.';
        }
    }, (error) => console.error("Error fetching guide data:", error));
}

function renderAllComponents() {
    if (!currentData) return;
    renderActivities();
    //... call all other render functions here
    updateProgressBar(); // Initial call with correct dates
    initMap();
}

// ... Rest of your functions (renderActivities, handleChatSend, updateProgressBar, etc.) remain here
// Make sure to add checks for `if (!currentData) return;` at the top of functions that rely on it.

async function fetchAndRenderWeather() {
    // This function is now safe to call
    // ... same weather fetching logic
}

function updateProgressBar() {
    // This function needs flight data, so ensure it's available
    if (!currentData || !currentData.flightData) return;
    // ... same progress bar logic
}

function initMap() {
    if (map || !currentData || !currentData.activitiesData) return;
    // ... same map initialization logic
}


// ... include all your other functions ...

// Make sure to define setupEventListeners, renderActivities, handleChatSend, etc.

function setupEventListeners() {
    // Add your event listeners here
}

function renderActivities() {
    if (!currentData || !currentData.activitiesData) return;
    const grid = document.getElementById('activities-grid');
    if (!grid) return;
    grid.innerHTML = currentData.activitiesData.map(activity => createActivityCard(activity)).join('');
}

function createActivityCard(activity) {
    // Your logic to create an activity card HTML string
    return `<div>${activity.name}</div>`; // Placeholder
}


// --- API CALLS ---
async function callGeminiWithParts(parts) {
    try {
        // Use the API redirect for the Gemini function as well
        const response = await fetch('/api/gemini', {
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

