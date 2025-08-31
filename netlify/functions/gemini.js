// This Netlify Function acts as a secure proxy to the Google Gemini API.
// It uses the 'node-fetch' library for making HTTP requests from the Node.js environment.
const fetch = require('node-fetch');

// The main handler function for the Netlify Function.
// It's an async function that receives 'event' and 'context' objects.
exports.handler = async function(event) {
  // We only want to handle POST requests from our frontend.
  // Any other HTTP method will be rejected.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Retrieve the secret Gemini API key from environment variables.
  // This is crucial for security, as the key is never exposed on the client-side.
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
      // If the API key is not configured in Netlify, return a server error.
      return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY environment variable not set."}) };
  }
  
  // The official Gemini API endpoint URL. We append our secret key here.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    // The body of the request from the frontend (script.js) contains the prompt for Gemini.
    // We parse it from the event object.
    const requestBody = JSON.parse(event.body);

    // Make the actual, secure server-to-server request to the Gemini API.
    // We forward the request body that we received from the client.
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // If the response from the Gemini API is not successful (e.g., 400, 500),
    // we log the error and forward the error details to the client for debugging.
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        return {
            statusCode: response.status,
            body: JSON.stringify(errorData),
        };
    }
    
    // If the API call was successful, we parse the JSON response.
    const data = await response.json();

    // Send the successful response from Gemini back to the client (script.js).
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    // This catches any other errors, like network issues or JSON parsing failures.
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
