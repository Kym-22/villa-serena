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

/* =========================================================
   ROOM SERVICE
   ========================================================= */

export type Modulo = 'limpieza' | 'roomservice' | 'recepcion' | 'admin';

export type EstadoPedido =
  | 'nuevo'
  | 'en-preparacion'
  | 'en-camino'
  | 'entregado'
  | 'cancelado';

export type OrigenPedido = 'app' | 'telefono';

export type CategoriaMenu =
  | 'Desayuno'
  | 'Principales'
  | 'Ligero'
  | 'Postres'
  | 'Bebidas';

export type TurnoRS = 'mañana' | 'tarde' | 'noche';

export interface ItemMenu {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaMenu;
  disponible: boolean;
}

export interface LineaPedido {
  itemId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  nota?: string;
}

export interface CambioEstado {
  estado: EstadoPedido;
  fechaHora: string; // ISO
  motivo?: string;
}

export interface Pedido {
  id: string;
  numero: number;
  habitacionNumero: string;
  piso: number;
  huesped: string;
  origen: OrigenPedido;
  turno: TurnoRS;
  lineas: LineaPedido[];
  notaGeneral: string;
  estado: EstadoPedido;
  creadoEn: string; // ISO
  entregadoEn?: string; // ISO
  motivoCancelacion?: string;
  historial: CambioEstado[];
}

export interface NotificacionRS {
  id: string;
  pedidoId: string;
  habitacionNumero: string;
  hora: string; // ISO
  leida: boolean;
}

export type SeccionRS = 'pedidos' | 'menu' | 'historial' | 'cargos';

/* =========================================================
   RECEPCIÓN
   ========================================================= */

export type EstadoHabHotel =
  | 'disponible'
  | 'ocupada'
  | 'reservada'
  | 'en-limpieza'
  | 'mantenimiento';

export interface HabitacionHotel {
  id: string;
  numero: string;
  piso: number;
  tipo: TipoHabitacion;
  capacidad: number;
  precioNoche: number;
  estado: EstadoHabHotel;
}

export type TipoDocumento = 'DPI' | 'Pasaporte';

export interface Huesped {
  id: string;
  nombre: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  telefono: string;
  correo: string;
  nacionalidad: string;
  creadoEn: string; // ISO
}

export type EstadoReserva =
  | 'pendiente'
  | 'confirmada'
  | 'en-curso'
  | 'finalizada'
  | 'cancelada';

export interface Acompanante {
  nombre: string;
  documento: string;
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Pago {
  id: string;
  fecha: string; // ISO
  monto: number;
  metodo: MetodoPago;
  comprobante: string; // correlativo, ej. CP-0001
}

export interface ServicioAdicional {
  id: string;
  tipo: string; // Restaurante, Lavandería, Estacionamiento, Spa, Otro
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  fecha: string; // ISO
}

export interface Reserva {
  id: string;
  codigo: string; // RES-1024
  huespedId: string;
  habitacionId: string | null;
  tipoHabitacion: TipoHabitacion;
  fechaEntrada: string; // YYYY-MM-DD
  fechaSalida: string; // YYYY-MM-DD
  personas: number;
  estado: EstadoReserva;
  acompanantes: Acompanante[];
  servicios: ServicioAdicional[];
  pagos: Pago[];
  descuento: number; // monto en la moneda del hotel
  checkInEn?: string; // ISO
  checkOutEn?: string; // ISO
  motivoCancelacion?: string;
  creadoEn: string; // ISO
}

export type EstadoSolicitudHuesped = 'pendiente' | 'en-proceso' | 'atendida';
export type PrioridadSolicitud = 'alta' | 'media' | 'baja';
export type AreaSolicitud = 'Limpieza' | 'Mantenimiento' | 'Room Service' | 'Recepción';

export interface SolicitudHuesped {
  id: string;
  huespedId: string;
  habitacionNumero: string;
  descripcion: string;
  area: AreaSolicitud;
  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitudHuesped;
  fecha: string; // ISO
}

export type SeccionRecepcion =
  | 'dia'
  | 'reservas'
  | 'disponibilidad'
  | 'habitaciones'
  | 'huespedes'
  | 'solicitudes';

/* =========================================================
   ADMINISTRADOR
   ========================================================= */

export type SeccionAdmin = 'panel' | 'tarifas' | 'reportes' | 'personal' | 'inventario';

// --- HU-2: Tarifas y ofertas ---

export type CriterioTarifa = 'temporada' | 'ocupacion' | 'evento';
export type AjusteTarifa = 'porcentaje' | 'fijo';

export interface ReglaTarifa {
  id: string;
  nombre: string;
  tipoHabitacion: TipoHabitacion | 'Todas';
  criterio: CriterioTarifa;
  ajuste: AjusteTarifa;
  valor: number; // +% (puede ser negativo) o precio fijo por noche
  desde?: string; // YYYY-MM-DD (temporada / evento)
  hasta?: string; // YYYY-MM-DD
  umbralOcupacion?: number; // % a partir del cual aplica (criterio 'ocupacion')
  activa: boolean;
}

export interface Promocion {
  id: string;
  nombre: string;
  codigo: string;
  descuentoPct: number;
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
  activa: boolean;
}

// --- HU-4: Personal ---

export type RolPersonal =
  | 'Recepción'
  | 'Limpieza'
  | 'Room Service'
  | 'Mantenimiento'
  | 'Administración';

export type TurnoPersonal = 'Mañana' | 'Tarde' | 'Noche';

export type PermisoModulo = 'limpieza' | 'roomservice' | 'recepcion' | 'admin';

export type EstadoAsistencia = 'presente' | 'ausente' | 'descanso' | 'pendiente';

export interface Empleado {
  id: string;
  nombre: string;
  rol: RolPersonal;
  turno: TurnoPersonal;
  telefono: string;
  activo: boolean;
  permisos: PermisoModulo[];
  tareasCompletadas: number;
  tareasAsignadas: number;
  puntualidadPct: number;
  asistencia: EstadoAsistencia;
}

// --- HU-5: Inventario ---

export type CategoriaInsumo = 'Lencería' | 'Aseo' | 'Amenities' | 'Minibar' | 'Limpieza';
export type TipoMovimiento = 'entrada' | 'salida' | 'merma';

export interface Insumo {
  id: string;
  nombre: string;
  categoria: CategoriaInsumo;
  unidad: string;
  stock: number;
  stockMinimo: number;
  costoUnitario: number;
  vencimiento?: string; // YYYY-MM-DD
}

export interface MovimientoInsumo {
  id: string;
  insumoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  fecha: string; // ISO
}
