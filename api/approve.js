export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({error: 'Missing paymentId'});

    const apiKey = process.env.PI_API_KEY;
    const apiUrl = process.env.PI_API_URL || "https://api.testnet.minepi.com";

    const r = await fetch(`${apiUrl}/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}` }
    });
    
    const text = await r.text();
    let j;
    try { j = JSON.parse(text); } catch { j = {raw: text}; }
    
    if (!r.ok) return res.status(r.status).json(j);
    return res.status(200).json({success: true, data: j});
  } catch (e) {
    return res.status(500).json({success: false, error: e.message || e});
  }
}
