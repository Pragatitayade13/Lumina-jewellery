import { useState, useEffect } from 'react';

const GOLD_API_KEY = 'goldapi-78522fb8370f2ca6e1bbd21f360cdb5a-io';

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
  try {
    const headers = { 'x-access-token': GOLD_API_KEY, 'Content-Type': 'application/json' };
    
    // Fetch Gold Rates
    const goldRes = await fetch('https://www.goldapi.io/api/XAU/INR', { headers });
    const goldData = await goldRes.json();
    
    // Fetch Silver Rates
    const silverRes = await fetch('https://www.goldapi.io/api/XAG/INR', { headers });
    const silverData = await silverRes.json();

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
    console.error("Failed to fetch live gold rates:", error);
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
