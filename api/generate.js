export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    try {
        const response = await fetch('https://api.magnific.com/v1/video/generate', {
            method: 'POST',
            headers: {
                'Authorization': req.headers['authorization'],
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        // Alat Rontgen: Tangkap format balasan asli dari Magnific
        const rawText = await response.text();
        let data;
        try { 
            data = JSON.parse(rawText); 
        } catch(e) { 
            data = { message: rawText }; 
        }
        
        if (!response.ok) {
            return res.status(response.status).json({ error: `Ditolak Magnific (${response.status}): ${data.message || data.error || 'Cek saldo/akses'}` });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: `Server Vercel Crash: ${error.message}` });
    }
}
