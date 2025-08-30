const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const requestBody = JSON.parse(event.body);
        
        // The generateContent method can directly take the structured request body
        const result = await model.generateContent(requestBody);
        const response = result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        };

    } catch (error) {
        console.error("Error in Gemini function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request with Gemini API." })
        };
    }
};

