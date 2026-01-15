import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { PathOptions, Layer } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const NYC_ZONES_GEOJSON_URL = 'https://data.cityofnewyork.us/api/geospatial/d3c5-ddgc?method=export&format=GeoJSON'

interface ZonePickup {
  location_id: number
  zone_name: string
  borough: string
  trip_count: number
}

interface ZoneMapProps {
  zonePickups: ZonePickup[]
  loading: boolean
}

interface ZoneProperties {
  location_id?: string
  locationid?: string
  zone?: string
  borough?: string
  [key: string]: unknown
}

export default function ZoneMap({ zonePickups, loading }: ZoneMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const [geoLoading, setGeoLoading] = useState(true)

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(NYC_ZONES_GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setGeoData(data)
        setGeoLoading(false)
      })
      .catch(err => {
        console.error('Failed to load zone geometry:', err)
        setGeoLoading(false)
      })
  }, [])

  // Create a lookup map for trip counts by location_id
  const tripCountMap = useMemo(() => {
    const map = new Map<number, ZonePickup>()
    zonePickups.forEach(zone => {
      map.set(zone.location_id, zone)
    })
    return map
  }, [zonePickups])

  // Calculate max trip count for color scaling
  const maxTripCount = useMemo(() => {
    if (zonePickups.length === 0) return 1
    return Math.max(...zonePickups.map(z => z.trip_count))
  }, [zonePickups])

  // Color scale function (light yellow to dark red)
  const getColor = (tripCount: number): string => {
    if (tripCount === 0) return '#f0f0f0'
    const ratio = tripCount / maxTripCount
    // Color gradient from light yellow (#ffffcc) to dark red (#800026)
    if (ratio > 0.8) return '#800026'
    if (ratio > 0.6) return '#bd0026'
    if (ratio > 0.4) return '#e31a1c'
    if (ratio > 0.2) return '#fc4e2a'
    if (ratio > 0.1) return '#fd8d3c'
    if (ratio > 0.05) return '#feb24c'
    if (ratio > 0.02) return '#fed976'
    return '#ffffcc'
  }

  // Style function for GeoJSON features
  const style = (feature: Feature<Geometry, ZoneProperties> | undefined): PathOptions => {
    if (!feature || !feature.properties) {
      return { fillColor: '#f0f0f0', weight: 1, opacity: 1, color: 'white', fillOpacity: 0.7 }
    }

    const locationId = parseInt(feature.properties.location_id || feature.properties.locationid || '0')
    const zoneData = tripCountMap.get(locationId)
    const tripCount = zoneData?.trip_count || 0

    return {
      fillColor: getColor(tripCount),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    }
  }

  // Tooltip on each feature
  const onEachFeature = (feature: Feature<Geometry, ZoneProperties>, layer: Layer) => {
    if (!feature.properties) return

    const locationId = parseInt(feature.properties.location_id || feature.properties.locationid || '0')
    const zoneData = tripCountMap.get(locationId)
    const zoneName = zoneData?.zone_name || feature.properties.zone || 'Unknown'
    const borough = zoneData?.borough || feature.properties.borough || 'Unknown'
    const tripCount = zoneData?.trip_count || 0

    if ('bindTooltip' in layer) {
      (layer as Layer & { bindTooltip: (content: string, options?: object) => void }).bindTooltip(
        `<strong>${zoneName}</strong><br/>Borough: ${borough}<br/>Pickups: ${tripCount.toLocaleString()}`,
        { sticky: true }
      )
    }
  }

  if (loading || geoLoading) {
    return <div className="map-loading">Loading map data...</div>
  }

  if (!geoData) {
    return <div className="map-error">Failed to load map geometry</div>
  }

  return (
    <div className="zone-map-wrapper">
      <MapContainer
        center={[40.7128, -73.95]}
        zoom={10}
        style={{ height: '450px', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          key={JSON.stringify(zonePickups.slice(0, 5))}
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      <div className="map-legend">
        <span className="legend-title">Pickups</span>
        <div className="legend-scale">
          <div className="legend-item" style={{ background: '#ffffcc' }}></div>
          <div className="legend-item" style={{ background: '#fed976' }}></div>
          <div className="legend-item" style={{ background: '#feb24c' }}></div>
          <div className="legend-item" style={{ background: '#fd8d3c' }}></div>
          <div className="legend-item" style={{ background: '#fc4e2a' }}></div>
          <div className="legend-item" style={{ background: '#e31a1c' }}></div>
          <div className="legend-item" style={{ background: '#bd0026' }}></div>
          <div className="legend-item" style={{ background: '#800026' }}></div>
        </div>
        <div className="legend-labels">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
