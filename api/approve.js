export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const FALLBACK_KEY = 'oywdxii2elrtsfs9to1pmy7nagcnj6wxznxiugy19q551dd11wsmfqyjwkjufzet';
  if (req.method === 'GET') {
    const key = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    return res.status(200).json({alive:true, message:'Approve ready fix 60s', hasKey:!!key, keyPrefix:key.slice(0,12)+'...', usingEnv:!!process.env.PI_API_KEY});
  }
  if (req.method !== 'POST') return res.status(405).json({success:false, error:'Method not allowed'});
  try{
    const {paymentId} = req.body||{};
    if(!paymentId) return res.status(400).json({success:false, error:'Missing paymentId'});
    const apiKey = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    console.log('APPROVE', paymentId, 'key', apiKey.slice(0,12));
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method:'POST', headers:{'X-API-Key':apiKey, 'Content-Type':'application/json'}
    });
    const txt = await piRes.text(); let data; try{ data=JSON.parse(txt);}catch{ data={raw:txt}; }
    console.log('APPROVE RES', piRes.status, JSON.stringify(data).slice(0,1000));
    if(piRes.ok) return res.status(200).json({success:true, data});
    const isHorizon = JSON.stringify(data).includes('horizon-errors');
    return res.status(piRes.status).json({
      success:false, status:piRes.status, error:data, isHorizonError:isHorizon,
      hint: isHorizon ? 'App wallet not found - fund via friendbot: https://friendbot.stellar.org/?addr=APP_WALLET_ADDRESS' : (piRes.status===404 ? 'Payment not found - key sai App hoặc domain npt170289.github.io chưa add trong develop.pi' : 'Approve failed')
    });
  }catch(e){ console.error(e); return res.status(500).json({success:false, error:e.message}); }
}
