export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') {
    const k = (process.env.PI_API_KEY || '').trim();
    return res.status(200).json({alive:true, message:'Approve ready - DUAL ENDPOINT FIX', hasKey:!!k, keyPrefix:k.slice(0,12)+'...', usingEnv:!!process.env.PI_API_KEY});
  }
  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({success:false, error:'Missing paymentId'});
    const apiKey = (process.env.PI_API_KEY || '').trim();
    if (!apiKey) return res.status(500).json({success:false, error:'PI_API_KEY not set'});
    
    console.log('APPROVE', paymentId, 'key', apiKey.slice(0,12));
    
    // THỬ CẢ 2 ENDPOINT - TESTNET TRƯỚC, MAINNET SAU
    const endpoints = [
      `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`,
      `https://api.minepi.com/v2/payments/${paymentId}/approve`
    ];

    let lastError = null;
    for (const url of endpoints) {
      console.log('TRYING', url);
      const piRes = await fetch(url, {
        method:'POST',
        headers:{
          'Authorization': `Key ${apiKey}`,
          'Content-Type':'application/json'
        }
      });
      const txt = await piRes.text(); 
      let data; 
      try{ data=JSON.parse(txt);}catch{ data={raw:txt}; }
      console.log('APPROVE RES', url, piRes.status, JSON.stringify(data).slice(0,1500));
      
      if (piRes.ok) {
        return res.status(200).json({success:true, data, endpoint: url});
      } 
      // Nếu không phải 404 thì trả luôn lỗi đó
      if (piRes.status !== 404) {
        return res.status(piRes.status).json({success:false, status:piRes.status, error:data, endpoint: url});
      }
      lastError = {status: piRes.status, error: data, endpoint: url};
    }
    // Cả 2 đều 404
    return res.status(404).json({success:false, status:404, error:lastError, message:'Both endpoints 404 - Check API Key matches App'});

  } catch(e){ 
    console.error('APPROVE EXCEPTION', e); 
    return res.status(500).json({success:false, error:e.message}); 
  }
}
