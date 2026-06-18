import { useState, useEffect } from 'react';

// Global shared state for the Live Gold API simulation
let globalRates = {
  gold24k: 7250,
  gold22k: 6650,
  gold18k: 5440,
  silver: 85,
  diamond: 195000,
  makingCharges: { plain: 12, antique: 18, kundan: 22, platinum: 25 }
};

const listeners = new Set();
let intervalId = null;
let lastFetchTime = 0;

const fetchLiveRates = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn("Offline: Skipping live gold rates fetch, using last known/mock rates.");
    return;
  }

  try {
    let goldRes, silverRes, goldData, silverData;

    if (import.meta.env.DEV) {
      // In dev, we proxy to GoldAPI via vite.config.js
      // We no longer pass the API key from the client to prevent leakage.
      // If it fails (403), it will just safely keep the mock globalRates.
      const headers = { 'Content-Type': 'application/json' };
      goldRes = await fetch('/api/goldapi/XAU/INR', { headers });
      silverRes = await fetch('/api/goldapi/XAG/INR', { headers });
    } else {
      // Fetch Gold & Silver Rates via our secure Vercel backend proxy
      goldRes = await fetch('/api/gold-rates?symbol=XAU&currency=INR');
      silverRes = await fetch('/api/gold-rates?symbol=XAG&currency=INR');
    }

    if (!goldRes.ok || !silverRes.ok) {
      throw new Error(`Failed to fetch rates: gold status ${goldRes.status}, silver status ${silverRes.status}`);
    }

    const goldContentType = goldRes.headers.get('content-type') || '';
    const silverContentType = silverRes.headers.get('content-type') || '';

    if (!goldContentType.includes('application/json') || !silverContentType.includes('application/json')) {
      throw new Error('Received non-JSON response from rates API');
    }

    goldData = await goldRes.json();
    silverData = await silverRes.json();

    if (goldData && goldData.price_gram_24k) {
      globalRates.gold24k = Math.round(goldData.price_gram_24k);
      globalRates.gold22k = Math.round(goldData.price_gram_22k);
      globalRates.gold18k = Math.round(goldData.price_gram_18k);
    }
    
    if (silverData && silverData.price_gram_24k) {
      globalRates.silver = Math.round(silverData.price_gram_24k);
    }

    listeners.forEach(l => l({ ...globalRates }));
  } catch (error) {
    console.warn("Failed to fetch live gold rates (using mock fallback rates):", error);
  }
};

const startInterval = () => {
  if (intervalId) return;
  
  // Fetch immediately if it's been more than 5 minutes since last fetch
  if (Date.now() - lastFetchTime > 5 * 60 * 1000) {
    fetchLiveRates();
    lastFetchTime = Date.now();
  }

  // Simulate small market fluctuations every 5 seconds, and occasionally fetch real data
  intervalId = setInterval(() => {
    // Small random fluctuation to keep the UI feeling "live" without hitting API limits
    globalRates = {
      ...globalRates,
      gold24k: Math.round(globalRates.gold24k * (1 + (Math.random() * 0.001 - 0.0005))),
      gold22k: Math.round(globalRates.gold22k * (1 + (Math.random() * 0.001 - 0.0005))),
      silver: Math.round(globalRates.silver * (1 + (Math.random() * 0.001 - 0.0005))),
    };
    
    // Fetch actual rates every 15 minutes to stay somewhat within limits but get updated data
    if (Date.now() - lastFetchTime > 15 * 60 * 1000) {
      fetchLiveRates();
      lastFetchTime = Date.now();
    }
    
    listeners.forEach(l => l(globalRates));
  }, 5000);
};

export function useRates() {
  const [rates, setRates] = useState(globalRates);

  useEffect(() => {
    startInterval();
    setRates(globalRates);
    listeners.add(setRates);
    
    return () => {
      listeners.delete(setRates);
      if (listeners.size === 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, []);

  const updateRates = async (newRates) => {
    globalRates = { ...globalRates, ...newRates };
    listeners.forEach(l => l(globalRates));
  };

  return { rates, loading: false, updateRates };
}
