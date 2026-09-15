import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// 1. Tipos de datos que recibe y procesa el componente
interface GraficoHistorialProps {
  isDarkTheme: boolean;
  selectedBranch: string;
  period: string;
}

interface SensorReading {
  address: string;
  temp: number;
}

interface RawHistoryData {
  timestamp: string;
  readings: SensorReading[];
}

interface ChartData {
  time: string;
  [macAddress: string]: string | number; // Permite llaves dinámicas para múltiples sensores
}

const API_URL = import.meta.env.VITE_API_URL || 'https://termosync-backend-production.up.railway.app';

export default function GraficoHistorial({ isDarkTheme, selectedBranch, period }: GraficoHistorialProps) {
  const [historyData, setHistoryData] = useState<ChartData[]>([]);
  const [uniqueSensors, setUniqueSensors] = useState<string[]>([]);

  // 2. Fetch de datos cada vez que cambia la sucursal o el período
  useEffect(() => {
    if (!selectedBranch) return;

    fetch(`${API_URL}/api/telemetry/historial?branchId=${selectedBranch}&periodo=${period}`)
      .then(res => res.json())
      .then((data: RawHistoryData[]) => {
        const formattedData: ChartData[] = [];
        const sensorsFound = new Set<string>();

        data.forEach(entry => {
          // Formateamos la hora
          const row: ChartData = {
            time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          // Recorremos el array interno de sensores
          entry.readings.forEach(sensor => {
            row[sensor.address] = sensor.temp;
            sensorsFound.add(sensor.address);
          });

          formattedData.push(row);
        });

        setHistoryData(formattedData);
        setUniqueSensors(Array.from(sensorsFound));
      })
      .catch(err => console.error("Error cargando historial:", err));
  }, [selectedBranch, period]);

  // Paleta de colores para las líneas (soportando hasta 6 sensores)
  const colors = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"];

  // 3. Estilos dinámicos adaptados al Tema Claro / Oscuro de tu App
  const textColor = isDarkTheme ? '#cbd5e1' : '#64748b'; // slate-300 o slate-500
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = isDarkTheme ? '#020617' : '#ffffff'; // black/slate-950 o blanco

  return (
    <div className="glass-card mt-6 w-full rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
          Historial de Temperaturas
        </h2>
        <p className="text-sm text-slate-400">
          Evolución térmica de los sensores en el período seleccionado.
        </p>
      </div>
      
      <div className="h-[400px] w-full">
        {historyData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            Esperando datos para graficar...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              
              <XAxis 
                dataKey="time" 
                stroke={textColor} 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis 
                stroke={textColor} 
                fontSize={12} 
                unit="°C" 
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip
                contentStyle={{ 
                  backgroundColor: tooltipBg,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  color: isDarkTheme ? '#fff' : '#000'
                }}
              />
              
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* Dibuja automáticamente una línea por cada MAC encontrada en la base de datos */}
              {uniqueSensors.map((mac, index) => (
                <Line
                  key={mac}
                  type="monotone"
                  dataKey={mac}
                  name={`Sensor ${mac.slice(-4)}`} // Muestra solo los 4 últimos dígitos de la MAC para que la leyenda sea legible
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}