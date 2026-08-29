import { useMemo, useState } from 'react';
import type {
  Huesped,
  HabitacionHotel,
  Reserva,
  TipoHabitacion,
  TipoDocumento,
} from '../../types';
import { NACIONALIDADES, nochesEntre, fechaHoyISO, fechaRelativaISO } from '../../data';
import {
  dinero,
  Campo,
  INPUT_CLS,
  CloseIcon,
  BedIcon,
  habitacionesDisponibles,
} from './recUtils';

const TIPOS: TipoHabitacion[] = ['Standard', 'Superior', 'Deluxe', 'Suite Deluxe', 'Suite'];

interface NuevoHuespedForm {
  nombre: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  telefono: string;
  correo: string;
  nacionalidad: string;
}

interface Props {
  huespedes: Huesped[];
  habitaciones: HabitacionHotel[];
  reservas: Reserva[];
  preset?: { entrada?: string; salida?: string; tipo?: TipoHabitacion; habitacionId?: string };
  onCerrar: () => void;
  onCrearHuesped: (h: Omit<Huesped, 'id' | 'creadoEn'>) => Huesped;
  onCrearReserva: (datos: {
    huespedId: string;
    tipoHabitacion: TipoHabitacion;
    fechaEntrada: string;
    fechaSalida: string;
    personas: number;
    habitacionId: string | null;
  }) => void;
}

export default function NuevaReservaModal({
  huespedes,
  habitaciones,
  reservas,
  preset,
  onCerrar,
  onCrearHuesped,
  onCrearReserva,
}: Props) {
  const [modoNuevoHuesped, setModoNuevoHuesped] = useState(huespedes.length === 0);
  const [huespedId, setHuespedId] = useState('');
  const [nh, setNh] = useState<NuevoHuespedForm>({
    nombre: '',
    tipoDocumento: 'DPI',
    documento: '',
    telefono: '',
    correo: '',
    nacionalidad: 'Guatemalteca',
  });

  const [entrada, setEntrada] = useState(preset?.entrada ?? fechaHoyISO());
  const [salida, setSalida] = useState(preset?.salida ?? fechaRelativaISO(2));
  const [personas, setPersonas] = useState('2');
  const [tipo, setTipo] = useState<TipoHabitacion>(preset?.tipo ?? 'Standard');
  const [habitacionId, setHabitacionId] = useState<string>(preset?.habitacionId ?? '');
  const [errores, setErrores] = useState<Record<string, string>>({});

  const nPersonas = Math.max(1, Number(personas) || 1);
  const rangoValido = entrada < salida;
  const noches = rangoValido ? nochesEntre(entrada, salida) : 0;

  const disponibles = useMemo(
    () =>
      rangoValido
        ? habitacionesDisponibles(entrada, salida, habitaciones, reservas, {
            personas: nPersonas,
            tipo,
          })
        : [],
    [rangoValido, entrada, salida, habitaciones, reservas, nPersonas, tipo],
  );

  const habElegida = disponibles.find(h => h.id === habitacionId) ?? null;

  function guardar() {
    const e: Record<string, string> = {};

    if (!rangoValido) e.fechas = 'La salida debe ser posterior a la entrada.';

    let idHuesped = huespedId;
    if (modoNuevoHuesped) {
      if (!nh.nombre.trim()) e.nombre = 'Nombre obligatorio.';
      if (!nh.documento.trim()) e.documento = 'Documento obligatorio.';
      if (!nh.telefono.trim()) e.telefono = 'Teléfono obligatorio.';
    } else if (!huespedId) {
      e.huesped = 'Selecciona un huésped.';
    }

    if (habitacionId && !disponibles.some(h => h.id === habitacionId)) {
      e.habitacion = 'Esa habitación ya no está disponible para el rango.';
    }

    setErrores(e);
    if (Object.keys(e).length > 0) return;

    if (modoNuevoHuesped) {
      const creado = onCrearHuesped({
        nombre: nh.nombre.trim(),
        tipoDocumento: nh.tipoDocumento,
        documento: nh.documento.trim(),
        telefono: nh.telefono.trim(),
        correo: nh.correo.trim(),
        nacionalidad: nh.nacionalidad,
      });
      idHuesped = creado.id;
    }

    onCrearReserva({
      huespedId: idHuesped,
      tipoHabitacion: tipo,
      fechaEntrada: entrada,
      fechaSalida: salida,
      personas: nPersonas,
      habitacionId: habitacionId || null,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />

      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white z-10">
          <h2 className="text-[22px] font-semibold text-[#18345C]">Nueva reserva</h2>
          <button onClick={onCerrar} className="text-[#AEBCC1] hover:text-[#1F2933] p-1">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Huésped */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest">Huésped</p>
              <button
                onClick={() => { setModoNuevoHuesped(v => !v); setErrores({}); }}
                className="text-[12px] font-semibold text-[#18345C] hover:underline"
              >
                {modoNuevoHuesped ? 'Elegir uno existente' : 'Registrar nuevo huésped'}
              </button>
            </div>

            {!modoNuevoHuesped ? (
              <Campo label="Seleccionar huésped" error={errores.huesped}>
                <select value={huespedId} onChange={e => setHuespedId(e.target.value)} className={INPUT_CLS}>
                  <option value="">Seleccionar…</option>
                  {huespedes.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.nombre} · {h.tipoDocumento} {h.documento}
                    </option>
                  ))}
                </select>
              </Campo>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-[#E5E0D8] rounded-xl p-4">
                <div className="sm:col-span-2">
                  <Campo label="Nombre completo" error={errores.nombre}>
                    <input type="text" value={nh.nombre} onChange={e => setNh(f => ({ ...f, nombre: e.target.value }))} className={INPUT_CLS} />
                  </Campo>
                </div>
                <Campo label="Tipo de documento">
                  <select
                    value={nh.tipoDocumento}
                    onChange={e => setNh(f => ({ ...f, tipoDocumento: e.target.value as TipoDocumento }))}
                    className={INPUT_CLS}
                  >
                    <option value="DPI">DPI</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </Campo>
                <Campo label="Número de documento" error={errores.documento}>
                  <input type="text" value={nh.documento} onChange={e => setNh(f => ({ ...f, documento: e.target.value }))} className={INPUT_CLS} />
                </Campo>
                <Campo label="Teléfono" error={errores.telefono}>
                  <input type="text" value={nh.telefono} onChange={e => setNh(f => ({ ...f, telefono: e.target.value }))} className={INPUT_CLS} />
                </Campo>
                <Campo label="Correo">
                  <input type="email" value={nh.correo} onChange={e => setNh(f => ({ ...f, correo: e.target.value }))} className={INPUT_CLS} />
                </Campo>
                <div className="sm:col-span-2">
                  <Campo label="Nacionalidad">
                    <select value={nh.nacionalidad} onChange={e => setNh(f => ({ ...f, nacionalidad: e.target.value }))} className={INPUT_CLS}>
                      {NACIONALIDADES.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </Campo>
                </div>
              </div>
            )}
          </div>

          {/* Estadía */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Campo label="Entrada">
              <input type="date" value={entrada} onChange={e => setEntrada(e.target.value)} className={INPUT_CLS} />
            </Campo>
            <Campo label="Salida">
              <input type="date" value={salida} min={entrada} onChange={e => setSalida(e.target.value)} className={INPUT_CLS} />
            </Campo>
            <Campo label="Personas">
              <input type="number" min="1" value={personas} onChange={e => setPersonas(e.target.value)} className={INPUT_CLS} />
            </Campo>
            <Campo label="Tipo">
              <select value={tipo} onChange={e => { setTipo(e.target.value as TipoHabitacion); setHabitacionId(''); }} className={INPUT_CLS}>
                {TIPOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Campo>
          </div>
          {errores.fechas && <p className="text-xs text-[#991B1B]">{errores.fechas}</p>}

          {/* Disponibilidad (HU-2 / HU-3 / HU-4) */}
          <div>
            <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">
              Habitaciones disponibles {rangoValido && `· ${noches} noche${noches !== 1 ? 's' : ''}`}
            </p>
            {!rangoValido ? (
              <p className="text-[13px] text-[#AEBCC1]">Indica un rango de fechas válido.</p>
            ) : disponibles.length === 0 ? (
              <p className="text-[13px] text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg px-3 py-2">
                No hay habitaciones {tipo} para {nPersonas} persona(s) en esas fechas.
              </p>
            ) : (
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {disponibles.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHabitacionId(id => (id === h.id ? '' : h.id))}
                    className={`w-full text-left flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors ${
                      habitacionId === h.id ? 'border-[#18345C] bg-[#F8F6F0]' : 'border-[#E5E0D8] hover:border-[#18345C]'
                    }`}
                  >
                    <span className="w-9 h-9 rounded-lg bg-white border border-[#E5E0D8] flex items-center justify-center text-[#18345C] shrink-0">
                      <BedIcon size={17} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-[#18345C] leading-none">Habitación {h.numero}</p>
                      <p className="text-[12px] text-[#AEBCC1] mt-0.5">
                        {h.tipo} · Piso {h.piso} · hasta {h.capacidad} personas
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-bold text-[#18345C]">{dinero(h.precioNoche)}</p>
                      <p className="text-[11px] text-[#AEBCC1]">por noche</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {errores.habitacion && <p className="text-xs text-[#991B1B] mt-1">{errores.habitacion}</p>}
            <p className="text-[12px] text-[#6B7280] mt-2">
              {habElegida
                ? `Se asignará la habitación ${habElegida.numero}. Total alojamiento: ${dinero(habElegida.precioNoche * noches)}.`
                : 'Puedes crear la reserva sin habitación y asignarla más tarde.'}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-6 flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Confirmar reserva
          </button>
        </div>
      </div>
    </div>
  );
}
