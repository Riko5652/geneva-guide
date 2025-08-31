import { currentData as globalData } from './main.js';

// --- MODALS ---
export function openModal(modalId, onOpenCallback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (onOpenCallback) onOpenCallback();
}

export function showTextResponseModal(title, content) {
    const modal = document.getElementById('text-response-modal');
    if (!modal) return;
    const titleEl = document.getElementById('text-response-modal-title');
    const contentEl = document.getElementById('text-response-modal-content');
    if (!titleEl || !contentEl) return;

    titleEl.textContent = title;
    contentEl.innerHTML = content?.replace(/\n/g, '<br>') ?? '';
    openModal('text-response-modal');
}

// --- DATA HELPERS ---
export function getWeatherInfo(code) {
    const codes = {
        0: { description: "בהיר", icon: "☀️" }, 1: { description: "בהיר", icon: "☀️" },
        2: { description: "מעונן חלקית", icon: "🌤️" }, 3: { description: "מעונן", icon: "☁️" },
        45: { description: "ערפילי", icon: "🌫️" }, 48: { description: "ערפילי", icon: "🌫️" },
        51: { description: "טפטוף קל", icon: "🌦️" }, 53: { description: "טפטוף", icon: "🌦️" },
        55: { description: "טפטוף", icon: "🌦️" }, 61: { description: "גשם קל", icon: "🌧️" },
        63: { description: "גשם", icon: "🌧️" }, 65: { description: "גשם חזק", icon: "🌧️" },
        80: { description: "ממטרים", icon: "🌦️" }, 81: { description: "ממטרים", icon: "🌦️" },
        82: { description: "ממטרים", icon: "🌦️" }, 95: { description: "סופת רעמים", icon: "⛈️" }
    };
    return codes[code] || { description: "לא ידוע", icon: "🤷" };
}

export function getStatusClass(status) {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
        case 'on time': return 'bg-green-100 text-green-800';
        case 'delayed': return 'bg-red-100 text-red-800';
        case 'canceled': return 'bg-red-200 text-red-900 font-bold';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// --- DATE HELPERS ---
export function getOpeningHoursForDay(activity, dayIndex, currentData = globalData) {
    if (!activity?.openingHours) return 'לא זמין';

    const tripStartDate = currentData?.tripTimeline?.[0]?.date ?? '2025-08-24';
    const currentDay = new Date(tripStartDate);
    currentDay.setDate(currentDay.getDate() + dayIndex);
    const dayOfWeek = currentDay.getDay();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = dayNames[dayOfWeek];

    for (const key in activity.openingHours) {
        if (!activity.openingHours.hasOwnProperty(key)) continue;

        if (key.includes(todayName) || key.toLowerCase() === 'everyday') 
            return `פתוח היום: ${activity.openingHours[key]}`;

        const days = key.split('-');
        if (days.length === 2) {
            const startDay = dayNames.indexOf(days[0]);
            const endDay = dayNames.indexOf(days[1]);
            if (dayOfWeek >= startDay && dayOfWeek <= endDay) 
                return `פתוח היום: ${activity.openingHours[key]}`;
        }
    }

    return 'סגור היום';
}

// --- CALCULATION HELPERS ---
export function calculateDistance(lat1, lon1, lat2, lon2) {
    if ([lat1,lon1,lat2,lon2].some(v => v == null)) return 0;
    const R = 6371; // km
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// --- FILE HELPERS ---
export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

