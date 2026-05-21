export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Hanya POST');

    const apiKey = req.headers['x-magnific-api-key'];
    
    try {
        const response = await fetch('https://api.magnific.com/v1/video/generate', {
            method: 'POST',
            headers: {
                'x-magnific-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal terhubung ke Magnific' });
    }
}

