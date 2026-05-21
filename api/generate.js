export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'API Key tidak ditemukan' });

    try {
        let finalImageUrl = req.body.image_url || ""; // Jika sudah pakai link manual

        // LANGKAH 1: JIKA PENGGUNA MENGIRIM FILE DARI GALERI (Base64)
        if (req.body.image_data) {
            // Mengubah Base64 kembali menjadi bentuk file biner
            const base64Data = req.body.image_data.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            
            // Membuat paket untuk dikirim ke Gudang Kie.ai
            const formData = new FormData();
            formData.append('file', blob, 'referensi.jpg');
            formData.append('uploadPath', 'images/dikintific');

            // Menembak ke Gudang Kie.ai
            const uploadRes = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
                method: 'POST',
                headers: { 'Authorization': authHeader },
                body: formData
            });
            const uploadData = await uploadRes.json();
            
            // Jika sukses masuk gudang, ambil link sementaranya
            if(uploadData.success && uploadData.data && uploadData.data.downloadUrl) {
                finalImageUrl = uploadData.data.downloadUrl;
            } else {
                throw new Error("Gagal mengupload gambar ke gudang Kie.ai.");
            }
        }

        if (!finalImageUrl) throw new Error("Gambar referensi wajib ada.");

        // LANGKAH 2: MEMBUAT PESANAN (Kirim Link ke Kling 3.0)
        const targetUrl = 'https://api.kie.ai/api/v1/jobs/createTask'; 
        
        const kiePayload = {
            model: req.body.model || "kling-3.0/motion-control",
            input: {
                prompt: req.body.prompt || "",
                input_urls: [finalImageUrl], 
                video_urls: req.body.video_url ? [req.body.video_url] : []
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
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'Akses ditolak' });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Server Vercel Crash' });
    }
}
