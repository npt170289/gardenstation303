export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({alive:true, message:'Approve API ready', hasKey: !!process.env.PI_API_KEY, keyPrefix: process.env.PI_API_KEY ? process.env.PI_API_KEY.slice(0,8)+'...' : null});
  }
  
  if (req.method !== 'POST') return res.status(405).json({success:false, error:'Method not allowed'});

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({success:false, error:'Missing paymentId'});
    if (!process.env.PI_API_KEY) return res.status(500).json({success:false, error:'PI_API_KEY not set'});
    
    console.log('APPROVE START', paymentId);
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PI_API_KEY.trim(),
        'Content-Type': 'application/json'
      }
    });
    const text = await piRes.text();
    let data;
    try{ data = JSON.parse(text); }catch{ data = {raw:text}; }
    console.log('APPROVE RES', piRes.status, data);
    
    if(piRes.ok || JSON.stringify(data).includes('already')) {
      return res.status(200).json({success:true, data});
    }
    return res.status(piRes.status).json({success:false, error:data, status:piRes.status});
  } catch(e){
    console.error('APPROVE ERROR', e);
    return res.status(500).json({success:false, error:e.message});
  }
}
