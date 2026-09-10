export interface GraficoHistorialProps {
  isDarkTheme: boolean;
}

export interface SensorHistoryItem {
  temperatura: number;
  humedad: number;
  timestamp: string;
  fechaVisible?: string;
}
