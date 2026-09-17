import { useEffect, useState } from 'react'
import './App.css'
import darkLogo from './img/dark.png'
import lightLogo from './img/light.png'
import GraficoHistorial from './components/GraficoHistorial'
import VisualizadorHeladeras from './components/VisualizadorHeladeras'

// 1. Nuevas Interfaces para tipar la arquitectura multisensores
interface Branch {
  _id: string;
  name: string;
}

export interface SensorReading {
  address: string;
  temp: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://termosync-backend-production.up.railway.app';

function App() {
  // Estados para temas y status de red
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Nuevos estados para sucursales, filtros y sensores
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [currentReadings, setCurrentReadings] = useState<SensorReading[]>([])

  // Cargar lista de sucursales al montar la app
  useEffect(() => {
    fetch(`${API_URL}/api/branches`)
      .then(res => res.json())
      .then((data: Branch[]) => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0]._id);
      })
      .catch(err => {
        console.error('Error cargando sucursales:', err);
        setError(true);
      });
  }, []);

  // Cargar lecturas (y configurar polling) cuando cambia la sucursal
  useEffect(() => {
    if (!selectedBranch) return;

    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/telemetry?branchId=${selectedBranch}`)

        if (!respuesta.ok) throw new Error('Error en la red')

        const datos = (await respuesta.json()) as SensorReading[]
        setCurrentReadings(datos)
        setLastUpdate(new Date())
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
  }, [selectedBranch])

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
        <div className="flex w-full flex-col">
          <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div className="absolute right-6 top-6 h-3 w-3 rounded-full bg-green-400 pulse-dot" />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">
                    Monitor 1-Wire
                  </span>
                  <span className="rounded-full border border-blue-400/20 bg-blue-500 px-4 py-2 text-xs font-medium text-white">
                    Lectura en vivo
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDarkTheme}
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
                    ThermalSync Al Fuego
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                    Monitoreo en tiempo real de las temperaturas de múltiples heladeras mediante sensores sumergibles DS18B20, con actualización automática cada 3 minutos y gestión multicámara.
                  </p>
                </div>

                {/* NUEVO: Controles de Filtro adaptados a tu UI */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <div className="flex-1 rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
                    <label className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-400 mb-2">
                      Sucursal
                    </label>
                    <select 
                      className="w-full bg-transparent text-white border-b border-white/10 pb-1 text-sm focus:outline-none focus:border-blue-400"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      {branches.map(branch => (
                        <option key={branch._id} value={branch._id} className="text-black">
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* NUEVO: Grilla dinámica de Sensores */}
                <div className='mt-6'>
                      <VisualizadorHeladeras readings={currentReadings} isDarkTheme={isDarkTheme} />
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
                      <span className={error ? 'text-red-300' : 'text-blue-200'}>{connectionLabel}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {error
                        ? 'No se pudo consultar la API. Revisa tu conexión a internet o el estado del backend en Railway.'
                        : 'El frontend está consultando los sensores de esta sucursal cada 5 segundos.'}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Última actualización</span>
                      <span className="text-slate-200">Tiempo real</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Pasamos la sucursal y el periodo como props al gráfico */}
          <GraficoHistorial 
            isDarkTheme={isDarkTheme} 
            selectedBranch={selectedBranch} 
          />
        </div>
      </section>

      {/* Sección Informativa - Adaptada sutilmente a la nueva realidad de sensores */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Del hardware al panel, en tiempo real.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            TempSync centraliza las lecturas de hardware de todas las sucursales, las procesa mediante una API centralizada y actualiza automáticamente esta interfaz cada cinco segundos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">01 / Interpretación</p>
            <h3 className="mt-4 text-xl font-semibold text-white">Qué significa cada label</h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <div>
                <p className="font-semibold text-white">Rangos de Temperatura</p>
                <p><span className="text-slate-200">Ambiente fresco:</span> menos de 0 °C (Ideal congeladores).</p>
                <p><span className="text-blue-200">Temperatura estable:</span> de 0 °C a 3.9 °C (Heladeras comerciales).</p>
                <p><span className="text-orange-300">Calor alto:</span> entre 4 °C y 8 °C.</p>
                <p><span className="text-red-400">Alerta de Calor:</span> superior a 8 °C (Riesgo en cadena de frío).</p>
              </div>
            </div>
          </article>

          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">02 / Placa ESP32</p>
            <h3 className="mt-4 text-xl font-semibold text-white">El puente entre el local y la nube</h3>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              La ESP32 es un microcontrolador con conectividad Wi-Fi. Escanea dinámicamente cuántos sensores tiene conectados, agrupa sus lecturas en un paquete JSON y las envía a la base de datos en la nube.
            </p>
          </article>

          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">03 / Flujo de datos</p>
            <h3 className="mt-4 text-xl font-semibold text-white">Una lectura que viaja por tres etapas</h3>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <li><span className="font-semibold text-white">Captura:</span> Los DS18B20 miden las distintas heladeras.</li>
              <li><span className="font-semibold text-white">Procesamiento:</span> Node.js y MongoDB reciben el POST, organizando la telemetría por Sucursal.</li>
              <li><span className="font-semibold text-white">Visualización:</span> Este panel solicita los datos del local seleccionado y refresca la UI sola.</li>
            </ol>
          </article>

          <article className="glass-card rounded-[1.75rem] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-200">04 / Sensor DS18B20</p>
            <h3 className="mt-4 text-xl font-semibold text-white">Precisión en entornos industriales</h3>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              El DS18B20 es un sensor térmico digital robusto. Al utilizar el protocolo 1-Wire, permite conectar múltiples cápsulas metálicas sumergibles a un único cable de la ESP32, ideal para medir múltiples freezers simultáneamente.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App