export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') {
    const k = (process.env.PI_API_KEY || '').trim();
    return res.status(200).json({alive:true, message:'Approve ready fix 60s - header Authorization Key', hasKey:!!k, keyPrefix:k.slice(0,12)+'...', usingEnv:!!process.env.PI_API_KEY});
  }
  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({success:false, error:'Missing paymentId'});
    const apiKey = (process.env.PI_API_KEY || '').trim();
    console.log('APPROVE', paymentId, 'key', apiKey.slice(0,12));
    // FIX CHÍNH Ở ĐÂY - Pi bắt buộc Authorization: Key
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method:'POST',
      headers:{
        'Authorization': `Key ${apiKey}`,
        'Content-Type':'application/json'
      }
    });
    const txt = await piRes.text(); let data; try{ data=JSON.parse(txt);}catch{ data={raw:txt}; }
    console.log('APPROVE RES', piRes.status, JSON.stringify(data).slice(0,1500));
    if (piRes.ok) return res.status(200).json({success:true, data});
    return res.status(piRes.status).json({success:false, status:piRes.status, error:data});
  } catch(e){ return res.status(500).json({success:false, error:e.message}); }
}
