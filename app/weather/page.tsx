import { CloudRain, CloudSun, Flower2, Thermometer, Wind } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getWeatherSnapshot } from '@/lib/weather'

function GardenRecommendationBadge({ level }: { level: 'good' | 'ok' | 'poor' }) {
  if (level === 'good') {
    return <span className="badge success">Good gardening window</span>
  }

  if (level === 'ok') {
    return <span className="badge warning">Mixed conditions</span>
  }

  return <span className="badge error">Low outdoor suitability</span>
}

export default async function WeatherPage() {
  const weather = await getWeatherSnapshot()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Garden Weather</h1>
          <p className="text-muted mb-0">Fast weather read for deciding what to do outside today</p>
        </div>
      </header>

      {!weather ? (
        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">
                  <CloudRain />
                </div>
                <p className="empty-state-text">Weather data is temporarily unavailable.</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="section">
            <div className="weather-hero-card">
              <div className="weather-hero-top">
                <div>
                  <div className="weather-location">{weather.locationLabel}</div>
                  <h2 className="weather-temp">{Math.round(weather.current.temperatureC)}°C</h2>
                  <p className="text-muted mb-0">
                    Feels like {Math.round(weather.current.feelsLikeC)}°C • {weather.current.condition}
                  </p>
                </div>
                <div className="weather-icon-wrap">
                  {weather.current.isDay ? <CloudSun size={34} /> : <CloudRain size={34} />}
                </div>
              </div>

              <div className="weather-meta-grid">
                <div className="weather-meta-item">
                  <Thermometer size={16} />
                  <span>{Math.round(weather.current.temperatureC)}°C now</span>
                </div>
                <div className="weather-meta-item">
                  <Wind size={16} />
                  <span>{Math.round(weather.current.windKph)} km/h wind</span>
                </div>
                <div className="weather-meta-item">
                  <CloudRain size={16} />
                  <span>{weather.next12h.precipitationMm.toFixed(1)} mm rain next 12h</span>
                </div>
                <div className="weather-meta-item">
                  <Flower2 size={16} />
                  <span>{Math.round(weather.next12h.maxWindKph)} km/h peak gust window</span>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Gardening Recommendation</h3>
              </div>
              <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <GardenRecommendationBadge level={weather.recommendation.level} />
                <p className="mb-0">{weather.recommendation.text}</p>
                <p className="text-muted mb-0" style={{ fontSize: 'var(--text-xs)' }}>
                  Updated {formatDistanceToNow(new Date(weather.fetchedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
