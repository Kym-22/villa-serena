import { useState } from 'react';
import type {
  Huesped,
  Reserva,
  HabitacionHotel,
  EstadoHabHotel,
  CargoHuesped,
  CategoriaCargo,
  DatosFiscales,
  PagoHuespedApp,
  MetodoPagoHuesped,
} from '../../types';
import { formatoFecha, formatoFechaHora } from '../../data';
import type { ResumenCuentaHuesped } from './huespedUtils';
import {
  dinero,
  Chip,
  Campo,
  INPUT_CLS,
  Cabecera,
  Tarjeta,
  Kpi,
  Aviso,
  Modal,
  BotonFiltro,
  BotonPrimario,
  BotonSecundario,
  CATEGORIAS_CARGO,
  METODO_PAGO_LABEL,
  puntosDeMonto,
  montoDePuntos,
  formatoPuntos,
  correoValido,
  formatoTarjeta,
  ultimos4,
  CardIcon,
  ReceiptIcon,
  StarIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  BedIcon,
} from './huespedUtils';

interface Props {
  huesped: Huesped;
  reserva: Reserva;
  habitacion: HabitacionHotel;
  estadoHabitacion: EstadoHabHotel;
  cargos: CargoHuesped[];
  cuenta: ResumenCuentaHuesped;
  pagos: PagoHuespedApp[];
  fiscales: DatosFiscales;
  facturaEmitida: string | null;
  puntos: number;
  estanciaCerrada: boolean;
  onGuardarFiscales: (datos: DatosFiscales) => void;
  onPagar: (metodo: MetodoPagoHuesped, extra: { ultimos4?: string }) => void;
  onCheckOut: () => void;
}

export default function CuentaHuesped({
  huesped,
  reserva,
  habitacion,
  estadoHabitacion,
  cargos,
  cuenta,
  pagos,
  fiscales,
  facturaEmitida,
  puntos,
  estanciaCerrada,
  onGuardarFiscales,
  onPagar,
  onCheckOut,
}: Props) {
  const [filtro, setFiltro] = useState<CategoriaCargo | 'todas'>('todas');
  const [pagando, setPagando] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [verComprobante, setVerComprobante] = useState(false);

  // Formulario de datos fiscales
  const [form, setForm] = useState<DatosFiscales>(
    fiscales.nombre ? fiscales : { ...fiscales, nombre: huesped.nombre, correo: huesped.correo },
  );
  const [erroresFiscales, setErroresFiscales] = useState<Record<string, string>>({});

  const visibles = cargos.filter(c => filtro === 'todas' || c.categoria === filtro);
  const categoriasUsadas = CATEGORIAS_CARGO.filter(c => cargos.some(x => x.categoria === c));

  function guardarFiscales() {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'Escribe el nombre o razón social.';
    if (!form.nit.trim()) e.nit = 'Escribe el NIT o marca “consumidor final”.';
    if (!form.direccion.trim()) e.direccion = 'Escribe la dirección fiscal.';
    if (!correoValido(form.correo)) e.correo = 'Necesitamos un correo válido para enviarte la factura.';
    setErroresFiscales(e);
    if (Object.keys(e).length > 0) return;
    onGuardarFiscales(form);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera
        titulo="Cuenta y check-out"
        subtitulo={`${reserva.codigo} · habitación ${habitacion.numero} · salida ${formatoFecha(reserva.fechaSalida)}`}
      >
        {facturaEmitida && (
          <button
            onClick={() => setVerComprobante(true)}
            className="px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors flex items-center gap-2"
          >
            <ReceiptIcon size={15} /> Ver factura
          </button>
        )}
      </Cabecera>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {/* Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi valor={dinero(cuenta.total)} label="Total de la estancia" />
          <Kpi valor={dinero(cuenta.pagado)} label="Pagado" color="#166534" />
          <Kpi
            valor={dinero(cuenta.saldo)}
            label="Saldo pendiente"
            color={cuenta.saldo > 0 ? '#9A3412' : '#166534'}
          />
          <Kpi valor={formatoPuntos(puntos)} label="Puntos de fidelidad" color="#78450A" />
        </div>

        {estanciaCerrada && (
          <Aviso tono="exito">
            <span className="flex items-start gap-2">
              <CheckIcon />
              <span>
                Check-out completado el {formatoFechaHora(reserva.checkOutEn ?? '')}. La habitación{' '}
                {habitacion.numero} pasó a “desocupada, pendiente de limpieza” y tu llave digital quedó
                desactivada.
              </span>
            </span>
          </Aviso>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ---------- Desglose de consumos ---------- */}
          <div className="lg:col-span-2 space-y-5">
            <Tarjeta titulo="Detalle de consumos">
              <div className="flex gap-2 flex-wrap mb-4">
                <BotonFiltro activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todo</BotonFiltro>
                {categoriasUsadas.map(c => (
                  <BotonFiltro key={c} activo={filtro === c} onClick={() => setFiltro(c)}>{c}</BotonFiltro>
                ))}
              </div>

              {/* El alojamiento es siempre la primera línea de la cuenta */}
              {(filtro === 'todas' || filtro === 'Estancia') && (
                <div className="flex items-start gap-3 py-3 border-b border-[#E5E0D8]">
                  <div className="w-9 h-9 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
                    <BedIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#18345C]">
                      Alojamiento · habitación {habitacion.numero}
                    </p>
                    <p className="text-[13px] text-[#AEBCC1]">
                      {cuenta.noches} {cuenta.noches === 1 ? 'noche' : 'noches'} × {dinero(cuenta.precioNoche)} ·{' '}
                      {formatoFecha(reserva.fechaEntrada)} → {formatoFecha(reserva.fechaSalida)}
                    </p>
                  </div>
                  <p className="text-[16px] font-semibold text-[#18345C] shrink-0">{dinero(cuenta.alojamiento)}</p>
                </div>
              )}

              {visibles.length === 0 && filtro !== 'todas' && filtro !== 'Estancia' ? (
                <p className="text-[14px] text-[#AEBCC1] py-4 text-center">
                  No hay consumos en esta categoría.
                </p>
              ) : (
                visibles.map(c => (
                  <div key={c.id} className="flex items-start gap-3 py-3 border-b border-[#E5E0D8] last:border-0">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
                      <ReceiptIcon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-[#18345C]">{c.concepto}</p>
                      <p className="text-[13px] text-[#AEBCC1] flex items-center gap-1.5 flex-wrap">
                        <Chip cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">{c.categoria}</Chip>
                        <span className="flex items-center gap-1">
                          <ClockIcon size={11} /> {formatoFechaHora(c.fecha)}
                        </span>
                        {c.cantidad > 1 && <span>· {c.cantidad} × {dinero(c.precioUnitario)}</span>}
                      </p>
                    </div>
                    <p className="text-[16px] font-semibold text-[#18345C] shrink-0">
                      {dinero(c.cantidad * c.precioUnitario)}
                    </p>
                  </div>
                ))
              )}

              {/* Totales */}
              <div className="mt-4 pt-4 border-t border-[#E5E0D8] space-y-1.5">
                <Linea label="Alojamiento" valor={dinero(cuenta.alojamiento)} />
                <Linea label="Consumos y servicios" valor={dinero(cuenta.extras)} />
                {cuenta.descuento > 0 && (
                  <Linea label="Descuento aplicado" valor={`− ${dinero(cuenta.descuento)}`} color="#166534" />
                )}
                <Linea label="Anticipo al reservar" valor={`− ${dinero(cuenta.anticipo)}`} color="#166534" />
                {cuenta.abonado > 0 && (
                  <Linea label="Pagos desde la app" valor={`− ${dinero(cuenta.abonado)}`} color="#166534" />
                )}
                <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-[#E5E0D8]">
                  <span className="text-[17px] font-semibold text-[#18345C]">Saldo pendiente</span>
                  <span
                    className="text-[26px] font-bold"
                    style={{ color: cuenta.saldo > 0 ? '#9A3412' : '#166534' }}
                  >
                    {dinero(cuenta.saldo)}
                  </span>
                </div>
              </div>
            </Tarjeta>

            {/* Datos fiscales */}
            <Tarjeta titulo="Datos para la factura electrónica">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Nombre o razón social" error={erroresFiscales.nombre}>
                  <input
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className={INPUT_CLS}
                  />
                </Campo>
                <Campo label="NIT" error={erroresFiscales.nit}>
                  <div className="flex gap-2">
                    <input
                      value={form.nit}
                      onChange={e => setForm({ ...form, nit: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="1234567-8"
                    />
                    <button
                      onClick={() => setForm({ ...form, nit: 'CF', direccion: form.direccion || 'Ciudad' })}
                      className="px-3 py-2.5 min-h-[44px] text-[13px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] shrink-0"
                    >
                      C/F
                    </button>
                  </div>
                </Campo>
                <Campo label="Dirección fiscal" error={erroresFiscales.direccion}>
                  <input
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                    className={INPUT_CLS}
                  />
                </Campo>
                <Campo label="Correo para la factura" error={erroresFiscales.correo}>
                  <input
                    value={form.correo}
                    onChange={e => setForm({ ...form, correo: e.target.value })}
                    className={INPUT_CLS}
                  />
                </Campo>
              </div>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <BotonSecundario onClick={guardarFiscales}>Guardar datos fiscales</BotonSecundario>
                {fiscales.nit && (
                  <span className="text-[13px] text-[#166534] flex items-center gap-1.5">
                    <CheckIcon size={13} /> Datos guardados
                  </span>
                )}
              </div>
            </Tarjeta>

            {/* Historial de pagos */}
            {(pagos.length > 0 || reserva.pagos.length > 0) && (
              <Tarjeta titulo="Pagos registrados">
                <div className="space-y-2">
                  {reserva.pagos.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
                      <span className="text-[#166534]"><CheckIcon size={15} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#18345C]">Anticipo de la reserva</p>
                        <p className="text-[12px] text-[#AEBCC1]">
                          {formatoFecha(p.fecha)} · {p.metodo} · {p.comprobante}
                        </p>
                      </div>
                      <p className="text-[15px] font-semibold text-[#18345C] shrink-0">{dinero(p.monto)}</p>
                    </div>
                  ))}

                  {pagos.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-[#F0FAF4] border border-[#86EFAC] rounded-lg px-3 py-2.5">
                      <span className="text-[#166534]"><CheckIcon size={15} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#166534]">
                          {METODO_PAGO_LABEL[p.metodo]}
                          {p.ultimos4 ? ` •••• ${p.ultimos4}` : ''}
                        </p>
                        <p className="text-[12px] text-[#166534]">
                          {formatoFechaHora(p.fecha)} · {p.comprobante}
                          {p.puntosUsados ? ` · ${formatoPuntos(p.puntosUsados)} puntos` : ''}
                        </p>
                      </div>
                      <p className="text-[15px] font-semibold text-[#166534] shrink-0">{dinero(p.monto)}</p>
                    </div>
                  ))}
                </div>
              </Tarjeta>
            )}
          </div>

          {/* ---------- Pago y check-out ---------- */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-0 space-y-5">
              <Tarjeta titulo="Pagar y salir">
                <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-3 text-center">
                  <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Saldo pendiente</p>
                  <p
                    className="text-[32px] font-bold leading-none mt-1"
                    style={{ color: cuenta.saldo > 0 ? '#9A3412' : '#166534' }}
                  >
                    {dinero(cuenta.saldo)}
                  </p>
                </div>

                {cuenta.saldo > 0 ? (
                  <div className="mt-4">
                    <BotonPrimario ancho onClick={() => setPagando(true)}>
                      Pagar {dinero(cuenta.saldo)}
                    </BotonPrimario>
                    <p className="text-[12px] text-[#AEBCC1] mt-2 text-center">
                      Pago seguro con tarjeta o puntos de fidelidad.
                    </p>
                  </div>
                ) : estanciaCerrada ? (
                  <div className="mt-4 text-center">
                    <p className="text-[15px] font-semibold text-[#166534] flex items-center justify-center gap-1.5">
                      <CheckIcon /> Estancia cerrada
                    </p>
                    <p className="text-[13px] text-[#6B7280] mt-1">
                      Gracias por hospedarte en Villa Serena.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Aviso tono="exito">Tu cuenta está en cero. Ya puedes hacer el check-out.</Aviso>
                    <div className="mt-3">
                      <BotonPrimario ancho onClick={() => setConfirmarSalida(true)}>
                        Hacer check-out
                      </BotonPrimario>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#E5E0D8] text-[13px] text-[#6B7280] space-y-1.5">
                  <p className="flex items-start gap-2">
                    <span className="text-[#D8B94E] shrink-0 mt-0.5"><StarIcon size={13} /></span>
                    Tienes {formatoPuntos(puntos)} puntos ({dinero(montoDePuntos(puntos))} en descuentos).
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#18345C] shrink-0 mt-0.5"><MailIcon size={13} /></span>
                    La factura y el comprobante llegan a {form.correo || huesped.correo}.
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#18345C] shrink-0 mt-0.5"><BedIcon size={13} /></span>
                    Estado actual de la habitación:{' '}
                    {estadoHabitacion === 'en-limpieza' ? 'desocupada, pendiente de limpieza' : 'ocupada'}.
                  </p>
                </div>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>

      {pagando && (
        <ModalPago
          saldo={cuenta.saldo}
          puntos={puntos}
          onCerrar={() => setPagando(false)}
          onPagar={(metodo, extra) => {
            onPagar(metodo, extra);
            setPagando(false);
          }}
        />
      )}

      {confirmarSalida && (
        <Modal titulo="Confirmar check-out" onCerrar={() => setConfirmarSalida(false)} ancho="sm:max-w-lg">
          <p className="text-[15px] text-[#1F2933]">
            Al confirmar cerramos tu estancia en la habitación {habitacion.numero}. Esto ocurre enseguida:
          </p>
          <ul className="mt-3 space-y-2 text-[14px] text-[#6B7280]">
            <li className="flex items-start gap-2"><span className="text-[#D8B94E]">•</span> Tu llave digital se desactiva de inmediato.</li>
            <li className="flex items-start gap-2"><span className="text-[#D8B94E]">•</span> La habitación pasa a “desocupada, pendiente de limpieza”.</li>
            <li className="flex items-start gap-2"><span className="text-[#D8B94E]">•</span> Enviamos la factura electrónica y el comprobante a tu correo.</li>
          </ul>

          <div className="flex gap-2 mt-5">
            <BotonSecundario onClick={() => setConfirmarSalida(false)} ancho>Volver</BotonSecundario>
            <BotonPrimario
              ancho
              onClick={() => {
                onCheckOut();
                setConfirmarSalida(false);
                setVerComprobante(true);
              }}
            >
              Confirmar check-out
            </BotonPrimario>
          </div>
        </Modal>
      )}

      {verComprobante && (
        <ModalComprobante
          huesped={huesped}
          reserva={reserva}
          habitacion={habitacion}
          cuenta={cuenta}
          cargos={cargos}
          pagos={pagos}
          fiscales={fiscales.nit ? fiscales : form}
          factura={facturaEmitida}
          onCerrar={() => setVerComprobante(false)}
        />
      )}
    </div>
  );
}

function Linea({ label, valor, color = '#6B7280' }: { label: string; valor: string; color?: string }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-[#6B7280]">{label}</span>
      <span style={{ color }}>{valor}</span>
    </div>
  );
}

/* =========================================================
   HU-05 · Pago del saldo
   ========================================================= */

function ModalPago({
  saldo,
  puntos,
  onCerrar,
  onPagar,
}: {
  saldo: number;
  puntos: number;
  onCerrar: () => void;
  onPagar: (metodo: MetodoPagoHuesped, extra: { ultimos4?: string }) => void;
}) {
  const [metodo, setMetodo] = useState<MetodoPagoHuesped>('tarjeta');
  const [tarjeta, setTarjeta] = useState('');
  const [titular, setTitular] = useState('');
  const [vence, setVence] = useState('');
  const [cvv, setCvv] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState(false);

  const puntosNecesarios = puntosDeMonto(saldo);
  const puntosSuficientes = puntos >= puntosNecesarios;

  function pagar() {
    if (metodo === 'puntos') {
      if (!puntosSuficientes) return;
      onPagar('puntos', {});
      return;
    }

    const e: Record<string, string> = {};
    if (tarjeta.replace(/\D/g, '').length < 15) e.tarjeta = 'Escribe los 16 dígitos de la tarjeta.';
    if (!titular.trim()) e.titular = 'Escribe el nombre del titular.';
    if (!/^\d{2}\/\d{2}$/.test(vence)) e.vence = 'Usa el formato MM/AA.';
    if (!/^\d{3,4}$/.test(cvv)) e.cvv = 'El código son 3 o 4 dígitos.';
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setProcesando(true);
    window.setTimeout(() => {
      onPagar(metodo, { ultimos4: ultimos4(tarjeta) });
      setProcesando(false);
    }, 900);
  }

  return (
    <Modal titulo="Pagar el saldo" subtitulo={`Importe a pagar: ${dinero(saldo)}`} onCerrar={onCerrar} ancho="sm:max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(['tarjeta', 'debito', 'puntos'] as MetodoPagoHuesped[]).map(m => (
            <button
              key={m}
              onClick={() => setMetodo(m)}
              className={`px-3 py-3 min-h-[44px] text-[13px] font-semibold rounded-md border transition-colors ${
                metodo === m
                  ? 'bg-[#18345C] text-white border-[#18345C]'
                  : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
              }`}
            >
              {m === 'tarjeta' ? 'Crédito' : m === 'debito' ? 'Débito' : 'Puntos'}
            </button>
          ))}
        </div>

        {metodo === 'puntos' ? (
          <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-4">
            <p className="text-[15px] font-semibold text-[#18345C] flex items-center gap-2">
              <StarIcon size={16} /> Pago con puntos de fidelidad
            </p>
            <div className="mt-3 space-y-1.5 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Puntos disponibles</span>
                <span className="text-[#18345C] font-medium">{formatoPuntos(puntos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Puntos necesarios</span>
                <span className="text-[#18345C] font-medium">{formatoPuntos(puntosNecesarios)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E0D8] pt-1.5">
                <span className="text-[#6B7280]">Te quedarían</span>
                <span
                  className="font-semibold"
                  style={{ color: puntosSuficientes ? '#166534' : '#991B1B' }}
                >
                  {formatoPuntos(Math.max(0, puntos - puntosNecesarios))}
                </span>
              </div>
            </div>

            {!puntosSuficientes && (
              <div className="mt-3">
                <Aviso tono="error">
                  No tienes puntos suficientes para cubrir el saldo. Elige crédito o débito.
                </Aviso>
              </div>
            )}
          </div>
        ) : (
          <>
            <Campo label="Número de tarjeta" error={errores.tarjeta}>
              <input
                value={tarjeta}
                onChange={e => setTarjeta(formatoTarjeta(e.target.value))}
                className={INPUT_CLS}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
              />
            </Campo>
            <Campo label="Titular" error={errores.titular}>
              <input value={titular} onChange={e => setTitular(e.target.value)} className={INPUT_CLS} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Vencimiento" error={errores.vence}>
                <input
                  value={vence}
                  onChange={e => {
                    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setVence(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                  }}
                  className={INPUT_CLS}
                  placeholder="MM/AA"
                  inputMode="numeric"
                />
              </Campo>
              <Campo label="CVV" error={errores.cvv}>
                <input
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={INPUT_CLS}
                  inputMode="numeric"
                />
              </Campo>
            </div>

            <Aviso tono="info">
              <span className="flex items-start gap-2">
                <CardIcon />
                <span>Los datos viajan cifrados a la pasarela de pago; el hotel no los almacena.</span>
              </span>
            </Aviso>
          </>
        )}

        <div className="flex gap-2 pt-1">
          <BotonSecundario onClick={onCerrar} ancho>Cancelar</BotonSecundario>
          <BotonPrimario
            ancho
            disabled={procesando || (metodo === 'puntos' && !puntosSuficientes)}
            onClick={pagar}
          >
            {procesando ? 'Procesando…' : `Pagar ${dinero(saldo)}`}
          </BotonPrimario>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   HU-05 · Comprobante y factura electrónica
   ========================================================= */

function ModalComprobante({
  huesped,
  reserva,
  habitacion,
  cuenta,
  cargos,
  pagos,
  fiscales,
  factura,
  onCerrar,
}: {
  huesped: Huesped;
  reserva: Reserva;
  habitacion: HabitacionHotel;
  cuenta: ResumenCuentaHuesped;
  cargos: CargoHuesped[];
  pagos: PagoHuespedApp[];
  fiscales: DatosFiscales;
  factura: string | null;
  onCerrar: () => void;
}) {
  const ultimoPago = pagos[pagos.length - 1];

  return (
    <Modal
      titulo="Factura electrónica"
      subtitulo={factura ? `Documento ${factura}` : 'Resumen de tu estancia'}
      onCerrar={onCerrar}
    >
      <div className="space-y-4">
        <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[18px] font-semibold text-[#18345C]">Villa Serena</p>
              <p className="text-[13px] text-[#6B7280]">Hotel y centro de descanso</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-[#AEBCC1]">{reserva.codigo}</p>
              <p className="text-[13px] text-[#AEBCC1]">Habitación {habitacion.numero}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E5E0D8] text-[13px] text-[#6B7280] space-y-0.5">
            <p><strong className="text-[#18345C]">Cliente:</strong> {fiscales.nombre || huesped.nombre}</p>
            <p><strong className="text-[#18345C]">NIT:</strong> {fiscales.nit || 'C/F'}</p>
            {fiscales.direccion && <p><strong className="text-[#18345C]">Dirección:</strong> {fiscales.direccion}</p>}
            <p><strong className="text-[#18345C]">Correo:</strong> {fiscales.correo || huesped.correo}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#6B7280]">
              Alojamiento — {cuenta.noches} {cuenta.noches === 1 ? 'noche' : 'noches'} × {dinero(cuenta.precioNoche)}
            </span>
            <span className="text-[#18345C]">{dinero(cuenta.alojamiento)}</span>
          </div>

          {cargos.map(c => (
            <div key={c.id} className="flex justify-between text-[14px]">
              <span className="text-[#6B7280]">
                {c.concepto}
                {c.cantidad > 1 && ` (${c.cantidad})`}
              </span>
              <span className="text-[#18345C]">{dinero(c.cantidad * c.precioUnitario)}</span>
            </div>
          ))}

          {cuenta.descuento > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#6B7280]">Descuento</span>
              <span className="text-[#166534]">− {dinero(cuenta.descuento)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline border-t border-[#E5E0D8] pt-2 mt-2">
            <span className="text-[16px] font-semibold text-[#18345C]">Total</span>
            <span className="text-[24px] font-bold text-[#18345C]">{dinero(cuenta.total)}</span>
          </div>

          <div className="flex justify-between text-[14px]">
            <span className="text-[#6B7280]">Pagado</span>
            <span className="text-[#166534]">{dinero(cuenta.pagado)}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#6B7280]">Saldo</span>
            <span style={{ color: cuenta.saldo > 0 ? '#991B1B' : '#166534' }}>{dinero(cuenta.saldo)}</span>
          </div>
        </div>

        {ultimoPago && (
          <div className="bg-[#F0FAF4] border border-[#86EFAC] rounded-lg px-4 py-3 text-[13px] text-[#166534]">
            <p className="font-semibold flex items-center gap-1.5"><CheckIcon size={13} /> Pago aprobado</p>
            <p className="mt-1">
              {METODO_PAGO_LABEL[ultimoPago.metodo]}
              {ultimoPago.ultimos4 ? ` terminada en ${ultimoPago.ultimos4}` : ''} ·{' '}
              {formatoFechaHora(ultimoPago.fecha)} · {ultimoPago.comprobante}
            </p>
          </div>
        )}

        <Aviso tono="info">
          <span className="flex items-start gap-2">
            <MailIcon />
            <span>
              Enviamos este documento a {fiscales.correo || huesped.correo}. Consérvalo como comprobante de tu
              estancia.
            </span>
          </span>
        </Aviso>

        <BotonSecundario onClick={onCerrar} ancho>Cerrar</BotonSecundario>
      </div>
    </Modal>
  );
}
