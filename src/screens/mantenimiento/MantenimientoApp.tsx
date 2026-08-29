import { useMemo, useState } from 'react';
import type {
  Modulo,
  SeccionMant,
  OrdenTrabajo,
  Incidencia,
  Activo,
  TareaPreventiva,
  Repuesto,
  HabitacionHotel,
  Empleado,
  EstadoOT,
  TipoAveria,
  PrioridadIncidencia,
} from '../../types';
import {
  INCIDENCIAS_MANT_INICIALES,
  ORDENES_INICIALES,
  ACTIVOS_INICIALES,
  TAREAS_PREVENTIVAS_INICIALES,
  REPUESTOS_INICIALES,
  HABITACIONES_HOTEL_INICIALES,
  RESERVAS_INICIALES,
  EMPLEADOS_INICIALES,
  ENCARGADO_MANT,
  siguienteCodigoOT,
  generarId,
  ahoraISO,
  fechaHoyISO,
  fechaRelativaISO,
} from '../../data';
import {
  SIGUIENTE_ESTADO_OT,
  estaAtrasada,
  validarCambioEstadoHab,
} from './mantUtils';
import ModuloSwitcher from '../ModuloSwitcher';
import PanelMantenimiento from './PanelMantenimiento';
import BandejaIncidencias from './BandejaIncidencias';
import OrdenesTrabajo from './OrdenesTrabajo';
import DetalleOrden from './DetalleOrden';
import NuevaOrdenModal from './NuevaOrdenModal';
import Preventivo from './Preventivo';
import Activos from './Activos';

const SECCIONES: { id: SeccionMant; label: string; corto: string }[] = [
  { id: 'panel', label: 'Panel del área', corto: 'Panel' },
  { id: 'incidencias', label: 'Incidencias recibidas', corto: 'Incid.' },
  { id: 'ordenes', label: 'Órdenes de trabajo', corto: 'Órdenes' },
  { id: 'preventivo', label: 'Mantenimiento preventivo', corto: 'Prevent.' },
  { id: 'activos', label: 'Activos y equipos', corto: 'Activos' },
];

function SeccionIcon({ id, size = 18 }: { id: SeccionMant; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (id) {
    case 'panel':
      return <svg {...p}><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="4" width="3" height="14" /></svg>;
    case 'incidencias':
      return <svg {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case 'ordenes':
      return <svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" /></svg>;
    case 'preventivo':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'activos':
      return <svg {...p}><path d="M20 7 12 3 4 7l8 4 8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></svg>;
  }
}

interface Props {
  onCambiarModulo: (m: Modulo) => void;
}

export default function MantenimientoApp({ onCambiarModulo }: Props) {
  const [seccion, setSeccion] = useState<SeccionMant>('panel');

  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>(ORDENES_INICIALES);
  const [incidencias, setIncidencias] = useState<Incidencia[]>(INCIDENCIAS_MANT_INICIALES);
  // El estado inicial de las habitaciones se deriva de las órdenes abiertas:
  // si una orden impide el uso, la habitación arranca fuera de servicio.
  // Así el módulo es coherente consigo mismo sin tocar los datos de Recepción.
  const [habitaciones, setHabitaciones] = useState<HabitacionHotel[]>(() =>
    HABITACIONES_HOTEL_INICIALES.map(h =>
      ORDENES_INICIALES.some(
        o =>
          o.esHabitacion &&
          o.ubicacion === h.numero &&
          o.impideUso &&
          o.estado !== 'cerrada' &&
          o.estado !== 'cancelada',
      )
        ? { ...h, estado: 'mantenimiento' as const }
        : h,
    ),
  );
  const [activos, setActivos] = useState<Activo[]>(ACTIVOS_INICIALES);
  const [tareas, setTareas] = useState<TareaPreventiva[]>(TAREAS_PREVENTIVAS_INICIALES);
  const [repuestos] = useState<Repuesto[]>(REPUESTOS_INICIALES);
  const [reservas] = useState(RESERVAS_INICIALES);

  const [ordenAbiertaId, setOrdenAbiertaId] = useState<string | null>(null);
  const [nuevaOrden, setNuevaOrden] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Los técnicos son los empleados activos con rol de Mantenimiento.
  const tecnicos: Empleado[] = useMemo(
    () => EMPLEADOS_INICIALES.filter(e => e.rol === 'Mantenimiento' && e.activo),
    [],
  );

  const ordenAbierta = ordenes.find(o => o.id === ordenAbiertaId) ?? null;

  // Una incidencia está "sin atender" mientras no tenga orden de trabajo.
  const incidenciasSinOrden = incidencias.filter(
    i => i.estado === 'pendiente' && !ordenes.some(o => o.incidenciaId === i.id),
  );
  const ordenesAtrasadas = ordenes.filter(estaAtrasada);

  function mostrarAviso(texto: string) {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? null : a)), 4000);
  }

  function registrarCambio(o: OrdenTrabajo, estado: EstadoOT, nota?: string): OrdenTrabajo {
    return {
      ...o,
      estado,
      historial: [...o.historial, { estado, fechaHora: ahoraISO(), responsable: ENCARGADO_MANT, nota }],
    };
  }

  /* ---------- Bloqueo de habitaciones (HU-8) ---------- */

  function bloquearHabitacion(numero: string) {
    setHabitaciones(hs =>
      hs.map(h => (h.numero === numero && h.estado !== 'ocupada' ? { ...h, estado: 'mantenimiento' } : h)),
    );
  }

  // Al liberar, la habitación NO vuelve a "disponible": pasa a "en limpieza"
  // para que el módulo de Limpieza la valide antes de volver a venderse.
  function liberarHabitacion(numero: string) {
    const hab = habitaciones.find(h => h.numero === numero);
    if (!hab) return;

    const bloqueada = ordenes.some(
      o => o.esHabitacion && o.ubicacion === numero && o.impideUso && !['cerrada', 'cancelada'].includes(o.estado),
    );
    if (bloqueada) {
      mostrarAviso(`La habitación ${numero} aún tiene una orden abierta que impide su uso.`);
      return;
    }

    const error = validarCambioEstadoHab(hab, 'en-limpieza', reservas);
    if (error) {
      mostrarAviso(error);
      return;
    }

    setHabitaciones(hs => hs.map(h => (h.numero === numero ? { ...h, estado: 'en-limpieza' } : h)));
    mostrarAviso(`Habitación ${numero} liberada. Queda en limpieza para su validación.`);
  }

  /* ---------- Creación de órdenes (HU-2, HU-3, HU-9) ---------- */

  function nuevaOT(datos: {
    ubicacion: string;
    esHabitacion: boolean;
    tipo: TipoAveria;
    descripcion: string;
    prioridad: PrioridadIncidencia;
    impideUso: boolean;
    origen: OrdenTrabajo['origen'];
    incidenciaId?: string;
    tareaPreventivaId?: string;
    activoId?: string;
    area?: OrdenTrabajo['area'];
    diasCompromiso: number;
  }): OrdenTrabajo {
    const codigo = siguienteCodigoOT();
    return {
      id: generarId(),
      codigo,
      ubicacion: datos.ubicacion,
      esHabitacion: datos.esHabitacion,
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      prioridad: datos.prioridad,
      origen: datos.origen,
      incidenciaId: datos.incidenciaId,
      tareaPreventivaId: datos.tareaPreventivaId,
      activoId: datos.activoId,
      impideUso: datos.impideUso,
      area: datos.area,
      estado: 'abierta',
      tecnicoId: null,
      fechaCompromiso: fechaRelativaISO(datos.diasCompromiso),
      repuestos: [],
      creadaEn: ahoraISO(),
      historial: [{ estado: 'abierta', fechaHora: ahoraISO(), responsable: ENCARGADO_MANT }],
    };
  }

  function generarDesdeIncidencia(incidenciaId: string, prioridad: PrioridadIncidencia, descripcion: string) {
    const inc = incidencias.find(i => i.id === incidenciaId);
    if (!inc) return;

    const esHab = /^\d+$/.test(inc.habitacionNumero);
    const orden = nuevaOT({
      ubicacion: inc.habitacionNumero,
      esHabitacion: esHab,
      tipo: (inc.tipo as TipoAveria) ?? 'Otro',
      descripcion,
      prioridad,
      impideUso: inc.impideUso,
      origen: 'incidencia',
      incidenciaId,
      area: inc.area,
      diasCompromiso: prioridad === 'alta' ? 0 : prioridad === 'media' ? 1 : 3,
    });

    setOrdenes(os => [orden, ...os]);
    setIncidencias(is => is.map(i => (i.id === incidenciaId ? { ...i, estado: 'en-proceso' } : i)));
    if (esHab && inc.impideUso) bloquearHabitacion(inc.habitacionNumero);
    mostrarAviso(`Orden ${orden.codigo} generada para ${inc.habitacionNumero}.`);
  }

  function crearOrdenInterna(datos: {
    ubicacion: string;
    esHabitacion: boolean;
    tipo: TipoAveria;
    descripcion: string;
    prioridad: PrioridadIncidencia;
    impideUso: boolean;
    activoId?: string;
  }) {
    const orden = nuevaOT({
      ...datos,
      origen: 'interna',
      diasCompromiso: datos.prioridad === 'alta' ? 0 : datos.prioridad === 'media' ? 1 : 3,
    });
    setOrdenes(os => [orden, ...os]);
    if (datos.esHabitacion && datos.impideUso) bloquearHabitacion(datos.ubicacion);
    setNuevaOrden(false);
    setSeccion('ordenes');
    mostrarAviso(`Orden ${orden.codigo} registrada.`);
  }

  function generarDesdePreventivo(tareaId: string) {
    const t = tareas.find(x => x.id === tareaId);
    if (!t) return;

    const orden = nuevaOT({
      ubicacion: t.ubicacion,
      esHabitacion: false,
      tipo: 'Avería técnica',
      descripcion: t.nombre,
      prioridad: 'media',
      impideUso: false,
      origen: 'preventivo',
      tareaPreventivaId: t.id,
      activoId: t.activoId ?? undefined,
      diasCompromiso: 2,
    });

    setOrdenes(os => [orden, ...os]);
    setTareas(ts => ts.map(x => (x.id === tareaId ? { ...x, ultimaEjecucion: fechaHoyISO() } : x)));
    mostrarAviso(`Orden ${orden.codigo} generada desde el plan preventivo.`);
  }

  /* ---------- Ciclo de vida de la orden (HU-4, HU-6, HU-7) ---------- */

  function asignarTecnico(ordenId: string, tecnicoId: string) {
    const tecnico = tecnicos.find(t => t.id === tecnicoId);
    setOrdenes(os =>
      os.map(o => {
        if (o.id !== ordenId) return o;
        const base = { ...o, tecnicoId };
        return o.estado === 'abierta'
          ? registrarCambio(base, 'asignada', `Asignada a ${tecnico?.nombre ?? ''}`)
          : {
              ...base,
              historial: [
                ...o.historial,
                { estado: o.estado, fechaHora: ahoraISO(), responsable: ENCARGADO_MANT, nota: `Reasignada a ${tecnico?.nombre ?? ''}` },
              ],
            };
      }),
    );
    mostrarAviso(`Orden asignada a ${tecnico?.nombre ?? 'el técnico'}.`);
  }

  function avanzarEstado(ordenId: string, extra?: { solucion?: string; minutos?: number }) {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return;
    const siguiente = SIGUIENTE_ESTADO_OT[orden.estado];
    if (!siguiente) return;

    setOrdenes(os =>
      os.map(o => {
        if (o.id !== ordenId) return o;
        const conDatos: OrdenTrabajo = {
          ...o,
          solucion: extra?.solucion ?? o.solucion,
          minutosEmpleados: extra?.minutos ?? o.minutosEmpleados,
          cerradaEn: siguiente === 'cerrada' ? ahoraISO() : o.cerradaEn,
        };
        return registrarCambio(conDatos, siguiente);
      }),
    );

    // Al cerrar, la incidencia de origen queda resuelta.
    if (siguiente === 'cerrada' && orden.incidenciaId) {
      setIncidencias(is => is.map(i => (i.id === orden.incidenciaId ? { ...i, estado: 'resuelta' } : i)));
    }
    mostrarAviso(`Orden ${orden.codigo}: ${siguiente === 'cerrada' ? 'cerrada' : siguiente.replace('-', ' ')}.`);
  }

  function cancelarOrden(ordenId: string, motivo: string) {
    const orden = ordenes.find(o => o.id === ordenId);
    setOrdenes(os =>
      os.map(o => (o.id === ordenId ? registrarCambio({ ...o, motivoCancelacion: motivo }, 'cancelada', motivo) : o)),
    );
    if (orden?.incidenciaId) {
      setIncidencias(is => is.map(i => (i.id === orden.incidenciaId ? { ...i, estado: 'pendiente' } : i)));
    }
    setOrdenAbiertaId(null);
    mostrarAviso(`Orden ${orden?.codigo ?? ''} cancelada.`);
  }

  function reprogramar(ordenId: string, fecha: string, motivo: string) {
    setOrdenes(os =>
      os.map(o =>
        o.id === ordenId
          ? {
              ...o,
              fechaCompromiso: fecha,
              historial: [
                ...o.historial,
                { estado: o.estado, fechaHora: ahoraISO(), responsable: ENCARGADO_MANT, nota: `Reprogramada: ${motivo}` },
              ],
            }
          : o,
      ),
    );
    mostrarAviso('Orden reprogramada.');
  }

  /* ---------- Repuestos (HU-11, informativo en esta ronda) ---------- */

  function agregarRepuesto(ordenId: string, repuestoId: string, cantidad: number) {
    const r = repuestos.find(x => x.id === repuestoId);
    if (!r) return;
    setOrdenes(os =>
      os.map(o =>
        o.id === ordenId
          ? {
              ...o,
              repuestos: [
                ...o.repuestos,
                { repuestoId: r.id, nombre: r.nombre, cantidad, costoUnitario: r.costoUnitario },
              ],
            }
          : o,
      ),
    );
  }

  function quitarRepuesto(ordenId: string, indice: number) {
    setOrdenes(os =>
      os.map(o => (o.id === ordenId ? { ...o, repuestos: o.repuestos.filter((_, i) => i !== indice) } : o)),
    );
  }

  /* ---------- Preventivo y activos (HU-9, HU-10) ---------- */

  function toggleTarea(id: string) {
    setTareas(ts => ts.map(t => (t.id === id ? { ...t, activa: !t.activa } : t)));
  }

  function cambiarEstadoActivo(id: string, estado: Activo['estado']) {
    setActivos(as => as.map(a => (a.id === id ? { ...a, estado } : a)));
  }

  const contenido = (() => {
    switch (seccion) {
      case 'panel':
        return (
          <PanelMantenimiento
            ordenes={ordenes}
            habitaciones={habitaciones}
            incidencias={incidencias}
            tecnicos={tecnicos}
            onLiberarHabitacion={liberarHabitacion}
            onAbrirOrden={setOrdenAbiertaId}
          />
        );
      case 'incidencias':
        return (
          <BandejaIncidencias
            incidencias={incidencias}
            ordenes={ordenes}
            onGenerarOrden={generarDesdeIncidencia}
            onAbrirOrden={setOrdenAbiertaId}
          />
        );
      case 'ordenes':
        return (
          <OrdenesTrabajo
            ordenes={ordenes}
            tecnicos={tecnicos}
            onAbrirOrden={setOrdenAbiertaId}
            onAsignar={asignarTecnico}
            onNuevaOrden={() => setNuevaOrden(true)}
          />
        );
      case 'preventivo':
        return (
          <Preventivo
            tareas={tareas}
            activos={activos}
            ordenes={ordenes}
            onGenerarOrden={generarDesdePreventivo}
            onToggleActiva={toggleTarea}
          />
        );
      case 'activos':
        return (
          <Activos
            activos={activos}
            ordenes={ordenes}
            onCambiarEstado={cambiarEstadoActivo}
            onAbrirOrden={setOrdenAbiertaId}
          />
        );
    }
  })();

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="flex-1 flex overflow-hidden">
        {/* Barra lateral — escritorio */}
        <nav className="hidden lg:flex flex-col w-56 shrink-0 h-full" style={{ backgroundColor: '#102747' }}>
          <div className="px-5 pt-7 pb-6 border-b shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <p className="text-white text-xl font-bold leading-tight" style={{ letterSpacing: '0.02em' }}>Villa Serena</p>
            <p className="text-xs mt-1" style={{ color: '#AEBCC1', letterSpacing: '0.06em' }}>Mantenimiento</p>
          </div>

          <div className="flex-1 py-3 overflow-y-auto">
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge =
                s.id === 'incidencias' ? incidenciasSinOrden.length : s.id === 'ordenes' ? ordenesAtrasadas.length : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setSeccion(s.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors relative"
                  style={{ color: active ? '#FFFFFF' : '#AEBCC1', backgroundColor: active ? '#18345C' : 'transparent' }}
                >
                  {active && <span className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: '#D8B94E' }} />}
                  <span style={{ color: active ? '#D8B94E' : '#AEBCC1' }}><SeccionIcon id={s.id} /></span>
                  <span className="text-sm font-medium flex-1">{s.label}</span>
                  {badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center" style={{ backgroundColor: '#D8B94E', color: '#102747' }}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <ModuloSwitcher actual="mantenimiento" onCambiar={onCambiarModulo} />

          <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: '#D8B94E', color: '#102747' }}>
                RP
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{ENCARGADO_MANT}</p>
                <p className="text-[10px] truncate" style={{ color: '#AEBCC1' }}>Encargado de mantenimiento</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ backgroundColor: '#102747' }}>
            <p className="lg:hidden text-white text-lg font-bold">Villa Serena</p>
            <span className="lg:hidden text-[#AEBCC1] text-xs">·</span>
            <p className="text-[#AEBCC1] text-xs font-medium truncate flex-1">
              {SECCIONES.find(s => s.id === seccion)?.label}
            </p>
            <div className="lg:hidden flex gap-1.5">
              <ModuloSwitcher actual="mantenimiento" onCambiar={onCambiarModulo} variant="inline" />
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">{contenido}</div>

          {/* Navegación inferior — móvil */}
          <div className="lg:hidden flex shrink-0 border-t overflow-x-auto" style={{ backgroundColor: '#102747', borderColor: '#1d3a5f' }}>
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge =
                s.id === 'incidencias' ? incidenciasSinOrden.length : s.id === 'ordenes' ? ordenesAtrasadas.length : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setSeccion(s.id)}
                  className="flex-1 min-w-[64px] flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors"
                  style={{ color: active ? '#D8B94E' : '#AEBCC1' }}
                >
                  {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5" style={{ backgroundColor: '#D8B94E' }} />}
                  <span className="relative">
                    <SeccionIcon id={s.id} size={20} />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-2 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D8B94E', color: '#102747' }}>
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] font-medium leading-tight truncate max-w-full px-0.5">{s.corto}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Aviso flotante: confirma que la acción del usuario surtió efecto */}
      {aviso && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
          <div className="bg-[#102747] text-white text-[14px] font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <span style={{ color: '#D8B94E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="flex-1">{aviso}</span>
            <button onClick={() => setAviso(null)} aria-label="Cerrar aviso" className="text-[#AEBCC1] hover:text-white shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {ordenAbierta && (
        <DetalleOrden
          orden={ordenAbierta}
          tecnicos={tecnicos}
          repuestos={repuestos}
          onCerrar={() => setOrdenAbiertaId(null)}
          onAsignar={asignarTecnico}
          onAvanzar={avanzarEstado}
          onCancelar={cancelarOrden}
          onReprogramar={reprogramar}
          onAgregarRepuesto={agregarRepuesto}
          onQuitarRepuesto={quitarRepuesto}
        />
      )}

      {nuevaOrden && (
        <NuevaOrdenModal
          activos={activos}
          onCerrar={() => setNuevaOrden(false)}
          onGuardar={crearOrdenInterna}
        />
      )}
    </div>
  );
}
