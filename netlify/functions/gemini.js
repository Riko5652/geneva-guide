import { toBase64 } from './utils.js';

/**
 * --- GEMINI AI ---
 * Calls the unified AI endpoint via a serverless function.
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
 * --- GEMINI PROMPT HELPERS ---
 * Functions to create specific prompts for different AI tasks.
 */
export function createActivityPrompt(existingActivities) {
    return `Suggest 3 more fun activities for a family with toddlers in/near Geneva, Switzerland. Avoid duplicating these: ${JSON.stringify(existingActivities)}. Provide ONLY a JSON array of objects. Each object must have keys: "id", "name", "category", "time", "transport", "address", "description", "image", "link", "lat", "lon", "cost". For "image", find a real, royalty-free URL. If unavailable, return "". "time" is travel duration in minutes. "id" must be a unique random number > 1000.`;
}

export function createPackingPrompt(packingList, luggage, theme = "") {
    if (theme) {
        return `Based on this packing list: ${JSON.stringify(packingList)}, suggest new items for a family trip to Geneva with toddlers, focusing on "${theme}". Respond ONLY with a JSON object of new items, like {"Category": ["item1"]}.`;
    } else {
        const checked = Object.values(packingList).flat().filter(i => i.checked).map(i => i.name);
        return `Create an optimal packing plan. Pack these items: ${checked.join(', ')} into this luggage: ${JSON.stringify(luggage)}. Consider luggage size and item types. Respond in Hebrew using Markdown.`;
    }
}

export async function analyzePackingImages(suitcaseFile, itemsFile) {
    if (!suitcaseFile || !itemsFile) throw new Error("Missing images");
    
    const suitcase64 = await toBase64(suitcaseFile);
    const items64 = await toBase64(itemsFile);
    const parts = [
        { text: "Visually analyze the suitcase and items images. Suggest a packing plan in Hebrew." },
        { inline_data: { mime_type: suitcaseFile.type, data: suitcase64 } },
        { inline_data: { mime_type: itemsFile.type, data: items64 } }
    ];
    return callGeminiWithParts(parts);
}

