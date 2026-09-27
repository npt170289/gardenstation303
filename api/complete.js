export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // KEY MỚI NHẤT BRO GỬI
  const FALLBACK_KEY = 'oywdxii2elrtsfs9to1pmy7nagcnj6wxznxiugy19q551dd11wsmfqyjwkjufzet';
  
  if (req.method === 'GET') {
    const key = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    return res.status(200).json({
      alive:true, 
      message:'Complete API ready - key oywdxii2...',
      hasKey: !!key,
      keyPrefix: key.slice(0,12)+'...',
      usingFallback: !process.env.PI_API_KEY
    });
  }
  
  if (req.method !== 'POST') return res.status(405).json({success:false, error:'Method not allowed, use POST'});

  try {
    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) return res.status(400).json({success:false, error:'Missing paymentId or txid'});
    
    const apiKey = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    if (!apiKey) {
      return res.status(500).json({success:false, error:'PI_API_KEY not set'});
    }

    console.log('COMPLETE START', paymentId, txid.slice(0,20)+'...');
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({txid})
    });
    const text = await piRes.text();
    let data; try{ data = JSON.parse(text); }catch{ data = {raw:text}; }
    console.log('COMPLETE RES', piRes.status, data);
    return res.status(piRes.ok ? 200 : 400).json({success: piRes.ok, data});
  } catch(e){
    console.error('Complete error:', e);
    return res.status(500).json({success:false, error:e.message});
  }
}
