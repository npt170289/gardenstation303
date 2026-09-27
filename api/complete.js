export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({alive:true, message:'Complete API ready - use POST with paymentId and txid', hasKey: !!process.env.PI_API_KEY});
  }
  
  if (req.method !== 'POST') return res.status(405).json({success:false, error:'Method not allowed, use POST'});

  try {
    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) return res.status(400).json({success:false, error:'Missing paymentId or txid'});
    
    if (!process.env.PI_API_KEY) {
      console.error('PI_API_KEY missing in env');
      return res.status(500).json({success:false, error:'PI_API_KEY not set in Vercel'});
    }

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({txid})
    });
    const data = await piRes.json();
    console.log('Complete:', paymentId, txid, data);
    return res.status(piRes.ok ? 200 : 400).json({success: piRes.ok, data});
  } catch(e){
    console.error('Complete error:', e);
    return res.status(500).json({success:false, error:e.message});
  }
}
