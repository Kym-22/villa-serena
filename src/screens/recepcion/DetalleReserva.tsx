import { useState } from 'react';
import type {
  Reserva,
  Huesped,
  HabitacionHotel,
  Acompanante,
  ServicioAdicional,
  MetodoPago,
  Pago,
} from '../../types';
import {
  formatoFecha,
  formatoFechaHora,
  nochesEntre,
  TIPOS_SERVICIO,
} from '../../data';
import {
  dinero,
  Chip,
  RESERVA_META,
  calcularCuenta,
  habitacionesDisponibles,
  habitacionTieneConflicto,
  Campo,
  INPUT_CLS,
  BedIcon,
  UserIcon,
  CalendarIcon,
  CloseIcon,
} from './recUtils';
import Comprobante from './Comprobante';

type Tab = 'resumen' | 'cuenta' | 'servicios' | 'huespedes' | 'cambios';

const MOTIVOS_CANCELACION = [
  'El huésped canceló',
  'No se presentó (no-show)',
  'Error de registro',
  'Cambio de fechas no disponible',
];

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

interface Props {
  reserva: Reserva;
  huesped: Huesped;
  habitaciones: HabitacionHotel[];
  reservas: Reserva[];
  onCerrar: () => void;
  onAsignarHabitacion: (reservaId: string, habitacionId: string) => void;
  onCheckIn: (reservaId: string) => void;
  onCheckOut: (reservaId: string) => void;
  onModificar: (
    reservaId: string,
    cambios: { fechaEntrada: string; fechaSalida: string; personas: number; habitacionId: string | null },
  ) => void;
  onCancelar: (reservaId: string, motivo: string) => void;
  onAgregarAcompanante: (reservaId: string, a: Acompanante) => void;
  onQuitarAcompanante: (reservaId: string, index: number) => void;
  onAgregarServicio: (reservaId: string, s: Omit<ServicioAdicional, 'id' | 'fecha'>) => void;
  onQuitarServicio: (reservaId: string, servicioId: string) => void;
  onRegistrarPago: (reservaId: string, datos: { monto: number; metodo: MetodoPago }) => Pago;
  onAplicarDescuento: (reservaId: string, monto: number) => void;
}

export default function DetalleReserva(props: Props) {
  const { reserva, huesped, habitaciones, reservas, onCerrar } = props;
  const [tab, setTab] = useState<Tab>('resumen');
  const [comprobante, setComprobante] = useState<Pago | null>(null);

  const habitacion = habitaciones.find(h => h.id === reserva.habitacionId) ?? null;
  const cuenta = calcularCuenta(reserva, habitacion);
  const meta = RESERVA_META[reserva.estado];
  const cerrada = reserva.estado === 'finalizada' || reserva.estado === 'cancelada';

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />

      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[93vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#E5E0D8] shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[24px] font-semibold text-[#18345C] leading-none">{reserva.codigo}</h2>
              <Chip cls={meta.chip}>{meta.label}</Chip>
            </div>
            <p className="text-[13px] text-[#AEBCC1] mt-1">
              {huesped.nombre} · {formatoFecha(reserva.fechaEntrada)} → {formatoFecha(reserva.fechaSalida)}
            </p>
          </div>
          <button onClick={onCerrar} className="text-[#AEBCC1] hover:text-[#1F2933] p-1 shrink-0">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 sm:px-4 pt-3 border-b border-[#E5E0D8] shrink-0 overflow-x-auto">
          {([
            ['resumen', 'Resumen'],
            ['cuenta', 'Cuenta y pagos'],
            ['servicios', 'Servicios'],
            ['huespedes', 'Huéspedes'],
            ['cambios', 'Cambios'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 text-[13px] font-semibold rounded-t-md whitespace-nowrap transition-colors ${
                tab === id
                  ? 'bg-[#18345C] text-white'
                  : 'text-[#6B7280] hover:bg-[#F8F6F0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1">
          {tab === 'resumen' && <TabResumen {...props} habitacion={habitacion} />}
          {tab === 'cuenta' && (
            <TabCuenta
              {...props}
              habitacion={habitacion}
              onVerComprobante={setComprobante}
              onPagoRegistrado={setComprobante}
            />
          )}
          {tab === 'servicios' && <TabServicios {...props} />}
          {tab === 'huespedes' && <TabHuespedes {...props} />}
          {tab === 'cambios' && <TabCambios {...props} />}
        </div>

        {cerrada && (
          <div className="px-5 sm:px-6 py-2.5 bg-[#F8F6F0] border-t border-[#E5E0D8] text-[12px] text-[#6B7280] shrink-0">
            {reserva.estado === 'cancelada'
              ? `Reserva cancelada: ${reserva.motivoCancelacion ?? '—'}`
              : `Estancia finalizada · check-out ${formatoFechaHora(reserva.checkOutEn ?? '')}`}
          </div>
        )}
      </div>

      {comprobante && (
        <Comprobante
          pago={comprobante}
          reserva={reserva}
          huesped={huesped}
          habitacion={habitacion}
          onCerrar={() => setComprobante(null)}
        />
      )}
    </div>
  );
}

/* ========================================================= */
/* RESUMEN — HU-4, 5, 6, 8                                    */
/* ========================================================= */

function TabResumen({
  reserva,
  huesped,
  habitacion,
  habitaciones,
  reservas,
  onAsignarHabitacion,
  onCheckIn,
  onCheckOut,
  onCancelar,
}: Props & { habitacion: HabitacionHotel | null }) {
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [errMotivo, setErrMotivo] = useState(false);

  const cerrada = reserva.estado === 'finalizada' || reserva.estado === 'cancelada';
  const disponiblesParaAsignar = habitacionesDisponibles(
    reserva.fechaEntrada,
    reserva.fechaSalida,
    habitaciones,
    reservas,
    { personas: reserva.personas, ignorarReservaId: reserva.id },
  );

  const puedeCheckIn =
    (reserva.estado === 'confirmada' || reserva.estado === 'pendiente') && !!reserva.habitacionId;
  const puedeCheckOut = reserva.estado === 'en-curso';

  function confirmarCancelacion() {
    if (!motivo.trim()) {
      setErrMotivo(true);
      return;
    }
    onCancelar(reserva.id, motivo.trim());
  }

  return (
    <div className="space-y-5">
      {/* Datos del huésped */}
      <Seccion titulo="Huésped titular">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px]">
          <Dato k="Nombre" v={huesped.nombre} />
          <Dato k="Documento" v={`${huesped.tipoDocumento} ${huesped.documento}`} />
          <Dato k="Teléfono" v={huesped.telefono} />
          <Dato k="Correo" v={huesped.correo} />
          <Dato k="Nacionalidad" v={huesped.nacionalidad} />
        </div>
      </Seccion>

      {/* Datos de la reserva */}
      <Seccion titulo="Reserva">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-[13px]">
          <Dato k="Entrada" v={formatoFecha(reserva.fechaEntrada)} />
          <Dato k="Salida" v={formatoFecha(reserva.fechaSalida)} />
          <Dato k="Noches" v={String(nochesEntre(reserva.fechaEntrada, reserva.fechaSalida))} />
          <Dato k="Personas" v={String(reserva.personas)} />
          <Dato k="Tipo solicitado" v={reserva.tipoHabitacion} />
          <Dato k="Creada" v={formatoFecha(reserva.creadoEn)} />
          {reserva.checkInEn && <Dato k="Check-in" v={formatoFechaHora(reserva.checkInEn)} />}
          {reserva.checkOutEn && <Dato k="Check-out" v={formatoFechaHora(reserva.checkOutEn)} />}
        </div>
      </Seccion>

      {/* Habitación asignada / asignación (HU-4) */}
      <Seccion titulo="Habitación asignada">
        {habitacion ? (
          <div className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-3">
            <span className="w-9 h-9 rounded-lg bg-white border border-[#E5E0D8] flex items-center justify-center text-[#18345C]">
              <BedIcon size={17} />
            </span>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-[#18345C] leading-none">Habitación {habitacion.numero}</p>
              <p className="text-[12px] text-[#AEBCC1] mt-0.5">
                {habitacion.tipo} · Piso {habitacion.piso} · hasta {habitacion.capacidad} personas · {dinero(habitacion.precioNoche)}/noche
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[#9A3412] bg-[#FFF7ED] border border-[#FDBA74] rounded-lg px-3 py-2">
            Sin habitación asignada. Asigna una para poder hacer el check-in.
          </p>
        )}

        {!cerrada && (
          <div className="mt-3">
            <Campo label={habitacion ? 'Cambiar habitación' : 'Asignar habitación (solo disponibles)'}>
              <select
                value={reserva.habitacionId ?? ''}
                onChange={e => e.target.value && onAsignarHabitacion(reserva.id, e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Seleccionar habitación…</option>
                {disponiblesParaAsignar.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.numero} · {h.tipo} · {h.capacidad} pers. · {dinero(h.precioNoche)}/noche
                  </option>
                ))}
              </select>
            </Campo>
            {disponiblesParaAsignar.length === 0 && (
              <p className="text-[12px] text-[#991B1B] mt-1">
                No hay habitaciones libres para estas fechas y capacidad.
              </p>
            )}
          </div>
        )}
      </Seccion>

      {/* Acciones */}
      {!cerrada && !cancelando && (
        <div className="flex flex-col sm:flex-row gap-3">
          {puedeCheckIn && (
            <button
              onClick={() => onCheckIn(reserva.id)}
              className="flex-1 py-3 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
            >
              Realizar check-in
            </button>
          )}
          {puedeCheckOut && (
            <button
              onClick={() => onCheckOut(reserva.id)}
              className="flex-1 py-3 text-[15px] font-semibold bg-[#166534] text-white rounded-md hover:bg-[#14532D] transition-colors"
            >
              Realizar check-out
            </button>
          )}
          <button
            onClick={() => setCancelando(true)}
            className="flex-1 sm:flex-none sm:px-5 py-3 text-[15px] font-semibold border border-[#FCA5A5] text-[#991B1B] rounded-md hover:bg-[#FEF2F2] transition-colors"
          >
            Cancelar reserva
          </button>
        </div>
      )}

      {!cerrada && !cancelando && !reserva.habitacionId && (reserva.estado === 'confirmada' || reserva.estado === 'pendiente') && (
        <p className="text-[12px] text-[#9A3412]">Asigna una habitación para habilitar el check-in.</p>
      )}

      {/* Cancelación (HU-8) */}
      {cancelando && (
        <div className="border border-[#FCA5A5] bg-[#FEF2F2] rounded-xl px-4 py-4 space-y-3">
          <p className="text-[15px] font-semibold text-[#991B1B]">Cancelar {reserva.codigo}</p>
          <p className="text-[13px] text-[#7F1D1D]">
            Selecciona un motivo. La habitación quedará liberada y la reserva no podrá reactivarse.
          </p>
          <div className="flex flex-wrap gap-2">
            {MOTIVOS_CANCELACION.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMotivo(m); setErrMotivo(false); }}
                className={`text-[12px] font-medium px-2.5 py-1 rounded-md border transition-colors ${
                  motivo === m
                    ? 'bg-[#991B1B] text-white border-[#991B1B]'
                    : 'bg-white text-[#7F1D1D] border-[#FCA5A5] hover:bg-[#FEE2E2]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setErrMotivo(false); }}
            placeholder="Detalle del motivo…"
            className="w-full border border-[#FCA5A5] rounded-md px-3 py-2.5 text-sm text-[#1F2933] resize-none focus:outline-none focus:border-[#991B1B] bg-white"
          />
          {errMotivo && <p className="text-xs text-[#991B1B]">El motivo es obligatorio.</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setCancelando(false); setMotivo(''); setErrMotivo(false); }}
              className="flex-1 py-2.5 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md bg-white hover:bg-[#F8F6F0] transition-colors"
            >
              Volver
            </button>
            <button
              onClick={confirmarCancelacion}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#991B1B] text-white rounded-md hover:bg-[#7F1D1D] transition-colors"
            >
              Confirmar cancelación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/* CUENTA Y PAGOS — HU-9, 11, 12                              */
/* ========================================================= */

function TabCuenta({
  reserva,
  habitacion,
  onRegistrarPago,
  onAplicarDescuento,
  onVerComprobante,
  onPagoRegistrado,
}: Props & {
  habitacion: HabitacionHotel | null;
  onVerComprobante: (p: Pago) => void;
  onPagoRegistrado: (p: Pago) => void;
}) {
  const cuenta = calcularCuenta(reserva, habitacion);
  const cerrada = reserva.estado === 'cancelada';

  const [pagando, setPagando] = useState(false);
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [errPago, setErrPago] = useState('');

  const [descOpen, setDescOpen] = useState(false);
  const [descMonto, setDescMonto] = useState(String(reserva.descuento || ''));

  function registrar() {
    const n = Number(monto);
    if (!n || n <= 0) {
      setErrPago('Ingresa un monto válido.');
      return;
    }
    const pago = onRegistrarPago(reserva.id, { monto: Math.round(n * 100) / 100, metodo });
    setPagando(false);
    setMonto('');
    setMetodo('efectivo');
    setErrPago('');
    onPagoRegistrado(pago);
  }

  return (
    <div className="space-y-5">
      {/* Desglose (HU-11) */}
      <div className="border border-[#E5E0D8] rounded-xl overflow-hidden">
        <FilaCuenta k={`Alojamiento · ${cuenta.noches} noche${cuenta.noches !== 1 ? 's' : ''} × ${dinero(cuenta.precioNoche)}`} v={dinero(cuenta.alojamiento)} />
        {reserva.servicios.map(s => (
          <FilaCuenta key={s.id} k={`${s.tipo} · ${s.descripcion} (${s.cantidad} × ${dinero(s.precioUnitario)})`} v={dinero(s.cantidad * s.precioUnitario)} sub />
        ))}
        <FilaCuenta k="Subtotal" v={dinero(cuenta.subtotal)} />
        <FilaCuenta k="Descuento" v={cuenta.descuento > 0 ? `- ${dinero(cuenta.descuento)}` : dinero(0)} />
        <FilaCuenta k="Total de la cuenta" v={dinero(cuenta.total)} fuerte />
        <FilaCuenta k="Pagado" v={dinero(cuenta.pagado)} />
        <div className="flex items-center justify-between px-4 py-3 bg-[#18345C]">
          <span className="text-[13px] font-semibold text-white uppercase tracking-wide">Saldo pendiente</span>
          <span className="text-[20px] font-bold text-white">{dinero(Math.max(0, cuenta.saldo))}</span>
        </div>
      </div>

      {!cerrada && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setPagando(v => !v); setMonto(cuenta.saldo > 0 ? String(cuenta.saldo) : ''); }}
            className="px-4 py-2.5 text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Registrar pago
          </button>
          <button
            onClick={() => setDescOpen(v => !v)}
            className="px-4 py-2.5 text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
          >
            Aplicar descuento
          </button>
        </div>
      )}

      {descOpen && !cerrada && (
        <div className="border border-[#E5E0D8] rounded-xl p-4 flex items-end gap-3">
          <div className="flex-1">
            <Campo label="Monto de descuento">
              <input
                type="number"
                min="0"
                value={descMonto}
                onChange={e => setDescMonto(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>
          </div>
          <button
            onClick={() => { onAplicarDescuento(reserva.id, Math.max(0, Number(descMonto) || 0)); setDescOpen(false); }}
            className="px-4 py-2.5 text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Guardar
          </button>
        </div>
      )}

      {/* Registrar pago (HU-9) */}
      {pagando && !cerrada && (
        <div className="border border-[#E5E0D8] rounded-xl p-4 space-y-3">
          <p className="text-[14px] font-semibold text-[#18345C]">Registrar pago</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Monto" error={errPago}>
              <input
                type="number"
                min="0"
                value={monto}
                onChange={e => { setMonto(e.target.value); setErrPago(''); }}
                className={INPUT_CLS}
              />
            </Campo>
            <Campo label="Método de pago">
              <select value={metodo} onChange={e => setMetodo(e.target.value as MetodoPago)} className={INPUT_CLS}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </Campo>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setPagando(false); setErrPago(''); }}
              className="flex-1 py-2.5 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={registrar}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
            >
              Registrar y generar comprobante
            </button>
          </div>
        </div>
      )}

      {/* Pagos realizados */}
      <div>
        <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">Pagos registrados</p>
        {reserva.pagos.length === 0 ? (
          <p className="text-[13px] text-[#AEBCC1]">Aún no hay pagos.</p>
        ) : (
          <div className="border border-[#E5E0D8] rounded-xl divide-y divide-[#F0EBE3]">
            {reserva.pagos.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#1F2933]">
                    {dinero(p.monto)} · {METODO_LABEL[p.metodo]}
                  </p>
                  <p className="text-[12px] text-[#AEBCC1]">
                    {formatoFechaHora(p.fecha)} · {p.comprobante}
                  </p>
                </div>
                <button
                  onClick={() => onVerComprobante(p)}
                  className="text-[13px] font-semibold text-[#18345C] hover:underline shrink-0"
                >
                  Ver comprobante
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================= */
/* SERVICIOS — HU-10                                          */
/* ========================================================= */

function TabServicios({ reserva, onAgregarServicio, onQuitarServicio }: Props) {
  const cerrada = reserva.estado === 'finalizada' || reserva.estado === 'cancelada';
  const [tipo, setTipo] = useState(TIPOS_SERVICIO[0]);
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [precio, setPrecio] = useState('');
  const [err, setErr] = useState('');

  function agregar() {
    const c = Number(cantidad);
    const pu = Number(precio);
    if (!descripcion.trim()) return setErr('Describe el servicio.');
    if (!c || c <= 0) return setErr('Cantidad inválida.');
    if (!pu || pu <= 0) return setErr('Precio inválido.');
    onAgregarServicio(reserva.id, {
      tipo,
      descripcion: descripcion.trim(),
      cantidad: c,
      precioUnitario: Math.round(pu * 100) / 100,
    });
    setDescripcion('');
    setCantidad('1');
    setPrecio('');
    setErr('');
  }

  return (
    <div className="space-y-5">
      {reserva.servicios.length === 0 ? (
        <p className="text-[13px] text-[#AEBCC1]">No hay servicios adicionales cargados.</p>
      ) : (
        <div className="border border-[#E5E0D8] rounded-xl divide-y divide-[#F0EBE3]">
          {reserva.servicios.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#1F2933]">
                  {s.tipo} · {s.descripcion}
                </p>
                <p className="text-[12px] text-[#AEBCC1]">
                  {s.cantidad} × {dinero(s.precioUnitario)} = {dinero(s.cantidad * s.precioUnitario)} · {formatoFecha(s.fecha)}
                </p>
              </div>
              {!cerrada && (
                <button
                  onClick={() => onQuitarServicio(reserva.id, s.id)}
                  className="text-[13px] font-semibold text-[#991B1B] hover:underline shrink-0"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!cerrada && (
        <div className="border border-[#E5E0D8] rounded-xl p-4 space-y-3">
          <p className="text-[14px] font-semibold text-[#18345C]">Agregar servicio</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Tipo">
              <select value={tipo} onChange={e => setTipo(e.target.value)} className={INPUT_CLS}>
                {TIPOS_SERVICIO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Descripción">
              <input
                type="text"
                value={descripcion}
                onChange={e => { setDescripcion(e.target.value); setErr(''); }}
                placeholder="Ej. Cena para 2, lavado exprés…"
                className={INPUT_CLS}
              />
            </Campo>
            <Campo label="Cantidad">
              <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} className={INPUT_CLS} />
            </Campo>
            <Campo label="Precio unitario">
              <input type="number" min="0" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0.00" className={INPUT_CLS} />
            </Campo>
          </div>
          {err && <p className="text-xs text-[#991B1B]">{err}</p>}
          <button
            onClick={agregar}
            className="w-full py-2.5 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Agregar a la cuenta
          </button>
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/* HUÉSPEDES ADICIONALES — HU-18                              */
/* ========================================================= */

function TabHuespedes({ reserva, huesped, onAgregarAcompanante, onQuitarAcompanante }: Props) {
  const cerrada = reserva.estado === 'finalizada' || reserva.estado === 'cancelada';
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [err, setErr] = useState('');

  const totalPersonas = reserva.acompanantes.length + 1;

  function agregar() {
    if (!nombre.trim()) return setErr('Nombre obligatorio.');
    onAgregarAcompanante(reserva.id, { nombre: nombre.trim(), documento: documento.trim() });
    setNombre('');
    setDocumento('');
    setErr('');
  }

  return (
    <div className="space-y-5">
      <div className="border border-[#E5E0D8] rounded-xl divide-y divide-[#F0EBE3]">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
            <UserIcon size={15} />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[#1F2933]">{huesped.nombre}</p>
            <p className="text-[12px] text-[#AEBCC1]">Titular · {huesped.tipoDocumento} {huesped.documento}</p>
          </div>
        </div>
        {reserva.acompanantes.map((a, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <span className="w-8 h-8 rounded-lg bg-[#F8F6F0] text-[#6B7280] flex items-center justify-center shrink-0">
              <UserIcon size={15} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#1F2933]">{a.nombre}</p>
              <p className="text-[12px] text-[#AEBCC1]">{a.documento || 'Sin documento'}</p>
            </div>
            {!cerrada && (
              <button
                onClick={() => onQuitarAcompanante(reserva.id, i)}
                className="text-[13px] font-semibold text-[#991B1B] hover:underline shrink-0"
              >
                Quitar
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-[12px] text-[#6B7280]">
        {totalPersonas} de {reserva.personas} personas registradas para esta habitación.
      </p>

      {!cerrada && (
        <div className="border border-[#E5E0D8] rounded-xl p-4 space-y-3">
          <p className="text-[14px] font-semibold text-[#18345C]">Registrar huésped adicional</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Nombre completo">
              <input type="text" value={nombre} onChange={e => { setNombre(e.target.value); setErr(''); }} className={INPUT_CLS} />
            </Campo>
            <Campo label="Documento (opcional)">
              <input type="text" value={documento} onChange={e => setDocumento(e.target.value)} className={INPUT_CLS} />
            </Campo>
          </div>
          {err && <p className="text-xs text-[#991B1B]">{err}</p>}
          <button
            onClick={agregar}
            className="w-full py-2.5 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Agregar a la reserva
          </button>
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/* CAMBIOS — HU-7                                             */
/* ========================================================= */

function TabCambios({ reserva, habitaciones, reservas, onModificar }: Props) {
  const cerrada = reserva.estado === 'finalizada' || reserva.estado === 'cancelada';
  const [entrada, setEntrada] = useState(reserva.fechaEntrada);
  const [salida, setSalida] = useState(reserva.fechaSalida);
  const [personas, setPersonas] = useState(String(reserva.personas));
  const [habId, setHabId] = useState<string>(reserva.habitacionId ?? '');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  const nPersonas = Math.max(1, Number(personas) || 1);
  const rangoValido = entrada < salida;

  const disponibles = rangoValido
    ? habitacionesDisponibles(entrada, salida, habitaciones, reservas, {
        personas: nPersonas,
        ignorarReservaId: reserva.id,
      })
    : [];

  const habActualEnConflicto =
    !!habId &&
    rangoValido &&
    habitacionTieneConflicto(habId, entrada, salida, reservas, reserva.id);

  function guardar() {
    setOk(false);
    if (!rangoValido) return setErr('La fecha de salida debe ser posterior a la de entrada.');
    if (habId && habActualEnConflicto) {
      return setErr('La habitación elegida ya tiene una reserva en esas fechas. Elige otra.');
    }
    onModificar(reserva.id, {
      fechaEntrada: entrada,
      fechaSalida: salida,
      personas: nPersonas,
      habitacionId: habId || null,
    });
    setErr('');
    setOk(true);
  }

  if (cerrada) {
    return <p className="text-[13px] text-[#AEBCC1]">Esta reserva está cerrada y no puede modificarse.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[#6B7280]">
        Al guardar, el sistema verifica de nuevo la disponibilidad para las fechas y la habitación elegidas.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Campo label="Fecha de entrada">
          <input type="date" value={entrada} onChange={e => { setEntrada(e.target.value); setOk(false); }} className={INPUT_CLS} />
        </Campo>
        <Campo label="Fecha de salida">
          <input type="date" value={salida} min={entrada} onChange={e => { setSalida(e.target.value); setOk(false); }} className={INPUT_CLS} />
        </Campo>
        <Campo label="Personas">
          <input type="number" min="1" value={personas} onChange={e => { setPersonas(e.target.value); setOk(false); }} className={INPUT_CLS} />
        </Campo>
        <Campo label="Habitación">
          <select value={habId} onChange={e => { setHabId(e.target.value); setOk(false); }} className={INPUT_CLS}>
            <option value="">Sin asignar</option>
            {/* La habitación actual sigue disponible como opción */}
            {reserva.habitacionId && !disponibles.some(h => h.id === reserva.habitacionId) && (
              <option value={reserva.habitacionId}>
                {habitaciones.find(h => h.id === reserva.habitacionId)?.numero} (actual)
              </option>
            )}
            {disponibles.map(h => (
              <option key={h.id} value={h.id}>
                {h.numero} · {h.tipo} · {h.capacidad} pers. · {dinero(h.precioNoche)}/noche
              </option>
            ))}
          </select>
        </Campo>
      </div>

      {habActualEnConflicto && (
        <p className="text-[12px] text-[#991B1B]">
          La habitación actual no está libre para el nuevo rango de fechas.
        </p>
      )}
      {err && <p className="text-[13px] text-[#991B1B]">{err}</p>}
      {ok && <p className="text-[13px] text-[#166534]">Cambios guardados y disponibilidad verificada.</p>}

      <button
        onClick={guardar}
        className="w-full py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
      >
        Guardar cambios
      </button>
    </div>
  );
}

/* ========================================================= */
/* AUXILIARES                                                 */
/* ========================================================= */

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">{titulo}</p>
      {children}
    </div>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#AEBCC1]">{k}</p>
      <p className="text-[13px] text-[#1F2933] font-medium">{v}</p>
    </div>
  );
}

function FilaCuenta({ k, v, sub, fuerte }: { k: string; v: string; sub?: boolean; fuerte?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 px-4 py-2.5 border-b border-[#F0EBE3] last:border-0 ${
        fuerte ? 'bg-[#F8F6F0]' : ''
      }`}
    >
      <span className={`${sub ? 'text-[12px] text-[#6B7280] pl-3' : 'text-[13px] text-[#1F2933]'} ${fuerte ? 'font-semibold' : ''}`}>
        {k}
      </span>
      <span className={`text-[13px] ${fuerte ? 'font-bold text-[#18345C]' : 'text-[#1F2933]'}`}>{v}</span>
    </div>
  );
}
