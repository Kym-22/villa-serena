import { useState } from 'react';
import type {
  Modulo,
  SeccionRecepcion,
  Huesped,
  Reserva,
  HabitacionHotel,
  SolicitudHuesped,
  EstadoHabHotel,
  EstadoSolicitudHuesped,
  MetodoPago,
  Pago,
  Acompanante,
  ServicioAdicional,
  TipoHabitacion,
} from '../../types';
import {
  HUESPEDES_INICIALES,
  RESERVAS_INICIALES,
  HABITACIONES_HOTEL_INICIALES,
  SOLICITUDES_HUESPED_INICIALES,
  RECEPCIONISTA,
  generarId,
  ahoraISO,
  siguienteCodigoReserva,
  siguienteComprobante,
  fechaHoyISO,
} from '../../data';
import { validarCambioEstadoHab } from './recUtils';
import ModuloSwitcher from '../ModuloSwitcher';
import DiaRecepcion from './DiaRecepcion';
import Reservas from './Reservas';
import Disponibilidad from './Disponibilidad';
import HabitacionesRecepcion from './HabitacionesRecepcion';
import Huespedes from './Huespedes';
import SolicitudesRecepcion from './SolicitudesRecepcion';
import DetalleReserva from './DetalleReserva';
import NuevaReservaModal from './NuevaReservaModal';

const SECCIONES: { id: SeccionRecepcion; label: string; corto: string }[] = [
  { id: 'dia', label: 'Vista del día', corto: 'Día' },
  { id: 'reservas', label: 'Reservas', corto: 'Reservas' },
  { id: 'disponibilidad', label: 'Disponibilidad', corto: 'Disponib.' },
  { id: 'habitaciones', label: 'Habitaciones', corto: 'Habs.' },
  { id: 'huespedes', label: 'Huéspedes', corto: 'Huésped.' },
  { id: 'solicitudes', label: 'Solicitudes', corto: 'Solicit.' },
];

function SeccionIcon({ id, size = 18 }: { id: SeccionRecepcion; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 } as const;
  switch (id) {
    case 'dia':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'reservas':
      return <svg {...p}><path d="M4 4h16v16H4z" /><path d="M8 4v16M4 9h4M4 14h4" /></svg>;
    case 'disponibilidad':
      return <svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case 'habitaciones':
      return <svg {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    case 'huespedes':
      return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'solicitudes':
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>;
  }
}

interface Props {
  onCambiarModulo: (m: Modulo) => void;
}

export default function RecepcionApp({ onCambiarModulo }: Props) {
  const [huespedes, setHuespedes] = useState<Huesped[]>(HUESPEDES_INICIALES);
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_INICIALES);
  const [habitaciones, setHabitaciones] = useState<HabitacionHotel[]>(HABITACIONES_HOTEL_INICIALES);
  const [solicitudes, setSolicitudes] = useState<SolicitudHuesped[]>(SOLICITUDES_HUESPED_INICIALES);

  const [seccion, setSeccion] = useState<SeccionRecepcion>('dia');
  const [reservaAbiertaId, setReservaAbiertaId] = useState<string | null>(null);
  const [nuevaReserva, setNuevaReserva] = useState<{
    open: boolean;
    preset?: { entrada?: string; salida?: string; tipo?: TipoHabitacion; habitacionId?: string };
  }>({ open: false });

  const reservaAbierta = reservas.find(r => r.id === reservaAbiertaId) ?? null;
  const huespedAbierto = reservaAbierta ? huespedes.find(h => h.id === reservaAbierta.huespedId) ?? null : null;

  const hoyISO = fechaHoyISO();
  const badgeDia =
    reservas.filter(r => r.fechaEntrada === hoyISO && (r.estado === 'confirmada' || r.estado === 'pendiente')).length +
    reservas.filter(r => r.fechaSalida === hoyISO && r.estado === 'en-curso').length;
  const badgeSolicitudes = solicitudes.filter(s => s.estado !== 'atendida').length;

  /* ---------- Habitaciones ---------- */
  function libera(habId: string | null) {
    if (!habId) return;
    setHabitaciones(hs =>
      hs.map(h => {
        if (h.id !== habId) return h;
        if (h.estado === 'reservada' || h.estado === 'ocupada') return { ...h, estado: 'disponible' };
        return h;
      }),
    );
  }
  function reservaHabitacionSiLibre(habId: string) {
    setHabitaciones(hs =>
      hs.map(h => (h.id === habId && h.estado === 'disponible' ? { ...h, estado: 'reservada' as EstadoHabHotel } : h)),
    );
  }
  function ocupa(habId: string, estado: EstadoHabHotel) {
    setHabitaciones(hs => hs.map(h => (h.id === habId ? { ...h, estado } : h)));
  }

  function cambiarEstadoHab(habId: string, nuevo: EstadoHabHotel) {
    setHabitaciones(hs =>
      hs.map(h => {
        if (h.id !== habId) return h;
        if (validarCambioEstadoHab(h, nuevo, reservas)) return h;
        return { ...h, estado: nuevo };
      }),
    );
  }

  /* ---------- Huéspedes ---------- */
  function crearHuesped(datos: Omit<Huesped, 'id' | 'creadoEn'>): Huesped {
    const nuevo: Huesped = { ...datos, id: generarId(), creadoEn: ahoraISO() };
    setHuespedes(prev => [nuevo, ...prev]);
    return nuevo;
  }

  /* ---------- Reservas ---------- */
  function crearReserva(d: {
    huespedId: string;
    tipoHabitacion: TipoHabitacion;
    fechaEntrada: string;
    fechaSalida: string;
    personas: number;
    habitacionId: string | null;
  }) {
    const nueva: Reserva = {
      id: generarId(),
      codigo: siguienteCodigoReserva(),
      huespedId: d.huespedId,
      habitacionId: d.habitacionId,
      tipoHabitacion: d.tipoHabitacion,
      fechaEntrada: d.fechaEntrada,
      fechaSalida: d.fechaSalida,
      personas: d.personas,
      estado: d.habitacionId ? 'confirmada' : 'pendiente',
      acompanantes: [],
      servicios: [],
      pagos: [],
      descuento: 0,
      creadoEn: ahoraISO(),
    };
    setReservas(prev => [nueva, ...prev]);
    if (d.habitacionId) reservaHabitacionSiLibre(d.habitacionId);
    setNuevaReserva({ open: false });
    setSeccion('reservas');
    setReservaAbiertaId(nueva.id);
  }

  function asignarHabitacion(reservaId: string, habitacionId: string) {
    const r = reservas.find(x => x.id === reservaId);
    const prev = r?.habitacionId ?? null;
    setReservas(rs =>
      rs.map(x =>
        x.id === reservaId
          ? { ...x, habitacionId, estado: x.estado === 'pendiente' ? 'confirmada' : x.estado }
          : x,
      ),
    );
    if (prev && prev !== habitacionId) libera(prev);
    reservaHabitacionSiLibre(habitacionId);
  }

  function modificarReserva(
    reservaId: string,
    c: { fechaEntrada: string; fechaSalida: string; personas: number; habitacionId: string | null },
  ) {
    const r = reservas.find(x => x.id === reservaId);
    const prev = r?.habitacionId ?? null;
    setReservas(rs =>
      rs.map(x => {
        if (x.id !== reservaId) return x;
        let estado = x.estado;
        if (c.habitacionId && estado === 'pendiente') estado = 'confirmada';
        if (!c.habitacionId && estado === 'confirmada') estado = 'pendiente';
        return {
          ...x,
          fechaEntrada: c.fechaEntrada,
          fechaSalida: c.fechaSalida,
          personas: c.personas,
          habitacionId: c.habitacionId,
          estado,
        };
      }),
    );
    if (prev && prev !== c.habitacionId) libera(prev);
    if (c.habitacionId) reservaHabitacionSiLibre(c.habitacionId);
  }

  function checkIn(reservaId: string) {
    const r = reservas.find(x => x.id === reservaId);
    if (!r || !r.habitacionId) return;
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, estado: 'en-curso', checkInEn: ahoraISO() } : x)));
    ocupa(r.habitacionId, 'ocupada');
  }

  function checkOut(reservaId: string) {
    const r = reservas.find(x => x.id === reservaId);
    if (!r) return;
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, estado: 'finalizada', checkOutEn: ahoraISO() } : x)));
    if (r.habitacionId) ocupa(r.habitacionId, 'en-limpieza');
  }

  function cancelarReserva(reservaId: string, motivo: string) {
    const r = reservas.find(x => x.id === reservaId);
    if (!r) return;
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, estado: 'cancelada', motivoCancelacion: motivo } : x)));
    if (r.habitacionId) {
      setHabitaciones(hs =>
        hs.map(h => {
          if (h.id !== r.habitacionId) return h;
          if (h.estado === 'reservada') return { ...h, estado: 'disponible' };
          if (h.estado === 'ocupada') return { ...h, estado: 'en-limpieza' };
          return h;
        }),
      );
    }
  }

  function agregarAcompanante(reservaId: string, a: Acompanante) {
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, acompanantes: [...x.acompanantes, a] } : x)));
  }
  function quitarAcompanante(reservaId: string, index: number) {
    setReservas(rs =>
      rs.map(x => (x.id === reservaId ? { ...x, acompanantes: x.acompanantes.filter((_, i) => i !== index) } : x)),
    );
  }

  function agregarServicio(reservaId: string, s: Omit<ServicioAdicional, 'id' | 'fecha'>) {
    const servicio: ServicioAdicional = { ...s, id: generarId(), fecha: ahoraISO() };
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, servicios: [...x.servicios, servicio] } : x)));
  }
  function quitarServicio(reservaId: string, servicioId: string) {
    setReservas(rs =>
      rs.map(x => (x.id === reservaId ? { ...x, servicios: x.servicios.filter(s => s.id !== servicioId) } : x)),
    );
  }

  function registrarPago(reservaId: string, datos: { monto: number; metodo: MetodoPago }): Pago {
    const pago: Pago = {
      id: generarId(),
      fecha: ahoraISO(),
      monto: datos.monto,
      metodo: datos.metodo,
      comprobante: siguienteComprobante(),
    };
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, pagos: [...x.pagos, pago] } : x)));
    return pago;
  }

  function aplicarDescuento(reservaId: string, monto: number) {
    setReservas(rs => rs.map(x => (x.id === reservaId ? { ...x, descuento: monto } : x)));
  }

  /* ---------- Solicitudes ---------- */
  function registrarSolicitud(s: Omit<SolicitudHuesped, 'id' | 'fecha' | 'estado'>) {
    setSolicitudes(prev => [{ ...s, id: generarId(), fecha: ahoraISO(), estado: 'pendiente' }, ...prev]);
  }
  function cambiarEstadoSolicitud(id: string, estado: EstadoSolicitudHuesped) {
    setSolicitudes(prev => prev.map(x => (x.id === id ? { ...x, estado } : x)));
  }

  /* ---------- Contenido ---------- */
  const contenido = (() => {
    switch (seccion) {
      case 'dia':
        return (
          <DiaRecepcion
            reservas={reservas}
            huespedes={huespedes}
            habitaciones={habitaciones}
            onAbrirReserva={setReservaAbiertaId}
            onIr={setSeccion}
          />
        );
      case 'reservas':
        return (
          <Reservas
            reservas={reservas}
            huespedes={huespedes}
            habitaciones={habitaciones}
            onAbrir={setReservaAbiertaId}
            onNueva={() => setNuevaReserva({ open: true })}
          />
        );
      case 'disponibilidad':
        return (
          <Disponibilidad
            habitaciones={habitaciones}
            reservas={reservas}
            onReservar={preset => setNuevaReserva({ open: true, preset })}
          />
        );
      case 'habitaciones':
        return (
          <HabitacionesRecepcion
            habitaciones={habitaciones}
            reservas={reservas}
            huespedes={huespedes}
            onCambiarEstado={cambiarEstadoHab}
          />
        );
      case 'huespedes':
        return (
          <Huespedes
            huespedes={huespedes}
            reservas={reservas}
            habitaciones={habitaciones}
            onRegistrar={crearHuesped}
            onAbrirReserva={id => { setSeccion('reservas'); setReservaAbiertaId(id); }}
          />
        );
      case 'solicitudes':
        return (
          <SolicitudesRecepcion
            solicitudes={solicitudes}
            huespedes={huespedes}
            reservas={reservas}
            onRegistrar={registrarSolicitud}
            onCambiarEstado={cambiarEstadoSolicitud}
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
            <p className="text-xs mt-1" style={{ color: '#AEBCC1', letterSpacing: '0.06em' }}>Recepción</p>
          </div>

          <div className="flex-1 py-3 overflow-y-auto">
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = s.id === 'dia' ? badgeDia : s.id === 'solicitudes' ? badgeSolicitudes : 0;
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

          <ModuloSwitcher actual="recepcion" onCambiar={onCambiarModulo} />

          <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: '#D8B94E', color: '#102747' }}>
                PG
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{RECEPCIONISTA}</p>
                <p className="text-[10px] truncate" style={{ color: '#AEBCC1' }}>Recepción · turno de día</p>
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
              <ModuloSwitcher actual="recepcion" onCambiar={onCambiarModulo} variant="inline" />
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">{contenido}</div>

          {/* Navegación inferior — móvil */}
          <div className="lg:hidden flex shrink-0 border-t overflow-x-auto" style={{ backgroundColor: '#102747', borderColor: '#1d3a5f' }}>
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = s.id === 'dia' ? badgeDia : s.id === 'solicitudes' ? badgeSolicitudes : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setSeccion(s.id)}
                  className="flex-1 min-w-[62px] flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors"
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

      {/* Modales */}
      {reservaAbierta && huespedAbierto && (
        <DetalleReserva
          reserva={reservaAbierta}
          huesped={huespedAbierto}
          habitaciones={habitaciones}
          reservas={reservas}
          onCerrar={() => setReservaAbiertaId(null)}
          onAsignarHabitacion={asignarHabitacion}
          onCheckIn={checkIn}
          onCheckOut={checkOut}
          onModificar={modificarReserva}
          onCancelar={cancelarReserva}
          onAgregarAcompanante={agregarAcompanante}
          onQuitarAcompanante={quitarAcompanante}
          onAgregarServicio={agregarServicio}
          onQuitarServicio={quitarServicio}
          onRegistrarPago={registrarPago}
          onAplicarDescuento={aplicarDescuento}
        />
      )}

      {nuevaReserva.open && (
        <NuevaReservaModal
          huespedes={huespedes}
          habitaciones={habitaciones}
          reservas={reservas}
          preset={nuevaReserva.preset}
          onCerrar={() => setNuevaReserva({ open: false })}
          onCrearHuesped={crearHuesped}
          onCrearReserva={crearReserva}
        />
      )}
    </div>
  );
}
