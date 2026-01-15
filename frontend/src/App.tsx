import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import ZoneMap from './ZoneMap'
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

interface PaymentData {
  payment_type: number
  payment_name: string
  trip_count: number
}

interface HeatmapData {
  day_of_week: number
  hour: number
  trip_count: number
}

interface TipStats {
  avg_tip_percentage: number
  trip_count: number
}

interface TipByBorough {
  borough: string
  avg_tip_percentage: number
  trip_count: number
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topPickupZones, setTopPickupZones] = useState<Zone[]>([])
  const [topDropoffZones, setTopDropoffZones] = useState<Zone[]>([])
  const [hourlyTrips, setHourlyTrips] = useState<HourlyData[]>([])
  const [dailyTrips, setDailyTrips] = useState<DailyData[]>([])
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentData[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [tipStats, setTipStats] = useState<TipStats | null>(null)
  const [tipByBorough, setTipByBorough] = useState<TipByBorough[]>([])
  const [zonePickups, setZonePickups] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const PAYMENT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/stats`).then(res => res.json()),
      fetch(`${API_URL}/top-pickup-zones`).then(res => res.json()),
      fetch(`${API_URL}/top-dropoff-zones`).then(res => res.json()),
      fetch(`${API_URL}/hourly-trips`).then(res => res.json()),
      fetch(`${API_URL}/daily-trips`).then(res => res.json()),
      fetch(`${API_URL}/payment-breakdown`).then(res => res.json()),
      fetch(`${API_URL}/heatmap`).then(res => res.json()),
      fetch(`${API_URL}/tip-stats`).then(res => res.json()),
      fetch(`${API_URL}/tip-by-borough`).then(res => res.json()),
      fetch(`${API_URL}/zone-pickups`).then(res => res.json())
    ])
      .then(([statsData, pickupData, dropoffData, hourlyData, dailyData, paymentData, heatmapResult, tipStatsData, tipBoroughData, zonePickupsData]) => {
        setStats(statsData)
        setTopPickupZones(pickupData)
        setTopDropoffZones(dropoffData)
        setHourlyTrips(hourlyData)
        setDailyTrips(dailyData)
        setPaymentBreakdown(paymentData)
        setHeatmapData(heatmapResult)
        setTipStats(tipStatsData)
        setTipByBorough(tipBoroughData)
        setZonePickups(zonePickupsData)
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
        <div className="stat-card">
          <h3>Average Tip</h3>
          <p className="stat-value">
            {loading ? 'Loading...' : tipStats ? `${tipStats.avg_tip_percentage}%` : 'Error'}
          </p>
          <p className="stat-note">Credit card payments only</p>
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
        <h2>Payment Methods</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="payment-container">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown as unknown as Record<string, unknown>[]}
                    dataKey="trip_count"
                    nameKey="payment_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(1)}%)`}
                  >
                    {paymentBreakdown.map((_, index) => (
                      <Cell key={index} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Trips']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="payment-legend">
              {paymentBreakdown.map((item, index) => {
                const total = paymentBreakdown.reduce((sum, p) => sum + p.trip_count, 0)
                const percent = ((item.trip_count / total) * 100).toFixed(1)
                return (
                  <div key={item.payment_type} className="payment-legend-item">
                    <span className="legend-color" style={{ background: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}></span>
                    <span className="payment-name">{item.payment_name}</span>
                    <span className="payment-count">{item.trip_count.toLocaleString()} ({percent}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Average Tip by Borough</h2>
        <p className="chart-subtitle">Credit card payments only (excludes tips &gt; 100% of fare)</p>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tipByBorough} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="borough"
                  width={100}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Avg Tip']}
                />
                <Bar dataKey="avg_tip_percentage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Pickup Patterns Heatmap</h2>
        <p className="heatmap-subtitle">Trip volume by hour and day of week</p>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="heatmap-container">
            <div className="heatmap-wrapper">
              <div className="heatmap-y-labels">
                {dayNames.map((day, index) => (
                  <div key={index} className="heatmap-y-label">{day}</div>
                ))}
              </div>
              <div className="heatmap-main">
                <div className="heatmap-grid">
                  {dayNames.map((_, dayIndex) => {
                    const maxCount = Math.max(...heatmapData.map(d => d.trip_count))
                    return (
                      <div key={dayIndex} className="heatmap-row">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const cell = heatmapData.find(
                            d => d.day_of_week === dayIndex && d.hour === hour
                          )
                          const count = cell?.trip_count || 0
                          const intensity = maxCount > 0 ? count / maxCount : 0
                          return (
                            <div
                              key={hour}
                              className="heatmap-cell"
                              style={{
                                backgroundColor: `rgba(37, 99, 235, ${intensity * 0.9 + 0.1})`
                              }}
                              title={`${dayNames[dayIndex]} ${hour}:00 - ${count.toLocaleString()} trips`}
                            />
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                <div className="heatmap-x-labels">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="heatmap-x-label">
                      {hour % 3 === 0 ? `${hour}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="heatmap-legend">
              <span>Low</span>
              <div className="heatmap-legend-gradient"></div>
              <span>High</span>
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Pickup Volume by Zone</h2>
        <p className="chart-subtitle">Hover over zones to see details</p>
        <ZoneMap zonePickups={zonePickups} loading={loading} />
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
