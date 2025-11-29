// Minimal serverless handler for Vercel
export default async function handler(req, res) {
    // Enable CORS
    const allowedOrigins = [
        'http://localhost:5173',
        'https://newnewoo.vercel.app',
        'https://newnewoo-git-main-bode-ahmeds-projects.vercel.app',
        'https://newnewoo-ag9qdglgo-bode-ahmeds-projects.vercel.app',
        'https://newnewoo-92m6214ih-bode-ahmeds-projects.vercel.app',
        'https://newnewoo-22ou4sjsu-bode-ahmeds-projects.vercel.app'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Health check
    if (req.url === '/api/health' || req.url === '/health') {
        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: 'production'
        });
    }

    // Root
    if (req.url === '/' || req.url === '/api') {
        return res.status(200).json({
            message: 'Lumina Fresh Market API',
            version: '1.0.0',
            status: 'running'
        });
    }

    // Try to dynamically import and run the main app
    try {
        const { default: app } = await import('../index.js');
        return app(req, res);
    } catch (error) {
        console.error('Error loading app:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
