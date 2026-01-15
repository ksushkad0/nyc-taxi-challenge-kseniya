import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

interface Stats {
  total_trips: number
  avg_fare: number
  avg_distance: number
}

interface PickupZone {
  location_id: number
  zone_name: string
  borough: string
  trip_count: number
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topPickupZones, setTopPickupZones] = useState<PickupZone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/stats`).then(res => res.json()),
      fetch(`${API_URL}/top-pickup-zones`).then(res => res.json())
    ])
      .then(([statsData, zonesData]) => {
        setStats(statsData)
        setTopPickupZones(zonesData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch data:', err)
        setLoading(false)
      })
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatCurrency = (num: number) => {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
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
        <div className="stat-card">
          <h3>Average Fare</h3>
          <p className="stat-value">
            {loading ? 'Loading...' : stats ? formatCurrency(stats.avg_fare) : 'Error'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Distance</h3>
          <p className="stat-value">
            {loading ? 'Loading...' : stats ? `${stats.avg_distance} mi` : 'Error'}
          </p>
        </div>
      </div>

      <div className="section">
        <h2>Top 10 Pickup Zones</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Zone</th>
                <th>Borough</th>
                <th>Trips</th>
              </tr>
            </thead>
            <tbody>
              {topPickupZones.map((zone, index) => (
                <tr key={zone.location_id}>
                  <td>{index + 1}</td>
                  <td>{zone.zone_name}</td>
                  <td>{zone.borough}</td>
                  <td>{formatNumber(zone.trip_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App
