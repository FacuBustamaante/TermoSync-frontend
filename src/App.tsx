import { useEffect, useMemo, useState } from 'react'
import './App.css'
import darkLogo from './img/dark.png'
import lightLogo from './img/light.png'

type SensorData = {
  temperatura: number | null
  humedad: number | null
  timestamp: string | null
}

//const API_URL = 'http://192.168.100.227:3000/api/sensor'
const API_URL = 'https://0hnt14s9-3000.brs.devtunnels.ms/api/sensor'

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
  const [isDarkTheme, setIsDarkTheme] = useState(false)

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

    if (clima.temperatura >= 4) {
      return {
        label: 'Calor alto',
        tone: 'text-blue-300',
      }
    }

    if (clima.temperatura >= 0) {
      return {
        label: 'Temperatura estable',
        tone: 'text-blue-300',
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
    <main className={`app-shell ${isDarkTheme ? 'theme-dark' : 'theme-light'} bg-black text-slate-100`}>
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-35" />

      <div className="brand-logo-wrap">
        <img
          src={isDarkTheme ? darkLogo : lightLogo}
          alt="TempSync Al Fuego"
          className="brand-logo"
        />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="absolute right-6 top-6 h-3 w-3 rounded-full bg-green-400 pulse-dot" />

            <div className="relative z-10 space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">
                  Monitor DHT22
                </span>
                <span className="rounded-full border border-blue-400/20 bg-blue-500 px-4 py-2 text-xs font-medium text-white">
                  Lectura en vivo
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDarkTheme}
                  aria-label={isDarkTheme ? 'Activar tema claro' : 'Activar tema oscuro'}
                  className="theme-toggle"
                  onClick={() => setIsDarkTheme((currentTheme) => !currentTheme)}
                  title={isDarkTheme ? 'Activar tema claro' : 'Activar tema oscuro'}
                >
                  <span aria-hidden="true" className="theme-toggle-icon">
                    {isDarkTheme ? '☀' : '☾'}
                  </span>
                </button>
              </div>

              <div className="max-w-2xl space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Panel ambiental
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  TempSync Al Fuego
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Lectura en vivo de las temperaturas y humedad de los sensores DHT22 con actualización automática cada 5 segundos. Actualmente dispone de un solo sensor conectado, pero se pueden agregar más sensores en el futuro para monitorear diferentes ubicaciones o entornos. 
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
                    <span className="rounded-full border border-blue-400/20 bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                      Sensor térmico
                    </span>
                  </div>
                </article>

                <article className="glass-card rounded-[1.75rem] border border-white/10 p-5">
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                    <span>Humedad</span>
                    <span className="text-blue-200">{humidityStatus}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                      {formatHumidity(clima.humedad)}
                    </p>
                    <span className="rounded-full border border-blue-400 bg-blue-500 px-3 py-1 text-xs font-bold text-white">
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
                    <span className={error ? 'text-blue-300' : 'text-blue-200'}>{connectionLabel}</span>
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
          </aside>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Del sensor a este panel, en tiempo real.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            TempSync recibe las lecturas del hardware, las expone mediante una API y las actualiza automáticamente en la interfaz cada cinco segundos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">01 / Interpretación</p>
            <h3 className="mt-4 text-xl font-semibold text-white">Qué significa cada label</h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <div>
                <p className="font-semibold text-white">Temperatura</p>
                <p><span className="text-slate-200">Ambiente fresco:</span> menos de 0 °C. <span className="text-blue-200">Temperatura estable:</span> de 0 °C a 3.9 °C. <span className="text-blue-300">Calor alto:</span> desde 4 °C.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Humedad</p>
                <p><span className="text-slate-200">Ambiente seco:</span> menos de 35 %. <span className="text-blue-200">Humedad equilibrada:</span> entre 35 % y 70 %. <span className="text-blue-300">Alta humedad:</span> más de 70 %.</p>
              </div>
            </div>
          </article>

          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">02 / Placa ESP32</p>
            <h3 className="mt-4 text-xl font-semibold text-white">El puente entre el entorno y la red</h3>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              La ESP32 es un microcontrolador con conectividad Wi-Fi. Se encarga de alimentar y consultar el DHT22, convertir su señal en datos utilizables y enviarlos al servidor para que puedan verse desde cualquier dispositivo conectado a la red local.
            </p>
          </article>

          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">03 / Flujo de datos</p>
            <h3 className="mt-4 text-xl font-semibold text-white">Una lectura que viaja por tres etapas</h3>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <li><span className="font-semibold text-white">Captura:</span> el DHT22 mide temperatura y humedad.</li>
              <li><span className="font-semibold text-white">Procesamiento:</span> la ESP32 lee el sensor y publica los datos en el backend.</li>
              <li><span className="font-semibold text-white">Visualización:</span> este panel consulta la API y refresca los valores automáticamente.</li>
            </ol>
          </article>

          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">04 / Sensor DHT22</p>
            <h3 className="mt-4 text-xl font-semibold text-white">Dos variables ambientales en un solo módulo</h3>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              El DHT22 entrega temperatura en grados Celsius y humedad relativa en porcentaje. Es adecuado para monitoreo ambiental porque ofrece una lectura digital estable y puede trabajar durante largos periodos con un consumo reducido.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App