export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { paymentId } = req.body;
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method:"POST",
      headers:{'X-API-Key': process.env.PI_API_KEY,'Content-Type':'application/json'}
    });
    const data = await piRes.json();
    return res.json({success: piRes.ok, data});
  } catch(e){ return res.status(500).json({success:false, error:e.message})}
}
