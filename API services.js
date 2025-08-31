import { currentData } from './main.js';

/**
 * --- WEATHER ---
 * Fetches and displays weather forecast in the UI
 */
export async function fetchAndRenderWeather(startDate = '2025-08-24', endDate = '2025-08-29') {
    const forecastContainer = document.getElementById('weather-forecast');
    if (!forecastContainer) return;
    forecastContainer.innerHTML = '<p class="text-center w-full col-span-full">טוען תחזית עדכנית...</p>';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=46.20&longitude=6.14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentData.weatherData = data;

        const whatToWearBtn = document.getElementById('what-to-wear-btn');
        forecastContainer.innerHTML = '';
        data.daily.time.forEach((dateStr, i) => {
            const date = new Date(dateStr);
            const day = date.toLocaleDateString('he-IL', { weekday: 'long' });
            const dayMonth = `${date.getDate()}.${date.getMonth() + 1}`;
            const weather = getWeatherInfo(data.daily.weathercode[i]);
            const tempMax = Math.round(data.daily.temperature_2m_max[i]);
            const tempMin = Math.round(data.daily.temperature_2m_min[i]);

            forecastContainer.innerHTML += `
                <div class="bg-secondary text-center p-4 rounded-lg shadow flex-shrink-0 w-full sm:w-auto flex-1">
                    <div class="font-bold text-lg">${day}, ${dayMonth}</div>
                    <div class="text-4xl my-2">${weather.icon}</div>
                    <div class="font-semibold">${tempMin}°/${tempMax}°</div>
                    <div class="text-sm text-gray-600">${weather.description}</div>
                </div>`;
        });

        if (whatToWearBtn) whatToWearBtn.classList.remove('hidden');
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
        82: { description: "ממטרים", icon: "🌦️" }, 95: { description: "סופת רעמים", icon: "⛈️" }
    };
    return codes[code] || { description: "לא ידוע", icon: "🤷" };
}

/**
 * --- GEMINI AI ---
 * Unified endpoint for calling the AI
 */
export async function callGeminiWithParts(parts) {
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
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        console.error("Unexpected Gemini response structure:", result);
        return "מצטער, קיבלתי תשובה בפורמט לא צפוי.";
    } catch (error) {
        console.error("Error calling Gemini function:", error);
        return "אופס, משהו השתבש. אנא נסה שוב מאוחר יותר.";
    }
}

/**
 * --- GEMINI HELPERS ---
 * Functions for creating prompts
 */
export function createActivityPrompt(existingActivities) {
    return `Suggest 3 more fun activities for a family with toddlers in/near Geneva, Switzerland. Avoid duplicating these: ${JSON.stringify(existingActivities)}. Provide ONLY a JSON array of objects. Each object must have keys: "id", "name", "category", "time", "transport", "address", "description", "image", "link", "lat", "lon", "cost". For "image", find a real, royalty-free URL. If unavailable, return "". "time" is travel duration in minutes. "id" must be a unique random number > 1000.`;
}

export function createPackingPrompt(packingList, luggage, theme = "") {
    if(theme) {
        return `Based on this packing list: ${JSON.stringify(packingList)}, suggest new items for a family trip to Geneva with toddlers, focusing on "${theme}". Respond ONLY with a JSON object of new items, like {"Category": ["item1"]}.`;
    } else {
        const checked = Object.values(packingList).flat().filter(i => i.checked).map(i => i.name);
        return `Create an optimal packing plan. Pack these items: ${checked.join(', ')} into this luggage: ${JSON.stringify(luggage)}. Consider luggage size and item types. Respond in Hebrew using Markdown.`;
    }
}

export async function analyzePackingImages(suitcaseFile, itemsFile) {
    if (!suitcaseFile || !itemsFile) throw new Error("Missing images");

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    const suitcase64 = await toBase64(suitcaseFile);
    const items64 = await toBase64(itemsFile);
    const parts = [
        { text: "Visually analyze the suitcase and items images. Suggest a packing plan in Hebrew." },
        { inline_data: { mime_type: suitcaseFile.type, data: suitcase64 } },
        { inline_data: { mime_type: itemsFile.type, data: items64 } }
    ];
    return callGeminiWithParts(parts);
}

