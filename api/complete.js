export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).json({alive:true, message:'Complete ready - DUAL ENDPOINT FIX'});
  
  try {
    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) return res.status(400).json({success:false, error:'Missing paymentId or txid'});
    const apiKey = (process.env.PI_API_KEY || '').trim();
    if (!apiKey) return res.status(500).json({success:false, error:'PI_API_KEY not set'});
    
    console.log('COMPLETE', paymentId, txid.slice(0,12));
    
    // THỬ CẢ 2 ENDPOINT
    const endpoints = [
      `https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`,
      `https://api.minepi.com/v2/payments/${paymentId}/complete`
    ];

    let lastError = null;
    for (const url of endpoints) {
      console.log('TRYING COMPLETE', url);
      const piRes = await fetch(url, {
        method:'POST',
        headers:{
          'Authorization': `Key ${apiKey}`,
          'Content-Type':'application/json'
        },
        body: JSON.stringify({txid})
      });
      const txt = await piRes.text(); 
      let data; 
      try{ data=JSON.parse(txt);}catch{ data={raw:txt}; }
      console.log('COMPLETE RES', url, piRes.status, JSON.stringify(data).slice(0,1500));
      
      if (piRes.ok) {
        return res.status(200).json({success:true, data, endpoint: url});
      } 
      if (piRes.status !== 404) {
        return res.status(piRes.status).json({success:false, status:piRes.status, error:data, endpoint: url});
      }
      lastError = {status: piRes.status, error: data, endpoint: url};
    }
    
    return res.status(404).json({success:false, status:404, error:lastError, message:'Both complete endpoints 404'});

  } catch(e){ 
    console.error('COMPLETE EXCEPTION', e); 
    return res.status(500).json({success:false, error:e.message}); 
  }
}
