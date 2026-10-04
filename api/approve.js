export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') {
    const k = (process.env.PI_API_KEY || '').trim();
    return res.status(200).json({alive:true, hasKey:!!k, keyPrefix:k.slice(0,12)+'...'});
  }
  try {
    const { paymentId } = req.body || {};
    const apiKey = (process.env.PI_API_KEY || '').trim();
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method:'POST',
      headers:{
        'Authorization': `Key ${apiKey}`, // <--- FIX 1: dùng backtick ` chứ không phải '
        'Content-Type':'application/json'
      }
    });
    const data = await piRes.json();
    if (piRes.ok) return res.status(200).json({success:true, data});
    else return res.status(piRes.status).json({success:false, error:data}); // <--- FIX 2: success:false khi lỗi
  } catch(e){ return res.status(500).json({success:false, error:e.message}); }
}
