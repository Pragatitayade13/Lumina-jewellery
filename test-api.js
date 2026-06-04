
const GOLD_API_KEY = 'goldapi-d95171e4eac03debe7f9d0c61b0c98bb-io';
const headers = { 'x-access-token': GOLD_API_KEY, 'Content-Type': 'application/json' };

async function testApi() {
  try {
    const goldRes = await fetch('https://www.goldapi.io/api/XAU/INR', { headers });
    const goldData = await goldRes.json();
    console.log(JSON.stringify(goldData, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
testApi();
