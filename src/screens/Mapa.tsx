import { useState } from "react"
import type { Habitacion, Solicitud, EstadoHabitacion } from "../types"

type FiltroPiso = "todos" | "1" | "2" | "3"

type FiltroEstado = "todos" | "limpia" | "pendiente" | "en-limpieza" | "prioritarias"

const ESTADO_CONFIG = {
  limpia: {
    label: "Limpia",
    bg: "#ECFDF3",
    border: "#86EFAC",
    text: "#15803D",
  },

  pendiente: {
    label: "Pendiente",
    bg: "#FFF9E8",
    border: "#F3D98B",
    text: "#9A6700",
  },

  "en-limpieza": {
    label: "En limpieza",
    bg: "#EFF6FF",
    border: "#93C5FD",
    text: "#1D4ED8",
  },
} as const

type EstadoLimpiezaVisual = keyof typeof ESTADO_CONFIG

/* =========================================================
   ESTADO AUTOMÁTICO DE LIMPIEZA
   ========================================================= */

function obtenerEstadoLimpieza(hab: Habitacion): EstadoLimpiezaVisual {
  const total = hab.tareas.length

  const completadas = hab.tareas.filter((t) => t.completada).length

  if (hab.estado === "limpia" && total > 0 && completadas === total) {
    return "limpia"
  }

  if (completadas === 0) {
    return "pendiente"
  }

  return "en-limpieza"
}

/* =========================================================
   PRIORIDAD
   ========================================================= */

function esPrioritaria(hab: Habitacion) {
  return Boolean(hab.proximaLlegada) && obtenerEstadoLimpieza(hab) !== "limpia"
}

/* =========================================================
   TARJETA DE HABITACIÓN
   ========================================================= */

interface TarjetaProps {
  hab: Habitacion
  usuarioActual: string
  onClick: () => void
}

function TarjetaHabitacion({ hab, usuarioActual, onClick }: TarjetaProps) {
  const estadoVisual = obtenerEstadoLimpieza(hab)

  const cfg = ESTADO_CONFIG[estadoVisual]

  const tareasDone = hab.tareas.filter((t) => t.completada).length

  const total = hab.tareas.length

  const porcentaje = total > 0 ? Math.round((tareasDone / total) * 100) : 0

  const esPropia = hab.personal === usuarioActual

  const esDeOtro = Boolean(hab.personal) && hab.personal !== usuarioActual

  const sinAsignar = !hab.personal

  const prioritaria = esPrioritaria(hab)

  return (
    <button
      onClick={onClick}
      className="
        text-left
        rounded-xl
        border
        border-[#E5E0D8]
        p-4
        hover:shadow-md
        hover:border-[#D8B94E]
        transition-all
        w-full
        min-h-[170px]
        bg-white
      "
    >
      {/* Encabezado: cama + número */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {/* Icono de cama */}
            <span
              className="
                w-8
                h-8
                rounded-lg
                bg-[#F8F6F0]
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#18345C"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7v10" />
                <path d="M21 10v7" />
                <path d="M3 13h18" />
                <path d="M5 13V9.5A1.5 1.5 0 0 1 6.5 8h3A1.5 1.5 0 0 1 11 9.5V13" />
                <path d="M11 13v-2a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v1" />
                <path d="M5 17v2" />
                <path d="M19 17v2" />
              </svg>
            </span>

            {/* Solo número */}
            <p
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-[#18345C]
                leading-none
              "
            >
              {hab.numero}
            </p>
          </div>

          <p className="text-xs text-[#6B7280] mt-1 ml-10">
            {hab.tipo}
          </p>
        </div>

        {/* Estado */}
        <span
          className="
            text-[9px]
            sm:text-[10px]
            font-semibold
            px-2
            py-1
            rounded-md
            uppercase
            tracking-wide
            whitespace-nowrap
            shrink-0
          "
          style={{
            color: cfg.text,
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.border}`,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Progreso */}
      {estadoVisual === "en-limpieza" && (
        <div className="mb-3">
          <div
            className="
              flex
              justify-between
              text-[10px]
              sm:text-xs
              text-[#6B7280]
              mb-1
            "
          >
            <span>
              {tareasDone} de {total} tareas
            </span>

            <span>{porcentaje}%</span>
          </div>

          <div
            className="
              h-1.5
              bg-[#EEF0F2]
              rounded-full
              overflow-hidden
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-[#18345C]
                transition-all
              "
              style={{
                width: `${porcentaje}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Prioridad */}
      {prioritaria && (
        <div
          className="
            inline-flex
            items-center
            gap-1.5
            text-[10px]
            text-[#8A6818]
            bg-[#F3D98B]/30
            border
            border-[#F3D98B]
            px-2
            py-1
            rounded-md
            mb-3
          "
        >
          <span>★</span>
          <span className="font-medium">Prioritaria</span>
        </div>
      )}

      {/* Personal */}
      <div
        className="
          mt-auto
          text-[10px]
          sm:text-xs
          text-[#6B7280]
        "
      >
        {/* Habitación propia */}
        {esPropia && (
          <div className="flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>

            <span>{hab.personal}</span>
          </div>
        )}

        {/* Habitación de otro trabajador */}
        {esDeOtro && (
          <div className="flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>

            <span>{hab.personal}</span>
          </div>
        )}

        {/* Sin asignar: también bloqueada */}
        {sinAsignar && (
          <div className="flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>

            <span>Sin asignar</span>
          </div>
        )}
      </div>

      {/* Próxima llegada */}
      {hab.proximaLlegada && (
        <div
          className="
            flex
            items-center
            gap-1.5
            text-[10px]
            sm:text-xs
            text-[#B88A18]
            font-medium
            mt-2
          "
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>

          <span>Próxima llegada: {hab.proximaLlegada}</span>
        </div>
      )}

      {/* Fuera de servicio */}
      {hab.estado === "fuera-servicio" && (
        <div className="mt-3">
          <span
            className="
              inline-flex
              text-[9px]
              font-semibold
              px-2
              py-1
              rounded-md
              uppercase
              bg-red-50
              text-red-600
              border
              border-red-200
            "
          >
            Fuera de servicio
          </span>
        </div>
      )}
    </button>
  )
}

/* =========================================================
   PANEL DE DETALLE
   ========================================================= */

interface PanelProps {
  hab: Habitacion
  solicitudes: Solicitud[]
  usuarioActual: string

  onClose: () => void

  onComenzarLimpieza: (id: string) => void

  onToggleTarea: (habId: string, tareaId: string) => void

  onFinalizarLimpieza: (id: string) => void

  onGuardarObservaciones: (id: string, obs: string) => void

  onIrIncidencias: () => void
}

function PanelDetalle({
  hab,
  solicitudes,
  usuarioActual,
  onClose,
  onComenzarLimpieza,
  onToggleTarea,
  onFinalizarLimpieza,
  onGuardarObservaciones,
  onIrIncidencias,
}: PanelProps) {
  const [obs, setObs] = useState(hab.observaciones ?? "")

  const estadoVisual = obtenerEstadoLimpieza(hab)

  const cfg = ESTADO_CONFIG[estadoVisual]

  const tareasDone = hab.tareas.filter((t) => t.completada).length

  const total = hab.tareas.length

  const todasCompletadas = total > 0 && tareasDone === total

  const esPropia = hab.personal === usuarioActual

  const solHab = solicitudes.filter((s) => s.habitacionNumero === hab.numero)

  const manejarTarea = (tareaId: string, yaCompletada: boolean) => {
    if (!esPropia) return

    if (!yaCompletada && tareasDone === 0 && estadoVisual === "pendiente") {
      onComenzarLimpieza(hab.id)
    }

    onToggleTarea(hab.id, tareaId)
  }

  return (
    <div className="absolute inset-0 z-20 flex items-stretch justify-end">
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />

      {/* Panel */}
      <div
        className="
          relative
          z-10
          w-full
          sm:max-w-md
          bg-white
          shadow-2xl
          flex
          flex-col
          overflow-hidden
        "
      >
        {/* Imagen */}
        <div className="relative h-36 sm:h-40 shrink-0 overflow-hidden">
          <img
            src={hab.foto}
            alt={`Habitación ${hab.numero}`}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#102747]/90 via-[#18345C]/25 to-transparent" />

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="
              absolute
              top-3
              right-3
              w-9
              h-9
              bg-white/20
              backdrop-blur-sm
              rounded-full
              flex
              items-center
              justify-center
              hover:bg-white/40
              transition-colors
            "
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />

              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Habitación */}
          <div className="absolute bottom-4 left-4">
            <p
              className="
                text-xl
                sm:text-2xl
                font-semibold
                text-white
                leading-tight
              "
            >
              Habitación {hab.numero}
            </p>

            <p className="text-white/80 text-xs mt-1">{hab.tipo}</p>
          </div>

          {/* Estado */}
          <div className="absolute bottom-4 right-4">
            <span
              className="
                text-[10px]
                font-semibold
                px-2
                py-1
                rounded-md
                uppercase
                tracking-wide
              "
              style={{
                color: cfg.text,
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Información rápida */}
        {(hab.proximaLlegada || hab.estado === "fuera-servicio") && (
          <div
            className="
              px-4
              py-3
              bg-[#F8F6F0]
              border-b
              border-[#E5E0D8]
              flex
              gap-3
              flex-wrap
            "
          >
            {hab.proximaLlegada && (
              <div className="flex items-center gap-1.5 text-xs text-[#B88A18] font-medium">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />

                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Próxima llegada: {hab.proximaLlegada}
              </div>
            )}

            {hab.estado === "fuera-servicio" && (
              <span className="text-xs font-semibold text-red-600">
                Fuera de servicio
              </span>
            )}
          </div>
        )}

        {/* Solo lectura */}
        {!esPropia && (
          <div
            className="
              px-4
              py-3
              bg-[#F3D98B]/20
              border-b
              border-[#E5E0D8]
              text-xs
              text-[#6B7280]
              flex
              items-center
              gap-2
            "
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />

              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Solo lectura
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {/* Tareas */}
          <div className="px-4 py-5 border-b border-[#F0EBE3]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#18345C]">
                Tareas de limpieza
              </p>

              <span className="text-xs text-[#18345C] font-semibold">
                {tareasDone} de {total}
              </span>
            </div>

            <div className="h-1.5 bg-[#F0EBE3] rounded-full mb-4 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#18345C] transition-all"
                style={{
                  width: total > 0 ? `${(tareasDone / total) * 100}%` : "0%",
                }}
              />
            </div>

            <div className="space-y-3">
              {hab.tareas.map((t) => (
                <div
                  key={t.id}
                  className={`
                      flex
                      items-center
                      gap-3

                      ${esPropia ? "cursor-pointer group" : "cursor-default"}
                    `}
                  onClick={() => manejarTarea(t.id, t.completada)}
                >
                  <div
                    className={`
                        w-5
                        h-5
                        rounded-md
                        border-2
                        flex
                        items-center
                        justify-center
                        transition-colors
                        shrink-0

                        ${
                          t.completada
                            ? "bg-[#18345C] border-[#18345C]"
                            : "bg-white border-[#AEBCC1]"
                        }

                        ${
                          esPropia && !t.completada
                            ? "group-hover:border-[#18345C]"
                            : ""
                        }
                      `}
                  >
                    {t.completada && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  <span
                    className={`
                        text-sm

                        ${
                          t.completada
                            ? "line-through text-[#AEBCC1]"
                            : "text-[#1F2933]"
                        }
                      `}
                  >
                    {t.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Solicitudes */}
          {solHab.length > 0 && (
            <div className="px-4 py-5 border-b border-[#F0EBE3]">
              <p className="text-xs font-semibold text-[#18345C] mb-3">
                Solicitudes pendientes
              </p>

              <div className="space-y-2">
                {solHab.map((s) => (
                  <div
                    key={s.id}
                    className="
                        flex
                        items-center
                        gap-3
                        bg-[#F8F6F0]
                        rounded-md
                        px-3
                        py-2.5
                      "
                  >
                    <span
                      className={`
                          w-2
                          h-2
                          rounded-full
                          shrink-0

                          ${
                            s.estado === "pendiente"
                              ? "bg-yellow-400"
                              : s.estado === "en-proceso" ||
                                  s.estado === "en-limpieza"
                                ? "bg-blue-400"
                                : "bg-green-400"
                          }
                        `}
                    />

                    <span className="flex-1 text-[#1F2933] text-xs">
                      {s.descripcion}

                      {s.cantidad ? ` (${s.cantidad})` : ""}
                    </span>

                    <span className="text-[10px] text-[#AEBCC1] shrink-0">
                      {s.hora}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div className="px-4 py-5 border-b border-[#F0EBE3]">
            <p className="text-xs font-semibold text-[#18345C] mb-1">
              Observaciones de limpieza
            </p>

            <p className="text-[10px] text-[#AEBCC1] mb-3">Opcional</p>

            {esPropia ? (
              <>
                <textarea
                  rows={3}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Agregar una observación sobre el servicio..."
                  className="
                    w-full
                    border
                    border-[#E5E0D8]
                    rounded-md
                    px-3
                    py-2.5
                    text-sm
                    text-[#1F2933]
                    placeholder:text-[#AEBCC1]
                    resize-none
                    focus:outline-none
                    focus:border-[#18345C]
                    transition-colors
                    bg-[#F8F6F0]
                  "
                />

                <button
                  onClick={() => onGuardarObservaciones(hab.id, obs)}
                  className="
                    mt-2
                    text-xs
                    text-[#18345C]
                    hover:text-[#D8B94E]
                    font-medium
                    transition-colors
                  "
                >
                  Guardar observación
                </button>
              </>
            ) : (
              <div
                className="
                  text-sm
                  text-[#6B7280]
                  bg-[#F8F6F0]
                  rounded-md
                  px-3
                  py-3
                "
              >
                {hab.observaciones ? hab.observaciones : "Sin observaciones."}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        {esPropia && (
          <div
            className="
              px-4
              py-4
              border-t
              border-[#E5E0D8]
              flex
              flex-col
              sm:flex-row
              gap-3
              shrink-0
            "
          >
            <button
              onClick={onIrIncidencias}
              className="
                flex-1
                py-3
                text-xs
                font-medium
                border
                border-[#18345C]
                text-[#18345C]
                rounded-md
                hover:bg-[#F8F6F0]
                transition-colors
              "
            >
              Reportar incidencia
            </button>

            <button
              onClick={() => onFinalizarLimpieza(hab.id)}
              disabled={!todasCompletadas || estadoVisual === "limpia"}
              className="
                flex-1
                py-3
                text-xs
                font-semibold
                bg-[#18345C]
                text-white
                rounded-md
                hover:bg-[#102747]
                transition-colors
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {estadoVisual === "limpia"
                ? "Limpieza finalizada"
                : "Finalizar limpieza"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   PANTALLA PRINCIPAL
   ========================================================= */

interface Props {
  habitaciones: Habitacion[]
  solicitudes: Solicitud[]

  onComenzarLimpieza: (id: string) => void

  onFinalizarLimpieza: (id: string) => void

  onActualizarEstado: (id: string, estado: EstadoHabitacion) => void

  onToggleTarea: (habId: string, tareaId: string) => void

  onGuardarObservaciones: (id: string, obs: string) => void

  onIrIncidencias: () => void

  usuarioActual?: string
}

export default function Mapa({
  habitaciones,
  solicitudes,
  onComenzarLimpieza,
  onFinalizarLimpieza,
  onToggleTarea,
  onGuardarObservaciones,
  onIrIncidencias,
  usuarioActual = "Carmen Vidal",
}: Props) {
  const [filtroPiso, setFiltroPiso] = useState<FiltroPiso>("todos")

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos")

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedHab = habitaciones.find((h) => h.id === selectedId) ?? null

  /* Filtros */
  const filtradas = habitaciones.filter((h) => {
    if (filtroPiso !== "todos" && h.piso !== Number(filtroPiso)) {
      return false
    }

    if (filtroEstado === "todos") {
      return true
    }

    if (filtroEstado === "prioritarias") {
      return esPrioritaria(h)
    }

    return obtenerEstadoLimpieza(h) === filtroEstado
  })
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F6F0] relative">
      {/* Header */}
      <div
        className="
          px-4
          sm:px-6
          py-4
          bg-white
          border-b
          border-[#E5E0D8]
          shrink-0
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            flex-wrap
            mb-4
          "
        >
          <div>
            <h1
              className="
                text-xl
                sm:text-2xl
                font-semibold
                text-[#18345C]
              "
            >
              Mapa de habitaciones
            </h1>

            <p className="text-xs text-[#AEBCC1] mt-1">
              {habitaciones.length} habitaciones
            </p>
          </div>
        </div>

        {/* Pisos */}
        <div className="flex gap-2 flex-wrap mb-2">
          {(["todos", "1", "2", "3"] as FiltroPiso[]).map((p) => (
            <button
              key={p}
              onClick={() => setFiltroPiso(p)}
              className={`
                  px-3
                  py-2
                  text-xs
                  rounded-md
                  font-medium
                  transition-colors

                  ${
                    filtroPiso === p
                      ? "bg-[#18345C] text-white"
                      : "bg-[#F8F6F0] text-[#6B7280] hover:bg-[#E5E0D8]"
                  }
                `}
            >
              {p === "todos" ? "Todos" : `Piso ${p}`}
            </button>
          ))}
        </div>

        {/* Estados */}
        <div className="flex gap-2 flex-wrap">
          {([
            {
              val: "todos",
              label: "Todos",
            },

            {
              val: "limpia",
              label: "Limpias",
            },

            {
              val: "pendiente",
              label: "Pendientes",
            },

            {
              val: "en-limpieza",
              label: "En limpieza",
            },

            {
              val: "prioritarias",
              label: "Prioritarias",
            },
          ] as {
            val: FiltroEstado
            label: string
          }[]).map((f) => (
            <button
              key={f.val}
              onClick={() => setFiltroEstado(f.val)}
              className={`
                  px-3
                  py-2
                  text-xs
                  rounded-md
                  font-medium
                  transition-colors

                  ${
                    filtroEstado === f.val
                      ? "bg-[#D8B94E] text-[#102747]"
                      : "bg-[#F8F6F0] text-[#6B7280] hover:bg-[#E5E0D8]"
                  }
                `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {[1, 2, 3].map((piso) => {
          const habsPiso = filtradas.filter((h) => h.piso === piso)

          if (habsPiso.length === 0) {
            return null
          }

          return (
            <div key={piso} className="mb-7">
              <div className="flex items-center gap-3 mb-3">
                <p
                  className="
                      text-xs
                      text-[#AEBCC1]
                      uppercase
                      tracking-widest
                      font-semibold
                    "
                >
                  Piso {piso}
                </p>

                <div className="flex-1 h-px bg-[#E5E0D8]" />

                <span className="text-[10px] text-[#AEBCC1]">
                  {habsPiso.length} habitaciones
                </span>
              </div>

              <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    gap-3
                  "
              >
                {habsPiso.map((h) => (
                  <TarjetaHabitacion
                    key={h.id}
                    hab={h}
                    usuarioActual={usuarioActual}
                    onClick={() => setSelectedId(h.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filtradas.length === 0 && (
          <div className="text-center py-16 text-[#AEBCC1] text-sm">
            No hay habitaciones que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* Detalle */}
      {selectedHab && (
        <PanelDetalle
          hab={selectedHab}
          solicitudes={solicitudes}
          usuarioActual={usuarioActual}
          onClose={() => setSelectedId(null)}
          onComenzarLimpieza={onComenzarLimpieza}
          onToggleTarea={onToggleTarea}
          onFinalizarLimpieza={(id) => {
            onFinalizarLimpieza(id)

            setSelectedId(null)
          }}
          onGuardarObservaciones={onGuardarObservaciones}
          onIrIncidencias={() => {
            setSelectedId(null)

            onIrIncidencias()
          }}
        />
      )}
    </div>
  )
}
