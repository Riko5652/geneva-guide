/**
 * This serverless function securely reads your Firebase configuration
 * from environment variables and sends them to the front-end.
 * This is the secure way to initialize Firebase on a live site.
 */
exports.handler = async function() {

    const config = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID
    };

    // Validate that all required environment variables are set in Netlify
    for (const [key, value] of Object.entries(config)) {
        if (!value) {
            const envVarName = `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Missing required environment variable: ${envVarName}` })
            };
        }
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
    };
};

