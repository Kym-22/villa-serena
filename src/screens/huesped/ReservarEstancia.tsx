import { useMemo, useState } from 'react';
import type {
  OfertaHabitacion,
  HabitacionHotel,
  Reserva,
  Huesped,
  ReservaHuesped,
  TipoHabitacion,
  DatosContacto,
} from '../../types';
import { fechaHoyISO, fechaRelativaISO, formatoFecha, nochesEntre } from '../../data';
import {
  dinero,
  Chip,
  Campo,
  INPUT_CLS,
  Cabecera,
  Tarjeta,
  Aviso,
  BotonPrimario,
  BotonSecundario,
  habitacionesDisponibles,
  correoValido,
  telefonoValido,
  formatoTarjeta,
  ultimos4,
  CalendarIcon,
  UserIcon,
  SearchIcon,
  CheckIcon,
  MailIcon,
  CardIcon,
  BedIcon,
} from './huespedUtils';

type Paso = 'buscar' | 'datos' | 'pago' | 'listo';

const PASOS: { id: Paso; label: string }[] = [
  { id: 'buscar', label: 'Fechas y habitación' },
  { id: 'datos', label: 'Tus datos' },
  { id: 'pago', label: 'Pago' },
  { id: 'listo', label: 'Confirmación' },
];

interface Props {
  ofertas: OfertaHabitacion[];
  habitaciones: HabitacionHotel[];
  reservas: Reserva[];
  huesped: Huesped;
  reservaWeb: ReservaHuesped | null;
  onConfirmar: (datos: {
    tipo: TipoHabitacion;
    fechaEntrada: string;
    fechaSalida: string;
    personas: number;
    contacto: DatosContacto;
    ultimos4: string;
  }) => void;
  onNuevaBusqueda: () => void;
}

export default function ReservarEstancia({
  ofertas,
  habitaciones,
  reservas,
  huesped,
  reservaWeb,
  onConfirmar,
  onNuevaBusqueda,
}: Props) {
  const [paso, setPaso] = useState<Paso>(reservaWeb ? 'listo' : 'buscar');

  const [entrada, setEntrada] = useState(fechaRelativaISO(7));
  const [salida, setSalida] = useState(fechaRelativaISO(10));
  const [personas, setPersonas] = useState(2);
  const [buscado, setBuscado] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const [tipoElegido, setTipoElegido] = useState<TipoHabitacion | null>(null);

  const [contacto, setContacto] = useState<DatosContacto>({
    nombre: '',
    correo: '',
    telefono: '',
    documento: '',
  });
  const [erroresDatos, setErroresDatos] = useState<Record<string, string>>({});

  const [tarjeta, setTarjeta] = useState('');
  const [titular, setTitular] = useState('');
  const [vence, setVence] = useState('');
  const [cvv, setCvv] = useState('');
  const [erroresPago, setErroresPago] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState(false);

  const noches = nochesEntre(entrada, salida);

  // Inventario en tiempo real: se consulta contra las reservas vigentes,
  // de modo que dos personas no pueden tomar la misma habitación.
  const disponiblesPorTipo = useMemo(() => {
    const libres = habitacionesDisponibles(entrada, salida, habitaciones, reservas, { personas });
    const mapa = new Map<TipoHabitacion, number>();
    for (const h of libres) mapa.set(h.tipo, (mapa.get(h.tipo) ?? 0) + 1);
    return mapa;
  }, [entrada, salida, personas, habitaciones, reservas]);

  const ofertasDisponibles = ofertas.filter(
    o => o.capacidad >= personas && (disponiblesPorTipo.get(o.tipo) ?? 0) > 0,
  );

  const oferta = tipoElegido ? ofertas.find(o => o.tipo === tipoElegido)! : null;
  const total = oferta ? oferta.precioNoche * noches : 0;

  function buscar() {
    if (entrada < fechaHoyISO()) {
      setErrorBusqueda('La fecha de entrada no puede ser anterior a hoy.');
      return;
    }
    if (salida <= entrada) {
      setErrorBusqueda('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }
    setErrorBusqueda('');
    setTipoElegido(null);
    setBuscado(true);
  }

  function irADatos(tipo: TipoHabitacion) {
    setTipoElegido(tipo);
    setContacto(c => (c.nombre ? c : { ...c, nombre: '', correo: '', telefono: '', documento: '' }));
    setPaso('datos');
  }

  function validarDatos(): boolean {
    const e: Record<string, string> = {};
    if (!contacto.nombre.trim()) e.nombre = 'Escribe tu nombre completo.';
    if (!correoValido(contacto.correo)) e.correo = 'Escribe un correo válido; ahí enviaremos tu confirmación.';
    if (!telefonoValido(contacto.telefono)) e.telefono = 'Escribe un teléfono de al menos 8 dígitos.';
    if (!contacto.documento.trim()) e.documento = 'Necesitamos tu documento de identidad.';
    setErroresDatos(e);
    return Object.keys(e).length === 0;
  }

  function validarPago(): boolean {
    const e: Record<string, string> = {};
    if (tarjeta.replace(/\D/g, '').length < 15) e.tarjeta = 'Escribe los 16 dígitos de la tarjeta.';
    if (!titular.trim()) e.titular = 'Escribe el nombre tal como aparece en la tarjeta.';
    if (!/^\d{2}\/\d{2}$/.test(vence)) e.vence = 'Usa el formato MM/AA.';
    if (!/^\d{3,4}$/.test(cvv)) e.cvv = 'El código de seguridad tiene 3 o 4 dígitos.';
    setErroresPago(e);
    return Object.keys(e).length === 0;
  }

  function pagar() {
    if (!validarPago() || !tipoElegido) return;
    setProcesando(true);
    // La pasarela real devolvería la autorización del cargo; aquí solo se
    // simula la espera para que el prototipo muestre el estado intermedio.
    window.setTimeout(() => {
      onConfirmar({
        tipo: tipoElegido,
        fechaEntrada: entrada,
        fechaSalida: salida,
        personas,
        contacto,
        ultimos4: ultimos4(tarjeta),
      });
      setProcesando(false);
      setPaso('listo');
    }, 900);
  }

  function empezarDeNuevo() {
    onNuevaBusqueda();
    setPaso('buscar');
    setBuscado(false);
    setTipoElegido(null);
    setTarjeta('');
    setTitular('');
    setVence('');
    setCvv('');
    setErroresPago({});
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera
        titulo="Reservar estancia"
        subtitulo="Consulta disponibilidad real y confirma tu habitación en línea"
      />

      {/* Progreso */}
      <div className="px-4 sm:px-6 pt-5">
        <div className="flex items-center gap-2 flex-wrap">
          {PASOS.map((p, i) => {
            const indice = PASOS.findIndex(x => x.id === paso);
            const hecho = i < indice;
            const activo = p.id === paso;
            return (
              <div key={p.id} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center ${
                    activo
                      ? 'bg-[#18345C] text-white'
                      : hecho
                        ? 'bg-[#D8B94E] text-[#102747]'
                        : 'bg-white text-[#AEBCC1] border border-[#E5E0D8]'
                  }`}
                >
                  {hecho ? '✓' : i + 1}
                </span>
                <span className={`text-[13px] ${activo ? 'font-semibold text-[#18345C]' : 'text-[#AEBCC1]'}`}>
                  {p.label}
                </span>
                {i < PASOS.length - 1 && <span className="text-[#E5E0D8] px-1">—</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {/* ---------- PASO 1: búsqueda y resultados ---------- */}
        {paso === 'buscar' && (
          <>
            <Tarjeta titulo="¿Cuándo quieres hospedarte?">
              <div className="grid gap-3 sm:grid-cols-4">
                <Campo label="Entrada">
                  <input
                    type="date"
                    value={entrada}
                    min={fechaHoyISO()}
                    onChange={e => setEntrada(e.target.value)}
                    className={INPUT_CLS}
                  />
                </Campo>
                <Campo label="Salida">
                  <input
                    type="date"
                    value={salida}
                    min={entrada}
                    onChange={e => setSalida(e.target.value)}
                    className={INPUT_CLS}
                  />
                </Campo>
                <Campo label="Huéspedes">
                  <select
                    value={personas}
                    onChange={e => setPersonas(Number(e.target.value))}
                    className={INPUT_CLS}
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </Campo>
                <div className="flex items-end">
                  <button
                    onClick={buscar}
                    className="w-full px-4 py-2.5 min-h-[44px] text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors flex items-center justify-center gap-2"
                  >
                    <SearchIcon size={15} /> Buscar
                  </button>
                </div>
              </div>

              {errorBusqueda && (
                <div className="mt-3">
                  <Aviso tono="error">{errorBusqueda}</Aviso>
                </div>
              )}

              {!errorBusqueda && noches > 0 && (
                <p className="text-[13px] text-[#6B7280] mt-3">
                  {noches} {noches === 1 ? 'noche' : 'noches'} · del {formatoFecha(entrada)} al {formatoFecha(salida)}
                </p>
              )}
            </Tarjeta>

            {buscado && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-semibold text-[#18345C]">Habitaciones disponibles</h2>
                  <Chip cls="bg-[#F0FAF4] text-[#166534] border-[#86EFAC]">
                    {ofertasDisponibles.length} {ofertasDisponibles.length === 1 ? 'tipo' : 'tipos'}
                  </Chip>
                </div>

                {ofertasDisponibles.length === 0 ? (
                  <Aviso tono="alerta">
                    No hay habitaciones libres para {personas} {personas === 1 ? 'huésped' : 'huéspedes'} en esas
                    fechas. Prueba con otras fechas o reduce el número de huéspedes.
                  </Aviso>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {ofertasDisponibles.map(o => (
                      <TarjetaOferta
                        key={o.tipo}
                        oferta={o}
                        noches={noches}
                        restantes={disponiblesPorTipo.get(o.tipo) ?? 0}
                        onElegir={() => irADatos(o.tipo)}
                      />
                    ))}
                  </div>
                )}

                <p className="text-[12px] text-[#AEBCC1]">
                  La disponibilidad se consulta contra las reservas vigentes del hotel, por lo que solo se
                  muestran habitaciones realmente libres en esas fechas.
                </p>
              </>
            )}
          </>
        )}

        {/* ---------- PASO 2: datos personales ---------- */}
        {paso === 'datos' && oferta && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <Tarjeta
                titulo="Datos para la confirmación"
                extra={
                  <button
                    onClick={() =>
                      setContacto({
                        nombre: huesped.nombre,
                        correo: huesped.correo,
                        telefono: huesped.telefono,
                        documento: huesped.documento,
                      })
                    }
                    className="text-[13px] font-semibold text-[#18345C] hover:underline"
                  >
                    Usar mis datos
                  </button>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo label="Nombre completo" error={erroresDatos.nombre}>
                    <input
                      value={contacto.nombre}
                      onChange={e => setContacto({ ...contacto, nombre: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="Como aparece en tu documento"
                    />
                  </Campo>
                  <Campo label="Documento de identidad" error={erroresDatos.documento}>
                    <input
                      value={contacto.documento}
                      onChange={e => setContacto({ ...contacto, documento: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="DPI o pasaporte"
                    />
                  </Campo>
                  <Campo label="Correo electrónico" error={erroresDatos.correo}>
                    <input
                      type="email"
                      value={contacto.correo}
                      onChange={e => setContacto({ ...contacto, correo: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="nombre@correo.com"
                    />
                  </Campo>
                  <Campo label="Teléfono" error={erroresDatos.telefono}>
                    <input
                      value={contacto.telefono}
                      onChange={e => setContacto({ ...contacto, telefono: e.target.value })}
                      className={INPUT_CLS}
                      placeholder="+502 0000 0000"
                    />
                  </Campo>
                </div>

                <div className="mt-4">
                  <Aviso tono="info">
                    <span className="flex items-start gap-2">
                      <MailIcon />
                      <span>
                        Al confirmar te enviaremos un correo con el código de reserva y el enlace para hacer el
                        check-in desde tu teléfono 24 horas antes de llegar.
                      </span>
                    </span>
                  </Aviso>
                </div>

                <div className="flex gap-2 mt-5">
                  <BotonSecundario onClick={() => setPaso('buscar')} ancho>Volver</BotonSecundario>
                  <BotonPrimario
                    ancho
                    onClick={() => {
                      if (validarDatos()) setPaso('pago');
                    }}
                  >
                    Continuar al pago
                  </BotonPrimario>
                </div>
              </Tarjeta>
            </div>

            <ResumenReserva oferta={oferta} entrada={entrada} salida={salida} noches={noches} personas={personas} total={total} />
          </div>
        )}

        {/* ---------- PASO 3: pago ---------- */}
        {paso === 'pago' && oferta && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <Tarjeta titulo="Datos de la tarjeta">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Campo label="Número de tarjeta" error={erroresPago.tarjeta}>
                      <input
                        value={tarjeta}
                        onChange={e => setTarjeta(formatoTarjeta(e.target.value))}
                        className={INPUT_CLS}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                      />
                    </Campo>
                  </div>
                  <div className="sm:col-span-2">
                    <Campo label="Titular de la tarjeta" error={erroresPago.titular}>
                      <input
                        value={titular}
                        onChange={e => setTitular(e.target.value)}
                        className={INPUT_CLS}
                        placeholder="Nombre impreso en la tarjeta"
                      />
                    </Campo>
                  </div>
                  <Campo label="Vencimiento" error={erroresPago.vence}>
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
                  <Campo label="Código de seguridad" error={erroresPago.cvv}>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={INPUT_CLS}
                      placeholder="CVV"
                      inputMode="numeric"
                    />
                  </Campo>
                </div>

                <div className="mt-4">
                  <Aviso tono="info">
                    <span className="flex items-start gap-2">
                      <CardIcon />
                      <span>
                        El cobro se procesa a través de una pasarela certificada. Villa Serena no almacena el
                        número completo de tu tarjeta.
                      </span>
                    </span>
                  </Aviso>
                </div>

                <div className="flex gap-2 mt-5">
                  <BotonSecundario onClick={() => setPaso('datos')} ancho>Volver</BotonSecundario>
                  <BotonPrimario ancho onClick={pagar} disabled={procesando}>
                    {procesando ? 'Procesando…' : `Pagar ${dinero(total)} y reservar`}
                  </BotonPrimario>
                </div>
              </Tarjeta>
            </div>

            <ResumenReserva oferta={oferta} entrada={entrada} salida={salida} noches={noches} personas={personas} total={total} />
          </div>
        )}

        {/* ---------- PASO 4: confirmación ---------- */}
        {paso === 'listo' && reservaWeb && (
          <div className="max-w-2xl">
            <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
              <div className="bg-[#F0FAF4] border-b border-[#86EFAC] px-5 py-5 text-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto text-[#166534] border border-[#86EFAC]">
                  <CheckIcon size={22} />
                </div>
                <p className="text-[22px] font-semibold text-[#166534] mt-3">¡Reserva confirmada!</p>
                <p className="text-[14px] text-[#166534] mt-1">
                  Enviamos el detalle a {reservaWeb.contacto.correo}
                </p>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-4 text-center">
                  <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Código de reserva</p>
                  <p className="text-[32px] font-bold text-[#18345C] leading-none mt-1">{reservaWeb.codigo}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Fila label="Habitación" valor={reservaWeb.tipo} />
                  <Fila label="Huéspedes" valor={String(reservaWeb.personas)} />
                  <Fila label="Entrada" valor={formatoFecha(reservaWeb.fechaEntrada)} />
                  <Fila label="Salida" valor={formatoFecha(reservaWeb.fechaSalida)} />
                  <Fila label="Noches" valor={String(reservaWeb.noches)} />
                  <Fila label="Total pagado" valor={dinero(reservaWeb.total)} />
                  <Fila label="Tarjeta" valor={`•••• ${reservaWeb.ultimos4}`} />
                  <Fila label="A nombre de" valor={reservaWeb.contacto.nombre} />
                </div>

                <Aviso tono="info">
                  24 horas antes de tu llegada recibirás un enlace para hacer el check-in web, cargar tu
                  documento y obtener la llave digital de la habitación.
                </Aviso>

                <BotonSecundario onClick={empezarDeNuevo} ancho>Hacer otra reserva</BotonSecundario>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Tarjeta de un tipo de habitación con su galería de fotos
   ========================================================= */

function TarjetaOferta({
  oferta,
  noches,
  restantes,
  onElegir,
}: {
  oferta: OfertaHabitacion;
  noches: number;
  restantes: number;
  onElegir: () => void;
}) {
  const [foto, setFoto] = useState(0);

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={oferta.fotos[foto]}
          alt={`Habitación ${oferta.tipo}`}
          className="w-full h-48 object-cover bg-[#F8F6F0]"
        />
        {oferta.fotos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {oferta.fotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setFoto(i)}
                aria-label={`Ver foto ${i + 1}`}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: i === foto ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
        )}
        {restantes <= 2 && (
          <span className="absolute top-2 right-2 text-[11px] font-semibold px-2 py-1 rounded-md bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]">
            {restantes === 1 ? '¡Última disponible!' : `Solo quedan ${restantes}`}
          </span>
        )}
      </div>

      <div className="px-4 py-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[20px] font-semibold text-[#18345C] leading-tight">{oferta.tipo}</p>
            <p className="text-[13px] text-[#AEBCC1] mt-0.5">
              {oferta.metros} m² · hasta {oferta.capacidad} {oferta.capacidad === 1 ? 'persona' : 'personas'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[22px] font-bold text-[#18345C] leading-none">{dinero(oferta.precioNoche)}</p>
            <p className="text-[11px] text-[#AEBCC1] mt-0.5">por noche</p>
          </div>
        </div>

        <p className="text-[14px] text-[#6B7280] mt-2">{oferta.descripcion}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {oferta.amenidades.map(a => (
            <Chip key={a} cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">{a}</Chip>
          ))}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[12px] text-[#AEBCC1]">
              {restantes} {restantes === 1 ? 'habitación libre' : 'habitaciones libres'}
            </p>
            {noches > 0 && (
              <p className="text-[14px] font-semibold text-[#18345C]">
                {dinero(oferta.precioNoche * noches)} por {noches} {noches === 1 ? 'noche' : 'noches'}
              </p>
            )}
          </div>
          <button
            onClick={onElegir}
            className="px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors shrink-0"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumenReserva({
  oferta,
  entrada,
  salida,
  noches,
  personas,
  total,
}: {
  oferta: OfertaHabitacion;
  entrada: string;
  salida: string;
  noches: number;
  personas: number;
  total: number;
}) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden lg:sticky lg:top-0">
        <img src={oferta.fotos[0]} alt={oferta.tipo} className="w-full h-36 object-cover bg-[#F8F6F0]" />
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[#18345C]"><BedIcon size={16} /></span>
            <p className="text-[17px] font-semibold text-[#18345C]">{oferta.tipo}</p>
          </div>

          <div className="text-[14px] text-[#6B7280] space-y-1.5">
            <p className="flex items-center gap-2">
              <CalendarIcon /> {formatoFecha(entrada)} → {formatoFecha(salida)}
            </p>
            <p className="flex items-center gap-2">
              <UserIcon /> {personas} {personas === 1 ? 'huésped' : 'huéspedes'}
            </p>
          </div>

          <div className="border-t border-[#E5E0D8] pt-3 space-y-1.5">
            <div className="flex justify-between text-[14px] text-[#6B7280]">
              <span>{dinero(oferta.precioNoche)} × {noches} {noches === 1 ? 'noche' : 'noches'}</span>
              <span>{dinero(total)}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#6B7280]">
              <span>Impuestos incluidos</span>
              <span>—</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-[#E5E0D8] pt-2 mt-2">
              <span className="text-[15px] font-semibold text-[#18345C]">Total</span>
              <span className="text-[22px] font-bold text-[#18345C]">{dinero(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
      <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest">{label}</p>
      <p className="text-[15px] font-semibold text-[#18345C] mt-0.5">{valor}</p>
    </div>
  );
}
