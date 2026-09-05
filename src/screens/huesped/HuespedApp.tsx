import { useEffect, useMemo, useState } from 'react';
import type {
  Modulo,
  SeccionHuesped,
  Reserva,
  CheckInWeb,
  PedidoHuesped,
  MensajeChat,
  Domotica,
  TurnoAmenidad,
  ReservaAmenidad,
  CargoHuesped,
  DatosFiscales,
  PagoHuespedApp,
  MetodoPagoHuesped,
  ReservaHuesped,
  TipoPedidoHuesped,
  LineaPedidoHuesped,
  DocumentoCargado,
  EstadoHabHotel,
  DatosContacto,
  TipoHabitacion,
} from '../../types';
import {
  HUESPEDES_INICIALES,
  HABITACIONES_HOTEL_INICIALES,
  HUESPED_DEMO_ID,
  RESERVA_HUESPED_INICIAL,
  RESERVAS_CON_HUESPED,
  CHECKIN_INICIAL,
  PEDIDOS_HUESPED_INICIALES,
  MENSAJES_CHAT_INICIALES,
  RESPUESTAS_RECEPCION,
  DOMOTICA_INICIAL,
  TURNOS_AMENIDAD_INICIALES,
  RESERVAS_AMENIDAD_INICIALES,
  CARGOS_HUESPED_INICIALES,
  DATOS_FISCALES_INICIALES,
  PUNTOS_FIDELIDAD_INICIALES,
  OFERTAS_HABITACION,
  MENU_INICIAL,
  SERVICIOS_CATALOGO,
  PRECIO_NOCHE_TIPO,
  generarId,
  ahoraISO,
  nochesEntre,
  codigoLlaveDigital,
  siguienteCodigoReservaWeb,
  siguienteNumeroPedidoHuesped,
  siguienteFacturaFEL,
} from '../../data';
import {
  SIGUIENTE_ESTADO_PEDIDO,
  pedidoActivo,
  totalCargos,
  puntosDeMonto,
} from './huespedUtils';
import ModuloSwitcher from '../ModuloSwitcher';
import InicioHuesped from './InicioHuesped';
import ReservarEstancia from './ReservarEstancia';
import CheckInWebScreen from './CheckInWeb';
import ServiciosHuesped from './ServiciosHuesped';
import MiHabitacion from './MiHabitacion';
import CuentaHuesped from './CuentaHuesped';

const SECCIONES: { id: SeccionHuesped; label: string; corto: string }[] = [
  { id: 'inicio', label: 'Mi estancia', corto: 'Estancia' },
  { id: 'checkin', label: 'Check-in web', corto: 'Check-in' },
  { id: 'servicios', label: 'Servicios y pedidos', corto: 'Servicios' },
  { id: 'habitacion', label: 'Mi habitación', corto: 'Habitación' },
  { id: 'cuenta', label: 'Cuenta y check-out', corto: 'Cuenta' },
  { id: 'reservar', label: 'Reservar estancia', corto: 'Reservar' },
];

function SeccionIcon({ id, size = 18 }: { id: SeccionHuesped; size?: number }) {
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
    case 'inicio':
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case 'checkin':
      return <svg {...p}><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 8.8-8.8" /><path d="m17 6 3 3" /><path d="m14 9 3 3" /></svg>;
    case 'servicios':
      return <svg {...p}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.3A1 1 0 0 0 6 19h12" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>;
    case 'habitacion':
      return <svg {...p}><path d="M3 7v10" /><path d="M21 10v7" /><path d="M3 13h18" /><path d="M5 13V9.5A1.5 1.5 0 0 1 6.5 8h3A1.5 1.5 0 0 1 11 9.5V13" /><path d="M11 13v-2a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v1" /></svg>;
    case 'cuenta':
      return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
    case 'reservar':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  }
}

// Cada paso del pedido avanza solo, para mostrar el seguimiento en vivo
// de la HU-03 sin necesidad de un servidor detrás.
const SEGUNDOS_POR_PASO = 20;

interface Props {
  onCambiarModulo: (m: Modulo) => void;
}

export default function HuespedApp({ onCambiarModulo }: Props) {
  const [seccion, setSeccion] = useState<SeccionHuesped>('inicio');

  const huesped = HUESPEDES_INICIALES.find(h => h.id === HUESPED_DEMO_ID)!;
  const [reserva, setReserva] = useState<Reserva>(RESERVA_HUESPED_INICIAL);
  const habitacion = HABITACIONES_HOTEL_INICIALES.find(h => h.id === reserva.habitacionId)!;

  const [estadoHabitacion, setEstadoHabitacion] = useState<EstadoHabHotel>('ocupada');
  const [checkin, setCheckin] = useState<CheckInWeb>(CHECKIN_INICIAL);
  const [pedidos, setPedidos] = useState<PedidoHuesped[]>(PEDIDOS_HUESPED_INICIALES);
  const [mensajes, setMensajes] = useState<MensajeChat[]>(MENSAJES_CHAT_INICIALES);
  const [escribiendo, setEscribiendo] = useState(false);
  const [domotica, setDomotica] = useState<Domotica>(DOMOTICA_INICIAL);
  const [turnos, setTurnos] = useState<TurnoAmenidad[]>(TURNOS_AMENIDAD_INICIALES);
  const [reservasAmenidad, setReservasAmenidad] = useState<ReservaAmenidad[]>(RESERVAS_AMENIDAD_INICIALES);
  const [cargos, setCargos] = useState<CargoHuesped[]>(CARGOS_HUESPED_INICIALES);
  const [pagos, setPagos] = useState<PagoHuespedApp[]>([]);
  const [fiscales, setFiscales] = useState<DatosFiscales>(DATOS_FISCALES_INICIALES);
  const [facturaEmitida, setFacturaEmitida] = useState<string | null>(null);
  const [puntos, setPuntos] = useState(PUNTOS_FIDELIDAD_INICIALES);
  const [reservaWeb, setReservaWeb] = useState<ReservaHuesped | null>(null);
  const [estanciaCerrada, setEstanciaCerrada] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const llaveActiva = checkin.estado === 'completado' && !estanciaCerrada;

  /* ---------- Cuenta (HU-05) ---------- */

  const cuenta = useMemo(() => {
    const noches = nochesEntre(reserva.fechaEntrada, reserva.fechaSalida);
    const precioNoche = habitacion?.precioNoche ?? PRECIO_NOCHE_TIPO[reserva.tipoHabitacion];
    const alojamiento = noches * precioNoche;
    const extras = totalCargos(cargos);
    const descuento = reserva.descuento || 0;
    const total = Math.max(0, alojamiento + extras - descuento);
    const anticipo = reserva.pagos.reduce((s, p) => s + p.monto, 0);
    const abonado = pagos.reduce((s, p) => s + p.monto, 0);
    const pagado = anticipo + abonado;
    const saldo = Math.round((total - pagado) * 100) / 100;
    return { noches, precioNoche, alojamiento, extras, descuento, total, anticipo, abonado, pagado, saldo };
  }, [reserva, habitacion, cargos, pagos]);

  const pedidosActivos = pedidos.filter(pedidoActivo);

  function mostrarAviso(texto: string) {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? null : a)), 4000);
  }

  /* ---------- HU-03 · Seguimiento en vivo de los pedidos ---------- */

  useEffect(() => {
    const id = window.setInterval(() => {
      setPedidos(ps =>
        ps.map(p => {
          if (!pedidoActivo(p)) return p;
          const siguiente = SIGUIENTE_ESTADO_PEDIDO[p.estado];
          if (!siguiente) return p;
          const ahora = ahoraISO();
          return {
            ...p,
            estado: siguiente,
            entregadoEn: siguiente === 'entregado' ? ahora : p.entregadoEn,
            historial: [...p.historial, { estado: siguiente, fechaHora: ahora }],
          };
        }),
      );
    }, SEGUNDOS_POR_PASO * 1000);
    return () => window.clearInterval(id);
  }, []);

  /* ---------- HU-01 · Reserva en línea ---------- */

  function confirmarReservaWeb(datos: {
    tipo: TipoHabitacion;
    fechaEntrada: string;
    fechaSalida: string;
    personas: number;
    contacto: DatosContacto;
    ultimos4: string;
  }) {
    const oferta = OFERTAS_HABITACION.find(o => o.tipo === datos.tipo)!;
    const noches = nochesEntre(datos.fechaEntrada, datos.fechaSalida);
    const nueva: ReservaHuesped = {
      codigo: siguienteCodigoReservaWeb(),
      tipo: datos.tipo,
      fechaEntrada: datos.fechaEntrada,
      fechaSalida: datos.fechaSalida,
      personas: datos.personas,
      noches,
      precioNoche: oferta.precioNoche,
      total: noches * oferta.precioNoche,
      contacto: datos.contacto,
      ultimos4: datos.ultimos4,
      creadaEn: ahoraISO(),
    };
    setReservaWeb(nueva);
    mostrarAviso(`Reserva ${nueva.codigo} confirmada. Enviamos el detalle a ${datos.contacto.correo}.`);
  }

  /* ---------- HU-02 · Check-in web ---------- */

  function completarCheckIn(datos: {
    documento: DocumentoCargado;
    firma: string;
    peticiones: string[];
    notaPeticiones: string;
  }) {
    setCheckin({
      estado: 'completado',
      documento: datos.documento,
      firma: datos.firma,
      peticiones: datos.peticiones,
      notaPeticiones: datos.notaPeticiones,
      completadoEn: ahoraISO(),
      codigoLlave: codigoLlaveDigital(reserva.codigo, habitacion.numero),
    });
    mostrarAviso('Check-in completado. Tu llave digital ya está activa.');
  }

  function guardarPeticiones(peticiones: string[], nota: string) {
    setCheckin(c => ({ ...c, peticiones, notaPeticiones: nota }));
    mostrarAviso('Actualizamos tus peticiones especiales.');
  }

  /* ---------- HU-03 · Pedidos y mensajería ---------- */

  function crearPedido(datos: {
    tipo: TipoPedidoHuesped;
    lineas: LineaPedidoHuesped[];
    nota: string;
    alergias: string;
    minutosEstimados: number;
  }) {
    const numero = siguienteNumeroPedidoHuesped();
    const creadoEn = ahoraISO();
    const pedido: PedidoHuesped = {
      id: generarId(),
      numero,
      tipo: datos.tipo,
      lineas: datos.lineas,
      nota: datos.nota,
      alergias: datos.alergias,
      estado: 'recibido',
      minutosEstimados: datos.minutosEstimados,
      creadoEn,
      historial: [{ estado: 'recibido', fechaHora: creadoEn }],
    };
    setPedidos(ps => [pedido, ...ps]);

    // El importe se carga en el momento a la cuenta de la habitación.
    const nuevosCargos: CargoHuesped[] = datos.lineas
      .filter(l => l.precioUnitario > 0)
      .map(l => ({
        id: generarId(),
        concepto: `${l.nombre} (pedido #${numero})`,
        categoria: datos.tipo === 'restaurante' ? 'Room service' : 'Servicios',
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        fecha: creadoEn,
      }));
    if (nuevosCargos.length) setCargos(cs => [...nuevosCargos, ...cs]);

    mostrarAviso(
      `Pedido #${numero} recibido. Tiempo estimado: ${datos.minutosEstimados} minutos.`,
    );
    return numero;
  }

  function cancelarPedido(id: string) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido || pedido.estado !== 'recibido') return;

    setPedidos(ps =>
      ps.map(p =>
        p.id === id
          ? { ...p, estado: 'cancelado', historial: [...p.historial, { estado: 'cancelado' as const, fechaHora: ahoraISO() }] }
          : p,
      ),
    );
    // Al cancelar se revierten los cargos que había generado el pedido.
    setCargos(cs => cs.filter(c => !c.concepto.endsWith(`(pedido #${pedido.numero})`)));
    mostrarAviso(`Pedido #${pedido.numero} cancelado. Retiramos su importe de tu cuenta.`);
  }

  function enviarMensaje(texto: string) {
    const mio: MensajeChat = { id: generarId(), autor: 'huesped', texto, hora: ahoraISO() };
    setMensajes(ms => [...ms, mio]);
    setEscribiendo(true);

    // Respuesta simulada de recepción: la mensajería real usaría WebSockets.
    window.setTimeout(() => {
      const respuesta = RESPUESTAS_RECEPCION[Math.floor(Math.random() * RESPUESTAS_RECEPCION.length)];
      setMensajes(ms => [...ms, { id: generarId(), autor: 'recepcion', texto: respuesta, hora: ahoraISO() }]);
      setEscribiendo(false);
    }, 1800);
  }

  /* ---------- HU-04 · Domótica y amenidades ---------- */

  function actualizarDomotica(cambios: Partial<Domotica>) {
    setDomotica(d => ({ ...d, ...cambios }));
  }

  function actualizarLuz(id: string, cambios: { encendida?: boolean; intensidad?: number }) {
    setDomotica(d => ({
      ...d,
      luces: d.luces.map(l => (l.id === id ? { ...l, ...cambios } : l)),
    }));
  }

  function conectarWifi() {
    setDomotica(d => ({ ...d, wifiConectado: !d.wifiConectado }));
    mostrarAviso(
      domotica.wifiConectado ? 'Te desconectamos de la red del hotel.' : 'Conectado a la red del hotel.',
    );
  }

  function reservarTurno(turnoId: string, personas: number) {
    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) return;

    const libres = turno.aforo - turno.ocupados;
    if (personas > libres) {
      mostrarAviso(`Solo quedan ${libres} plazas en ese turno.`);
      return;
    }
    if (reservasAmenidad.some(r => r.turnoId === turnoId)) {
      mostrarAviso('Ya tienes ese turno reservado.');
      return;
    }

    setTurnos(ts => ts.map(t => (t.id === turnoId ? { ...t, ocupados: t.ocupados + personas } : t)));
    setReservasAmenidad(rs => [
      {
        id: generarId(),
        turnoId,
        area: turno.area,
        fecha: turno.fecha,
        hora: turno.hora,
        personas,
        creadaEn: ahoraISO(),
      },
      ...rs,
    ]);
    mostrarAviso(`Turno reservado: ${turno.area}, ${turno.hora}.`);
  }

  function cancelarTurno(reservaId: string) {
    const r = reservasAmenidad.find(x => x.id === reservaId);
    if (!r) return;
    setTurnos(ts =>
      ts.map(t => (t.id === r.turnoId ? { ...t, ocupados: Math.max(0, t.ocupados - r.personas) } : t)),
    );
    setReservasAmenidad(rs => rs.filter(x => x.id !== reservaId));
    mostrarAviso(`Cancelamos tu turno de ${r.area}.`);
  }

  /* ---------- HU-05 · Pago, factura y check-out ---------- */

  function guardarFiscales(datos: DatosFiscales) {
    setFiscales(datos);
    mostrarAviso('Datos fiscales guardados para tu factura electrónica.');
  }

  function pagarSaldo(metodo: MetodoPagoHuesped, extra: { ultimos4?: string }) {
    if (cuenta.saldo <= 0) return;

    // Un solo correlativo por operación: el comprobante del pago y la
    // factura electrónica que se envía por correo son el mismo documento.
    const comprobante = siguienteFacturaFEL();

    if (metodo === 'puntos') {
      const necesarios = puntosDeMonto(cuenta.saldo);
      if (puntos < necesarios) {
        mostrarAviso(
          `Te faltan ${necesarios - puntos} puntos para cubrir el saldo. Elige otro método de pago.`,
        );
        return;
      }
      setPuntos(p => p - necesarios);
      setPagos(ps => [
        ...ps,
        {
          id: generarId(),
          monto: cuenta.saldo,
          metodo,
          fecha: ahoraISO(),
          comprobante,
          puntosUsados: necesarios,
        },
      ]);
      mostrarAviso(`Pago realizado con ${necesarios} puntos. Saldo en cero.`);
    } else {
      setPagos(ps => [
        ...ps,
        {
          id: generarId(),
          monto: cuenta.saldo,
          metodo,
          fecha: ahoraISO(),
          comprobante,
          ultimos4: extra.ultimos4,
        },
      ]);
      // El pago acumula puntos de fidelidad para la próxima estancia.
      setPuntos(p => p + Math.round(cuenta.saldo * 10));
      mostrarAviso('Pago aprobado. Enviamos el comprobante a tu correo.');
    }

    setFacturaEmitida(comprobante);
  }

  function hacerCheckOut() {
    if (cuenta.saldo > 0) {
      mostrarAviso('Primero liquida el saldo pendiente para cerrar tu cuenta.');
      return;
    }
    setEstanciaCerrada(true);
    setEstadoHabitacion('en-limpieza');
    setReserva(r => ({ ...r, estado: 'finalizada', checkOutEn: ahoraISO() }));
    setCheckin(c => ({ ...c, estado: 'completado' }));
    mostrarAviso('Check-out realizado. Tu llave digital quedó desactivada.');
  }

  /* ---------- Pantalla activa ---------- */

  const contenido = (() => {
    switch (seccion) {
      case 'inicio':
        return (
          <InicioHuesped
            huesped={huesped}
            reserva={reserva}
            habitacion={habitacion}
            estadoHabitacion={estadoHabitacion}
            checkin={checkin}
            pedidos={pedidos}
            reservasAmenidad={reservasAmenidad}
            domotica={domotica}
            cuenta={cuenta}
            puntos={puntos}
            llaveActiva={llaveActiva}
            estanciaCerrada={estanciaCerrada}
            onIr={setSeccion}
          />
        );
      case 'reservar':
        return (
          <ReservarEstancia
            ofertas={OFERTAS_HABITACION}
            habitaciones={HABITACIONES_HOTEL_INICIALES}
            reservas={RESERVAS_CON_HUESPED}
            huesped={huesped}
            reservaWeb={reservaWeb}
            onConfirmar={confirmarReservaWeb}
            onNuevaBusqueda={() => setReservaWeb(null)}
          />
        );
      case 'checkin':
        return (
          <CheckInWebScreen
            huesped={huesped}
            reserva={reserva}
            habitacion={habitacion}
            checkin={checkin}
            estanciaCerrada={estanciaCerrada}
            onCompletar={completarCheckIn}
            onGuardarPeticiones={guardarPeticiones}
            onIrHabitacion={() => setSeccion('habitacion')}
          />
        );
      case 'servicios':
        return (
          <ServiciosHuesped
            menu={MENU_INICIAL}
            servicios={SERVICIOS_CATALOGO}
            pedidos={pedidos}
            mensajes={mensajes}
            escribiendo={escribiendo}
            habitacion={habitacion}
            estanciaCerrada={estanciaCerrada}
            onCrearPedido={crearPedido}
            onCancelarPedido={cancelarPedido}
            onEnviarMensaje={enviarMensaje}
            onIrCuenta={() => setSeccion('cuenta')}
          />
        );
      case 'habitacion':
        return (
          <MiHabitacion
            habitacion={habitacion}
            domotica={domotica}
            turnos={turnos}
            reservasAmenidad={reservasAmenidad}
            llaveActiva={llaveActiva}
            codigoLlave={checkin.codigoLlave}
            estanciaCerrada={estanciaCerrada}
            onActualizarDomotica={actualizarDomotica}
            onActualizarLuz={actualizarLuz}
            onConectarWifi={conectarWifi}
            onReservarTurno={reservarTurno}
            onCancelarTurno={cancelarTurno}
            onIrCheckin={() => setSeccion('checkin')}
          />
        );
      case 'cuenta':
        return (
          <CuentaHuesped
            huesped={huesped}
            reserva={reserva}
            habitacion={habitacion}
            estadoHabitacion={estadoHabitacion}
            cargos={cargos}
            cuenta={cuenta}
            pagos={pagos}
            fiscales={fiscales}
            facturaEmitida={facturaEmitida}
            puntos={puntos}
            estanciaCerrada={estanciaCerrada}
            onGuardarFiscales={guardarFiscales}
            onPagar={pagarSaldo}
            onCheckOut={hacerCheckOut}
          />
        );
    }
  })();

  const badgeDe = (id: SeccionHuesped) => {
    if (id === 'servicios') return pedidosActivos.length;
    if (id === 'checkin') return checkin.estado === 'disponible' && !estanciaCerrada ? 1 : 0;
    if (id === 'cuenta') return cuenta.saldo > 0 && estanciaCerrada ? 1 : 0;
    return 0;
  };

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
            <p className="text-xs mt-1" style={{ color: '#AEBCC1', letterSpacing: '0.06em' }}>Portal del huésped</p>
          </div>

          <div className="flex-1 py-3 overflow-y-auto">
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = badgeDe(s.id);
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

          <ModuloSwitcher actual="huesped" onCambiar={onCambiarModulo} />

          <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: '#D8B94E', color: '#102747' }}>
                AM
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{huesped.nombre}</p>
                <p className="text-[10px] truncate" style={{ color: '#AEBCC1' }}>
                  {estanciaCerrada ? 'Estancia finalizada' : `Habitación ${habitacion.numero}`}
                </p>
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
              <ModuloSwitcher actual="huesped" onCambiar={onCambiarModulo} variant="inline" />
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">{contenido}</div>

          {/* Navegación inferior — móvil */}
          <div className="lg:hidden flex shrink-0 border-t overflow-x-auto" style={{ backgroundColor: '#102747', borderColor: '#1d3a5f' }}>
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = badgeDe(s.id);
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

      {/* Aviso flotante: confirma que la acción del huésped surtió efecto */}
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
    </div>
  );
}
