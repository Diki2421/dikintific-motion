export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    try {
        // 1. UBAH TARGET URL KE SERVER KIE.AI
        // Catatan: Ini adalah contoh endpoint Kie.ai, pastikan URL ini 
        // sesuai dengan model yang Anda pilih di buku panduan docs.kie.ai
        const targetUrl = 'https://api.kie.ai/api/v1/runway/generate'; 
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': req.headers['authorization'], // Otomatis mengirim API Key Kie Anda
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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
            return res.status(response.status).json({ error: `Ditolak Kie.ai (${response.status}): ${data.message || data.error || 'Akses ditolak'}` });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: `Server Vercel Crash: ${error.message}` });
    }
}
