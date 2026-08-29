import { useState } from 'react';
import type { Pantalla, Modulo, Habitacion, Solicitud, Incidencia, ObjetoOlvidado, EntradaHistorial, EstadoHabitacion } from './types';
import { HABITACIONES_INICIALES, SOLICITUDES_INICIALES, INCIDENCIAS_INICIALES, OBJETOS_INICIALES, HISTORIAL_INICIAL, generarId, horaActual } from './data';
import Inicio from './screens/Inicio';
import Mapa from './screens/Mapa';
import Solicitudes from './screens/Solicitudes';
import Incidencias from './screens/Incidencias';
import Objetos from './screens/Objetos';
import Historial from './screens/Historial';
import RoomServiceApp from './screens/roomservice/RoomServiceApp';
import RecepcionApp from './screens/recepcion/RecepcionApp';
import AdminApp from './screens/admin/AdminApp';
import ModuloSwitcher from './screens/ModuloSwitcher';

// ── Icons (reused for sidebar + bottom nav) ─────────────────────────────────

const ICONS: Record<Pantalla, (size?: number) => React.ReactNode> = {
  inicio: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  mapa: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  solicitudes: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  incidencias: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  objetos: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M16 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2"/>
      <path d="M9 11V7a3 3 0 0 1 6 0v4"/>
    </svg>
  ),
  historial: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

const NAV_LABELS: Record<Pantalla, string> = {
  inicio: 'Inicio',
  mapa: 'Mapa',
  solicitudes: 'Solicitudes',
  incidencias: 'Incidencias',
  objetos: 'Objetos',
  historial: 'Historial',
};

const NAV_LABELS_SIDEBAR: Record<Pantalla, string> = {
  inicio: 'Inicio',
  mapa: 'Mapa de habitaciones',
  solicitudes: 'Solicitudes',
  incidencias: 'Incidencias',
  objetos: 'Objetos olvidados',
  historial: 'Historial',
};

const PANTALLAS: Pantalla[] = ['inicio', 'mapa', 'solicitudes', 'incidencias', 'objetos', 'historial'];

// ── Sidebar (desktop only) ──────────────────────────────────────────────────

function Sidebar({
  pantalla,
  setPantalla,
  solPendientes,
  incPendientes,
  onCambiarModulo,
}: {
  pantalla: Pantalla;
  setPantalla: (p: Pantalla) => void;
  solPendientes: number;
  incPendientes: number;
  onCambiarModulo: (m: Modulo) => void;
}) {
  return (
    <nav
      className="hidden lg:flex flex-col w-56 shrink-0 h-full"
      style={{ backgroundColor: '#102747' }}
    >
      {/* Marca */}
      <div className="px-5 pt-7 pb-6 border-b shrink-0" style={{ borderColor: '#1d3a5f' }}>
        <p
          className="text-white text-xl font-bold leading-tight"
          style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif', letterSpacing: '0.02em' }}
        >
          Villa Serena
        </p>
        <p className="text-xs mt-1" style={{ color: '#AEBCC1', letterSpacing: '0.06em' }}>
          Módulo de Limpieza
        </p>
      </div>

      {/* Navegación */}
      <div className="flex-1 py-3 overflow-y-auto">
        {PANTALLAS.map(id => {
          const active = pantalla === id;
          const badge = id === 'solicitudes' ? solPendientes : id === 'incidencias' ? incPendientes : 0;
          return (
            <button
              key={id}
              onClick={() => setPantalla(id)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors relative group"
              style={{
                color: active ? '#FFFFFF' : '#AEBCC1',
                backgroundColor: active ? '#18345C' : 'transparent',
              }}
            >
              {active && <span className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: '#D8B94E' }} />}
              <span style={{ color: active ? '#D8B94E' : '#AEBCC1' }}>{ICONS[id]()}</span>
              <span className="text-sm font-medium flex-1">{NAV_LABELS_SIDEBAR[id]}</span>
              {badge > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cambio de módulo */}
      <ModuloSwitcher actual="limpieza" onCambiar={onCambiarModulo} />

      {/* Usuario */}
      <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#1d3a5f' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ backgroundColor: '#D8B94E', color: '#102747' }}
          >
            CV
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">Carmen Vidal</p>
            <p className="text-[10px] truncate" style={{ color: '#AEBCC1' }}>Turno de mañana</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [modulo, setModulo] = useState<Modulo>('limpieza');
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>(HABITACIONES_INICIALES);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(SOLICITUDES_INICIALES);
  const [incidencias, setIncidencias] = useState<Incidencia[]>(INCIDENCIAS_INICIALES);
  const [objetos, setObjetos] = useState<ObjetoOlvidado[]>(OBJETOS_INICIALES);
  const [historial, setHistorial] = useState<EntradaHistorial[]>(HISTORIAL_INICIAL);
  const [habitacionAbrir, setHabitacionAbrir] = useState<string | null>(null);

  function agregarHistorial(e: Omit<EntradaHistorial, 'id'>) {
    setHistorial(h => [{ id: generarId(), ...e }, ...h]);
  }

  // Habitaciones
  function comenzarLimpieza(id: string) {
    setHabitaciones(hs => hs.map(h => h.id === id ? { ...h, estado: 'en-limpieza' as EstadoHabitacion } : h));
    const hab = habitaciones.find(h => h.id === id);
    if (hab) agregarHistorial({ habitacionNumero: hab.numero, tipo: 'Limpieza iniciada', fechaHora: horaActual(), estado: 'En limpieza', responsable: 'Carmen Vidal' });
  }

  function finalizarLimpieza(id: string) {
    const hora = horaActual();
    const hab = habitaciones.find(h => h.id === id);

    setHabitaciones(hs => hs.map(h =>
      h.id === id
        ? {
            ...h,
            estado: 'limpia' as EstadoHabitacion,
            finalizadaEn: hora,
            tareas: h.tareas.map(t => ({ ...t, completada: true })),
          }
        : h
    ));

    if (hab) {
      // Si la limpieza nació de una solicitud del huésped,
      // al finalizar la habitación la solicitud también queda atendida.
      setSolicitudes(ss => ss.map(s =>
        s.tipo === 'limpieza' &&
        s.habitacionNumero === hab.numero &&
        (s.estado === 'pendiente' || s.estado === 'en-limpieza')
          ? { ...s, estado: 'finalizada', horaEntrega: hora }
          : s
      ));

      agregarHistorial({
        habitacionNumero: hab.numero,
        tipo: 'Limpieza completa',
        fechaHora: hora,
        estado: 'Limpia',
        responsable: 'Carmen Vidal',
      });
    }
  }

  function actualizarEstado(id: string, estado: EstadoHabitacion) {
    setHabitaciones(hs => hs.map(h => h.id === id ? { ...h, estado } : h));
  }

  function toggleTarea(habId: string, tareaId: string) {
    setHabitaciones(hs => hs.map(h =>
      h.id !== habId ? h :
      { ...h, tareas: h.tareas.map(t => t.id === tareaId ? { ...t, completada: !t.completada } : t) }
    ));
  }

  function guardarObservaciones(id: string, obs: string) {
    setHabitaciones(hs => hs.map(h => h.id === id ? { ...h, observaciones: obs } : h));
  }

  function abrirHabitacionDesdeInicio(id: string, iniciar: boolean) {
    const hab = habitaciones.find(h => h.id === id);
    if (!hab) return;

    if (iniciar && hab.estado === 'pendiente') {
      comenzarLimpieza(id);
    }

    setHabitacionAbrir(hab.numero);
  }

  // Solicitudes de limpieza
  function iniciarSolicitudLimpieza(id: string) {
    setSolicitudes(ss => ss.map(s => s.id === id ? { ...s, estado: 'en-limpieza' } : s));
    const sol = solicitudes.find(s => s.id === id);
    if (sol) agregarHistorial({ habitacionNumero: sol.habitacionNumero, tipo: 'Limpieza iniciada (solicitud)', fechaHora: horaActual(), estado: 'En limpieza', responsable: 'Carmen Vidal' });
  }

  function finalizarSolicitudLimpieza(id: string) {
    const hora = horaActual();
    setSolicitudes(ss => ss.map(s => s.id === id ? { ...s, estado: 'finalizada', horaEntrega: hora } : s));
    const sol = solicitudes.find(s => s.id === id);
    if (sol) agregarHistorial({ habitacionNumero: sol.habitacionNumero, tipo: 'Limpieza finalizada (solicitud)', fechaHora: hora, estado: 'Finalizada', responsable: 'Carmen Vidal' });
  }

  function abrirLimpiezaDesdeSolicitud(solicitudId: string, habitacionNumero: string) {
    const sol = solicitudes.find(s => s.id === solicitudId);
    const hab = habitaciones.find(h => h.numero === habitacionNumero);

    // Si la solicitud aún está pendiente, pasa a En proceso.
    if (sol?.estado === 'pendiente') {
      setSolicitudes(ss => ss.map(s =>
        s.id === solicitudId ? { ...s, estado: 'en-limpieza' } : s
      ));

      if (hab && hab.estado === 'pendiente') {
        setHabitaciones(hs => hs.map(h =>
          h.id === hab.id
            ? { ...h, estado: 'en-limpieza' as EstadoHabitacion }
            : h
        ));

        agregarHistorial({
          habitacionNumero,
          tipo: 'Limpieza iniciada (solicitud)',
          fechaHora: horaActual(),
          estado: 'En limpieza',
          responsable: 'Carmen Vidal',
        });
      }
    }

    setHabitacionAbrir(habitacionNumero);
  }

  // Solicitudes de artículos
  function atenderArticulo(id: string) {
    setSolicitudes(ss => ss.map(s => s.id === id ? { ...s, estado: 'en-proceso' } : s));
    const sol = solicitudes.find(s => s.id === id);
    if (sol) agregarHistorial({ habitacionNumero: sol.habitacionNumero, tipo: 'Artículo en proceso', fechaHora: horaActual(), estado: 'En proceso', responsable: 'Carmen Vidal' });
  }

  function confirmarEntregaArticulo(id: string) {
    const hora = horaActual();
    setSolicitudes(ss => ss.map(s => s.id === id ? { ...s, estado: 'entregado', horaEntrega: hora } : s));
    const sol = solicitudes.find(s => s.id === id);
    if (sol) agregarHistorial({ habitacionNumero: sol.habitacionNumero, tipo: 'Artículo entregado', fechaHora: hora, estado: 'Entregado', responsable: 'Carmen Vidal' });
  }

  // Incidencias
  function registrarIncidencia(inc: Incidencia) {
    setIncidencias(is => [inc, ...is]);
    if (inc.impideUso) {
      setHabitaciones(hs => hs.map(h =>
        h.numero === inc.habitacionNumero ? { ...h, estado: 'fuera-servicio' as EstadoHabitacion } : h
      ));
    }
    agregarHistorial({ habitacionNumero: inc.habitacionNumero, tipo: 'Incidencia reportada', fechaHora: inc.hora, estado: 'Pendiente', responsable: 'Carmen Vidal' });
  }

  // Objetos
  function registrarObjeto(obj: ObjetoOlvidado) {
    setObjetos(os => [obj, ...os]);
    agregarHistorial({ habitacionNumero: obj.habitacionNumero, tipo: 'Objeto registrado', fechaHora: obj.fechaHora, estado: 'Guardado', responsable: 'Carmen Vidal' });
  }

  const solPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const incPendientes = incidencias.filter(i => i.estado === 'pendiente').length;

  // Pantalla activa
  const screenContent = (() => {
    switch (pantalla) {
      case 'inicio':
        return (
          <Inicio
            habitaciones={habitaciones}
            solicitudes={solicitudes}
            historial={historial}
            onIrMapa={() => setPantalla('mapa')}
            onIrSolicitudes={() => setPantalla('solicitudes')}
            onComenzarLimpieza={comenzarLimpieza}
            onAbrirHabitacion={abrirHabitacionDesdeInicio}
          />
        );
      case 'mapa':
        return (
          <Mapa
            habitaciones={habitaciones}
            solicitudes={solicitudes}
            onComenzarLimpieza={comenzarLimpieza}
            onFinalizarLimpieza={finalizarLimpieza}
            onActualizarEstado={actualizarEstado}
            onToggleTarea={toggleTarea}
            onGuardarObservaciones={guardarObservaciones}
            onIrIncidencias={() => setPantalla('incidencias')}
          />
        );
      case 'solicitudes':
        return (
          <Solicitudes
            solicitudes={solicitudes}
            onAtenderArticulo={atenderArticulo}
            onConfirmarEntrega={confirmarEntregaArticulo}
            onAbrirLimpieza={abrirLimpiezaDesdeSolicitud}
          />
        );
      case 'incidencias':return <Incidencias incidencias={incidencias} onRegistrar={registrarIncidencia} />;
      case 'objetos':    return <Objetos objetos={objetos} onRegistrar={registrarObjeto} />;
      case 'historial':  return <Historial historial={historial} />;
    }
  })();

  if (modulo === 'roomservice') {
    return <RoomServiceApp onCambiarModulo={setModulo} />;
  }

  if (modulo === 'recepcion') {
    return <RecepcionApp onCambiarModulo={setModulo} />;
  }

  if (modulo === 'admin') {
    return <AdminApp onCambiarModulo={setModulo} />;
  }

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&display=swap');
      `}</style>
      {/* ── Layout principal ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — solo desktop */}
        <Sidebar
          pantalla={pantalla}
          setPantalla={setPantalla}
          solPendientes={solPendientes}
          incPendientes={incPendientes}
          onCambiarModulo={setModulo}
        />

        {/* Área de contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra superior móvil */}
          <div
            className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ backgroundColor: '#102747' }}
          >
            <p
              className="text-white text-lg font-bold"
              style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
            >
              Villa Serena
            </p>
            <span className="text-[#AEBCC1] text-xs">·</span>
            <p className="text-[#AEBCC1] text-xs font-medium truncate flex-1">
              {NAV_LABELS_SIDEBAR[pantalla]}
            </p>
            <div className="flex gap-1.5 shrink-0">
              <ModuloSwitcher actual="limpieza" onCambiar={setModulo} variant="inline" />
            </div>
            {(solPendientes + incPendientes) > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: '#D8B94E', color: '#102747' }}
              >
                {solPendientes + incPendientes}
              </span>
            )}
          </div>

          {/* Pantalla activa */}
          <div className="flex-1 flex overflow-hidden relative">
            {screenContent}

            {(pantalla === 'solicitudes' || pantalla === 'inicio') && habitacionAbrir && (
              <Mapa
                habitaciones={habitaciones}
                solicitudes={solicitudes}
                onComenzarLimpieza={comenzarLimpieza}
                onFinalizarLimpieza={finalizarLimpieza}
                onActualizarEstado={actualizarEstado}
                onToggleTarea={toggleTarea}
                onGuardarObservaciones={guardarObservaciones}
                onIrIncidencias={() => {
                  setHabitacionAbrir(null);
                  setPantalla('incidencias');
                }}
                habitacionInicialNumero={habitacionAbrir}
                onHabitacionInicialProcesada={() => {}}
                soloDetalle
                onCerrarSoloDetalle={() => setHabitacionAbrir(null)}
              />
            )}
          </div>

          {/* ── Navegación inferior móvil ── */}
          <div
            className="lg:hidden flex shrink-0 border-t"
            style={{ backgroundColor: '#102747', borderColor: '#1d3a5f' }}
          >
            {PANTALLAS.map(id => {
              const active = pantalla === id;
              const badge = id === 'solicitudes' ? solPendientes : id === 'incidencias' ? incPendientes : 0;
              return (
                <button
                  key={id}
                  onClick={() => setPantalla(id)}
                  className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors min-w-0"
                  style={{ color: active ? '#D8B94E' : '#AEBCC1' }}
                >
                  {active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5"
                      style={{ backgroundColor: '#D8B94E' }}
                    />
                  )}
                  <span className="relative">
                    {ICONS[id](20)}
                    {badge > 0 && (
                      <span
                        className="absolute -top-1 -right-2 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] font-medium leading-tight truncate max-w-full px-0.5">
                    {NAV_LABELS[id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
