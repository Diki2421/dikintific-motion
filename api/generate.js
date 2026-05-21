export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    // Ambil API key dari header frontend
    let apiKey = req.headers['authorization'];
    if (!apiKey) return res.status(401).json({ error: 'API Key tidak ditemukan' });

    try {
        const response = await fetch('https://api.magnific.com/v1/video/generate', {
            method: 'POST',
            headers: {
                'Authorization': apiKey, // Mengirim format Bearer yang sudah disiapkan frontend
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        // Jika Magnific menolak
        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || data.error || 'Ditolak oleh Magnific (Pastikan saldo/akses tersedia)' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal terhubung ke jaringan server Magnific' });
    }
}
