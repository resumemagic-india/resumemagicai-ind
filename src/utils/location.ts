
export interface LocationData {
  latitude: number;
  longitude: number;
  display: string;
  currency: string;
  country_code: string;
}

export const getUserLocation = async (): Promise<LocationData | null> => {
  try {
    console.log("Attempting to fetch user location from IP API");
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      console.error('IP API returned an error response:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log("Received location data from IP API:", data);
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      display: `${data.city}, ${data.region}, ${data.country_name}`,
      currency: data.currency,
      country_code: data.country_code
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'INR': '₹',
    'CNY': '¥',
    'BRL': 'R$',
    'ZAR': 'R',
    'NZD': 'NZ$',
    'MXN': 'MX$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NOK': 'kr',
    'SEK': 'kr',
    'DKK': 'kr',
    'CHF': 'CHF',
    'THB': '฿',
    'RUB': '₽',
  };
  
  return currencySymbols[currencyCode] || currencyCode;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  
  return `${symbol}${amount.toFixed(2)}`;
};

// Exchange rates relative to GBP (approximate)
// In a production app, you would fetch this from an API
export const getExchangeRate = (currencyCode: string): number => {
  const rates: { [key: string]: number } = {
    'USD': 1.28,
    'EUR': 1.18,
    'GBP': 1.0,
    'JPY': 195.42,
    'AUD': 1.94,
    'CAD': 1.76,
    'INR': 106.68,
    'CNY': 9.27,
    'BRL': 7.12,
    'ZAR': 23.63,
    'NZD': 2.09,
    'MXN': 22.02,
    'SGD': 1.73,
    'HKD': 10.03,
    'NOK': 13.58,
    'SEK': 13.48,
    'DKK': 8.83,
    'CHF': 1.15,
    'THB': 45.76,
    'RUB': 115.63,
  };
  
  return rates[currencyCode] || 1.0;
};

export const convertPrice = (gbpPrice: number, currencyCode: string): number => {
  const rate = getExchangeRate(currencyCode);
  // Round to 2 decimal places
  return Math.round(gbpPrice * rate * 100) / 100;
};
