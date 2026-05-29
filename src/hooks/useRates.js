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

const startInterval = () => {
  if (intervalId) return;
  intervalId = setInterval(() => {
    globalRates = {
      ...globalRates,
      gold24k: Math.round(globalRates.gold24k * (1 + (Math.random() * 0.001 - 0.0005))),
      gold22k: Math.round(globalRates.gold22k * (1 + (Math.random() * 0.001 - 0.0005))),
      silver: Math.round(globalRates.silver * (1 + (Math.random() * 0.001 - 0.0005))),
    };
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
