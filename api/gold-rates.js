export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, currency } = req.query;

  if (!symbol || !currency) {
    return res.status(400).json({ error: 'Symbol and currency are required' });
  }

  const apiKey = process.env.GOLD_API_KEY || 'goldapi-d95171e4eac03debe7f9d0c61b0c98bb-io';

  try {
    const response = await fetch(`https://www.goldapi.io/api/${symbol}/${currency}`, {
      method: 'GET',
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GoldAPI Error (${response.status}):`, errorData);

      // If quota exceeded or forbidden, return mock data fallback
      if (response.status === 403 || response.status === 429) {
        console.log('Falling back to mock data due to API limits.');
        if (symbol === 'XAU') {
          return res.status(200).json({
            price_gram_24k: 7250,
            price_gram_22k: 6650,
            price_gram_18k: 5440
          });
        } else if (symbol === 'XAG') {
          return res.status(200).json({
            price_gram_24k: 85
          });
        }
      }

      return res.status(response.status).json({ error: `GoldAPI returned ${response.status}` });
    }

    const data = await response.json();

    // Set Cache-Control to cache the response for 1 hour (3600 seconds) 
    // to prevent hitting GoldAPI rate limits
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from GoldAPI:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
