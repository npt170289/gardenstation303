export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Cho phép GET để check sống, không lỗi 500 nữa
  if (req.method === 'GET') {
    return res.status(200).json({alive:true, message:'Approve API ready - use POST with paymentId', hasKey: !!process.env.PI_API_KEY});
  }
  
  if (req.method !== 'POST') return res.status(405).json({success:false, error:'Method not allowed, use POST'});

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({success:false, error:'Missing paymentId'});
    
    if (!process.env.PI_API_KEY) {
      console.error('PI_API_KEY missing in env');
      return res.status(500).json({success:false, error:'PI_API_KEY not set in Vercel'});
    }

    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PI_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    const data = await piRes.json();
    console.log('Approve:', paymentId, data);
    return res.status(piRes.ok ? 200 : 400).json({success: piRes.ok, data});
  } catch(e){
    console.error('Approve error:', e);
    return res.status(500).json({success:false, error:e.message});
  }
}
