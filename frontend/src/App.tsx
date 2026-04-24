import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking...')

  useEffect(() => {
    axios.get('http://localhost:8000/api/health')
      .then(res => setApiStatus(res.data.status))
      .catch(err => setApiStatus('error: ' + err.message))
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Futures Dashboard</h1>
      <p className="text-slate-300">
        Backend API status: <span className="font-mono text-green-400">{apiStatus}</span>
      </p>
    </div>
  )
}

export default App