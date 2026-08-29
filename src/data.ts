import type {
  Habitacion,
  Solicitud,
  Incidencia,
  ObjetoOlvidado,
  EntradaHistorial,
  ItemMenu,
  Pedido,
  TurnoRS,
  TipoHabitacion,
  HabitacionHotel,
  Huesped,
  Reserva,
  SolicitudHuesped,
  ReglaTarifa,
  Promocion,
  Empleado,
  Insumo,
  MovimientoInsumo,
} from "./types"

/* =========================================================
   TAREAS DE LIMPIEZA DE HABITACIÓN
   ========================================================= */

const tareasBase = () => [
  { id: "t1", nombre: "Retirar basura y residuos", completada: false },
  { id: "t2", nombre: "Cambiar ropa de cama", completada: false },
  { id: "t3", nombre: "Cambiar toallas", completada: false },
  { id: "t4", nombre: "Limpiar y desinfectar baño", completada: false },
  { id: "t5", nombre: "Limpiar espejos", completada: false },
  { id: "t6", nombre: "Limpiar muebles y superficies", completada: false },
  { id: "t7", nombre: "Aspirar piso o alfombra", completada: false },
  { id: "t8", nombre: "Trapear piso", completada: false },
  { id: "t9", nombre: "Reponer papel higiénico", completada: false },
  { id: "t10", nombre: "Reponer amenidades", completada: false },
  { id: "t11", nombre: "Realizar inspección final", completada: false },
]

/* =========================================================
   FOTOGRAFÍAS DE HABITACIONES
   ========================================================= */

const FOTO_STANDARD =
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format"

const FOTO_SUPERIOR =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format"

const FOTO_DELUXE =
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format"

const FOTO_SUITE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=380&fit=crop&auto=format"

/* =========================================================
   HABITACIONES
   ========================================================= */

export const HABITACIONES_INICIALES: Habitacion[] = [
  /* ===================== PISO 1 ===================== */

  {
    id: "h101",
    numero: "101",
    piso: 1,
    tipo: "Standard",
    estado: "limpia",
    personal: "Carmen Vidal",
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_STANDARD,
  },

  {
    id: "h102",
    numero: "102",
    piso: 1,
    tipo: "Standard",
    estado: "en-limpieza",
    personal: "Carmen Vidal",
    proximaLlegada: "2:00 p. m.",

    tareas: tareasBase().map((t, i) => ({
      ...t,
      completada: i < 2,
    })),

    observaciones: "",
    foto: FOTO_STANDARD,
  },

  {
    id: "h103",
    numero: "103",
    piso: 1,
    tipo: "Superior",
    estado: "pendiente",
    personal: null,
    proximaLlegada: null,

    tareas: tareasBase(),

    observaciones: "",
    foto: FOTO_SUPERIOR,
  },

  {
    id: "h104",
    numero: "104",
    piso: 1,
    tipo: "Standard",
    estado: "limpia",
    personal: "Laura Méndez",
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_STANDARD,
  },

  {
    id: "h105",
    numero: "105",
    piso: 1,
    tipo: "Deluxe",
    estado: "fuera-servicio",
    personal: null,
    proximaLlegada: null,

    tareas: tareasBase(),

    observaciones: "Avería de aire acondicionado. En reparación.",

    foto: FOTO_DELUXE,
  },

  {
    id: "h106",
    numero: "106",
    piso: 1,
    tipo: "Deluxe",
    estado: "limpia",
    personal: "Laura Méndez",
    proximaLlegada: "3:30 p. m.",

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_DELUXE,
  },

  /* ===================== PISO 2 ===================== */

  {
    id: "h201",
    numero: "201",
    piso: 2,
    tipo: "Standard",
    estado: "limpia",
    personal: "Laura Méndez",
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_STANDARD,
  },

  {
    id: "h202",
    numero: "202",
    piso: 2,
    tipo: "Superior",
    estado: "limpia",
    personal: "Carmen Vidal",
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_SUPERIOR,
  },

  {
    id: "h203",
    numero: "203",
    piso: 2,
    tipo: "Deluxe",
    estado: "limpia",
    personal: null,
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_DELUXE,
  },

  {
    id: "h204",
    numero: "204",
    piso: 2,
    tipo: "Suite Deluxe",
    estado: "pendiente",
    personal: "Carmen Vidal",
    proximaLlegada: "2:00 p. m.",

    tareas: tareasBase(),

    observaciones: "",
    foto: FOTO_SUITE,
  },

  {
    id: "h205",
    numero: "205",
    piso: 2,
    tipo: "Superior",
    estado: "pendiente",
    personal: null,
    proximaLlegada: null,

    tareas: tareasBase(),

    observaciones: "",
    foto: FOTO_SUPERIOR,
  },

  /* ===================== PISO 3 ===================== */

  {
    id: "h301",
    numero: "301",
    piso: 3,
    tipo: "Suite",
    estado: "limpia",
    personal: "Laura Méndez",
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_SUITE,
  },

  {
    id: "h302",
    numero: "302",
    piso: 3,
    tipo: "Standard",
    estado: "limpia",
    personal: "Carmen Vidal",
    proximaLlegada: null,

    tareas: tareasBase().map((t) => ({
      ...t,
      completada: true,
    })),

    observaciones: "",
    foto: FOTO_STANDARD,
    finalizadaEn: "10:42 a. m.",
  },

  {
    id: "h303",
    numero: "303",
    piso: 3,
    tipo: "Superior",
    estado: "en-limpieza",
    personal: "Laura Méndez",
    proximaLlegada: null,

    tareas: tareasBase().map((t, i) => ({
      ...t,
      completada: i < 3,
    })),

    observaciones: "",
    foto: FOTO_SUPERIOR,
  },

  {
    id: "h304",
    numero: "304",
    piso: 3,
    tipo: "Deluxe",
    estado: "pendiente",
    personal: null,
    proximaLlegada: "4:00 p. m.",

    tareas: tareasBase(),

    observaciones: "",
    foto: FOTO_DELUXE,
  },
]

/* =========================================================
   SOLICITUDES
   ========================================================= */

export const SOLICITUDES_INICIALES: Solicitud[] = [
  {
    id: "s1",
    habitacionNumero: "204",
    tipo: "articulos",
    descripcion: "Toallas",
    cantidad: 2,
    hora: "10:30 a.m.",
    estado: "pendiente",
    observaciones: "Solicitud urgente del huésped.",
  },

  {
    id: "s2",
    habitacionNumero: "102",
    tipo: "limpieza",
    descripcion: "Limpieza de habitación",
    hora: "10:45 a.m.",
    estado: "en-limpieza",
    observaciones: "",
  },

  {
    id: "s3",
    habitacionNumero: "103",
    tipo: "articulos",
    descripcion: "Almohadas extra",
    cantidad: 1,
    hora: "11:00 a.m.",
    estado: "pendiente",
    observaciones: "",
  },

  {
    id: "s4",
    habitacionNumero: "301",
    tipo: "articulos",
    descripcion: "Botella de agua",
    cantidad: 2,
    hora: "09:15 a.m.",
    estado: "entregado",
    horaEntrega: "09:30 a.m.",
    observaciones: "",
  },

  {
    id: "s5",
    habitacionNumero: "106",
    tipo: "limpieza",
    descripcion: "Servicio de limpieza completo",
    hora: "08:30 a.m.",
    estado: "finalizada",
    horaEntrega: "09:50 a.m.",
    observaciones: "",
  },
]

/* =========================================================
   INCIDENCIAS
   ========================================================= */

export const INCIDENCIAS_INICIALES: Incidencia[] = [
  {
    id: "i1",
    habitacionNumero: "204",
    tipo: "Fuga de agua",

    descripcion: "Fuga de agua bajo el lavabo del baño principal.",

    prioridad: "alta",
    hora: "10:35 a. m.",
    estado: "pendiente",
    impideUso: false,
  },

  {
    id: "i2",
    habitacionNumero: "105",
    tipo: "Avería técnica",

    descripcion:
      "El equipo de aire acondicionado no funciona. La habitación está fuera de servicio.",

    prioridad: "alta",
    hora: "09:00 a. m.",
    estado: "en-proceso",
    impideUso: true,
  },

  {
    id: "i3",
    habitacionNumero: "302",
    tipo: "Daño en mobiliario",

    descripcion: "Espejo del baño con grieta visible.",

    prioridad: "media",
    hora: "08:50 a. m.",
    estado: "resuelta",
    impideUso: false,
  },
]

/* =========================================================
   OBJETOS OLVIDADOS
   ========================================================= */

export const OBJETOS_INICIALES: ObjetoOlvidado[] = [
  {
    id: "o1",
    habitacionNumero: "301",

    descripcion: "Libro y auriculares inalámbricos negros",

    fechaHora: "Ayer, 14:30",

    observaciones: "Encontrados bajo la cama.",

    estado: "guardado",
  },

  {
    id: "o2",
    habitacionNumero: "202",

    descripcion: "Cargador de laptop Apple",

    fechaHora: "Ayer, 11:00",

    observaciones: "Conectado junto al escritorio.",

    estado: "guardado",
  },

  {
    id: "o3",
    habitacionNumero: "104",

    descripcion: "Reloj de pulsera plateado",

    fechaHora: "Hace 2 días, 10:15",

    observaciones: "En la mesita de noche.",

    estado: "devuelto",
  },
]

/* =========================================================
   HISTORIAL
   ========================================================= */

export const HISTORIAL_INICIAL: EntradaHistorial[] = [
  {
    id: "hist1",
    habitacionNumero: "302",
    tipo: "Limpieza completa",
    fechaHora: "10:42 a. m.",
    estado: "Limpia",
    responsable: "Carmen Vidal",
  },

  {
    id: "hist2",
    habitacionNumero: "204",
    tipo: "Incidencia reportada",
    fechaHora: "10:35 a. m.",
    estado: "Pendiente",
    responsable: "Carmen Vidal",
  },

  {
    id: "hist3",
    habitacionNumero: "204",
    tipo: "Solicitud recibida",
    fechaHora: "10:20 a. m.",
    estado: "Pendiente",
    responsable: "Sistema",
  },

  {
    id: "hist4",
    habitacionNumero: "101",
    tipo: "Limpieza completa",
    fechaHora: "09:30 a. m.",
    estado: "Limpia",
    responsable: "Carmen Vidal",
  },

  {
    id: "hist5",
    habitacionNumero: "202",
    tipo: "Limpieza completa",
    fechaHora: "09:15 a. m.",
    estado: "Limpia",
    responsable: "Carmen Vidal",
  },

  {
    id: "hist6",
    habitacionNumero: "301",
    tipo: "Limpieza completa",
    fechaHora: "08:45 a. m.",
    estado: "Limpia",
    responsable: "Laura Méndez",
  },

  {
    id: "hist7",
    habitacionNumero: "104",
    tipo: "Limpieza completa",
    fechaHora: "08:30 a. m.",
    estado: "Limpia",
    responsable: "Laura Méndez",
  },

  {
    id: "hist8",
    habitacionNumero: "201",
    tipo: "Limpieza completa",
    fechaHora: "08:15 a. m.",
    estado: "Limpia",
    responsable: "Laura Méndez",
  },
]

/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

export function generarId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function horaActual(): string {
  const now = new Date()

  let h = now.getHours()

  const m = now.getMinutes().toString().padStart(2, "0")

  const ampm = h >= 12 ? "p. m." : "a. m."

  h = h % 12 || 12

  return `${h}:${m} ${ampm}`
}

/* =========================================================
   ROOM SERVICE — CONFIGURACIÓN Y AUXILIARES
   ========================================================= */

// Moneda del hotel. Cambia este valor para adaptar todo el módulo.
export const MONEDA = "$"

export const ENCARGADO_RS = "Diego Fuentes"

export const HABITACIONES_HOTEL = [
  "101", "102", "103", "104", "105", "106",
  "201", "202", "203", "204", "205",
  "301", "302", "303", "304",
]

export const TURNOS_HORARIO: Record<TurnoRS, string> = {
  "mañana": "06:00 – 14:00",
  "tarde": "14:00 – 22:00",
  "noche": "22:00 – 06:00",
}

export function turnoActual(): TurnoRS {
  const h = new Date().getHours()
  if (h >= 6 && h < 14) return "mañana"
  if (h >= 14 && h < 22) return "tarde"
  return "noche"
}

export function ahoraISO(): string {
  return new Date().toISOString()
}

// ISO de un instante situado `min` minutos en el pasado.
function haceMinutos(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}

export function formatoHoraISO(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, "0")
  const ampm = h >= 12 ? "p. m." : "a. m."
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

// Minutos transcurridos entre dos instantes ISO (o hasta ahora si falta el segundo).
export function minutosEntre(desdeISO: string, hastaISO?: string): number {
  const fin = hastaISO ? new Date(hastaISO).getTime() : Date.now()
  const ini = new Date(desdeISO).getTime()
  return Math.max(0, Math.round((fin - ini) / 60_000))
}

export function formatoDuracion(min: number): string {
  if (min < 1) return "menos de 1 min"
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export function pisoDeHabitacion(numero: string): number {
  return parseInt(numero.charAt(0), 10) || 1
}

// Huéspedes registrados por habitación (se autocompleta al tomar un pedido telefónico).
export const HUESPEDES_POR_HABITACION: Record<string, string> = {
  "101": "Marta Salinas",
  "103": "Andrés Villalba",
  "106": "Familia Chen",
  "202": "Rebeca Ordóñez",
  "204": "Familia Restrepo",
  "205": "Tomás Iriarte",
  "301": "Sr. y Sra. Delgado",
  "304": "Valentina Cruz",
}

/* =========================================================
   ROOM SERVICE — MENÚ / CATÁLOGO
   ========================================================= */

export const MENU_INICIAL: ItemMenu[] = [
  // Desayuno
  { id: "m-continental", nombre: "Desayuno continental", descripcion: "Pan artesanal, mantequilla, mermelada, jugo y café.", precio: 8.5, categoria: "Desayuno", disponible: true },
  { id: "m-huevos", nombre: "Huevos al gusto", descripcion: "Dos huevos, tostadas y papas doradas.", precio: 7.0, categoria: "Desayuno", disponible: true },
  { id: "m-frutas", nombre: "Bowl de frutas", descripcion: "Selección de fruta fresca de estación.", precio: 5.5, categoria: "Desayuno", disponible: true },
  { id: "m-panqueques", nombre: "Panqueques con miel de maple", descripcion: "Tres panqueques esponjosos con mantequilla.", precio: 6.5, categoria: "Desayuno", disponible: true },

  // Principales
  { id: "m-hamburguesa", nombre: "Hamburguesa de la casa", descripcion: "Carne de res, cheddar, tocino y papas fritas.", precio: 12.0, categoria: "Principales", disponible: true },
  { id: "m-alfredo", nombre: "Pasta Alfredo", descripcion: "Fettuccine en salsa cremosa de parmesano.", precio: 11.0, categoria: "Principales", disponible: true },
  { id: "m-salmon", nombre: "Salmón a la parrilla", descripcion: "Con vegetales salteados y arroz jazmín.", precio: 16.5, categoria: "Principales", disponible: true },
  { id: "m-curry", nombre: "Pollo al curry", descripcion: "Con arroz basmati y pan naan.", precio: 13.0, categoria: "Principales", disponible: true },
  { id: "m-risotto", nombre: "Risotto de hongos", descripcion: "Arroz arborio, hongos silvestres y parmesano.", precio: 12.5, categoria: "Principales", disponible: false },

  // Ligero
  { id: "m-cesar", nombre: "Ensalada César", descripcion: "Lechuga romana, crutones y aderezo césar.", precio: 8.0, categoria: "Ligero", disponible: true },
  { id: "m-club", nombre: "Club sándwich", descripcion: "Pollo, tocino, huevo y papas fritas.", precio: 9.5, categoria: "Ligero", disponible: true },
  { id: "m-sopa", nombre: "Sopa del día", descripcion: "Crema de zapallo con crotones.", precio: 5.0, categoria: "Ligero", disponible: true },

  // Postres
  { id: "m-cheesecake", nombre: "Cheesecake de frutos rojos", descripcion: "Base de galleta y salsa de berries.", precio: 6.0, categoria: "Postres", disponible: true },
  { id: "m-brownie", nombre: "Brownie con helado", descripcion: "Brownie tibio con helado de vainilla.", precio: 5.5, categoria: "Postres", disponible: true },
  { id: "m-flan", nombre: "Flan de la casa", descripcion: "Flan de huevo con caramelo.", precio: 4.5, categoria: "Postres", disponible: true },

  // Bebidas
  { id: "m-jugo", nombre: "Jugo natural de naranja", descripcion: "Exprimido del día, 350 ml.", precio: 3.5, categoria: "Bebidas", disponible: false },
  { id: "m-cafe", nombre: "Café americano", descripcion: "Taza doble, grano de la casa.", precio: 2.5, categoria: "Bebidas", disponible: true },
  { id: "m-vino", nombre: "Botella de vino tinto", descripcion: "Cabernet Sauvignon reserva, 750 ml.", precio: 22.0, categoria: "Bebidas", disponible: true },
  { id: "m-agua", nombre: "Agua mineral 500 ml", descripcion: "Con o sin gas.", precio: 2.0, categoria: "Bebidas", disponible: true },
  { id: "m-gaseosa", nombre: "Gaseosa", descripcion: "Lata 350 ml.", precio: 2.5, categoria: "Bebidas", disponible: true },
]

/* =========================================================
   ROOM SERVICE — PEDIDOS INICIALES
   ========================================================= */

// El turno se fija al cargar la app para que la demo sea coherente
// sin importar la hora en que se ejecute.
const _TURNO = turnoActual()

export const PEDIDOS_INICIALES: Pedido[] = [
  {
    id: "pd-1042",
    numero: 1042,
    habitacionNumero: "204",
    piso: 2,
    huesped: "Familia Restrepo",
    origen: "app",
    turno: _TURNO,
    lineas: [
      { itemId: "m-hamburguesa", nombre: "Hamburguesa de la casa", precioUnitario: 12.0, cantidad: 2, nota: "Una sin cebolla" },
      { itemId: "m-gaseosa", nombre: "Gaseosa", precioUnitario: 2.5, cantidad: 2 },
    ],
    notaGeneral: "Alergia a los frutos secos. Tocar el timbre, no golpear la puerta.",
    estado: "nuevo",
    creadoEn: haceMinutos(46),
    historial: [{ estado: "nuevo", fechaHora: haceMinutos(46) }],
  },
  {
    id: "pd-1041",
    numero: 1041,
    habitacionNumero: "301",
    piso: 3,
    huesped: "Sr. y Sra. Delgado",
    origen: "telefono",
    turno: _TURNO,
    lineas: [
      { itemId: "m-salmon", nombre: "Salmón a la parrilla", precioUnitario: 16.5, cantidad: 1 },
      { itemId: "m-cesar", nombre: "Ensalada César", precioUnitario: 8.0, cantidad: 1, nota: "Sin crutones (celíaca)" },
      { itemId: "m-vino", nombre: "Botella de vino tinto", precioUnitario: 22.0, cantidad: 1 },
    ],
    notaGeneral: "Aniversario de bodas. Servir en la terraza de la suite.",
    estado: "en-preparacion",
    creadoEn: haceMinutos(34),
    historial: [
      { estado: "nuevo", fechaHora: haceMinutos(34) },
      { estado: "en-preparacion", fechaHora: haceMinutos(22) },
    ],
  },
  {
    id: "pd-1043",
    numero: 1043,
    habitacionNumero: "106",
    piso: 1,
    huesped: "Familia Chen",
    origen: "app",
    turno: _TURNO,
    lineas: [
      { itemId: "m-panqueques", nombre: "Panqueques con miel de maple", precioUnitario: 6.5, cantidad: 2 },
      { itemId: "m-jugo", nombre: "Jugo natural de naranja", precioUnitario: 3.5, cantidad: 2 },
    ],
    notaGeneral: "",
    estado: "en-camino",
    creadoEn: haceMinutos(19),
    historial: [
      { estado: "nuevo", fechaHora: haceMinutos(19) },
      { estado: "en-preparacion", fechaHora: haceMinutos(12) },
      { estado: "en-camino", fechaHora: haceMinutos(3) },
    ],
  },
  {
    id: "pd-1040",
    numero: 1040,
    habitacionNumero: "202",
    piso: 2,
    huesped: "Rebeca Ordóñez",
    origen: "app",
    turno: _TURNO,
    lineas: [
      { itemId: "m-club", nombre: "Club sándwich", precioUnitario: 9.5, cantidad: 1, nota: "Sin mayonesa" },
      { itemId: "m-agua", nombre: "Agua mineral 500 ml", precioUnitario: 2.0, cantidad: 1 },
    ],
    notaGeneral: "",
    estado: "nuevo",
    creadoEn: haceMinutos(9),
    historial: [{ estado: "nuevo", fechaHora: haceMinutos(9) }],
  },
  {
    id: "pd-1039",
    numero: 1039,
    habitacionNumero: "103",
    piso: 1,
    huesped: "Andrés Villalba",
    origen: "telefono",
    turno: _TURNO,
    lineas: [
      { itemId: "m-hamburguesa", nombre: "Hamburguesa de la casa", precioUnitario: 12.0, cantidad: 1 },
      { itemId: "m-brownie", nombre: "Brownie con helado", precioUnitario: 5.5, cantidad: 1 },
      { itemId: "m-cafe", nombre: "Café americano", precioUnitario: 2.5, cantidad: 1 },
    ],
    notaGeneral: "",
    estado: "entregado",
    creadoEn: haceMinutos(98),
    entregadoEn: haceMinutos(59),
    historial: [
      { estado: "nuevo", fechaHora: haceMinutos(98) },
      { estado: "en-preparacion", fechaHora: haceMinutos(84) },
      { estado: "en-camino", fechaHora: haceMinutos(68) },
      { estado: "entregado", fechaHora: haceMinutos(59) },
    ],
  },
  {
    id: "pd-1038",
    numero: 1038,
    habitacionNumero: "304",
    piso: 3,
    huesped: "Valentina Cruz",
    origen: "app",
    turno: _TURNO,
    lineas: [
      { itemId: "m-continental", nombre: "Desayuno continental", precioUnitario: 8.5, cantidad: 1 },
      { itemId: "m-frutas", nombre: "Bowl de frutas", precioUnitario: 5.5, cantidad: 1 },
    ],
    notaGeneral: "Entregar antes de las 8:30, tiene un tour.",
    estado: "entregado",
    creadoEn: haceMinutos(134),
    entregadoEn: haceMinutos(96),
    historial: [
      { estado: "nuevo", fechaHora: haceMinutos(134) },
      { estado: "en-preparacion", fechaHora: haceMinutos(120) },
      { estado: "en-camino", fechaHora: haceMinutos(104) },
      { estado: "entregado", fechaHora: haceMinutos(96) },
    ],
  },
  {
    id: "pd-1037",
    numero: 1037,
    habitacionNumero: "205",
    piso: 2,
    huesped: "Tomás Iriarte",
    origen: "telefono",
    turno: _TURNO,
    lineas: [
      { itemId: "m-risotto", nombre: "Risotto de hongos", precioUnitario: 12.5, cantidad: 1 },
    ],
    notaGeneral: "",
    estado: "cancelado",
    creadoEn: haceMinutos(150),
    motivoCancelacion: "Ítem agotado: no quedaba risotto de hongos en cocina.",
    historial: [
      { estado: "nuevo", fechaHora: haceMinutos(150) },
      { estado: "cancelado", fechaHora: haceMinutos(141), motivo: "Ítem agotado: no quedaba risotto de hongos en cocina." },
    ],
  },
]

// Correlativo para nuevos pedidos creados durante la sesión.
let _ultimoNumero = Math.max(...PEDIDOS_INICIALES.map((p) => p.numero))
export function siguienteNumeroPedido(): number {
  _ultimoNumero += 1
  return _ultimoNumero
}

/* =========================================================
   RECEPCIÓN — CONFIGURACIÓN Y AUXILIARES DE FECHA
   ========================================================= */

export const RECEPCIONISTA = "Paola Guzmán"

export const CAPACIDAD_TIPO: Record<TipoHabitacion, number> = {
  "Standard": 2,
  "Superior": 2,
  "Deluxe": 3,
  "Suite Deluxe": 4,
  "Suite": 4,
}

export const PRECIO_NOCHE_TIPO: Record<TipoHabitacion, number> = {
  "Standard": 75,
  "Superior": 95,
  "Deluxe": 130,
  "Suite Deluxe": 190,
  "Suite": 220,
}

export const NACIONALIDADES = [
  "Guatemalteca", "Mexicana", "Salvadoreña", "Hondureña", "Costarricense",
  "Estadounidense", "Canadiense", "Española", "Argentina", "Colombiana", "Otra",
]

export const TIPOS_SERVICIO = [
  "Restaurante", "Lavandería", "Estacionamiento", "Spa", "Minibar", "Transporte", "Otro",
]

// --- Fechas (formato YYYY-MM-DD, siempre en hora local) ---

function ymdLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dia}`
}

export function fechaHoyISO(): string {
  return ymdLocal(new Date())
}

// Fecha relativa a hoy, en días (puede ser negativa).
export function fechaRelativaISO(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return ymdLocal(d)
}

export function nochesEntre(entradaISO: string, salidaISO: string): number {
  const a = new Date(entradaISO + "T00:00:00").getTime()
  const b = new Date(salidaISO + "T00:00:00").getTime()
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

const _MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

export function formatoFecha(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso.length > 10 ? iso : iso + "T00:00:00")
  return `${d.getDate()} ${_MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatoFechaHora(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return `${formatoFecha(iso)}, ${formatoHoraISO(iso)}`
}

// --- Correlativos de recepción ---

let _correlativoReserva = 1050
export function siguienteCodigoReserva(): string {
  _correlativoReserva += 1
  return `RES-${_correlativoReserva}`
}

let _correlativoComprobante = 0
export function siguienteComprobante(): string {
  _correlativoComprobante += 1
  return `CP-${String(_correlativoComprobante).padStart(4, "0")}`
}

/* =========================================================
   RECEPCIÓN — HABITACIONES DEL HOTEL
   ========================================================= */

function mkHab(numero: string, tipo: TipoHabitacion, estado: HabitacionHotel["estado"]): HabitacionHotel {
  return {
    id: `hh-${numero}`,
    numero,
    piso: pisoDeHabitacion(numero),
    tipo,
    capacidad: CAPACIDAD_TIPO[tipo],
    precioNoche: PRECIO_NOCHE_TIPO[tipo],
    estado,
  }
}

export const HABITACIONES_HOTEL_INICIALES: HabitacionHotel[] = [
  mkHab("101", "Standard", "ocupada"),
  mkHab("102", "Standard", "disponible"),
  mkHab("103", "Superior", "disponible"),
  mkHab("104", "Standard", "en-limpieza"),
  mkHab("105", "Deluxe", "ocupada"),
  mkHab("106", "Deluxe", "disponible"),
  mkHab("201", "Standard", "disponible"),
  mkHab("202", "Superior", "disponible"),
  mkHab("203", "Deluxe", "mantenimiento"),
  mkHab("204", "Suite Deluxe", "disponible"),
  mkHab("205", "Superior", "disponible"),
  mkHab("301", "Suite", "ocupada"),
  mkHab("302", "Standard", "disponible"),
  mkHab("303", "Superior", "disponible"),
  mkHab("304", "Deluxe", "disponible"),
]

/* =========================================================
   RECEPCIÓN — HUÉSPEDES
   ========================================================= */

export const HUESPEDES_INICIALES: Huesped[] = [
  { id: "hu-ana",    nombre: "Ana Morales",       tipoDocumento: "DPI",       documento: "2987 65432 0101", telefono: "+502 5512 3344", correo: "ana.morales@correo.com",   nacionalidad: "Guatemalteca",   creadoEn: "2025-11-02T09:00:00.000Z" },
  { id: "hu-carlos", nombre: "Carlos Ruiz",       tipoDocumento: "Pasaporte", documento: "MX-A1234567",     telefono: "+52 55 8899 1122", correo: "carlos.ruiz@correo.com",   nacionalidad: "Mexicana",       creadoEn: "2026-01-15T14:20:00.000Z" },
  { id: "hu-sofia",  nombre: "Sofía López",       tipoDocumento: "DPI",       documento: "1765 43210 0102", telefono: "+502 4478 9900",  correo: "sofia.lopez@correo.com",   nacionalidad: "Guatemalteca",   creadoEn: "2026-03-08T11:05:00.000Z" },
  { id: "hu-marta",  nombre: "Marta Girón",       tipoDocumento: "DPI",       documento: "3120 98765 0103", telefono: "+502 5566 7788",  correo: "marta.giron@correo.com",   nacionalidad: "Guatemalteca",   creadoEn: "2026-05-21T16:40:00.000Z" },
  { id: "hu-jorge",  nombre: "Jorge Castillo",    tipoDocumento: "Pasaporte", documento: "US-556677889",    telefono: "+1 305 220 3344",  correo: "jorge.castillo@correo.com", nacionalidad: "Estadounidense", creadoEn: "2025-08-30T08:15:00.000Z" },
  { id: "hu-pedro",  nombre: "Pedro Ramírez",     tipoDocumento: "DPI",       documento: "4098 11223 0104", telefono: "+502 5901 2233",  correo: "pedro.ramirez@correo.com", nacionalidad: "Guatemalteca",   creadoEn: "2026-07-19T10:00:00.000Z" },
  { id: "hu-lucia",  nombre: "Lucía Hernández",   tipoDocumento: "DPI",       documento: "2233 44556 0105", telefono: "+502 4102 8877",  correo: "lucia.hernandez@correo.com", nacionalidad: "Salvadoreña",  creadoEn: "2026-08-01T13:30:00.000Z" },
]

/* =========================================================
   RECEPCIÓN — RESERVAS
   ========================================================= */

export const RESERVAS_INICIALES: Reserva[] = [
  // Llega hoy — check-in pendiente, habitación asignada.
  {
    id: "re-1", codigo: "RES-1042", huespedId: "hu-ana", habitacionId: "hh-101",
    tipoHabitacion: "Standard", fechaEntrada: fechaRelativaISO(0), fechaSalida: fechaRelativaISO(3),
    personas: 2, estado: "confirmada",
    acompanantes: [{ nombre: "Luis Morales", documento: "2987 65432 0110" }],
    servicios: [],
    pagos: [{ id: "pg-1", fecha: fechaRelativaISO(-5) + "T15:00:00.000Z", monto: 100, metodo: "tarjeta", comprobante: "CP-1001" }],
    descuento: 0, creadoEn: fechaRelativaISO(-5) + "T15:00:00.000Z",
  },
  // En curso — sale hoy (check-out pendiente), con consumos y saldo.
  {
    id: "re-2", codigo: "RES-1039", huespedId: "hu-sofia", habitacionId: "hh-301",
    tipoHabitacion: "Suite", fechaEntrada: fechaRelativaISO(-4), fechaSalida: fechaRelativaISO(0),
    personas: 3, estado: "en-curso",
    acompanantes: [
      { nombre: "Diego López", documento: "1765 43210 0111" },
      { nombre: "Camila López", documento: "1765 43210 0112" },
    ],
    servicios: [
      { id: "sv-1", tipo: "Restaurante", descripcion: "Cena buffet x3", cantidad: 3, precioUnitario: 28, fecha: fechaRelativaISO(-3) + "T21:00:00.000Z" },
      { id: "sv-2", tipo: "Spa", descripcion: "Masaje relajante", cantidad: 1, precioUnitario: 60, fecha: fechaRelativaISO(-2) + "T17:00:00.000Z" },
    ],
    pagos: [{ id: "pg-2", fecha: fechaRelativaISO(-4) + "T13:00:00.000Z", monto: 500, metodo: "tarjeta", comprobante: "CP-1002" }],
    descuento: 40, checkInEn: fechaRelativaISO(-4) + "T13:05:00.000Z",
    creadoEn: fechaRelativaISO(-20) + "T10:00:00.000Z",
  },
  // En curso — estancia larga, sale en 1 día.
  {
    id: "re-3", codigo: "RES-1040", huespedId: "hu-carlos", habitacionId: "hh-105",
    tipoHabitacion: "Deluxe", fechaEntrada: fechaRelativaISO(-2), fechaSalida: fechaRelativaISO(1),
    personas: 1, estado: "en-curso",
    acompanantes: [],
    servicios: [
      { id: "sv-3", tipo: "Lavandería", descripcion: "Planchado de camisas", cantidad: 4, precioUnitario: 5, fecha: fechaRelativaISO(-1) + "T09:00:00.000Z" },
    ],
    pagos: [{ id: "pg-3", fecha: fechaRelativaISO(-2) + "T12:00:00.000Z", monto: 390, metodo: "efectivo", comprobante: "CP-1003" }],
    descuento: 0, checkInEn: fechaRelativaISO(-2) + "T12:10:00.000Z",
    creadoEn: fechaRelativaISO(-12) + "T18:00:00.000Z",
  },
  // Futura — sin habitación asignada todavía (demo de "asignar habitación").
  {
    id: "re-4", codigo: "RES-1044", huespedId: "hu-marta", habitacionId: null,
    tipoHabitacion: "Superior", fechaEntrada: fechaRelativaISO(2), fechaSalida: fechaRelativaISO(5),
    personas: 2, estado: "confirmada",
    acompanantes: [], servicios: [], pagos: [],
    descuento: 0, creadoEn: fechaRelativaISO(-1) + "T11:00:00.000Z",
  },
  // Llega hoy — reserva aún pendiente de confirmar.
  {
    id: "re-5", codigo: "RES-1045", huespedId: "hu-lucia", habitacionId: null,
    tipoHabitacion: "Superior", fechaEntrada: fechaRelativaISO(0), fechaSalida: fechaRelativaISO(2),
    personas: 2, estado: "pendiente",
    acompanantes: [], servicios: [], pagos: [],
    descuento: 0, creadoEn: fechaRelativaISO(0) + "T07:30:00.000Z",
  },
  // Historial — estancia pasada de Jorge.
  {
    id: "re-6", codigo: "RES-1010", huespedId: "hu-jorge", habitacionId: "hh-102",
    tipoHabitacion: "Standard", fechaEntrada: fechaRelativaISO(-25), fechaSalida: fechaRelativaISO(-21),
    personas: 1, estado: "finalizada",
    acompanantes: [],
    servicios: [{ id: "sv-4", tipo: "Estacionamiento", descripcion: "4 noches", cantidad: 4, precioUnitario: 8, fecha: fechaRelativaISO(-25) + "T12:00:00.000Z" }],
    pagos: [{ id: "pg-4", fecha: fechaRelativaISO(-21) + "T11:00:00.000Z", monto: 332, metodo: "tarjeta", comprobante: "CP-1004" }],
    descuento: 0,
    checkInEn: fechaRelativaISO(-25) + "T14:00:00.000Z",
    checkOutEn: fechaRelativaISO(-21) + "T11:30:00.000Z",
    creadoEn: fechaRelativaISO(-40) + "T09:00:00.000Z",
  },
  // Historial — estancia pasada de Ana (huésped recurrente).
  {
    id: "re-7", codigo: "RES-0995", huespedId: "hu-ana", habitacionId: "hh-202",
    tipoHabitacion: "Superior", fechaEntrada: fechaRelativaISO(-60), fechaSalida: fechaRelativaISO(-57),
    personas: 2, estado: "finalizada",
    acompanantes: [{ nombre: "Luis Morales", documento: "2987 65432 0110" }],
    servicios: [],
    pagos: [{ id: "pg-5", fecha: fechaRelativaISO(-57) + "T11:00:00.000Z", monto: 285, metodo: "efectivo", comprobante: "CP-0995" }],
    descuento: 0,
    checkInEn: fechaRelativaISO(-60) + "T15:00:00.000Z",
    checkOutEn: fechaRelativaISO(-57) + "T10:45:00.000Z",
    creadoEn: fechaRelativaISO(-75) + "T09:00:00.000Z",
  },
  // Cancelada.
  {
    id: "re-8", codigo: "RES-1041", huespedId: "hu-pedro", habitacionId: null,
    tipoHabitacion: "Deluxe", fechaEntrada: fechaRelativaISO(1), fechaSalida: fechaRelativaISO(4),
    personas: 2, estado: "cancelada",
    acompanantes: [], servicios: [], pagos: [],
    descuento: 0,
    motivoCancelacion: "El huésped canceló su viaje por motivos personales.",
    creadoEn: fechaRelativaISO(-8) + "T16:00:00.000Z",
  },
]

/* =========================================================
   RECEPCIÓN — SOLICITUDES DE HUÉSPEDES
   ========================================================= */

export const SOLICITUDES_HUESPED_INICIALES: SolicitudHuesped[] = [
  {
    id: "sh-1", huespedId: "hu-ana", habitacionNumero: "101",
    descripcion: "Solicita dos almohadas hipoalergénicas adicionales.",
    area: "Limpieza", prioridad: "media", estado: "pendiente",
    fecha: fechaRelativaISO(0) + "T08:20:00.000Z",
  },
  {
    id: "sh-2", huespedId: "hu-sofia", habitacionNumero: "301",
    descripcion: "El aire acondicionado no enfría correctamente.",
    area: "Mantenimiento", prioridad: "alta", estado: "en-proceso",
    fecha: fechaRelativaISO(-1) + "T19:45:00.000Z",
  },
  {
    id: "sh-3", huespedId: "hu-carlos", habitacionNumero: "105",
    descripcion: "Reservar transporte al aeropuerto para mañana a las 6:00.",
    area: "Recepción", prioridad: "media", estado: "pendiente",
    fecha: fechaRelativaISO(0) + "T10:10:00.000Z",
  },
  {
    id: "sh-4", huespedId: "hu-carlos", habitacionNumero: "105",
    descripcion: "Botella de vino para celebración en la habitación.",
    area: "Room Service", prioridad: "baja", estado: "atendida",
    fecha: fechaRelativaISO(-1) + "T15:00:00.000Z",
  },
]

/* =========================================================
   ADMINISTRADOR — HU-2: TARIFAS Y OFERTAS
   ========================================================= */

// Tarifa base editable por tipo de habitación (arranca desde PRECIO_NOCHE_TIPO).
export const TARIFAS_BASE_INICIALES: Record<TipoHabitacion, number> = {
  ...PRECIO_NOCHE_TIPO,
}

export const REGLAS_TARIFA_INICIALES: ReglaTarifa[] = [
  {
    id: "rt-1",
    nombre: "Temporada alta — fin de año",
    tipoHabitacion: "Todas",
    criterio: "temporada",
    ajuste: "porcentaje",
    valor: 20,
    desde: fechaRelativaISO(-2),
    hasta: fechaRelativaISO(20),
    activa: true,
  },
  {
    id: "rt-2",
    nombre: "Alta ocupación — suites",
    tipoHabitacion: "Suite",
    criterio: "ocupacion",
    ajuste: "porcentaje",
    valor: 15,
    umbralOcupacion: 70,
    activa: true,
  },
  {
    id: "rt-3",
    nombre: "Congreso de medicina",
    tipoHabitacion: "Deluxe",
    criterio: "evento",
    ajuste: "fijo",
    valor: 160,
    desde: fechaRelativaISO(5),
    hasta: fechaRelativaISO(8),
    activa: true,
  },
  {
    id: "rt-4",
    nombre: "Temporada baja — entre semana",
    tipoHabitacion: "Standard",
    criterio: "temporada",
    ajuste: "porcentaje",
    valor: -10,
    desde: fechaRelativaISO(40),
    hasta: fechaRelativaISO(70),
    activa: false,
  },
]

export const PROMOCIONES_INICIALES: Promocion[] = [
  { id: "pm-1", nombre: "Escapada de fin de semana", codigo: "FINDE20", descuentoPct: 20, desde: fechaRelativaISO(-5), hasta: fechaRelativaISO(30), activa: true },
  { id: "pm-2", nombre: "Reserva anticipada", codigo: "ANTICIPA15", descuentoPct: 15, desde: fechaRelativaISO(0), hasta: fechaRelativaISO(90), activa: true },
  { id: "pm-3", nombre: "Cliente frecuente", codigo: "VIP10", descuentoPct: 10, desde: fechaRelativaISO(-30), hasta: fechaRelativaISO(0), activa: false },
]

/* =========================================================
   ADMINISTRADOR — HU-4: PERSONAL
   ========================================================= */

export const EMPLEADOS_INICIALES: Empleado[] = [
  { id: "em-1", nombre: "Paola Guzmán", rol: "Recepción", turno: "Mañana", telefono: "+502 5512 0001", activo: true, permisos: ["recepcion"], tareasCompletadas: 24, tareasAsignadas: 26, puntualidadPct: 98, asistencia: "presente" },
  { id: "em-2", nombre: "Carmen Vidal", rol: "Limpieza", turno: "Mañana", telefono: "+502 5512 0002", activo: true, permisos: ["limpieza"], tareasCompletadas: 31, tareasAsignadas: 34, puntualidadPct: 95, asistencia: "presente" },
  { id: "em-3", nombre: "Laura Méndez", rol: "Limpieza", turno: "Tarde", telefono: "+502 5512 0003", activo: true, permisos: ["limpieza"], tareasCompletadas: 28, tareasAsignadas: 30, puntualidadPct: 92, asistencia: "presente" },
  { id: "em-4", nombre: "Diego Fuentes", rol: "Room Service", turno: "Tarde", telefono: "+502 5512 0004", activo: true, permisos: ["roomservice"], tareasCompletadas: 19, tareasAsignadas: 22, puntualidadPct: 88, asistencia: "presente" },
  { id: "em-5", nombre: "Marco Solís", rol: "Room Service", turno: "Noche", telefono: "+502 5512 0005", activo: true, permisos: ["roomservice"], tareasCompletadas: 12, tareasAsignadas: 15, puntualidadPct: 90, asistencia: "descanso" },
  { id: "em-6", nombre: "Rodrigo Paz", rol: "Mantenimiento", turno: "Mañana", telefono: "+502 5512 0006", activo: true, permisos: ["recepcion"], tareasCompletadas: 9, tareasAsignadas: 11, puntualidadPct: 85, asistencia: "presente" },
  { id: "em-7", nombre: "Elena Ríos", rol: "Recepción", turno: "Noche", telefono: "+502 5512 0007", activo: true, permisos: ["recepcion"], tareasCompletadas: 17, tareasAsignadas: 18, puntualidadPct: 97, asistencia: "presente" },
  { id: "em-8", nombre: "Tomás Aguilar", rol: "Limpieza", turno: "Noche", telefono: "+502 5512 0008", activo: false, permisos: ["limpieza"], tareasCompletadas: 0, tareasAsignadas: 0, puntualidadPct: 0, asistencia: "ausente" },
  { id: "em-9", nombre: "Valeria Cano", rol: "Administración", turno: "Mañana", telefono: "+502 5512 0009", activo: true, permisos: ["admin", "recepcion", "roomservice", "limpieza"], tareasCompletadas: 14, tareasAsignadas: 14, puntualidadPct: 100, asistencia: "presente" },
  { id: "em-10", nombre: "Iván Torres", rol: "Mantenimiento", turno: "Tarde", telefono: "+502 5512 0010", activo: true, permisos: ["recepcion"], tareasCompletadas: 6, tareasAsignadas: 10, puntualidadPct: 80, asistencia: "pendiente" },
]

/* =========================================================
   ADMINISTRADOR — HU-5: INVENTARIO
   ========================================================= */

export const INSUMOS_INICIALES: Insumo[] = [
  { id: "in-1", nombre: "Juego de sábanas (queen)", categoria: "Lencería", unidad: "juego", stock: 42, stockMinimo: 30, costoUnitario: 18.0 },
  { id: "in-2", nombre: "Toalla de baño", categoria: "Lencería", unidad: "unidad", stock: 24, stockMinimo: 40, costoUnitario: 6.5 },
  { id: "in-3", nombre: "Toalla de manos", categoria: "Lencería", unidad: "unidad", stock: 70, stockMinimo: 40, costoUnitario: 3.0 },
  { id: "in-4", nombre: "Almohada estándar", categoria: "Lencería", unidad: "unidad", stock: 33, stockMinimo: 20, costoUnitario: 9.0 },
  { id: "in-5", nombre: "Jabón de tocador 25 g", categoria: "Aseo", unidad: "unidad", stock: 180, stockMinimo: 120, costoUnitario: 0.35, vencimiento: fechaRelativaISO(240) },
  { id: "in-6", nombre: "Shampoo 30 ml", categoria: "Aseo", unidad: "unidad", stock: 95, stockMinimo: 120, costoUnitario: 0.55, vencimiento: fechaRelativaISO(45) },
  { id: "in-7", nombre: "Papel higiénico", categoria: "Aseo", unidad: "rollo", stock: 210, stockMinimo: 150, costoUnitario: 0.4 },
  { id: "in-8", nombre: "Kit dental", categoria: "Amenities", unidad: "unidad", stock: 60, stockMinimo: 50, costoUnitario: 0.7, vencimiento: fechaRelativaISO(120) },
  { id: "in-9", nombre: "Set de costura", categoria: "Amenities", unidad: "unidad", stock: 18, stockMinimo: 25, costoUnitario: 0.6 },
  { id: "in-10", nombre: "Zapatillas desechables", categoria: "Amenities", unidad: "par", stock: 40, stockMinimo: 30, costoUnitario: 1.1 },
  { id: "in-11", nombre: "Agua embotellada 500 ml", categoria: "Minibar", unidad: "botella", stock: 130, stockMinimo: 80, costoUnitario: 0.5, vencimiento: fechaRelativaISO(20) },
  { id: "in-12", nombre: "Refresco en lata", categoria: "Minibar", unidad: "lata", stock: 46, stockMinimo: 60, costoUnitario: 0.8, vencimiento: fechaRelativaISO(75) },
  { id: "in-13", nombre: "Snack de maní", categoria: "Minibar", unidad: "unidad", stock: 22, stockMinimo: 40, costoUnitario: 0.9, vencimiento: fechaRelativaISO(10) },
  { id: "in-14", nombre: "Detergente multiusos 5 L", categoria: "Limpieza", unidad: "bidón", stock: 12, stockMinimo: 8, costoUnitario: 11.0 },
  { id: "in-15", nombre: "Bolsas de basura (paquete)", categoria: "Limpieza", unidad: "paquete", stock: 5, stockMinimo: 12, costoUnitario: 2.2 },
  { id: "in-16", nombre: "Guantes de nitrilo (caja)", categoria: "Limpieza", unidad: "caja", stock: 9, stockMinimo: 6, costoUnitario: 4.5, vencimiento: fechaRelativaISO(400) },
]

export const MOVIMIENTOS_INSUMO_INICIALES: MovimientoInsumo[] = [
  { id: "mv-1", insumoId: "in-2", tipo: "salida", cantidad: 16, motivo: "Reposición pisos 1 y 2", fecha: fechaRelativaISO(-1) + "T09:30:00.000Z" },
  { id: "mv-2", insumoId: "in-11", tipo: "entrada", cantidad: 96, motivo: "Compra a proveedor", fecha: fechaRelativaISO(-1) + "T14:00:00.000Z" },
  { id: "mv-3", insumoId: "in-13", tipo: "salida", cantidad: 18, motivo: "Consumo de minibar", fecha: fechaRelativaISO(0) + "T08:15:00.000Z" },
  { id: "mv-4", insumoId: "in-15", tipo: "merma", cantidad: 3, motivo: "Paquete dañado en bodega", fecha: fechaRelativaISO(-2) + "T16:40:00.000Z" },
  { id: "mv-5", insumoId: "in-6", tipo: "salida", cantidad: 25, motivo: "Reposición de amenities", fecha: fechaRelativaISO(0) + "T10:05:00.000Z" },
  { id: "mv-6", insumoId: "in-1", tipo: "entrada", cantidad: 12, motivo: "Retorno de lavandería externa", fecha: fechaRelativaISO(-3) + "T11:20:00.000Z" },
]
