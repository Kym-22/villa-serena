import { useEffect, useRef, useState } from 'react';
import type {
  Huesped,
  Reserva,
  HabitacionHotel,
  CheckInWeb as CheckInWebEstado,
  DocumentoCargado,
  FormatoDocumento,
} from '../../types';
import {
  formatoFecha,
  formatoFechaHora,
  PETICIONES_ESPECIALES,
  TERMINOS_ESTANCIA,
} from '../../data';
import {
  Chip,
  Campo,
  INPUT_CLS,
  Cabecera,
  Tarjeta,
  Aviso,
  BotonPrimario,
  BotonSecundario,
  CodigoQR,
  correoValido,
  telefonoValido,
  CheckIcon,
  UploadIcon,
  PenIcon,
  KeyIcon,
  AlertIcon,
  MailIcon,
} from './huespedUtils';

const PASOS = [
  { id: 1, label: 'Tus datos' },
  { id: 2, label: 'Documento' },
  { id: 3, label: 'Firma' },
  { id: 4, label: 'Peticiones' },
];

// Formatos que acepta el módulo de carga, según la nota técnica de la HU-02.
const FORMATOS: Record<string, FormatoDocumento> = {
  jpg: 'JPG',
  jpeg: 'JPG',
  pdf: 'PDF',
};

const PESO_MAXIMO_KB = 5 * 1024;

interface Props {
  huesped: Huesped;
  reserva: Reserva;
  habitacion: HabitacionHotel;
  checkin: CheckInWebEstado;
  estanciaCerrada: boolean;
  onCompletar: (datos: {
    documento: DocumentoCargado;
    firma: string;
    peticiones: string[];
    notaPeticiones: string;
  }) => void;
  onGuardarPeticiones: (peticiones: string[], nota: string) => void;
  onIrHabitacion: () => void;
}

export default function CheckInWebScreen({
  huesped,
  reserva,
  habitacion,
  checkin,
  estanciaCerrada,
  onCompletar,
  onGuardarPeticiones,
  onIrHabitacion,
}: Props) {
  const [paso, setPaso] = useState(1);

  const [nombre, setNombre] = useState(huesped.nombre);
  const [documento, setDocumento] = useState(huesped.documento);
  const [telefono, setTelefono] = useState(huesped.telefono);
  const [correo, setCorreo] = useState(huesped.correo);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [archivo, setArchivo] = useState<DocumentoCargado | null>(checkin.documento);
  const [errorArchivo, setErrorArchivo] = useState('');

  const [aceptado, setAceptado] = useState(false);
  const [firma, setFirma] = useState<string | null>(checkin.firma);
  const [errorFirma, setErrorFirma] = useState('');

  const [peticiones, setPeticiones] = useState<string[]>(checkin.peticiones);
  const [nota, setNota] = useState(checkin.notaPeticiones);

  const completado = checkin.estado === 'completado';

  /* ---------- Paso 1: verificación de datos ---------- */

  function validarDatos(): boolean {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre no puede quedar vacío.';
    if (!documento.trim()) e.documento = 'Escribe el número de tu documento.';
    if (!telefonoValido(telefono)) e.telefono = 'Escribe un teléfono de al menos 8 dígitos.';
    if (!correoValido(correo)) e.correo = 'Escribe un correo válido.';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  /* ---------- Paso 2: carga del documento ---------- */

  function recibirArchivo(archivos: FileList | null) {
    const f = archivos?.[0];
    if (!f) return;

    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const formato = FORMATOS[ext];
    if (!formato) {
      setErrorArchivo('Solo aceptamos imágenes JPG o archivos PDF.');
      setArchivo(null);
      return;
    }

    const pesoKb = Math.max(1, Math.round(f.size / 1024));
    if (pesoKb > PESO_MAXIMO_KB) {
      setErrorArchivo('El archivo supera los 5 MB. Sube una versión más liviana.');
      setArchivo(null);
      return;
    }

    setErrorArchivo('');
    setArchivo({ nombre: f.name, formato, pesoKb });
  }

  /* ---------- Paso 4: cierre ---------- */

  function finalizar() {
    if (!archivo || !firma) return;
    onCompletar({ documento: archivo, firma, peticiones, notaPeticiones: nota });
  }

  /* ---------- Vista de check-in ya completado ---------- */

  if (completado) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
        <Cabecera
          titulo="Check-in completado"
          subtitulo={`Habitación ${habitacion.numero} · ${reserva.codigo}`}
        />

        <div className="px-4 sm:px-6 py-5 space-y-5 max-w-3xl">
          {estanciaCerrada ? (
            <Aviso tono="alerta">
              Tu estancia finalizó y la llave digital quedó desactivada tras el check-out.
            </Aviso>
          ) : (
            <Aviso tono="exito">
              <span className="flex items-start gap-2">
                <CheckIcon />
                <span>
                  Completaste el check-in el {formatoFechaHora(checkin.completadoEn ?? '')}. Puedes entrar a la
                  habitación directamente con tu llave digital.
                </span>
              </span>
            </Aviso>
          )}

          <Tarjeta titulo="Tu llave digital">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className={estanciaCerrada ? 'opacity-30 grayscale' : ''}>
                <CodigoQR texto={checkin.codigoLlave ?? reserva.codigo} tamano={170} />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <p className="text-[17px] font-semibold text-[#18345C] flex items-center justify-center sm:justify-start gap-2">
                  <KeyIcon size={18} /> Habitación {habitacion.numero}
                </p>
                <p className="text-[14px] text-[#6B7280] mt-1">
                  Muestra este código en el lector de la puerta o usa la apertura por Bluetooth desde la
                  sección “Mi habitación”.
                </p>
                <p className="text-[12px] text-[#AEBCC1] mt-2 break-all">{checkin.codigoLlave}</p>
                {!estanciaCerrada && (
                  <div className="mt-4">
                    <BotonPrimario onClick={onIrHabitacion}>Ir a abrir la puerta</BotonPrimario>
                  </div>
                )}
              </div>
            </div>
          </Tarjeta>

          <div className="grid gap-5 sm:grid-cols-2">
            <Tarjeta titulo="Documento verificado">
              {checkin.documento ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#F0FAF4] border border-[#86EFAC] flex items-center justify-center shrink-0 text-[#166534]">
                    <CheckIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[#18345C] truncate">{checkin.documento.nombre}</p>
                    <p className="text-[12px] text-[#AEBCC1]">
                      {checkin.documento.formato} · {checkin.documento.pesoKb} KB · verificado
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-[#AEBCC1]">Sin documento cargado.</p>
              )}

              {checkin.firma && (
                <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
                  <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest mb-2">Firma de los términos</p>
                  <img src={checkin.firma} alt="Firma del huésped" className="h-16 bg-white border border-[#E5E0D8] rounded-md" />
                </div>
              )}
            </Tarjeta>

            <Tarjeta titulo="Peticiones especiales">
              <PeticionesEditor
                peticiones={peticiones}
                nota={nota}
                onTogglePeticion={p =>
                  setPeticiones(ps => (ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p]))
                }
                onNota={setNota}
                soloLectura={estanciaCerrada}
              />
              {!estanciaCerrada && (
                <div className="mt-4">
                  <BotonSecundario onClick={() => onGuardarPeticiones(peticiones, nota)} ancho>
                    Guardar cambios
                  </BotonSecundario>
                </div>
              )}
            </Tarjeta>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Asistente de check-in ---------- */

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera
        titulo="Check-in web"
        subtitulo={`${reserva.codigo} · llegada ${formatoFecha(reserva.fechaEntrada)} · habitación ${habitacion.numero}`}
      />

      <div className="px-4 sm:px-6 py-5 space-y-5 max-w-3xl">
        <Aviso tono="info">
          <span className="flex items-start gap-2">
            <MailIcon />
            <span>
              Este enlace se envía por correo y SMS 24 horas antes de la llegada. Al terminar recibirás tu
              llave digital y no tendrás que hacer fila en recepción.
            </span>
          </span>
        </Aviso>

        {/* Progreso */}
        <div className="flex items-center gap-2 flex-wrap">
          {PASOS.map((p, i) => {
            const hecho = p.id < paso;
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
                  {hecho ? '✓' : p.id}
                </span>
                <span className={`text-[13px] ${activo ? 'font-semibold text-[#18345C]' : 'text-[#AEBCC1]'}`}>
                  {p.label}
                </span>
                {i < PASOS.length - 1 && <span className="text-[#E5E0D8] px-1">—</span>}
              </div>
            );
          })}
        </div>

        {/* Paso 1 */}
        {paso === 1 && (
          <Tarjeta titulo="Verifica tus datos">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre completo" error={errores.nombre}>
                <input value={nombre} onChange={e => setNombre(e.target.value)} className={INPUT_CLS} />
              </Campo>
              <Campo label={`Documento (${huesped.tipoDocumento})`} error={errores.documento}>
                <input value={documento} onChange={e => setDocumento(e.target.value)} className={INPUT_CLS} />
              </Campo>
              <Campo label="Teléfono" error={errores.telefono}>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} className={INPUT_CLS} />
              </Campo>
              <Campo label="Correo electrónico" error={errores.correo}>
                <input value={correo} onChange={e => setCorreo(e.target.value)} className={INPUT_CLS} />
              </Campo>
            </div>

            <div className="mt-4 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-3">
              <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Tu reserva</p>
              <p className="text-[14px] text-[#18345C] mt-1">
                {formatoFecha(reserva.fechaEntrada)} → {formatoFecha(reserva.fechaSalida)} ·{' '}
                {reserva.personas} {reserva.personas === 1 ? 'huésped' : 'huéspedes'} · {habitacion.tipo}
              </p>
              {reserva.acompanantes.length > 0 && (
                <p className="text-[13px] text-[#6B7280] mt-1">
                  Acompañantes: {reserva.acompanantes.map(a => a.nombre).join(', ')}
                </p>
              )}
            </div>

            <div className="mt-5">
              <BotonPrimario
                ancho
                onClick={() => {
                  if (validarDatos()) setPaso(2);
                }}
              >
                Continuar
              </BotonPrimario>
            </div>
          </Tarjeta>
        )}

        {/* Paso 2 */}
        {paso === 2 && (
          <Tarjeta titulo="Documento de identidad">
            <p className="text-[14px] text-[#6B7280]">
              Sube una foto legible de tu {huesped.tipoDocumento === 'DPI' ? 'DPI' : 'pasaporte'}. Aceptamos
              archivos JPG o PDF de hasta 5 MB.
            </p>

            <label className="mt-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E0D8] rounded-xl px-4 py-8 cursor-pointer hover:border-[#18345C] transition-colors text-center">
              <span className="text-[#18345C]"><UploadIcon size={22} /></span>
              <span className="text-[15px] font-medium text-[#18345C]">
                {archivo ? 'Cambiar archivo' : 'Seleccionar archivo'}
              </span>
              <span className="text-[13px] text-[#AEBCC1]">JPG o PDF · máximo 5 MB</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.pdf,image/jpeg,application/pdf"
                className="hidden"
                onChange={e => recibirArchivo(e.target.files)}
              />
            </label>

            {errorArchivo && (
              <div className="mt-3">
                <Aviso tono="error">
                  <span className="flex items-start gap-2"><AlertIcon /> {errorArchivo}</span>
                </Aviso>
              </div>
            )}

            {archivo && (
              <div className="mt-3 flex items-center gap-3 bg-[#F0FAF4] border border-[#86EFAC] rounded-lg px-4 py-3">
                <span className="text-[#166534]"><CheckIcon size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-[#166534] truncate">{archivo.nombre}</p>
                  <p className="text-[12px] text-[#166534]">{archivo.formato} · {archivo.pesoKb} KB</p>
                </div>
                <button
                  onClick={() => setArchivo(null)}
                  className="text-[13px] font-semibold text-[#991B1B] hover:underline shrink-0"
                >
                  Quitar
                </button>
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <BotonSecundario onClick={() => setPaso(1)} ancho>Volver</BotonSecundario>
              <BotonPrimario ancho disabled={!archivo} onClick={() => setPaso(3)}>Continuar</BotonPrimario>
            </div>
          </Tarjeta>
        )}

        {/* Paso 3 */}
        {paso === 3 && (
          <Tarjeta titulo="Términos de la estancia">
            <ul className="space-y-2">
              {TERMINOS_ESTANCIA.map(t => (
                <li key={t} className="flex items-start gap-2 text-[14px] text-[#6B7280]">
                  <span className="text-[#D8B94E] mt-0.5 shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptado}
                onChange={e => setAceptado(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#18345C]"
              />
              <span className="text-[14px] text-[#1F2933]">
                He leído y acepto los términos y condiciones de la estancia.
              </span>
            </label>

            <div className="mt-5">
              <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <PenIcon size={13} /> Firma con el dedo o el ratón
              </p>
              <LienzoFirma valor={firma} onCambio={setFirma} />
            </div>

            {errorFirma && (
              <div className="mt-3">
                <Aviso tono="error">{errorFirma}</Aviso>
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <BotonSecundario onClick={() => setPaso(2)} ancho>Volver</BotonSecundario>
              <BotonPrimario
                ancho
                disabled={!aceptado}
                onClick={() => {
                  if (!firma) {
                    setErrorFirma('Necesitamos tu firma para registrar la aceptación.');
                    return;
                  }
                  setErrorFirma('');
                  setPaso(4);
                }}
              >
                Continuar
              </BotonPrimario>
            </div>
          </Tarjeta>
        )}

        {/* Paso 4 */}
        {paso === 4 && (
          <Tarjeta titulo="Peticiones especiales">
            <p className="text-[14px] text-[#6B7280]">
              Marca lo que necesites. Recepción y limpieza lo verán antes de que llegues; están sujetas a
              disponibilidad.
            </p>

            <div className="mt-4">
              <PeticionesEditor
                peticiones={peticiones}
                nota={nota}
                onTogglePeticion={p =>
                  setPeticiones(ps => (ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p]))
                }
                onNota={setNota}
              />
            </div>

            <div className="flex gap-2 mt-5">
              <BotonSecundario onClick={() => setPaso(3)} ancho>Volver</BotonSecundario>
              <BotonPrimario ancho onClick={finalizar}>Finalizar y generar mi llave</BotonPrimario>
            </div>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Selector de peticiones especiales
   ========================================================= */

function PeticionesEditor({
  peticiones,
  nota,
  onTogglePeticion,
  onNota,
  soloLectura = false,
}: {
  peticiones: string[];
  nota: string;
  onTogglePeticion: (p: string) => void;
  onNota: (v: string) => void;
  soloLectura?: boolean;
}) {
  if (soloLectura) {
    return peticiones.length === 0 && !nota ? (
      <p className="text-[14px] text-[#AEBCC1]">No registraste peticiones especiales.</p>
    ) : (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {peticiones.map(p => (
            <Chip key={p} cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">{p}</Chip>
          ))}
        </div>
        {nota && <p className="text-[14px] text-[#6B7280]">{nota}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {PETICIONES_ESPECIALES.map(p => {
          const activa = peticiones.includes(p);
          return (
            <button
              key={p}
              onClick={() => onTogglePeticion(p)}
              className={`px-3 py-2 min-h-[44px] text-[14px] font-medium rounded-md border transition-colors ${
                activa
                  ? 'bg-[#18345C] text-white border-[#18345C]'
                  : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Campo label="¿Algo más que debamos saber?">
          <textarea
            value={nota}
            onChange={e => onNota(e.target.value)}
            rows={3}
            className={INPUT_CLS}
            placeholder="Llegamos cerca de medianoche, agradecemos habitación lejos del ascensor…"
          />
        </Campo>
      </div>
    </>
  );
}

/* =========================================================
   Lienzo de firma digital
   Se dibuja con el dedo o el ratón y se guarda como imagen.
   ========================================================= */

function LienzoFirma({ valor, onCambio }: { valor: string | null; onCambio: (v: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const dibujando = useRef(false);
  // Se lleva en una referencia además del estado: el estado solo controla el
  // texto de ayuda, pero al soltar el puntero hay que saber ya si hubo trazo.
  const hayTrazo = useRef(Boolean(valor));
  const [vacio, setVacio] = useState(!valor);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // El lienzo se dibuja al doble de resolución para que la firma no se vea
    // pixelada en pantallas de alta densidad.
    const ancho = canvas.clientWidth;
    canvas.width = ancho * 2;
    canvas.height = 160 * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#102747';
    if (valor) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, ancho, 160);
      img.src = valor;
    }
  }, []);

  function posicion(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function empezar(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dibujando.current = true;
    const { x, y } = posicion(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return;
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = posicion(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hayTrazo.current = true;
    setVacio(false);
  }

  function terminar() {
    if (!dibujando.current) return;
    dibujando.current = false;
    const canvas = ref.current;
    if (canvas && hayTrazo.current) onCambio(canvas.toDataURL('image/png'));
  }

  function limpiar() {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hayTrazo.current = false;
    setVacio(true);
    onCambio(null);
  }

  return (
    <div>
      <div className="relative bg-white border border-[#E5E0D8] rounded-lg overflow-hidden">
        <canvas
          ref={ref}
          className="w-full touch-none block"
          style={{ height: 160 }}
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerLeave={terminar}
        />
        {vacio && (
          <p className="absolute inset-0 flex items-center justify-center text-[14px] text-[#AEBCC1] pointer-events-none">
            Firma aquí
          </p>
        )}
      </div>
      <button
        onClick={limpiar}
        className="mt-2 text-[13px] font-semibold text-[#6B7280] hover:text-[#18345C]"
      >
        Borrar firma
      </button>
    </div>
  );
}
