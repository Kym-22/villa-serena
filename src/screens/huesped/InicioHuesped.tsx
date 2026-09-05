import type {
  Huesped,
  Reserva,
  HabitacionHotel,
  EstadoHabHotel,
  CheckInWeb,
  PedidoHuesped,
  ReservaAmenidad,
  Domotica,
  SeccionHuesped,
} from '../../types';
import { formatoFecha, formatoHoraISO, WIFI_RED } from '../../data';
import type { ResumenCuentaHuesped } from './huespedUtils';
import {
  dinero,
  Chip,
  Tarjeta,
  Aviso,
  BotonPrimario,
  CodigoQR,
  ESTADO_PEDIDO_META,
  RESERVA_META,
  formatoPuntos,
  totalPedido,
  pedidoActivo,
  BedIcon,
  KeyIcon,
  ClockIcon,
  CartIcon,
  ThermoIcon,
  WifiIcon,
  StarIcon,
  CalendarIcon,
  CheckIcon,
  SparkIcon,
} from './huespedUtils';

interface Props {
  huesped: Huesped;
  reserva: Reserva;
  habitacion: HabitacionHotel;
  estadoHabitacion: EstadoHabHotel;
  checkin: CheckInWeb;
  pedidos: PedidoHuesped[];
  reservasAmenidad: ReservaAmenidad[];
  domotica: Domotica;
  cuenta: ResumenCuentaHuesped;
  puntos: number;
  llaveActiva: boolean;
  estanciaCerrada: boolean;
  onIr: (s: SeccionHuesped) => void;
}

export default function InicioHuesped({
  huesped,
  reserva,
  habitacion,
  estadoHabitacion,
  checkin,
  pedidos,
  reservasAmenidad,
  domotica,
  cuenta,
  puntos,
  llaveActiva,
  estanciaCerrada,
  onIr,
}: Props) {
  const activos = pedidos.filter(pedidoActivo);
  const rm = RESERVA_META[reserva.estado];
  const primerNombre = huesped.nombre.split(' ')[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <p className="text-[13px] text-[#AEBCC1] uppercase tracking-widest">Bienvenida a Villa Serena</p>
        <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight mt-1">Hola, {primerNombre}</h1>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <Chip cls={rm.chip}>{rm.label}</Chip>
          <span className="text-[14px] text-[#6B7280]">
            {estanciaCerrada
              ? 'Tu estancia finalizó. Gracias por hospedarte con nosotros.'
              : `Habitación ${habitacion.numero} · ${habitacion.tipo} · salida el ${formatoFecha(reserva.fechaSalida)}`}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {/* HU-02 · Recordatorio del check-in web */}
        {!estanciaCerrada && checkin.estado === 'disponible' && (
          <div className="bg-[#FFFBEF] border border-[#F3D98B] rounded-xl px-4 py-4">
            <p className="text-[15px] font-semibold text-[#78450A]">Completa tu check-in web</p>
            <p className="text-[14px] text-[#78450A] mt-1">
              Verifica tus datos, firma los términos de la estancia y recibe tu llave digital sin pasar por
              recepción. Toma menos de dos minutos.
            </p>
            <button
              onClick={() => onIr('checkin')}
              className="mt-3 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
            >
              Comenzar check-in
            </button>
          </div>
        )}

        {estanciaCerrada && (
          <Aviso tono="exito">
            Check-out completado. La habitación {habitacion.numero} quedó registrada como desocupada y
            pendiente de limpieza. Te enviamos la factura y el comprobante a {huesped.correo}.
          </Aviso>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Estancia */}
          <Tarjeta titulo="Tu estancia" extra={<span className="text-[13px] font-semibold text-[#18345C]">{reserva.codigo}</span>}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
                <BedIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[24px] font-semibold text-[#18345C] leading-none">Habitación {habitacion.numero}</p>
                <p className="text-[14px] text-[#6B7280] mt-1">
                  {habitacion.tipo} · {reserva.personas} {reserva.personas === 1 ? 'huésped' : 'huéspedes'} ·{' '}
                  {cuenta.noches} {cuenta.noches === 1 ? 'noche' : 'noches'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Dato icono={<CalendarIcon />} label="Entrada" valor={formatoFecha(reserva.fechaEntrada)} />
              <Dato icono={<CalendarIcon />} label="Salida" valor={formatoFecha(reserva.fechaSalida)} />
            </div>

            {checkin.peticiones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
                <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest mb-2">Peticiones registradas</p>
                <div className="flex flex-wrap gap-1.5">
                  {checkin.peticiones.map(p => (
                    <Chip key={p} cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">{p}</Chip>
                  ))}
                </div>
              </div>
            )}
          </Tarjeta>

          {/* Llave digital */}
          <Tarjeta titulo="Llave digital">
            {llaveActiva && checkin.codigoLlave ? (
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <CodigoQR texto={checkin.codigoLlave} tamano={140} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#166534] flex items-center gap-1.5">
                    <CheckIcon /> Llave activa
                  </p>
                  <p className="text-[14px] text-[#6B7280] mt-1">
                    Acerca el teléfono a la cerradura o muestra este código en el lector de la puerta.
                  </p>
                  <p className="text-[12px] text-[#AEBCC1] mt-2 break-all">{checkin.codigoLlave}</p>
                  <button
                    onClick={() => onIr('habitacion')}
                    className="mt-3 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
                  >
                    Abrir la puerta
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#F8F6F0] flex items-center justify-center mx-auto text-[#AEBCC1]">
                  <KeyIcon size={22} />
                </div>
                <p className="text-[15px] font-medium text-[#18345C] mt-3">
                  {estanciaCerrada ? 'Llave desactivada' : 'Tu llave todavía no está activa'}
                </p>
                <p className="text-[14px] text-[#AEBCC1] mt-1">
                  {estanciaCerrada
                    ? 'Se desactivó automáticamente al procesar el pago del check-out.'
                    : 'Se genera al terminar el check-in web.'}
                </p>
                {!estanciaCerrada && (
                  <div className="mt-4">
                    <BotonPrimario onClick={() => onIr('checkin')}>Ir al check-in</BotonPrimario>
                  </div>
                )}
              </div>
            )}
          </Tarjeta>

          {/* Cuenta */}
          <Tarjeta
            titulo="Tu cuenta"
            extra={
              <button
                onClick={() => onIr('cuenta')}
                className="text-[13px] font-semibold text-[#18345C] hover:underline"
              >
                Ver detalle
              </button>
            }
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Saldo pendiente</p>
                <p
                  className="text-[32px] font-bold leading-none mt-1"
                  style={{ color: cuenta.saldo > 0 ? '#9A3412' : '#166534' }}
                >
                  {dinero(cuenta.saldo)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Consumido</p>
                <p className="text-[20px] font-semibold text-[#18345C] leading-none mt-1">{dinero(cuenta.total)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Dato label="Alojamiento" valor={dinero(cuenta.alojamiento)} />
              <Dato label="Consumos" valor={dinero(cuenta.extras)} />
            </div>

            <div className="mt-4 pt-4 border-t border-[#E5E0D8] flex items-center gap-2">
              <span className="text-[#D8B94E]"><StarIcon size={15} /></span>
              <p className="text-[14px] text-[#6B7280] flex-1">
                Tienes <strong className="text-[#18345C]">{formatoPuntos(puntos)}</strong> puntos de fidelidad
              </p>
            </div>
          </Tarjeta>

          {/* Pedidos en curso */}
          <Tarjeta
            titulo="Pedidos en curso"
            extra={
              <button
                onClick={() => onIr('servicios')}
                className="text-[13px] font-semibold text-[#18345C] hover:underline"
              >
                Pedir algo
              </button>
            }
          >
            {activos.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#F8F6F0] flex items-center justify-center mx-auto text-[#AEBCC1]">
                  <CartIcon size={22} />
                </div>
                <p className="text-[14px] text-[#AEBCC1] mt-3">
                  No tienes pedidos en curso. Pide al restaurante o solicita un servicio cuando lo necesites.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activos.map(p => {
                  const em = ESTADO_PEDIDO_META[p.estado];
                  return (
                    <button
                      key={p.id}
                      onClick={() => onIr('servicios')}
                      className="w-full text-left bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-3 hover:border-[#18345C] transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-semibold text-[#18345C]">Pedido #{p.numero}</span>
                        <Chip cls={em.chip}>{em.label}</Chip>
                      </div>
                      <p className="text-[14px] text-[#6B7280] mt-1 truncate">
                        {p.lineas.map(l => `${l.cantidad}× ${l.nombre}`).join(', ')}
                      </p>
                      <p className="text-[12px] text-[#AEBCC1] mt-1 flex items-center gap-1">
                        <ClockIcon size={12} /> {formatoHoraISO(p.creadoEn)} · estimado {p.minutosEstimados} min
                        {totalPedido(p) > 0 && ` · ${dinero(totalPedido(p))}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </Tarjeta>

          {/* Confort */}
          <Tarjeta
            titulo="Tu habitación ahora"
            extra={
              <button
                onClick={() => onIr('habitacion')}
                className="text-[13px] font-semibold text-[#18345C] hover:underline"
              >
                Controlar
              </button>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Mini icono={<ThermoIcon size={15} />} valor={`${domotica.temperatura}°`} label={domotica.climaEncendido ? 'Clima activo' : 'Clima apagado'} />
              <Mini icono={<SparkIcon size={15} />} valor={`${domotica.luces.filter(l => l.encendida).length}/${domotica.luces.length}`} label="Luces encendidas" />
              <Mini icono={<BedIcon size={15} />} valor={`${domotica.cortinas}%`} label="Cortinas abiertas" />
              <Mini icono={<WifiIcon size={15} />} valor={domotica.wifiConectado ? 'Sí' : 'No'} label={WIFI_RED} />
            </div>

            {domotica.noMolestar && (
              <div className="mt-3">
                <Aviso tono="alerta">Tienes activo el aviso de “No molestar”. Limpieza no entrará a la habitación.</Aviso>
              </div>
            )}
            {estadoHabitacion === 'en-limpieza' && (
              <div className="mt-3">
                <Aviso tono="info">La habitación está en proceso de limpieza.</Aviso>
              </div>
            )}
          </Tarjeta>

          {/* Amenidades */}
          <Tarjeta
            titulo="Tus turnos reservados"
            extra={
              <button
                onClick={() => onIr('habitacion')}
                className="text-[13px] font-semibold text-[#18345C] hover:underline"
              >
                Reservar turno
              </button>
            }
          >
            {reservasAmenidad.length === 0 ? (
              <p className="text-[14px] text-[#AEBCC1] py-4 text-center">
                No tienes turnos reservados. El spa, el gimnasio y las canchas tienen aforo limitado.
              </p>
            ) : (
              <div className="space-y-2">
                {reservasAmenidad.map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
                    <span className="text-[#18345C]"><ClockIcon size={14} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#18345C] truncate">{r.area}</p>
                      <p className="text-[12px] text-[#AEBCC1]">{formatoFecha(r.fecha)} · {r.hora}</p>
                    </div>
                    <span className="text-[13px] text-[#6B7280] shrink-0">
                      {r.personas} {r.personas === 1 ? 'persona' : 'personas'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Tarjeta>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AccesoRapido label="Pedir al restaurante" onClick={() => onIr('servicios')} icono={<CartIcon size={18} />} />
          <AccesoRapido label="Chat con recepción" onClick={() => onIr('servicios')} icono={<ClockIcon size={18} />} />
          <AccesoRapido label="Abrir la puerta" onClick={() => onIr('habitacion')} icono={<KeyIcon size={18} />} />
          <AccesoRapido label="Pagar y hacer check-out" onClick={() => onIr('cuenta')} icono={<StarIcon size={18} />} />
        </div>
      </div>
    </div>
  );
}

function Dato({ icono, label, valor }: { icono?: React.ReactNode; label: string; valor: string }) {
  return (
    <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
      <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest flex items-center gap-1">
        {icono}
        {label}
      </p>
      <p className="text-[15px] font-semibold text-[#18345C] mt-1">{valor}</p>
    </div>
  );
}

function Mini({ icono, valor, label }: { icono: React.ReactNode; valor: string; label: string }) {
  return (
    <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
      <span className="text-[#18345C]">{icono}</span>
      <p className="text-[18px] font-bold text-[#18345C] leading-none mt-1.5">{valor}</p>
      <p className="text-[11px] text-[#6B7280] mt-1 truncate">{label}</p>
    </div>
  );
}

function AccesoRapido({ label, icono, onClick }: { label: string; icono: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-4 text-left hover:border-[#18345C] transition-colors min-h-[44px]"
    >
      <span className="text-[#D8B94E]">{icono}</span>
      <p className="text-[14px] font-medium text-[#18345C] mt-2 leading-tight">{label}</p>
    </button>
  );
}
