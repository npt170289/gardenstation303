export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const FALLBACK_KEY = 'oywdxii2elrtsfs9to1pmy7nagcnj6wxznxiugy19q551dd11wsmfqyjwkjufzet';
  if (req.method === 'GET') return res.status(200).json({alive:true});
  if (req.method !== 'POST') return res.status(405).json({success:false});
  try{
    const {paymentId, txid} = req.body||{};
    if(!paymentId||!txid) return res.status(400).json({success:false, error:'Missing paymentId or txid'});
    const apiKey = (process.env.PI_API_KEY || FALLBACK_KEY || '').trim();
    const piRes = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method:'POST', headers:{'X-API-Key':apiKey, 'Content-Type':'application/json'}, body:JSON.stringify({txid})
    });
    const txt = await piRes.text(); let data; try{ data=JSON.parse(txt);}catch{ data={raw:txt}; }
    console.log('COMPLETE', piRes.status, data);
    return res.status(piRes.ok?200:piRes.status).json({success:piRes.ok, data});
  }catch(e){ return res.status(500).json({success:false, error:e.message}); }
}
