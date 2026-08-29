import type {
  Habitacion,
  Solicitud,
  Incidencia,
  ObjetoOlvidado,
  EntradaHistorial,
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
