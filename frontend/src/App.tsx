import { useState, useEffect } from 'react'
import axios from 'axios'
import PriceChart from './components/PriceChart'

interface CatalogItem {
  name: string
  asset_class: string
  exchange: string
  contract_size: number
  unit: string
  currency: string
}

interface Catalog {
  [ticker: string]: CatalogItem
}

function App() {
  const [catalog, setCatalog] = useState<Catalog>({})
  const [selectedTicker, setSelectedTicker] = useState<string>('CL=F')
  const [period, setPeriod] = useState<string>('1y')

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/futures/catalog')
      .then((res) => setCatalog(res.data))
      .catch((err) => console.error(err))
  }, [])

  const periods = ['1mo', '3mo', '6mo', '1y', '2y', '5y']

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 px-8 py-6">
        <h1 className="text-3xl font-bold">Futures Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Cost of Carry Analysis & Basis Trading
        </p>
      </header>

      <main className="p-8">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Contract
            </label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white"
            >
              {Object.entries(catalog).map(([ticker, info]) => (
                <option key={ticker} value={ticker}>
                  {info.name} ({ticker})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Period</label>
            <div className="flex gap-2">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main chart */}
        {catalog[selectedTicker] && (
          <PriceChart
            ticker={selectedTicker}
            name={catalog[selectedTicker].name}
            period={period}
          />
        )}

        {/* Contract details */}
        {catalog[selectedTicker] && (
          <div className="mt-6 bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Contract Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Asset Class</p>
                <p className="font-medium">
                  {catalog[selectedTicker].asset_class}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Exchange</p>
                <p className="font-medium">
                  {catalog[selectedTicker].exchange}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Contract Size</p>
                <p className="font-medium">
                  {catalog[selectedTicker].contract_size.toLocaleString()}{' '}
                  {catalog[selectedTicker].unit}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Currency</p>
                <p className="font-medium">
                  {catalog[selectedTicker].currency}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App