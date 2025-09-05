import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { renderAllComponents } from './ui.js?v=1757102727628';
import { setupEventListeners } from './handlers.js?v=1757102727628';
import { setupGeminiChat } from "./Gemini.js?v=1757102727628";

// --- Global State ---
export let db, auth, storage, userId;
export let currentData = { activitiesData: [] };
export let currentCategoryFilter = 'all';
export let currentTimeFilter = 'all';
export let newlyAddedItems = new Set();
export const appId = "lipetztrip-guide";

// Map state for Leaflet integration
export let map = null;
export function setMap(newMap) { map = newMap; }

// --- State Modifiers ---
export function addNewlyAddedItem(id) { try { newlyAddedItems.add(id); } catch (e) {} }
export function clearNewlyAddedItems() { newlyAddedItems = new Set(); }
export function setCurrentCategoryFilter(filter) { 
    currentCategoryFilter = filter; 
    if (typeof window !== 'undefined') window.currentCategoryFilter = filter;
}
export function setCurrentTimeFilter(filter) { 
    currentTimeFilter = filter; 
    if (typeof window !== 'undefined') window.currentTimeFilter = filter;
}

// --- Initialize Global UI State ---
if (typeof window !== 'undefined') {
    window.displayedActivitiesCount = 6; // Initial number of activities to display
    window.currentCategoryFilter = currentCategoryFilter;
    window.currentTimeFilter = currentTimeFilter;
}

// --- INITIALIZATION ---
if (typeof window !== 'undefined') {
    if (window.__APP_BOOTSTRAPPED__) {
        console.log('App already bootstrapped, skipping');
    } else {
        window.__APP_BOOTSTRAPPED__ = true;
        document.addEventListener('DOMContentLoaded', initApp);
    }
}

async function initApp() {
    try {
        const response = await fetch('/api/get-config');
        if (!response.ok) throw new Error('Failed to get Firebase config');
        const firebaseConfig = await response.json();
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        console.log("Firebase initialized successfully");
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log("User signed in:", userId);
                setupFirebaseListeners();
            } else {
                console.log("No user signed in, attempting anonymous sign-in");
                signInAnonymously(auth).catch(error => {
                    console.warn("Anonymous sign-in failed:", error);
                    // Continue without auth for basic functionality
                    setupBasicApp();
                });
            }
        });
        
    } catch (error) {
        console.warn("Firebase initialization failed:", error);
        // Continue without Firebase for static functionality
        setupBasicApp();
    }
}

function setupBasicApp() {
    console.log("Setting up basic app without Firebase");
    setupEventListeners();
    setupGeminiChat();
    
    // Load demo data for basic functionality
    currentData = {
        activitiesData: [],
        itineraryData: [],
        flightData: { bookingRef: "Demo Mode" },
        hotelData: { name: "Demo Hotel", bookingRef: "DEMO123" },
        familyData: [{ name: "Demo Family", passport: "DEMO" }],
        packingListData: {},
        bulletinBoard: [],
        photoAlbum: [],
        familyMemories: [],
        interactivePacking: []
    };
    
    renderAllComponents();
}

function setupFirebaseListeners() {
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    
    onSnapshot(publicDataRef, (snapshot) => {
        if (snapshot.exists()) {
            currentData = { ...currentData, ...snapshot.data() };
            console.log("Data updated from Firebase:", Object.keys(currentData));
            renderAllComponents();
        } else {
            console.log("No Firebase data found, using defaults");
            setupBasicApp();
        }
    }, (error) => {
        console.warn("Firebase listener error:", error);
        setupBasicApp();
    });
    
    setupEventListeners();
    setupGeminiChat();
}