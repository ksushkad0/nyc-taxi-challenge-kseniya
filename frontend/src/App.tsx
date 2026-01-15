import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

interface Stats {
  total_trips: number
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err)
        setLoading(false)
      })
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="dashboard">
      <h1>NYC Taxi Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Trips</h3>
          <p className="stat-value">
            {loading ? 'Loading...' : stats ? formatNumber(stats.total_trips) : 'Error'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
