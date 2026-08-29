import { useState } from 'react';
import type {
  Modulo,
  SeccionAdmin,
  HabitacionHotel,
  Reserva,
  Huesped,
  EstadoHabHotel,
  TipoHabitacion,
  ReglaTarifa,
  Promocion,
  Empleado,
  TurnoPersonal,
  PermisoModulo,
  EstadoAsistencia,
  Insumo,
  MovimientoInsumo,
  TipoMovimiento,
} from '../../types';
import {
  HABITACIONES_HOTEL_INICIALES,
  RESERVAS_INICIALES,
  HUESPEDES_INICIALES,
  TARIFAS_BASE_INICIALES,
  REGLAS_TARIFA_INICIALES,
  PROMOCIONES_INICIALES,
  EMPLEADOS_INICIALES,
  INSUMOS_INICIALES,
  MOVIMIENTOS_INSUMO_INICIALES,
  fechaHoyISO,
  generarId,
  ahoraISO,
} from '../../data';
import { validarCambioEstadoHab } from '../recepcion/recUtils';
import ModuloSwitcher from '../ModuloSwitcher';
import PanelHabitaciones from './PanelHabitaciones';
import Tarifas from './Tarifas';
import Reportes from './Reportes';
import Personal from './Personal';
import Inventario from './Inventario';

const SECCIONES: { id: SeccionAdmin; label: string; corto: string }[] = [
  { id: 'panel', label: 'Panel de habitaciones', corto: 'Panel' },
  { id: 'tarifas', label: 'Tarifas y ofertas', corto: 'Tarifas' },
  { id: 'reportes', label: 'Reportes', corto: 'Reportes' },
  { id: 'personal', label: 'Personal', corto: 'Personal' },
  { id: 'inventario', label: 'Inventario', corto: 'Inventario' },
];

function SeccionIcon({ id, size = 18 }: { id: SeccionAdmin; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 } as const;
  switch (id) {
    case 'panel':
      return <svg {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    case 'tarifas':
      return <svg {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
    case 'reportes':
      return <svg {...p}><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="4" width="3" height="14" /></svg>;
    case 'personal':
      return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'inventario':
      return <svg {...p}><path d="M20 7 12 3 4 7l8 4 8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></svg>;
  }
}

interface Props {
  onCambiarModulo: (m: Modulo) => void;
}

export default function AdminApp({ onCambiarModulo }: Props) {
  const [seccion, setSeccion] = useState<SeccionAdmin>('panel');

  const [habitaciones, setHabitaciones] = useState<HabitacionHotel[]>(HABITACIONES_HOTEL_INICIALES);
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_INICIALES);
  const [huespedes] = useState<Huesped[]>(HUESPEDES_INICIALES);

  const [tarifasBase, setTarifasBase] = useState<Record<TipoHabitacion, number>>({ ...TARIFAS_BASE_INICIALES });
  const [reglas, setReglas] = useState<ReglaTarifa[]>(REGLAS_TARIFA_INICIALES);
  const [promociones, setPromociones] = useState<Promocion[]>(PROMOCIONES_INICIALES);

  const [empleados, setEmpleados] = useState<Empleado[]>(EMPLEADOS_INICIALES);

  const [insumos, setInsumos] = useState<Insumo[]>(INSUMOS_INICIALES);
  const [movimientos, setMovimientos] = useState<MovimientoInsumo[]>(MOVIMIENTOS_INSUMO_INICIALES);

  const ocupacionActualPct = habitaciones.length
    ? Math.round((habitaciones.filter(h => h.estado === 'ocupada').length / habitaciones.length) * 100)
    : 0;

  const hoy = fechaHoyISO();
  const badgePanel = reservas.filter(
    r => r.fechaEntrada === hoy && (r.estado === 'pendiente' || r.estado === 'confirmada') && !r.habitacionId,
  ).length;
  const badgeInventario = insumos.filter(i => i.stock <= i.stockMinimo).length;

  /* ---------- HU-1 · Habitaciones ---------- */
  function cambiarEstadoHab(habId: string, nuevo: EstadoHabHotel) {
    setHabitaciones(hs =>
      hs.map(h => {
        if (h.id !== habId) return h;
        if (validarCambioEstadoHab(h, nuevo, reservas)) return h;
        return { ...h, estado: nuevo };
      }),
    );
  }

  function asignarHabitacion(reservaId: string, habId: string) {
    const prev = reservas.find(r => r.id === reservaId)?.habitacionId ?? null;
    setReservas(rs =>
      rs.map(r =>
        r.id === reservaId
          ? { ...r, habitacionId: habId, estado: r.estado === 'pendiente' ? 'confirmada' : r.estado }
          : r,
      ),
    );
    setHabitaciones(hs =>
      hs.map(h => {
        if (h.id === prev && (h.estado === 'reservada' || h.estado === 'ocupada')) return { ...h, estado: 'disponible' };
        if (h.id === habId && h.estado === 'disponible') return { ...h, estado: 'reservada' };
        return h;
      }),
    );
  }

  /* ---------- HU-2 · Tarifas ---------- */
  function cambiarTarifaBase(tipo: TipoHabitacion, valor: number) {
    setTarifasBase(t => ({ ...t, [tipo]: valor }));
  }
  function guardarRegla(r: ReglaTarifa) {
    setReglas(prev => (prev.some(x => x.id === r.id) ? prev.map(x => (x.id === r.id ? r : x)) : [r, ...prev]));
  }
  function toggleRegla(id: string) {
    setReglas(prev => prev.map(r => (r.id === id ? { ...r, activa: !r.activa } : r)));
  }
  function eliminarRegla(id: string) {
    setReglas(prev => prev.filter(r => r.id !== id));
  }
  function guardarPromo(p: Promocion) {
    setPromociones(prev => (prev.some(x => x.id === p.id) ? prev.map(x => (x.id === p.id ? p : x)) : [p, ...prev]));
  }
  function togglePromo(id: string) {
    setPromociones(prev => prev.map(p => (p.id === id ? { ...p, activa: !p.activa } : p)));
  }

  /* ---------- HU-4 · Personal ---------- */
  function agregarEmpleado(e: Omit<Empleado, 'id'>) {
    setEmpleados(prev => [{ ...e, id: generarId() }, ...prev]);
  }
  function cambiarAsistencia(id: string, a: EstadoAsistencia) {
    setEmpleados(prev => prev.map(e => (e.id === id ? { ...e, asistencia: a } : e)));
  }
  function toggleActivo(id: string) {
    setEmpleados(prev => prev.map(e => (e.id === id ? { ...e, activo: !e.activo } : e)));
  }
  function cambiarTurno(id: string, turno: TurnoPersonal) {
    setEmpleados(prev => prev.map(e => (e.id === id ? { ...e, turno } : e)));
  }
  function togglePermiso(id: string, permiso: PermisoModulo) {
    setEmpleados(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, permisos: e.permisos.includes(permiso) ? e.permisos.filter(p => p !== permiso) : [...e.permisos, permiso] }
          : e,
      ),
    );
  }

  /* ---------- HU-5 · Inventario ---------- */
  function agregarInsumo(i: Omit<Insumo, 'id'>) {
    setInsumos(prev => [{ ...i, id: generarId() }, ...prev]);
  }
  function registrarMovimiento(insumoId: string, tipo: TipoMovimiento, cantidad: number, motivo: string) {
    setInsumos(prev =>
      prev.map(i => {
        if (i.id !== insumoId) return i;
        const delta = tipo === 'entrada' ? cantidad : -cantidad;
        return { ...i, stock: Math.max(0, i.stock + delta) };
      }),
    );
    setMovimientos(prev => [
      { id: generarId(), insumoId, tipo, cantidad, motivo, fecha: ahoraISO() },
      ...prev,
    ]);
  }

  const contenido = (() => {
    switch (seccion) {
      case 'panel':
        return (
          <PanelHabitaciones
            habitaciones={habitaciones}
            reservas={reservas}
            huespedes={huespedes}
            onCambiarEstado={cambiarEstadoHab}
            onAsignar={asignarHabitacion}
          />
        );
      case 'tarifas':
        return (
          <Tarifas
            tarifasBase={tarifasBase}
            reglas={reglas}
            promociones={promociones}
            ocupacionActualPct={ocupacionActualPct}
            onCambiarTarifaBase={cambiarTarifaBase}
            onGuardarRegla={guardarRegla}
            onToggleRegla={toggleRegla}
            onEliminarRegla={eliminarRegla}
            onGuardarPromo={guardarPromo}
            onTogglePromo={togglePromo}
          />
        );
      case 'reportes':
        return <Reportes reservas={reservas} habitaciones={habitaciones} tarifasBase={tarifasBase} />;
      case 'personal':
        return (
          <Personal
            empleados={empleados}
            onAgregar={agregarEmpleado}
            onCambiarAsistencia={cambiarAsistencia}
            onToggleActivo={toggleActivo}
            onCambiarTurno={cambiarTurno}
            onTogglePermiso={togglePermiso}
          />
        );
      case 'inventario':
        return (
          <Inventario
            insumos={insumos}
            movimientos={movimientos}
            onAgregarInsumo={agregarInsumo}
            onRegistrarMovimiento={registrarMovimiento}
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
        {/* Sidebar — escritorio */}
        <nav className="hidden lg:flex flex-col w-56 shrink-0 h-full" style={{ backgroundColor: '#102747' }}>
          <div className="px-5 pt-7 pb-6 border-b shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <p className="text-white text-xl font-bold leading-tight" style={{ letterSpacing: '0.02em' }}>Villa Serena</p>
            <p className="text-xs mt-1" style={{ color: '#AEBCC1', letterSpacing: '0.06em' }}>Administración</p>
          </div>

          <div className="flex-1 py-3 overflow-y-auto">
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = s.id === 'panel' ? badgePanel : s.id === 'inventario' ? badgeInventario : 0;
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

          <ModuloSwitcher actual="admin" onCambiar={onCambiarModulo} />

          <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: '#D8B94E', color: '#102747' }}>
                VC
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">Valeria Cano</p>
                <p className="text-[10px] truncate" style={{ color: '#AEBCC1' }}>Administradora</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Área de contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ backgroundColor: '#102747' }}>
            <p className="lg:hidden text-white text-lg font-bold">Villa Serena</p>
            <span className="lg:hidden text-[#AEBCC1] text-xs">·</span>
            <p className="text-[#AEBCC1] text-xs font-medium truncate flex-1">
              {SECCIONES.find(s => s.id === seccion)?.label}
            </p>
            <div className="lg:hidden flex gap-1.5">
              <ModuloSwitcher actual="admin" onCambiar={onCambiarModulo} variant="inline" />
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">{contenido}</div>

          {/* Navegación inferior — móvil */}
          <div className="lg:hidden flex shrink-0 border-t overflow-x-auto" style={{ backgroundColor: '#102747', borderColor: '#1d3a5f' }}>
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = s.id === 'panel' ? badgePanel : s.id === 'inventario' ? badgeInventario : 0;
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
    </div>
  );
}
