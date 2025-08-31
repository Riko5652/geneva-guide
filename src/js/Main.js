// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

import { renderAllComponents } from './ui.js';
import { setupEventListeners } from './handlers.js';

// --- Global State ---
export let db, auth, storage, userId;
// **CHANGE**: Initializing currentData with a default structure to prevent errors
export let currentData = {
    activitiesData: [],
    itineraryData: [],
    packingListData: {},
    luggageData: [],
    photoAlbum: [],
    expenses: [],
    bulletinBoard: []
};
export let map = null;
export let currentCategoryFilter = 'all';
export let currentTimeFilter = 'all';
export let displayedActivitiesCount = 6;
export const ACTIVITIES_INCREMENT = 6;

// --- State Modifiers ---
export function setMap(newMap) { map = newMap; }
export function setCurrentCategoryFilter(filter) { currentCategoryFilter = filter; }
export function setCurrentTimeFilter(filter) { currentTimeFilter = filter; }
export function setDisplayedActivitiesCount(count) { displayedActivitiesCount = count; }

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
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h1>Application Error</h1>
                <p>Could not initialize Firebase.</p>
                <p><i>${error.message}</i></p>
            </div>
        `;
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

function loadAndRenderAllData() {
    const appId = "lipetztrip-guide";
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);

    onSnapshot(publicDataRef, (docSnap) => {
        if (docSnap.exists()) {
            // Overwrite the initial empty data with the real data from Firebase
            currentData = docSnap.data();

            // Ensure activitiesData array exists to be safe
            currentData.activitiesData = Array.isArray(currentData.activitiesData) ? currentData.activitiesData : [];

            // Merge AI-added activities from localStorage
            try {
                const storedAiActivities = JSON.parse(localStorage.getItem('ai_added_activities'));
                if (Array.isArray(storedAiActivities)) {
                    const existingIds = new Set(currentData.activitiesData.map(a => a.id));
                    const uniqueNewActivities = storedAiActivities.filter(a => !existingIds.has(a.id));
                    currentData.activitiesData.push(...uniqueNewActivities);
                }
            } catch (e) {
                console.warn("Failed to parse AI activities from localStorage:", e);
            }

            renderAllComponents();
            setupEventListeners(); // Setup listeners after first render
        } else {
            console.error("Guide data not found. Run seed script.");
            const mainEl = document.querySelector('main');
            if (mainEl) {
                mainEl.innerHTML = '<p class="text-center text-red-500 font-bold p-8">Data not found in database.</p>';
            }
        }
    }, (error) => {
        console.error("Error fetching guide data:", error);
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.innerHTML = `<p class="text-center text-red-500 font-bold p-8">Error loading data: ${error.message}</p>`;
        }
    });
}

