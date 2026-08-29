export type EstadoHabitacion = 'limpia' | 'pendiente' | 'en-limpieza' | 'inspeccion' | 'fuera-servicio';
export type TipoHabitacion = 'Standard' | 'Superior' | 'Deluxe' | 'Suite Deluxe' | 'Suite';

export interface Tarea {
  id: string;
  nombre: string;
  completada: boolean;
}

export interface Habitacion {
  id: string;
  numero: string;
  piso: number;
  tipo: TipoHabitacion;
  estado: EstadoHabitacion;
  personal: string | null;
  proximaLlegada: string | null;
  tareas: Tarea[];
  observaciones: string;
  foto: string;
  finalizadaEn?: string;
}

export type EstadoSolicitud = 'pendiente' | 'en-proceso' | 'en-limpieza' | 'finalizada' | 'entregado';
export type TipoSolicitud = 'limpieza' | 'articulos';

export interface Solicitud {
  id: string;
  habitacionNumero: string;
  tipo: TipoSolicitud;
  descripcion: string;
  cantidad?: number;
  hora: string;
  estado: EstadoSolicitud;
  horaEntrega?: string;
  observaciones: string;
}

export type PrioridadIncidencia = 'alta' | 'media' | 'baja';
export type EstadoIncidencia = 'pendiente' | 'en-proceso' | 'resuelta';

export interface Incidencia {
  id: string;
  habitacionNumero: string;
  tipo: string;
  descripcion: string;
  prioridad: PrioridadIncidencia;
  hora: string;
  estado: EstadoIncidencia;
  impideUso: boolean;
}

export interface ObjetoOlvidado {
  id: string;
  habitacionNumero: string;
  descripcion: string;
  fechaHora: string;
  observaciones: string;
  estado: 'guardado' | 'devuelto';
}

export interface EntradaHistorial {
  id: string;
  habitacionNumero: string;
  tipo: string;
  fechaHora: string;
  estado: string;
  responsable: string;
}

export type Pantalla = 'inicio' | 'mapa' | 'solicitudes' | 'incidencias' | 'objetos' | 'historial';
