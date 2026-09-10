import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GraficoHistorialProps, SensorHistoryItem } from '../types/index.ts';
export default function GraficoHistorial({ isDarkTheme }: GraficoHistorialProps) {
  const [datos, setDatos] = useState<SensorHistoryItem[]>([]);
  const [periodo, setPeriodo] = useState('semana'); // Inicia en 7 días por defecto

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL.replace('/actual', '/historial');
        const respuesta = await fetch(`${baseUrl}?periodo=${periodo}`);
        
        if (!respuesta.ok) throw new Error('Error al obtener historial');
        
        const data: SensorHistoryItem[] = await respuesta.json();

        // Formatear fecha para el eje X
        const datosFormateados = data.map((item: SensorHistoryItem) => {
          const fecha = new Date(item.timestamp);
          return {
            ...item,
            fechaVisible: fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
          };
        });

        setDatos(datosFormateados);
      } catch (error) {
        console.error("Error cargando el gráfico:", error);
      }
    };

    obtenerHistorial();
    const intervalo = setInterval(obtenerHistorial, 300000); 
    return () => clearInterval(intervalo);
  }, [periodo]);

  const textColor = isDarkTheme ? '#cbd5e1' : '#475569';
  const gridColor = isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="glass-card mt-8 rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Historial</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Análisis de Tendencias</h2>
        </div>
        
        <div className="flex gap-2 rounded-full border border-white/10 bg-black/20 p-1">
          <button 
            onClick={() => setPeriodo('semana')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${periodo === 'semana' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            7 Días
          </button>
          <button 
            onClick={() => setPeriodo('mes')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${periodo === 'mes' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Último Mes
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <AreaChart data={datos} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="fechaVisible" stroke={textColor} fontSize={12} tickMargin={10} minTickGap={30} />
            <YAxis stroke={textColor} fontSize={12} tickFormatter={(val) => `${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff', borderRadius: '12px', border: 'none', color: isDarkTheme ? '#fff' : '#000' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Area type="monotone" dataKey="temperatura" name="Temp (°C)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTemp)" />
            <Area type="monotone" dataKey="humedad" name="Humedad (%)" stroke="#10b981" fillOpacity={1} fill="url(#colorHum)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}