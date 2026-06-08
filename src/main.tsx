import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './services/clientBackend';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

// Suppress benign Firestore BloomFilter internal SDK warnings/errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorStr = args.map(arg => {
    try {
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    } catch {
      return String(arg);
    }
  }).join(' ');
  
  if (
    errorStr.includes('BloomFilter error') || 
    errorStr.includes('BloomFilterError') || 
    errorStr.includes('Invalid hash count: 0')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const warnStr = args.map(arg => {
    try {
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    } catch {
      return String(arg);
    }
  }).join(' ');

  if (
    warnStr.includes('BloomFilter error') || 
    warnStr.includes('BloomFilterError') || 
    warnStr.includes('Invalid hash count: 0')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

