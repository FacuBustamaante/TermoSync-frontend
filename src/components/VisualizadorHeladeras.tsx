import { type SensorReading } from "../App";

//Tipos de datos que recibe el componente

interface VisualizadorHeladerasProps {
   readings: SensorReading[];
   isDarkTheme: boolean;
}

//Lógica de colores y etiquetas adaptada para las heladeras
function getTemperatureStatus(temp: number | null) {
   if (temp === null) return { label: 'Sin lectura', textColor: 'text-slate-400', svgColor: 'text-slate-600', bgColor: 'bg-slate-500/10' };
   if (temp >= 8) return { label: 'Alerta: falla de frío', textColor: 'text-red-400', svgColor: 'text-red-500', bgColor: 'bg-red-500/10' };
   if (temp >= 4) return { label: 'Calor alto', textColor: 'text-orange-300', svgColor: 'text-orange-400', bgColor: 'bg-orange-500/10' };
   if (temp >= 0) return { label: 'Temperatura estable', textColor: 'text-cyan-300', svgColor: 'text-cyan-400', bgColor: 'bg-cyan-500/10' };
}

export default function VisualizadorHeladeras({ readings, isDarkTheme }: VisualizadorHeladerasProps) {
   if (readings.length === 0) {
      return (
         <div className="col-span-full rounded-[1.75rem] border border-white/10 p-8 text-center text-slate-400 glass-card">
            <svg className="mx-auto h-12 w-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>No hay sensroes reportando para esta sucursal.</p>
         </div>
      );
   }

   return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
         {readings.map((sensor, index) => {
            const status = getTemperatureStatus(sensor.temp);

            return (
               <article
                  key={sensor.address}
                  className={`glass-card relative overflow-hidden rounded-[1.75rem] border ${sensor.temp >= 8 ? 'border-red-500/50 pulse-dot' : 'border-white/10'} p-6 flex items-center gap-6 transition-all duration-300 hover:scale-[1.02]`}
               >
                  {/*1. Ilustracion vectorial de la Heladera */}
                  <div className={`shrink-0 rounded-2xl ${status?.bgColor} p-4 flex items-center justify-center`}>
                     <svg
                        width="60"
                        height="90"
                        viewBox="0 0 100 150"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={status?.svgColor}
                     >
                        {/* Patas */}
                        <line x1="30" y1="140" x2="30" y2="148" />
                        <line x1="70" y1="140" x2="70" y2="148" />
                        {/* Cuerpo de la heladera */}
                        <rect x="20" y="10" width="60" height="130" rx="4" />
                        {/* Separador doble (Freezer / Heladera) */}
                        <line x1="20" y1="45" x2="80" y2="45" />
                        <line x1="20" y1="52" x2="80" y2="52" />
                        {/* Manija Freezer */}
                        <line x1="30" y1="20" x2="30" y2="35" />
                        {/* Manija Heladera */}
                        <line x1="30" y1="65" x2="30" y2="95" />
                     </svg>
                  </div>

                  {/* Información y Temperatura */}
                  <div className="flex flex-col flex-1 justify-center">
                     <div className="mb-2">
                        <h3 className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                           Heladera {index + 1}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 truncate w-full" title={sensor.address}>
                           {sensor.address.slice(-6)} {/* Muestra solo la terminación de la MAC */}
                        </p>
                     </div>

                     <div className="flex items-baseline gap-1 mt-1">
                        <p className={`text-4xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                           {sensor.temp.toFixed(1)}
                        </p>
                        <span className="text-xl text-slate-500 font-medium">°C</span>
                     </div>

                     <span className={`mt-2 inline-flex text-xs font-semibold uppercase tracking-wider ${status?.textColor}`}>
                        {status?.label}
                     </span>
                  </div>
               </article>
            )
         })}
      </div>
   )
}