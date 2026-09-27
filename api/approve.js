export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // KEY MỚI NHẤT BRO GỬI - oywdxii2...
  const FALLBACK_KEY = 'oywdxii2elrtsfs9to1pmy7nagcnj6wxznxiugy19q551dd11wsmfqyjwkjufzet';
  
  if (req.method === 'GET') {
    const key = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    return res.status(200).json({
      alive:true, 
      message:'Approve API ready - key oywdxii2...',
      hasKey: !!key,
      keyLength: key.length,
      keyPrefix: key ? key.slice(0,12)+'...' : null,
      keySuffix: key ? '...'+key.slice(-6) : null,
      usingEnv: !!process.env.PI_API_KEY,
      usingFallback: !process.env.PI_API_KEY,
      envPrefix: process.env.PI_API_KEY ? process.env.PI_API_KEY.slice(0,12)+'...' : null,
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method !== 'POST') return res.status(405).json({success:false, error:'Method not allowed'});

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({success:false, error:'Missing paymentId'});
    const apiKey = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    if (!apiKey) return res.status(500).json({success:false, error:'PI_API_KEY not set'});

    console.log('=== APPROVE WITH KEY oywdxii2... ===');
    console.log('PaymentId:', paymentId);
    console.log('Key prefix:', apiKey.slice(0,8), 'len:', apiKey.length, 'usingEnv:', !!process.env.PI_API_KEY);

    console.log('Step 1: GET payment...');
    const getRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey }
    });
    const getText = await getRes.text();
    let getData; try{ getData = JSON.parse(getText); }catch{ getData = {raw:getText}; }
    console.log('GET status:', getRes.status, JSON.stringify(getData).slice(0,500));
    
    if(!getRes.ok){
      return res.status(getRes.status).json({
        success:false, 
        step:'GET payment',
        error:getData, 
        hint: getRes.status===404 ? 'Payment not found - key oywdxii2... khong phai cua App npt170289.github.io HOAC payment het han' : 'GET failed',
        keyPrefix: apiKey.slice(0,12),
        envPrefix: process.env.PI_API_KEY ? process.env.PI_API_KEY.slice(0,12) : null
      });
    }

    console.log('Step 2: POST approve...');
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    const text = await piRes.text();
    let data; try{ data = JSON.parse(text); }catch{ data = {raw:text}; }
    console.log('APPROVE RES', piRes.status, JSON.stringify(data).slice(0,800));
    
    if(piRes.ok || JSON.stringify(data).includes('already') || JSON.stringify(data).includes('approved')){
      return res.status(200).json({success:true, data, getData});
    }
    return res.status(piRes.status).json({
      success:false, 
      step:'APPROVE',
      error:data, 
      getData,
      hint: data?.type?.includes('horizon') ? 'Horizon 404 = App wallet GCLJ53F4...WH2GH chua sync' : ''
    });
  } catch(e){
    console.error('APPROVE ERROR', e);
    return res.status(500).json({success:false, error:e.message, stack:e.stack});
  }
}
