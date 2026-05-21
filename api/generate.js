export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    try {
        const response = await fetch('https://api.magnific.com/v1/video/generate', {
            method: 'POST',
            headers: {
                'Authorization': req.headers['authorization'],
                'Content-Type': 'application/json',
                /* INI TOPENGNYA (Mencegah blokir Firewall 403) */
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify(req.body)
        });
        
        const rawText = await response.text();
        let data;
        try { 
            data = JSON.parse(rawText); 
        } catch(e) { 
            data = { message: rawText }; 
        }
        
        if (!response.ok) {
            return res.status(response.status).json({ error: `Ditolak Magnific (${response.status}): ${data.message || data.error || 'Akses ditolak'}` });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: `Server Vercel Crash: ${error.message}` });
    }
}
