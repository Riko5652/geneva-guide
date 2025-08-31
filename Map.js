import { currentData, map, setMap } from './main.js';

/**
 * --- Map Initialization ---
 * יוצר או מאפס את המפה עם markers למלון ולפעילויות.
 */
export function initMap() {
    if (!L) return; // Leaflet לא נטען
    let localMap = map;

    // מחיקת markers קיימים אם המפה כבר קיימת
    if (localMap) {
        localMap.eachLayer(layer => {
            if (!!layer.toGeoJSON) localMap.removeLayer(layer);
        });
    } else {
        if (!document.getElementById('map')) return;
        localMap = L.map('map', { zoomControl: true, attributionControl: true });
        setMap(localMap);
    }

    const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };
    localMap.setView([hotelLocation.lat, hotelLocation.lon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(localMap);

    const hotelIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const activityIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // סמן המלון
    L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon })
        .addTo(localMap)
        .bindTooltip(`<div dir="rtl"><b>${hotelLocation.name}</b><br>נקודת המוצא שלכם!</div>`)
        .openTooltip();

    // סמני פעילויות
    currentData?.activitiesData?.forEach(activity => {
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon], { icon: activityIcon })
                .addTo(localMap)
                .bindTooltip(`<div dir="rtl"><b>${activity.name ?? ''}</b><br>כ-${activity.time ?? '?'} דקות נסיעה מהמלון</div>`);
        }
    });
}

/**
 * --- Nearby Points ---
 * מוצא ומציג פעילות קרובה בהתאם למיקום המשתמש.
 */
export function findAndDisplayNearby(latitude, longitude) {
    if (!currentData?.activitiesData) return;
    const resultsContainer = document.getElementById('nearby-results');
    if (!resultsContainer) return;

    const nearbyPlaces = currentData.activitiesData
        .filter(place => ['משחקייה', 'חוץ', 'בית מרקחת'].includes(place.category) && place.lat && place.lon)
        .map(place => ({ ...place, calculatedDistance: calculateDistance(latitude, longitude, place.lat, place.lon) }))
        .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

    const playgrounds = nearbyPlaces.filter(p => ['משחקייה','חוץ'].includes(p.category)).slice(0,5);
    const pharmacies = nearbyPlaces.filter(p => p.category==='בית מרקחת').slice(0,3);

    resultsContainer.innerHTML = `
        <div dir="rtl">
            <h4 class="font-bold text-lg mb-2">משחקיות ופארקים קרובים:</h4>
            <ul class="list-disc pr-5 space-y-1">
                ${playgrounds.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance?.toFixed(1) ?? '?'} ק"מ</li>`).join('')}
            </ul>
        </div>
        <div class="border-t pt-4 mt-4" dir="rtl">
            <h4 class="font-bold text-lg mb-2">בתי מרקחת קרובים:</h4>
            <ul class="list-disc pr-5 space-y-1">
                ${pharmacies.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance?.toFixed(1) ?? '?'} ק"מ</li>`).join('')}
            </ul>
        </div>`;
}

/**
 * --- Helper: Calculate Distance ---
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    if ([lat1,lon1,lat2,lon2].some(v => v == null)) return 0;
    const R = 6371; // km
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
