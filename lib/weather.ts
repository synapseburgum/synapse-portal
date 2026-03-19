export type WeatherSnapshot = {
  locationLabel: string
  latitude: number
  longitude: number
  timezone: string
  current: {
    temperatureC: number
    feelsLikeC: number
    windKph: number
    weatherCode: number
    condition: string
    isDay: boolean
  }
  next12h: {
    precipitationMm: number
    maxWindKph: number
  }
  recommendation: {
    level: 'good' | 'ok' | 'poor'
    text: string
  }
  fetchedAt: string
}

const DEFAULT_LAT = Number(process.env.WEATHER_LAT || 51.5074)
const DEFAULT_LON = Number(process.env.WEATHER_LON || -0.1278)
const DEFAULT_LABEL = process.env.WEATHER_LABEL || 'Local weather'
const DEFAULT_TIMEZONE = process.env.WEATHER_TIMEZONE || 'Europe/London'

function weatherCodeToText(code: number) {
  if (code === 0) return 'Clear sky'
  if ([1, 2].includes(code)) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain'
  if ([71, 73, 75, 77].includes(code)) return 'Snow'
  if ([80, 81, 82].includes(code)) return 'Rain showers'
  if ([85, 86].includes(code)) return 'Snow showers'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Mixed weather'
}

function getRecommendation({ precipitationMm, maxWindKph }: { precipitationMm: number; maxWindKph: number }) {
  if (precipitationMm > 4 || maxWindKph > 35) {
    return {
      level: 'poor' as const,
      text: 'Poor gardening window: prioritize covered tasks and skip delicate sowing.',
    }
  }

  if (precipitationMm > 1.5 || maxWindKph > 24) {
    return {
      level: 'ok' as const,
      text: 'Mixed conditions: okay for routine checks, but avoid fragile transplanting.',
    }
  }

  return {
    level: 'good' as const,
    text: 'Good gardening window: suitable for sowing, transplanting, and outdoor jobs.',
  }
}

export async function getWeatherSnapshot(): Promise<WeatherSnapshot | null> {
  const params = new URLSearchParams({
    latitude: String(DEFAULT_LAT),
    longitude: String(DEFAULT_LON),
    current: 'temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    hourly: 'precipitation,wind_speed_10m',
    forecast_days: '2',
    timezone: DEFAULT_TIMEZONE,
  })

  const endpoint = `https://api.open-meteo.com/v1/forecast?${params.toString()}`

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      next: { revalidate: 900 },
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) return null

    const data = await res.json()

    const current = data?.current
    const hourly = data?.hourly

    if (!current || !hourly?.time || !hourly?.precipitation || !hourly?.wind_speed_10m) {
      return null
    }

    const now = new Date()
    const hourTimes = hourly.time.map((t: string) => new Date(t))
    const next12Indices: number[] = []

    for (let i = 0; i < hourTimes.length; i += 1) {
      const diffMs = hourTimes[i].getTime() - now.getTime()
      if (diffMs >= 0 && diffMs <= 12 * 60 * 60 * 1000) {
        next12Indices.push(i)
      }
    }

    const precipitationMm = next12Indices.reduce((sum, idx) => sum + Number(hourly.precipitation[idx] || 0), 0)
    const maxWindKph = next12Indices.reduce((max, idx) => Math.max(max, Number(hourly.wind_speed_10m[idx] || 0)), 0)

    const recommendation = getRecommendation({ precipitationMm, maxWindKph })

    return {
      locationLabel: DEFAULT_LABEL,
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LON,
      timezone: data?.timezone || DEFAULT_TIMEZONE,
      current: {
        temperatureC: Number(current.temperature_2m ?? 0),
        feelsLikeC: Number(current.apparent_temperature ?? 0),
        windKph: Number(current.wind_speed_10m ?? 0),
        weatherCode: Number(current.weather_code ?? -1),
        condition: weatherCodeToText(Number(current.weather_code ?? -1)),
        isDay: Number(current.is_day ?? 1) === 1,
      },
      next12h: {
        precipitationMm: Number(precipitationMm.toFixed(1)),
        maxWindKph: Number(maxWindKph.toFixed(1)),
      },
      recommendation,
      fetchedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}
