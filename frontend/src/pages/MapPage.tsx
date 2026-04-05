import { MapPin, Building2, ExternalLink, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { api, getApiErrorMessage } from '../lib/api'
import type { RecyclingCenter } from '../types'

const fallbackLocation = {
  lat: 12.9716,
  lng: 77.5946,
}

const buildMapEmbedUrl = (lat: number, lng: number) => {
  const offset = 0.03
  const bbox = [lng - offset, lat - offset, lng + offset, lat + offset].join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
}

export const MapPage = () => {
  const [centers, setCenters] = useState<RecyclingCenter[]>([])
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null)
  const [locationLabel, setLocationLabel] = useState('Detecting your location...')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCenters = async (lat?: number, lng?: number) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<{ centers: RecyclingCenter[] }>('/recycling-centers', {
        params: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
      })
      setCenters(response.data.centers)
      setSelectedCenter(response.data.centers[0] ?? null)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLabel('Browser location is unavailable. Showing default Bengaluru results.')
      void loadCenters(fallbackLocation.lat, fallbackLocation.lng)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocationLabel(`Showing centers near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`)
        void loadCenters(latitude, longitude)
      },
      () => {
        setLocationLabel('Location permission was denied. Showing default Bengaluru results.')
        void loadCenters(fallbackLocation.lat, fallbackLocation.lng)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      {/* Centers List */}
      <section className="rounded-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-500">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">
              Nearby centers
            </span>
            <h2 className="text-xl font-bold text-deep-500 dark:text-dark-text-heading">Find recycling drop-off spots</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-dark-text-muted">{locationLabel}</p>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Centers List */}
        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-neutral-200 dark:border-dark-border border-t-neutral-400 dark:border-t-dark-text-muted" />
                <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-muted">Loading nearby recycling centers...</p>
              </div>
            </div>
          ) : (
            centers.map((center) => (
              <article
                key={`${center.name}-${center.address}`}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
                  selectedCenter?.name === center.name
                    ? 'border-primary-500 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-primary-300 dark:hover:border-primary-700'
                }`}
                onClick={() => setSelectedCenter(center)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selectedCenter?.name === center.name ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500' : 'bg-neutral-100 dark:bg-dark-bg text-neutral-500 dark:text-dark-text-muted'
                    }`}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-deep-500 dark:text-dark-text-heading">{center.name}</h3>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-dark-text-muted">{center.address}</p>
                      <p className="mt-1.5 text-xs font-semibold text-primary-500">
                        {center.distance_km !== null
                          ? `${center.distance_km} km away`
                          : 'Distance available after location access'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600"
                      href={`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=15/${center.lat}/${center.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={12} />
                      Open in OSM
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Map Section */}
      <section className="rounded-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface shadow-sm">
          {selectedCenter ? (
            <iframe
              title="Recycling centers map"
              src={buildMapEmbedUrl(selectedCenter.lat, selectedCenter.lng)}
              className="h-[28rem] w-full rounded-none border-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-[28rem] items-center justify-center rounded-xl text-sm text-neutral-500 dark:text-dark-text-muted">
              Select a center to preview it on the map.
            </div>
          )}
        </div>

        {selectedCenter && (
          <div className="mt-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 p-4 border border-primary-100 dark:border-primary-800">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-500">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">
                  Selected center
                </p>
                <h3 className="mt-1 text-lg font-bold text-deep-500 dark:text-dark-text-heading">{selectedCenter.name}</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-dark-text">{selectedCenter.address}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}