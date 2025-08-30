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
            const errText = await response.text();
            throw new Error(`Failed to fetch Firebase config: ${errText}`);
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
            // The problematic function call below is now removed.
            // loadChatHistory(userId); 
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
            const mainContent = document.querySelector('main');
            if (mainContent) {
                 mainContent.innerHTML = '<p class="text-center text-red-500 font-bold p-8">Data not found in database. Please run the seed script.</p>';
            }
        }
    }, (error) => console.error("Error fetching guide data:", error));
}

function renderAllComponents() {
    if (!currentData) return;
    
    // Call all rendering functions that depend on the data
    renderActivities();
    updateProgressBar(); // Initial call with correct dates
    initMap();
    // Add other rendering functions here as needed
    // e.g., populateFlightDetails(), populateFamilyDetails(), etc.
}


// --- DUMMY/PLACEHOLDER FUNCTIONS (to be replaced with actual logic) ---
// Note: Many of these were in the original HTML but need to be defined here.

function fetchAndRenderWeather() {
    console.log("Fetching weather...");
    // Actual weather fetching logic would go here
    const weatherContainer = document.getElementById('weather-forecast');
    if (weatherContainer) weatherContainer.innerHTML = "<p>Weather data will be loaded here.</p>";
}

function updateProgressBar() {
    if (!currentData || !currentData.flightData) {
        console.log("Waiting for flight data to update progress bar...");
        return;
    }
    // Actual progress bar logic using currentData.flightData
    const progressBarText = document.getElementById('progress-bar-text');
    if (progressBarText) progressBarText.textContent = "Trip progress loaded.";
}

function initMap() {
    if (map) return; // a map has been initialized
    if (!currentData || !currentData.activitiesData) {
        console.log("Waiting for activities data to initialize map...");
        return;
    }
    const mapContainer = document.getElementById('map');
    if (mapContainer && L) { // Check if Leaflet is loaded
        console.log("Initializing map...");
        map = L.map('map').setView([46.204391, 6.143158], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Add markers based on data
        currentData.activitiesData.forEach(activity => {
             if (activity.lat && activity.lon) {
                L.marker([activity.lat, activity.lon]).addTo(map).bindPopup(activity.name);
             }
        });
    }
}

function renderActivities() {
    if (!currentData || !currentData.activitiesData) return;
    const grid = document.getElementById('activities-grid');
    if (!grid) return;
    grid.innerHTML = currentData.activitiesData.map(activity => createActivityCard(activity)).join('');
}

function createActivityCard(activity) {
    // A simplified card for demonstration
    return `
        <div class="card bg-white p-4 rounded shadow">
            <h3 class="font-bold">${activity.name}</h3>
            <p>${activity.description}</p>
        </div>
    `;
}

function setupEventListeners() {
    console.log("Setting up event listeners...");
    // A real app would have all button/modal listeners here.
    // Example:
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.nav-gemini-btn')) {
            const modal = document.getElementById('gemini-chat-modal');
            if (modal) modal.classList.add('flex');
        }
        if (e.target.matches('#close-gemini-modal-btn')) {
             const modal = document.getElementById('gemini-chat-modal');
            if (modal) modal.classList.remove('flex');
        }
    });
}

// --- API CALLS ---
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
        // Assuming the serverless function now returns the text directly in a `text` property
        return result.text || "No text found in response.";
    } catch (error) {
        console.error("Error calling serverless function:", error);
        return "אופס, משהו השתבש. אנא נסה שוב מאוחר יותר.";
    }
}

