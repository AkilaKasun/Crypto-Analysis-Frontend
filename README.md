# CryptoScope Frontend

CryptoScope is a React-based cryptocurrency research dashboard that enables users to search for cryptocurrencies and request AI-generated market analysis through a FastAPI backend.

The application provides a modern dark-themed interface with asynchronous cryptocurrency search, multi-coin selection, sentiment classification, market summaries, key market factors, and AI-generated insights.

> **Disclaimer:** CryptoScope is intended for informational and educational purposes only. AI-generated predictions and confidence scores are not guarantees of future performance or financial advice.

## Features

- Search cryptocurrencies by name or symbol.
- Select up to five cryptocurrencies for analysis.
- Send lowercase CoinGecko IDs to the backend, such as `bitcoin`, `ethereum`, and `solana`.
- Display AI-generated market summaries and sentiment.
- Highlight bullish, bearish, and neutral market outlooks.
- Present key market factors in structured cards.
- Display AI-generated insights with confidence indicators.
- Responsive dashboard layout for desktop and mobile.
- Loading indicators, error messages, and empty states.
- Integration with a FastAPI backend.

## Technology Stack

- React
- Vite
- Tailwind CSS
- React Select
- Axios
- Lucide React
- FastAPI backend
- CoinGecko API
- OpenRouter API through the backend

## Prerequisites

Before running the project, install:

- Node.js (a current LTS version is recommended)
- npm
- The CryptoScope FastAPI backend

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_FRONTEND_REPOSITORY_URL>
cd <YOUR_FRONTEND_FOLDER>
```

Replace the placeholders with your repository URL and project directory.

### 2. Install dependencies

```bash
npm install
```

If the required packages are not already installed, run:

```bash
npm install axios react-select lucide-react
```

### 3. Configure environment variables

Create a `.env` file in the frontend root directory, alongside `package.json`.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If your cryptocurrency search service uses a configurable CoinGecko endpoint, add this variable only if it is supported by your service implementation:

```env
VITE_COINGECKO_LIST_URL=https://api.coingecko.com/api/v3/coins/list?include_platform=false
```

**Security:** Never put private API keys, including `OPENROUTER_KEY`, in the frontend environment file. Variables prefixed with `VITE_` are exposed to browser-side code. Keep private credentials in the backend environment.

Restart the Vite development server after changing environment variables.

### 4. Run the frontend

```bash
npm run dev
```

Open the URL printed in the terminal. The default is usually:

```text
http://localhost:5173
```

### 5. Run the backend

In a separate terminal, navigate to the backend project directory and start FastAPI:

```bash
uvicorn main:app --reload
```

The backend should be accessible at `http://127.0.0.1:8000`, unless configured differently.

## Project Structure

A typical project structure is:

```text
frontend/
├── public/
├── src/
│   ├── pages/
│   │   └── AnalysisPage.jsx
│   ├── services/
│   │   └── AnalysisServices.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

Your actual structure may differ.

### Render the analysis page

In `src/App.jsx`:

```jsx
import AnalysisPage from "./pages/AnalysisPage";

export default function App() {
  return <AnalysisPage />;
}
```

## API Integration

The frontend communicates with the FastAPI backend through the service module:

```text
src/services/AnalysisServices.js
```

The module should provide these functions:

- `fetchCryptocurrencyList()` — searches for cryptocurrencies and returns options suitable for React Select.
- `analyzeCryptocurrencies(coinIds)` — sends the selected cryptocurrency IDs to the backend.

### Cryptocurrency search option

Each dropdown option should use a structure similar to:

```js
{
  value: "bitcoin",
  label: "Bitcoin (BTC)",
  name: "Bitcoin",
  symbol: "BTC"
}
```

The `label` is displayed in the dropdown, while the lowercase `value` is sent to the backend.

### Analysis endpoint

The frontend sends a POST request to:

```http
POST /crypto/analysis
Content-Type: application/json
```

Example request:

```json
{
  "coin": ["bitcoin", "ethereum", "solana"]
}
```

The backend is expected to return an `analysis` array containing cryptocurrency analysis results.

Example response:

```json
{
  "analysis": [
    {
      "coin": "Bitcoin",
      "summary": "An example AI-generated market summary.",
      "sentiment": "neutral",
      "key_factors": [
        {
          "factor": "Trading volume",
          "impact": "An explanation of trading-volume conditions."
        }
      ],
      "insights": [
        {
          "prediction": "An example short-term market outlook.",
          "confidence": "65"
        }
      ]
    }
  ]
}
```

The frontend supports both `summary` and the legacy field `summery`. New backend responses should use `summary`.

## Backend CORS Configuration

The FastAPI backend must allow requests from the frontend origin.

For local development, allow:

```text
http://localhost:5173
```

If you use another development port or deploy the frontend, update the backend CORS configuration accordingly.

## Available Scripts

Run these commands from the frontend project directory.

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates a production build |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint, if configured |

## Production Build

Generate the production build:

```bash
npm run build
```

Vite creates the production files in the `dist/` directory.

Before deployment:

1. Set `VITE_API_BASE_URL` to the deployed backend URL.
2. Allow the deployed frontend origin in the backend CORS configuration.
3. Keep private API keys on the backend.
4. Verify cryptocurrency search and analysis against the deployed services.
5. Ensure `.env` is excluded from Git.

## Troubleshooting

### CORS errors

If the browser reports that the request was blocked by CORS:

- Verify that CORS middleware is attached to the actual FastAPI application.
- Ensure that only one FastAPI application instance is created in `main.py`.
- Confirm that `http://localhost:5173` is in the allowed origins.
- Restart the backend after changing its configuration.

### Backend connection errors

- Verify that FastAPI is running.
- Check `VITE_API_BASE_URL`.
- Inspect the browser Developer Tools Network tab.
- Review the backend terminal for errors.

### Cryptocurrency search problems

- Check that the search service uses the correct CoinGecko endpoint.
- Check the browser Network tab for API errors or rate limits.
- Confirm that `loadOptions` is connected to `fetchCryptocurrencyList()`.

### Analysis results not appearing

- Verify that the backend returns an `analysis` array.
- Check the structure of `key_factors` and `insights`.
- Inspect the browser console and backend logs for errors.

## Limitations

- CoinGecko may enforce API request limits.
- AI-generated analysis may be inaccurate or incomplete.
- Model-reported confidence scores are not independently verified probabilities.
- Real market metrics can only be displayed when they are included in the API response.

## License

Add a license before distributing this project publicly. Until a license is selected, no explicit open-source license is specified.
