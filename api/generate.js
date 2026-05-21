export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    try {
        // 1. Endpoint resmi Kie.ai untuk Create Task
        const targetUrl = 'https://api.kie.ai/api/v1/jobs/createTask'; 
        
        // 2. Menerjemahkan bahasa Web Anda menjadi bahasa Kie.ai
        const kiePayload = {
            model: "kling-3.0/motion-control", // Nama model resmi
            input: {
                prompt: req.body.prompt || "",
                // Kie.ai mewajibkan array URL untuk gambar
                input_urls: req.body.image_url ? [req.body.image_url] : [],
                // Kie.ai mewajibkan array URL untuk video referensi
                video_urls: req.body.video_url ? [req.body.video_url] : []
            }
        };

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': req.headers['authorization'],
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: JSON.stringify(kiePayload)
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
