import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PriceData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface PriceChartProps {
  ticker: string
  name: string
  period?: string
}

export default function PriceChart({ ticker, name, period = '1y' }: PriceChartProps) {
  const [data, setData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    axios
      .get(`http://localhost:8000/api/futures/${encodeURIComponent(ticker)}/history`, {
        params: { period },
      })
      .then((res) => {
        setData(res.data.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [ticker, period])

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-slate-400">
        Loading {name}...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-red-400">
        Error loading {name}: {error}
      </div>
    )
  }

  const firstPrice = data[0]?.close || 0
  const lastPrice = data[data.length - 1]?.close || 0
  const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100
  const isPositive = totalReturn >= 0

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-sm text-slate-400 font-mono">{ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            ${lastPrice.toFixed(2)}
          </p>
          <p
            className={`text-sm font-medium ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {totalReturn.toFixed(2)}% ({period})
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(date) => {
              const d = new Date(date)
              return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`
            }}
            minTickGap={50}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            domain={['dataMin * 0.98', 'dataMax * 1.02']}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
            }}
            labelStyle={{ color: '#cbd5e1' }}
            formatter={(value) =>
              [
                typeof value === 'number' ? `$${value.toFixed(2)}` : '',
                'Close',
              ] as [string, string]
            }
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={isPositive ? '#4ade80' : '#f87171'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}