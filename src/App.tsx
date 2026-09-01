import { useEffect, useMemo, useState } from 'react'
import './App.css'

type SensorData = {
  temperatura: number | null
  humedad: number | null
  timestamp: string | null
}

const API_URL = 'http://192.168.100.227:3000/api/sensor'

const initialState: SensorData = {
  temperatura: null,
  humedad: null,
  timestamp: null,
}

function formatTemperature(value: number | null) {
  return value === null ? '--' : `${value.toFixed(1)} °C`
}

function formatHumidity(value: number | null) {
  return value === null ? '--' : `${value.toFixed(0)} %`
}

function App() {
  const [clima, setClima] = useState<SensorData>(initialState)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch(API_URL)

        if (!respuesta.ok) {
          throw new Error('Error en la red')
        }

        const datos = (await respuesta.json()) as SensorData
        setClima(datos)
        setError(false)
      } catch (err) {
        console.error('No se pudo conectar con el servidor:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    obtenerDatos()
    const intervalo = setInterval(obtenerDatos, 5000)

    return () => clearInterval(intervalo)
  }, [])

  const temperatureStatus = useMemo(() => {
    if (clima.temperatura === null) {
      return {
        label: 'Esperando lectura',
        tone: 'text-slate-300',
      }
    }

    if (clima.temperatura >= 32) {
      return {
        label: 'Calor alto',
        tone: 'text-red-300',
      }
    }

    if (clima.temperatura >= 24) {
      return {
        label: 'Temperatura estable',
        tone: 'text-red-300',
      }
    }

    return {
      label: 'Ambiente fresco',
      tone: 'text-slate-200',
    }
  }, [clima.temperatura])

  const humidityStatus = useMemo(() => {
    if (clima.humedad === null) {
      return 'Sin lectura'
    }

    if (clima.humedad < 35) {
      return 'Ambiente seco'
    }

    if (clima.humedad > 70) {
      return 'Alta humedad'
    }

    return 'Humedad equilibrada'
  }, [clima.humedad])

  const connectionLabel = error ? 'Sin conexión' : loading ? 'Conectando' : 'Activo'

  return (
    <main className="app-shell bg-black text-slate-100">
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-35" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="absolute right-6 top-6 h-3 w-3 rounded-full bg-red-400 pulse-dot" />

            <div className="relative z-10 space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">
                  Monitor DHT22
                </span>
                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-200">
                  Lectura en vivo
                </span>
              </div>

              <div className="max-w-2xl space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Panel ambiental
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Control visual de temperatura y humedad para las tiendas de Al Fuego.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Un tablero con vidrio, contraste alto y acentos de fuego para revisar el estado del sensor sin perder legibilidad.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="glass-card rounded-[1.75rem] border border-white/10 p-5">
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                    <span>Temperatura</span>
                    <span className={temperatureStatus.tone}>{temperatureStatus.label}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <p className="shrink-0 whitespace-nowrap text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl">
                      {formatTemperature(clima.temperatura)}
                    </p>
                    <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
                      Sensor térmico
                    </span>
                  </div>
                </article>

                <article className="glass-card rounded-[1.75rem] border border-white/10 p-5">
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                    <span>Humedad</span>
                    <span className="text-red-200">{humidityStatus}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                      {formatHumidity(clima.humedad)}
                    </p>
                    <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
                      Sensor hídrico
                    </span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <aside className="glass-card flex h-full flex-col justify-between rounded-[2rem] p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Estado</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Conectividad y lectura</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Backend</span>
                    <span className={error ? 'text-red-300' : 'text-red-200'}>{connectionLabel}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {error
                      ? 'No se pudo consultar la API del sensor. Revisa la IP, el servidor o la red local.'
                      : 'El frontend está consultando el sensor cada 5 segundos con actualización automática.'}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Última actualización</span>
                    <span className="text-slate-200">Tiempo real</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {clima.timestamp ? new Date(clima.timestamp).toLocaleTimeString() : '--:--:--'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-red-200">Lectura activa</p>
              <p className="mt-2 text-sm leading-6 text-red-50/90">
                Una combinación de negro y rojo para un panel técnico con sensación de profundidad y calor.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default App