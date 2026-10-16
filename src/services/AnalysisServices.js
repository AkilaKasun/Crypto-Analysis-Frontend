
import axios from "axios";
import debounce from "debounce-promise";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const COINGECKO_BASE_URL = import.meta.env.VITE_COINGECKO_LIST_URL

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const coinSearchCache = new Map();

async function searchCoins(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) return [];

  if (coinSearchCache.has(normalizedQuery)) {
    return coinSearchCache.get(normalizedQuery);
  }

  const { data } = await axios.get(
    `${COINGECKO_BASE_URL}/search`,
    {
      params: { query: normalizedQuery },
      timeout: 10000,
    }
  );

  const options = (data.coins || [])
    .filter(
      (coin) =>
        coin.id &&
        coin.name &&
        /^[a-z0-9-]+$/i.test(coin.id)
    )
    .slice(0, 25)
    .map((coin) => ({
      // Send this value to FastAPI.
      value: coin.id.toLowerCase(),

      // Display a readable name in the dropdown.
      label: `${coin.name} (${coin.symbol.toUpperCase()})`,

      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
    }));

  coinSearchCache.set(normalizedQuery, options);
  return options;
}

// Wait 300ms after typing before calling CoinGecko.
export const fetchCryptocurrencyList = debounce(
  searchCoins,
  300
);

export async function analyzeCryptocurrencies(coinIds) {
  const normalizedIds = coinIds.map((id) =>
    String(id).trim().toLowerCase()
  );

  const { data } = await http.post("/crypto/analysis", {
    coin: normalizedIds,
  });

  return data;
}
