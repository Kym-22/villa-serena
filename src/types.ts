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
  // Área que reportó la incidencia. Opcional: si falta se asume Limpieza,
  // que es el único módulo que las registraba antes de Mantenimiento.
  area?: AreaSolicitud;
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

export type Modulo = 'limpieza' | 'roomservice' | 'recepcion' | 'admin' | 'mantenimiento' | 'huesped';

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

export type PermisoModulo = 'limpieza' | 'roomservice' | 'recepcion' | 'admin' | 'mantenimiento';

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

/* =========================================================
   MANTENIMIENTO
   ========================================================= */

export type SeccionMant = 'panel' | 'incidencias' | 'ordenes' | 'preventivo' | 'activos';

export type EstadoOT =
  | 'abierta'
  | 'asignada'
  | 'en-proceso'
  | 'resuelta'
  | 'cerrada'
  | 'cancelada';

export type OrigenOT = 'incidencia' | 'interna' | 'preventivo';

export type TipoAveria =
  | 'Fuga de agua'
  | 'Avería técnica'
  | 'Daño en mobiliario'
  | 'Problema eléctrico'
  | 'Otro';

export type CategoriaActivo =
  | 'Climatización'
  | 'Electricidad'
  | 'Fontanería'
  | 'Mobiliario'
  | 'Ascensores'
  | 'Cocina';

export type EstadoActivo = 'operativo' | 'en-reparacion' | 'fuera-servicio';

export type FrecuenciaPreventivo =
  | 'semanal'
  | 'mensual'
  | 'trimestral'
  | 'semestral'
  | 'anual';

export interface CambioEstadoOT {
  estado: EstadoOT;
  fechaHora: string; // ISO
  responsable: string;
  nota?: string;
}

// Repuestos propios del módulo. En esta ronda son informativos:
// no descuentan del inventario de Administración (queda para la ronda 2).
export interface Repuesto {
  id: string;
  nombre: string;
  unidad: string;
  stock: number;
  costoUnitario: number;
}

export interface RepuestoUsado {
  repuestoId: string;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
}

export interface OrdenTrabajo {
  id: string;
  codigo: string; // OT-0001
  ubicacion: string; // número de habitación o área común
  esHabitacion: boolean;
  tipo: TipoAveria;
  descripcion: string;
  prioridad: PrioridadIncidencia; // alta | media | baja
  origen: OrigenOT;
  incidenciaId?: string;
  activoId?: string;
  tareaPreventivaId?: string;
  impideUso: boolean;
  // Área de la que provino el reporte que originó la orden.
  area?: AreaSolicitud;
  estado: EstadoOT;
  tecnicoId: string | null;
  fechaCompromiso: string; // YYYY-MM-DD
  solucion?: string;
  minutosEmpleados?: number;
  motivoCancelacion?: string;
  repuestos: RepuestoUsado[];
  creadaEn: string; // ISO
  cerradaEn?: string; // ISO
  historial: CambioEstadoOT[];
}

export interface Activo {
  id: string;
  nombre: string;
  categoria: CategoriaActivo;
  ubicacion: string;
  marcaModelo: string;
  instaladoEn: string; // YYYY-MM-DD
  estado: EstadoActivo;
}

export interface TareaPreventiva {
  id: string;
  nombre: string;
  activoId: string | null;
  ubicacion: string;
  frecuencia: FrecuenciaPreventivo;
  proximaEjecucion: string; // YYYY-MM-DD
  ultimaEjecucion?: string; // YYYY-MM-DD
  activa: boolean;
}

/* =========================================================
   HUÉSPED
   Vista que usa el cliente del hotel desde su propio teléfono.
   Cubre HU-01 (reserva), HU-02 (check-in web), HU-03 (servicios),
   HU-04 (confort y amenidades) y HU-05 (cuenta y check-out).
   ========================================================= */

export type SeccionHuesped =
  | 'inicio'
  | 'reservar'
  | 'checkin'
  | 'servicios'
  | 'habitacion'
  | 'cuenta';

// --- HU-01: oferta pública de habitaciones ---

export interface OfertaHabitacion {
  tipo: TipoHabitacion;
  descripcion: string;
  capacidad: number;
  precioNoche: number;
  metros: number;
  fotos: string[];
  amenidades: string[];
}

export interface DatosContacto {
  nombre: string;
  correo: string;
  telefono: string;
  documento: string;
}

export interface ReservaHuesped {
  codigo: string;
  tipo: TipoHabitacion;
  fechaEntrada: string; // YYYY-MM-DD
  fechaSalida: string; // YYYY-MM-DD
  personas: number;
  noches: number;
  precioNoche: number;
  total: number;
  contacto: DatosContacto;
  ultimos4: string;
  creadaEn: string; // ISO
}

// --- HU-02: check-in web anticipado ---

export type EstadoCheckInWeb = 'disponible' | 'completado';

export type FormatoDocumento = 'JPG' | 'PDF';

export interface DocumentoCargado {
  nombre: string;
  formato: FormatoDocumento;
  pesoKb: number;
}

export interface CheckInWeb {
  estado: EstadoCheckInWeb;
  documento: DocumentoCargado | null;
  firma: string | null; // trazo del canvas de firma (data URL)
  peticiones: string[];
  notaPeticiones: string;
  completadoEn?: string; // ISO
  codigoLlave?: string; // contenido que representa el QR de acceso
}

// --- HU-03: portal de servicios y pedidos ---

export type CategoriaServicioHuesped =
  | 'Habitación'
  | 'Limpieza'
  | 'Bienestar'
  | 'Recepción';

export interface ServicioCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaServicioHuesped;
  precio: number; // 0 = sin costo adicional
  minutosEstimados: number;
}

export type EstadoPedidoHuesped =
  | 'recibido'
  | 'en-preparacion'
  | 'en-camino'
  | 'entregado'
  | 'cancelado';

export type TipoPedidoHuesped = 'restaurante' | 'servicio';

export interface LineaPedidoHuesped {
  refId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface PedidoHuesped {
  id: string;
  numero: number;
  tipo: TipoPedidoHuesped;
  lineas: LineaPedidoHuesped[];
  nota: string;
  alergias: string;
  estado: EstadoPedidoHuesped;
  minutosEstimados: number;
  creadoEn: string; // ISO
  entregadoEn?: string; // ISO
  historial: { estado: EstadoPedidoHuesped; fechaHora: string }[];
}

export interface MensajeChat {
  id: string;
  autor: 'huesped' | 'recepcion';
  texto: string;
  hora: string; // ISO
}

// --- HU-04: domótica y amenidades ---

export interface Luz {
  id: string;
  nombre: string;
  encendida: boolean;
  intensidad: number; // 0–100
}

export interface Domotica {
  climaEncendido: boolean;
  temperatura: number; // °C
  luces: Luz[];
  cortinas: number; // % de apertura
  noMolestar: boolean;
  hacerHabitacion: boolean;
  wifiConectado: boolean;
}

export type AreaAmenidad =
  | 'Spa'
  | 'Gimnasio'
  | 'Cancha de tenis'
  | 'Restaurante Mirador'
  | 'Piscina';

export interface TurnoAmenidad {
  id: string;
  area: AreaAmenidad;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  aforo: number;
  ocupados: number;
}

export interface ReservaAmenidad {
  id: string;
  turnoId: string;
  area: AreaAmenidad;
  fecha: string;
  hora: string;
  personas: number;
  creadaEn: string; // ISO
}

// --- HU-05: cuenta, factura y check-out ---

export type CategoriaCargo =
  | 'Estancia'
  | 'Restaurante'
  | 'Room service'
  | 'Servicios'
  | 'Amenidades';

export interface CargoHuesped {
  id: string;
  concepto: string;
  categoria: CategoriaCargo;
  cantidad: number;
  precioUnitario: number;
  fecha: string; // ISO
}

export type MetodoPagoHuesped = 'tarjeta' | 'debito' | 'puntos';

export interface DatosFiscales {
  nombre: string;
  nit: string;
  direccion: string;
  correo: string;
}

export interface PagoHuespedApp {
  id: string;
  monto: number;
  metodo: MetodoPagoHuesped;
  fecha: string; // ISO
  comprobante: string; // FEL-0001
  ultimos4?: string;
  puntosUsados?: number;
}
