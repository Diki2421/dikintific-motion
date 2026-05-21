export const config = {
    api: { bodyParser: true }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'API Key tidak ditemukan' });

    try {
        let finalImageUrl = req.body.image_url || ""; 

        // Sistem pembacaan gambar yang lebih aman dan fleksibel
        if (req.body.image_data && req.body.image_data.includes(',')) {
            const base64Data = req.body.image_data.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('file', blob, 'referensi.jpg');
            formData.append('uploadPath', 'images/dikintific');

            const uploadRes = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
                method: 'POST',
                headers: { 'Authorization': authHeader },
                body: formData
            });
            const uploadData = await uploadRes.json();
            
            if(uploadData.success && uploadData.data && uploadData.data.downloadUrl) {
                finalImageUrl = uploadData.data.downloadUrl;
            } else {
                throw new Error("Gagal mengupload gambar ke gudang Kie.ai.");
            }
        }

        if (!finalImageUrl) throw new Error("Gambar referensi wajib diunggah ulang.");

        const targetUrl = 'https://api.kie.ai/api/v1/jobs/createTask'; 
        
        const kiePayload = {
            model: req.body.model || "kling-2.6", 
            input: {
                prompt: req.body.prompt || "Make the character alive, realistic motion",
                image_url: finalImageUrl,
                duration: 5
            }
        };

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: JSON.stringify(kiePayload)
        });
        
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'Akses ditolak oleh Kie.ai' });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Server Vercel mengalami kendala' });
    }
}
