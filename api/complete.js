export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) return res.status(400).json({success:false, error:'Missing paymentId or txid'});

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });
    const data = await piRes.json();
    console.log('Complete:', paymentId, txid, data);
    return res.json({success: piRes.ok, data});
  } catch (e) {
    console.error(e);
    return res.status(500).json({success:false, error: e.message});
  }
}
