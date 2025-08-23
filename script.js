// =================================================================================
// DATA
// =================================================================================

// Data for all activities and points of interest
const activitiesData = [
    { id: 1, name: 'Just Bloom', category: 'משחקייה', time: 35, transport: 'רכבת + הליכה', address: 'Rue de la Cité 24, 1204 Genève', description: 'בית קפה-משחקייה מסוגנן ואיכותי בלב העיר.', image: 'https://lh3.googleusercontent.com/p/AF1QipMXnZC1n-voXjVFzSsI3FgGFAaurrGx_U0qD-Vm=w408-h544-k-no', link: 'https://justbloom.ch/', lat: 46.2048, lon: 6.1459, cost: 'בתשלום (לפי צריכה)', openingHours: { 'Monday-Saturday': '09:00-18:00', 'Sunday': '10:00-17:00' }, whatToBring: ['חיתולים ומגבונים', 'בגדים להחלפה', 'בקבוק מים'] },
    { id: 2, name: 'Vitam Parc', category: 'משחקייה', time: 55, transport: 'רכבת + אוטובוס', address: '500 Rte des Envignes, 74160 Neydens, France', description: 'מתחם ענק בצרפת עם אזור פנטסטי לפעוטות.', image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqJpKF7GxCaLnlYnWlBrI7rDgldY3g6-4OBKZY9Z8nTeMDZV4S10z0A_NrNDZxNGIrHk3H3u6Ps8IAVpEeXPdeuEIr_7BUicVnCZUsngmqrhFLz9HI_okiyJaLYFypOCgiv-lw=w408-h306-k-no', link: 'https://www.vitam.fr/', lat: 46.1257, lon: 6.1181, cost: 'בתשלום (יש לבדוק באתר)', openingHours: { 'Everyday': '10:00-20:00' }, whatToBring: ['תיק החתלה מלא', 'חטיפים ואוכל', 'בגדי ים (לאזור המים)', 'גרביים למשחקייה'] },
    { id: 4, name: 'C5 Kids Party', category: 'משחקייה', time: 65, transport: 'רכבת + אוטובוס', address: '1 Rue de la Gabelle, 74100 Annemasse, France', description: 'פארק משחקים מודרני בצרפת עם אזור ייעודי לפעוטות.', image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4noS5YpRDqNpFkhUsOLUKYy5cTv-iqGnL7GrWy_Rl155uTjkNrNp_RnhsMHV8i3yBEtrLCts8Nw6j5V1yEkxWi9YbsfplcyPYWgY_6OgrTQkFI2pH3WfURz6soSHJV8UTgAwY3KY=w203-h152-k-no', link: 'https://c5kidsparty.com/', lat: 46.1973, lon: 6.2368, cost: 'בתשלום (יש לבדוק באתר)', openingHours: { 'Wednesday-Sunday': '10:00-19:00' }, whatToBring: ['תיק החתלה מלא', 'חטיפים', 'גרביים'] },
    { id: 5, name: 'Bubbles Kids Club', category: 'משחקייה', time: 45, transport: 'רכבת + אוטובוס', address: 'Rte de Frontenex 62, 1207 Genève', description: 'מועדון פרימיום איכותי עם משחק חופשי ואזור מאובזר.', image: 'https://bubblesclub.ch/wp-content/uploads/2023/02/Bubbles-kids-scaled.jpg', link: 'https://bubblesclub.ch/', lat: 46.203, lon: 6.159, cost: 'כ-20 CHF לשעתיים', openingHours: { 'Tuesday-Saturday': '09:00-18:00' }, whatToBring: ['חיתולים ומגבונים', 'בגדים להחלפה', 'בקבוק מים'] },
    { id: 6, name: 'TOTEM Escalade', category: 'משחקייה', time: 15, transport: 'הליכה או אוטובוס', address: 'Rue des Lattes 30, 1217 Meyrin', description: 'אולם טיפוס ענק במיירין עם "אזור ילדים" מדהים.', image: 'https://lh3.googleusercontent.com/p/AF1QipPAyNsS1b9S8-9fhBGMa7eFnMVQOnktiirzokOj=w408-h305-k-no', link: 'https://totem.ch/my', lat: 46.2255, lon: 6.0712, cost: 'כ-10 CHF לילד', openingHours: { 'Monday-Friday': '12:00-22:00', 'Saturday-Sunday': '10:00-20:00' }, whatToBring: ['בגדים נוחים לטיפוס', 'בקבוק מים', 'נעלי ספורט'] },
    { id: 7, name: 'Airloop', category: 'משחקייה', time: 50, transport: 'רכבת + חשמלית', address: 'Rte des Jeunes 10, 1227 Carouge', description: 'פארק טרמפולינות עם אזור ייעודי לפעוטות.', image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4noj60sKpcHQbwJ9tTwVnjAbkRyN0GPav27xbET_wSLWzz7VdcpVyFuqo5n-eWCeRyqXmYNNo-yD9afsILY6_9bzIu7ioNuHAq8oWnfoBWyB01yMUVFoxiKfKyfBOzDblAdON_E=w426-h240-k-no', link: 'https://www.airloop.ch/en/homepage', lat: 46.177, lon: 6.123, cost: 'כ-10 CHF לפעוט', openingHours: { 'Wednesday-Sunday': '10:00-19:00' }, whatToBring: ['גרביים מיוחדות (ניתן לקנות במקום)', 'בגדים נוחים', 'הרבה מים'] },
    { id: 9, name: 'מוזיאון הטבע', category: 'תרבות', time: 45, transport: 'רכבת + אוטובוס', address: 'Rte de Malagnou 1, 1208 Genève', description: 'דיורמות מרשימות של פוחלצים.', image: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=Rq9p9JmZtBfCTSYUq8--eA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=57.40184&pitch=0&thumbfov=100', link: 'https://www.museum-geneve.ch/', lat: 46.2006, lon: 6.1607, cost: 'חינם (תערוכות קבועות)', openingHours: { 'Tuesday-Sunday': '10:00-17:00' }, whatToBring: ['תיק החתלה', 'חטיפים שקטים', 'עגלה נוחה לניווט'] },
    { id: 10, name: 'La Maison de la Créativité', category: 'תרבות', time: 55, transport: 'רכבת + חשמלית', address: 'Rte de Chêne 7, 1223 Cologny', description: 'וילה קסומה המוקדשת למשחק חופשי ויצירתיות.', image: 'https://lh3.googleusercontent.com/p/AF1QipPJpFGXygKM8Z2YGwbFe3OHb_pghexQ8VxZS6XA=w408-h306-k-no', link: 'https://maisondelacreativite.ch/', lat: 46.179, lon: 6.176, cost: 'בתשלום (יש לבדוק באתר)', openingHours: { 'Wednesday-Thursday': '09:30-11:30, 14:00-17:00', 'Sunday': '10:00-12:00, 14:00-17:00' }, whatToBring: ['בגדים שלא אכפת שיתלכלכו', 'מגבונים', 'סקרנות ודמיון'] },
    { id: 11, name: 'MAMCO', category: 'תרבות', time: 35, transport: 'רכבת + הליכה', address: 'Rue des Bains 10, 1205 Genève', description: 'סיור מודרך מותאם לפעוטות במוזיאון לאמנות מודרנית.', image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrinx_hH6m4bTvOHy2IU8E8V-p50vx4AJFLArKyCty2A1rS_qDzss6AtDFz5B5xrJutAHIVdgrMttDo5j39VZ4gPEH0fm3bbeEJB1F7cTzwRi8ef1_IbGXQYuPoL5BP6jTejfPD=w408-h543-k-no', link: 'https://www.mamco.ch/en/', lat: 46.199, lon: 6.138, cost: 'חינם (בתיאום מראש)', openingHours: { 'Tuesday-Sunday': '11:00-18:00' }, whatToBring: ['תיק החתלה', 'מנשא (יכול להיות נוח יותר מעגלה)'] },
    { id: 12, name: 'תיאטרון הבובות', category: 'תרבות', time: 40, transport: 'רכבת + הליכה', address: 'Rue Rodo 3, 1205 Genève', description: 'הצגות קסומות לילדים. יש לבדוק התאמה לגילאי 2+.', image: 'https://www.marionnettes.ch/sites/default/files/styles/w1024/public/spectacles/2021-03/2019_TMG_LaPromesse_c_Eliphas_01.jpg?itok=zQ-a-6xJ', link: 'https://www.marionnettes.ch/', lat: 46.202, lon: 6.143, cost: 'בתשלום (יש לבדוק באתר)', openingHours: { 'Varies by show': 'Check website' }, whatToBring: ['חטיף שקט', 'שתיה', 'סבלנות'] },
    { id: 13, name: 'Ludothèque de Meyrin', category: 'משחקייה', time: 15, transport: 'הליכה או אוטובוס', address: 'Av. de Vaudagne 18, 1217 Meyrin', description: 'ספריית צעצועים ציבורית. חוויה אותנטית ורגועה.', image: 'https://lh3.googleusercontent.com/p/AF1QipNQtGaxn5GS5hNT6lNRGoPGq96K3t3fwyNv3ESJ=w408-h306-k-no', link: 'https://www.meyrin.ch/ludotheques', lat: 46.229, lon: 6.079, cost: 'חינם למשחק במקום', openingHours: { 'Monday': '15:00-18:00', 'Wednesday': '10:00-12:00, 14:00-18:00', 'Friday': '15:00-18:00' }, whatToBring: ['חיתולים ומגבונים', 'שתיה'] },
    { id: 14, name: 'Un R de Famille', category: 'קפה', time: 40, transport: 'רכבת + חשמלית', address: 'Rue Goetz-Monin 10, 1205 Genève', description: 'מסעדה למשפחות עם פינת משחקים חמודה.', image: 'https://lh3.googleusercontent.com/p/AF1QipOgmWF6KtT8O-hBPNj4_5YdFO6vLF1S4tvubpNh=w203-h135-k-no', link: 'https://unrdefamille.ch/', lat: 46.197, lon: 6.142, cost: 'עלות האוכל/שתיה', openingHours: { 'Tuesday-Saturday': '10:00-23:00' }, whatToBring: ['תיק החתלה', 'תיאבון'] },
    { id: 15, name: 'Parc des Bastions', category: 'חוץ', time: 40, transport: 'רכבת + הליכה', address: 'Prom. des Bastions 1, 1204 Genève', description: 'פארק יפהפה במרכז העיר עם גן שעשועים.', image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq5wqRSf-GHeg_0e53yzzd2jI6VkGdAltRVn8xjOWdAlq6WptaivMDGGZD_IzeGrNw2PVNPsyoUqo-88W_NlU5uFnOmJXzgrsI7VM0rnukorshUky-vdLb0RaO-1c5kgL-wdMYf=w408-h544-k-no', link: 'https://www.geneve.ch/fr/parc-bastions', lat: 46.200, lon: 6.146, cost: 'חינם', openingHours: { 'Everyday': '24/7' }, whatToBring: ['קרם הגנה וכובעים', 'שמיכת פיקניק', 'חטיפים ושתיה', 'כדור או צעצועים לחול'] },
    { id: 16, name: 'Bois de la Bâtie', category: 'חוץ', time: 45, transport: 'רכבת + אוטובוס', address: 'Chem. de la Bâtie, 1202 Genève', description: 'פארק גדול עם גן חיות קטן וחמוד (כניסה חופשית).', image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4no9mdhSxIANhw49JOEP16IFiu44z_lzEYD8B9sR-euhziGbVsobws0YRQbP6S3ilXWsA-x2L3LVxE2FCsuHw17_zDqrIedIs77PeIWZGI9ZGfQ2Mir7fOBEEW3ZXzF8avtp1VHx=w426-h240-k-no', link: 'https://www.geneve.ch/fr/parc-bastions', lat: 46.194, lon: 6.128, cost: 'חינם', openingHours: { 'Park': '24/7', 'Animal Park': '08:00-18:00' }, whatToBring: ['נעלי הליכה נוחות', 'מים וחטיפים', 'עגלה עמידה לשבילים'] },
    { id: 17, name: 'Pharmacie Principale Gare Cornavin', category: 'בית מרקחת', time: 20, transport: 'רכבת', address: 'Pl. de Cornavin 7, 1201 Genève', description: 'בית מרקחת גדול ומרכזי בתחנת הרכבת הראשית.', image: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Pharmacie_Principale_Gen%C3%A8ve_Cornavin.JPG', link: '#', lat: 46.210, lon: 6.142, cost: '-' },
    { id: 18, name: 'Pharmacie de la Bergère (Meyrin)', category: 'בית מרקחת', time: 10, transport: 'הליכה', address: 'Rue de la Bergère 12, 1217 Meyrin', description: 'בית מרקחת שכונתי קרוב למלון.', image: 'https://placehold.co/600x400/F3EFEA/4A4A4A?text=בית+מרקחת', link: '#', lat: 46.219, lon: 6.075, cost: '-' },
    { id: 19, name: 'Aquatis Aquarium-Vivarium', category: 'תרבות', time: 60, transport: 'רכבת', address: 'Route de Berne 144, 1010 Lausanne', description: 'האקווריום הגדול באירופה למים מתוקים, חוויה מרתקת.', image: 'https://www.aquatis.ch/wp-content/uploads/2019/07/AQUATIS_parcours_01-scaled.jpg', link: 'https://www.aquatis.ch/', lat: 46.5335, lon: 6.6503, cost: 'בתשלום (יש לבדוק באתר)', openingHours: { 'Everyday': '10:00-18:00' }, whatToBring: ['עגלה נוחה', 'תיק החתלה', 'חטיפים ושתיה'] }
];

// Detailed flight information
const flightData = {
    outbound: [
        { from: 'תל אביב (TLV)', to: 'אתונה (ATH)', date: '2025-08-24', time: '14:00 - 16:15', airline: 'Israir', flightNum: '6H567', airlineRef: 'ASLZDC', status: 'On Time', checkin: 'https://myisrair.israir.co.il/Account' },
        { from: 'אתונה (ATH)', to: 'ז\'נבה (GVA)', date: '2025-08-24', time: '20:45 - 22:45', airline: 'easyJet', flightNum: 'EZS1472', airlineRef: 'KB1ZR6T', status: 'On Time', checkin: 'https://www.easyjet.com/en/manage/viewbooking?bookingReference=KB1ZR6T&passengerLogin=true' }
    ],
    inbound: [
        { from: 'ז\'נבה (GVA)', to: 'אתונה (ATH)', date: '2025-08-29', time: '06:20 - 10:05', airline: 'easyJet', flightNum: 'EZS1471', airlineRef: 'KB1ZR6H', status: 'On Time', checkin: 'https://www.easyjet.com/en/manage/viewbooking?bookingReference=KB1ZR6H&passengerLogin=true' },
        { from: 'אתונה (ATH)', to: 'תל אביב (TLV)', date: '2025-08-29', time: '12:00 - 14:00', airline: 'Blue Bird Airways', flightNum: 'BZ701', airlineRef: '3053CA47', status: 'Delayed', checkin: 'https://booking.bluebirdair.com/booking/3CA477C5-9410-47E3-869D-385AD2531207' }
    ],
    connections: {
        outbound: '4 שעות ו-30 דקות (העברה עצמית)',
        inbound: 'שעה ו-55 דקות (העברה עצמית - <strong>קצר מאוד!</strong>)'
    },
    passengers: [
        { name: 'Adi Pnina Lipetz', ticket: '818-2747537094', seatOutbound1: '26A', seatOutbound2: '28D', seatInbound1: '17B', seatInbound2: '29B', baggage: '1x8kg Carry-on' },
        { name: 'Bar Lipetz', ticket: '818-2747537097', seatOutbound1: '26C', seatOutbound2: '28E', seatInbound1: '17C', seatInbound2: '29D', baggage: 'Small Carry-on' },
        { name: 'Dor Lipetz', ticket: '818-2747537096', seatOutbound1: '26B', seatOutbound2: '28C', seatInbound1: '17A', seatInbound2: '29A', baggage: '1x20kg Checked + Large Carry-on' },
        { name: 'Ran Lipetz', ticket: '818-2747537095', seatOutbound1: '26D', seatOutbound2: '28F', seatInbound1: '17D', seatInbound2: '29C', baggage: 'Small Carry-on' }
    ]
};

// Family passport details
const familyData = [
    { name: 'דור ליפץ', passport: '23136738' },
    { name: 'עדי ליפץ', passport: '34574916' },
    { name: 'בר ליפץ', passport: '36940752' },
    { name: 'רן ליפץ', passport: '40751154' }
];

// Global state variables
let currentWeatherData = null;
let chatImageBase64 = null;
let map = null; // To hold the map instance

// =================================================================================
// INITIALIZATION
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderWeather();
    renderActivities();
    initMap(); // New function to initialize the map
    setupEventListeners();
    displayDailyAttraction();
    populateItineraryDetails();
    setupPackingGuideModal();
    updateProgressBar(); // Initial call for the progress bar
    setInterval(updateProgressBar, 60000); // Update progress bar every minute
});

// =================================================================================
// NEW CORE FEATURES
// =================================================================================

/**
 * Initializes and populates the interactive Leaflet map.
 */
function initMap() {
    if (map) return; // Initialize map only once

    const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };

    // Create the map instance
    map = L.map('map').setView([hotelLocation.lat, hotelLocation.lon], 12);

    // Add the tile layer (map background)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define custom icons
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

    // Add hotel marker
    L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon })
        .addTo(map)
        .bindTooltip(`<b>${hotelLocation.name}</b><br>נקודת המוצא שלכם!`).openTooltip();

    // Add activity markers
    activitiesData.forEach(activity => {
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon], { icon: activityIcon })
                .addTo(map)
                .bindTooltip(`<b>${activity.name}</b><br>כ-${activity.time} דקות נסיעה מהמלון`);
        }
    });
}

/**
 * Updates the trip progress bar based on the current date and time.
 */
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

/**
 * Generates and displays boarding passes for all flights and passengers.
 */
function showBoardingPasses() {
    const container = document.getElementById('boarding-pass-content');
    container.innerHTML = ''; // Clear previous content

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
                <div class="boarding-pass-card">
                    <div class="flex justify-between items-center border-b pb-2 mb-2">
                        <h4 class="font-bold text-lg">${flight.airline}</h4>
                        <span class="text-sm font-semibold">כרטיס עלייה למטוס</span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                        <div class="col-span-2">
                            <div class="mb-2">
                                <span class="text-gray-500 block">שם הנוסע</span>
                                <span class="font-bold">${passenger.name}</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <span class="text-gray-500 block">מ-</span>
                                    <span class="font-bold">${flight.from}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 block">ל-</span>
                                    <span class="font-bold">${flight.to}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 block">טיסה</span>
                                    <span class="font-bold">${flight.flightNum}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 block">תאריך</span>
                                    <span class="font-bold">${flight.date}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 block">שעה</span>
                                    <span class="font-bold">${flight.time.split(' - ')[0]}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 block">מושב</span>
                                    <span class="font-bold text-lg">${passenger[seatKey]}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" alt="QR Code" class="rounded-md">
                        </div>
                    </div>
                </div>
            `;
        });
    });
    
    // Open the modal
    const modal = document.getElementById('boarding-pass-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}


// =================================================================================
// EXISTING & UPDATED FUNCTIONS
// =================================================================================

/**
 * Fetches weather data and renders it on the page.
 */
async function fetchAndRenderWeather() {
    const forecastContainer = document.getElementById('weather-forecast');
    const whatToWearBtn = document.getElementById('what-to-wear-btn');
    const startDate = '2025-08-24';
    const endDate = '2025-08-29';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=46.20&longitude=6.14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentWeatherData = data; // Store weather data globally

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
        whatToWearBtn.classList.remove('hidden'); // Show the button once weather is loaded
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

const activitiesGrid = document.getElementById('activities-grid');
let currentCategoryFilter = 'all';
let currentTimeFilter = 'all';

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
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.address}" target="_blank" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">ניווט ב-Maps</a>
                </div>
            </div>
        </div>
    `;
};

const renderActivities = () => {
    const filteredActivities = activitiesData.filter(activity => {
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
};

let suitcaseImageBase64 = null;
let itemsImageBase64 = null;

function setupPackingAssistant() {
    const suitcaseInput = document.getElementById('suitcase-image-input');
    const itemsInput = document.getElementById('items-image-input');
    const uploadSuitcaseBtn = document.getElementById('upload-suitcase-btn');
    const uploadItemsBtn = document.getElementById('upload-items-btn');
    const getSuggestionBtn = document.getElementById('get-packing-suggestion-btn');

    uploadSuitcaseBtn.addEventListener('click', () => suitcaseInput.click());
    uploadItemsBtn.addEventListener('click', () => itemsInput.click());

    suitcaseInput.addEventListener('change', (event) => handleImageUpload(event, 'suitcase'));
    itemsInput.addEventListener('change', (event) => handleImageUpload(event, 'items'));

    getSuggestionBtn.addEventListener('click', handlePackingSuggestion);
}

function handleImageUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result;
        const preview = document.getElementById(`${type}-preview`);
        const placeholder = document.getElementById(`${type}-placeholder`);

        preview.src = base64String;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');

        if (type === 'suitcase') {
            suitcaseImageBase64 = base64String.split(',')[1];
        } else {
            itemsImageBase64 = base64String.split(',')[1];
        }

        if (suitcaseImageBase64 && itemsImageBase64) {
            document.getElementById('get-packing-suggestion-btn').disabled = false;
        }
    };
    reader.readAsDataURL(file);
}

async function handlePackingSuggestion() {
    if (!suitcaseImageBase64 || !itemsImageBase64) {
        alert("אנא העלה תמונה של המזוודה וגם של הציוד.");
        return;
    }

    const resultContainer = document.getElementById('packing-suggestion-result');
    resultContainer.innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';

    const prompt = "You are a packing expert. Based on the image of the suitcase and the image of the items, provide a step-by-step packing plan in Hebrew. Be specific about the order and placement of items to maximize space. For example: '1. Start by placing the shoes along the sides. 2. Roll the trousers and place them at the bottom...'";

    const parts = [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: suitcaseImageBase64 } },
        { inlineData: { mimeType: 'image/jpeg', data: itemsImageBase64 } }
    ];

    const response = await callGeminiWithParts(parts);
    resultContainer.innerHTML = response.replace(/\n/g, '<br>');
}

function setupPackingGuideModal() {
    const modal = document.getElementById('packing-guide-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-packing-modal-btn');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    const accordionButtons = modal.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('open');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    setupPackingAssistant();
}

function setupEventListeners() {
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

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    
    // Auto-close mobile menu on selection
    mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    const modals = {
        'packing-guide': { open: ['#open-packing-modal-btn', '#open-packing-modal-btn-mobile'], close: ['close-packing-modal-btn'] },
        'nearby': { open: ['.nav-nearby-btn'], close: ['close-nearby-modal-btn'], onOpen: findAndDisplayNearby },
        'hotel-booking': { open: ['#open-hotel-modal-btn'], close: ['close-hotel-modal-btn'] },
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
    
    // Special listener for showing boarding passes
    document.getElementById('show-boarding-passes-btn').addEventListener('click', showBoardingPasses);

    const chatInput = document.getElementById('chat-input');
    document.getElementById('chat-send-btn').addEventListener('click', handleChatSend);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatSend(); });
    document.getElementById('chat-attach-btn').addEventListener('click', () => document.getElementById('chat-image-input').click());
    document.getElementById('chat-image-input').addEventListener('change', handleChatImageUpload);
    document.getElementById('chat-remove-image-btn').addEventListener('click', removeChatImage);

    document.querySelectorAll('.gemini-plan-btn').forEach(button => button.addEventListener('click', handlePlanRequest));
    document.querySelectorAll('.gemini-story-btn').forEach(button => button.addEventListener('click', handleStoryRequest));
    document.querySelectorAll('.gemini-summary-btn').forEach(button => button.addEventListener('click', handleSummaryRequest));

    document.getElementById('what-to-wear-btn').addEventListener('click', handleWhatToWearRequest);
    document.getElementById('generate-custom-plan-btn').addEventListener('click', handleCustomPlanRequest);
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
    const resultsContainer = document.getElementById('nearby-results');
    resultsContainer.innerHTML = '<p>מאתר את מיקומך...</p>';

    if (!navigator.geolocation) {
        resultsContainer.innerHTML = '<p>שירותי מיקום אינם נתמכים.</p>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const nearbyPlaces = activitiesData
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

function populateFamilyDetails() {
    const container = document.getElementById('family-details-content');
    container.innerHTML = familyData.map(member => `
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
        case 'canceled': return 'bg-red-200 text-red-900 font-bold';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function populateFlightDetails() {
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

const dailySpecials = {
    '2025-08-24': 'ברוכים הבאים! אחרי התמקמות, צאו לשיט רגוע באגם עם סירות ה-"Mouettes Genevoises" הצהובות.',
    '2025-08-25': 'טיפ יומי: קחו את הרכבת המיניאטורית ב-Jardin Anglais. היא חוויה נהדרת לפעוטות ומציעה תצפית יפה על שעון הפרחים.',
    '2025-08-26': 'פנינה נסתרת: גלו את Parc des Franchises, פארק ענק עם מתקני משחקים פנטסטיים, אהוב במיוחד על משפחות מקומיות.',
    '2025-08-27': 'היום יום שוק! בקרו בשוק פלנפלה (Plainpalais Market) בבוקר כדי ליהנות מתוצרת טרייה, מטעמים מקומיים ואווירה תוססת.',
    '2025-08-28': 'אירוע מיוחד: ב-Bains des Pâquis מתקיימת היום שעת סיפור לילדים בבוקר. התחלה מושלמת ליום על שפת האגם!',
    '2025-08-29': 'פינוק ליום האחרון: לפני הנסיעה לשדה התעופה, אל תשכחו לקנות שוקולד טעים מאחת השוקולטריות המקומיות כמו Favarger או Auer.'
};

function displayDailyAttraction() {
    const container = document.getElementById('daily-special-content');
    const today = new Date();
    const tripDates = Object.keys(dailySpecials);
    const demoDate = tripDates[today.getDay() % tripDates.length]; 
    const special = dailySpecials[demoDate] || "טיפ יומי: ז'נבה מלאה בגני שעשועים נסתרים. חפשו אותם בסמטאות העיר העתיקה!";
    container.innerHTML = `<p>${special}</p>`;
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
        if (key.includes(todayName) || key.toLowerCase() === 'everyday') {
            return `פתוח היום: ${activity.openingHours[key]}`;
        }
        const days = key.split('-');
        if (days.length === 2) {
            const startDay = dayNames.indexOf(days[0]);
            const endDay = dayNames.indexOf(days[1]);
            if (dayOfWeek >= startDay && dayOfWeek <= endDay) {
                return `פתוח היום: ${activity.openingHours[key]}`;
            }
        }
    }
    return 'סגור היום';
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
        </div>
    `;
}

function populateItineraryDetails() {
    document.querySelectorAll('[data-day-index]').forEach(dayElement => {
        const dayIndexOfTrip = parseInt(dayElement.dataset.dayIndex, 10);
        dayElement.querySelectorAll('[data-activity-details]').forEach(element => {
            const activityName = element.dataset.activityDetails;
            const activity = activitiesData.find(a => a.name === activityName);
            if (activity) {
                element.innerHTML = createActivitySnippetHTML(activity, dayIndexOfTrip);
            }
        });
    });
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

function handleChatImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result;
        chatImageBase64 = base64String.split(',')[1];
        
        const previewContainer = document.getElementById('chat-image-preview-container');
        const previewImg = document.getElementById('chat-image-preview');
        
        previewImg.src = base64String;
        previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function removeChatImage() {
    chatImageBase64 = null;
    document.getElementById('chat-image-preview-container').classList.add('hidden');
    document.getElementById('chat-image-input').value = ''; // Reset file input
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

    const availableActivities = activitiesData.map(a => `- ${a.name} (${a.category}): ${a.description}`).join('\n');
    const fullPrompt = `You are a creative trip planner for a family with a 2 and 3-year-old in Geneva. Their hotel is near the Zimeysa train station. They want a plan for a day that feels like: "${userPrompt}". 
    
    Here is a list of available activities:
    ${availableActivities}

    Create a simple, step-by-step, half-day or full-day itinerary (morning, lunch, afternoon). Suggest 2-3 real, relevant activities from the list and a suitable, simple lunch spot. Provide travel times between locations using public transport. Respond in Hebrew.`;

    const geminiResponse = await callGeminiWithParts([{ text: fullPrompt }]);
    resultContainer.innerHTML = `<div class="gemini-plan-result">${geminiResponse.replace(/\n/g, '<br>')}</div>`;
}
