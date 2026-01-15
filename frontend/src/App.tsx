import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './App.css'

const API_URL = 'http://localhost:8000'

interface Stats {
  total_trips: number
  avg_fare: number
  avg_distance: number
}

interface Zone {
  location_id: number
  zone_name: string
  borough: string
  trip_count: number
}

interface HourlyData {
  hour: number
  trip_count: number
}

interface DailyData {
  day_of_week: number
  trip_count: number
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topPickupZones, setTopPickupZones] = useState<Zone[]>([])
  const [topDropoffZones, setTopDropoffZones] = useState<Zone[]>([])
  const [hourlyTrips, setHourlyTrips] = useState<HourlyData[]>([])
  const [dailyTrips, setDailyTrips] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/stats`).then(res => res.json()),
      fetch(`${API_URL}/top-pickup-zones`).then(res => res.json()),
      fetch(`${API_URL}/top-dropoff-zones`).then(res => res.json()),
      fetch(`${API_URL}/hourly-trips`).then(res => res.json()),
      fetch(`${API_URL}/daily-trips`).then(res => res.json())
    ])
      .then(([statsData, pickupData, dropoffData, hourlyData, dailyData]) => {
        setStats(statsData)
        setTopPickupZones(pickupData)
        setTopDropoffZones(dropoffData)
        setHourlyTrips(hourlyData)
        setDailyTrips(dailyData)
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
        <h2>Trips by Hour of Day</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyTrips}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Trips']}
                  labelFormatter={(hour) => `Hour: ${hour}:00`}
                />
                <Bar dataKey="trip_count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Trips by Day of Week</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyTrips}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day_of_week"
                  tickFormatter={(day) => dayNames[day]}
                />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Trips']}
                  labelFormatter={(day) => dayNames[Number(day)]}
                />
                <Bar dataKey="trip_count">
                  {dailyTrips.map((entry) => (
                    <Cell
                      key={entry.day_of_week}
                      fill={entry.day_of_week === 0 || entry.day_of_week === 6 ? '#f59e0b' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color weekday"></span> Weekday</span>
              <span className="legend-item"><span className="legend-color weekend"></span> Weekend</span>
            </div>
          </div>
        )}
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

      <div className="section">
        <h2>Top 10 Dropoff Zones</h2>
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
              {topDropoffZones.map((zone, index) => (
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
