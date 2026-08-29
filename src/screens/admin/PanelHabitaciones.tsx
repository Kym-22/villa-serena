import { useEffect, useMemo, useState } from 'react';
import type { HabitacionHotel, Reserva, Huesped, EstadoHabHotel } from '../../types';
import { fechaHoyISO, formatoFecha } from '../../data';
import {
  Chip,
  HAB_META,
  HAB_TRANSICIONES,
  RESERVA_META,
  habitacionesDisponibles,
  validarCambioEstadoHab,
} from '../recepcion/recUtils';
import { BedIcon } from './adminUtils';

interface Props {
  habitaciones: HabitacionHotel[];
  reservas: Reserva[];
  huespedes: Huesped[];
  onCambiarEstado: (habId: string, nuevo: EstadoHabHotel) => void;
  onAsignar: (reservaId: string, habId: string) => void;
}

const ESTADOS: EstadoHabHotel[] = ['disponible', 'reservada', 'ocupada', 'en-limpieza', 'mantenimiento'];

export default function PanelHabitaciones({
  habitaciones,
  reservas,
  huespedes,
  onCambiarEstado,
  onAsignar,
}: Props) {
  const [ahora, setAhora] = useState(() => new Date());
  const [piso, setPiso] = useState<'todos' | 1 | 2 | 3>('todos');
  const [filtro, setFiltro] = useState<EstadoHabHotel | 'todas'>('todas');
  const [aviso, setAviso] = useState('');
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});

  // Sensación de "tiempo real".
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hoy = fechaHoyISO();
  const huespedDe = useMemo(() => new Map(huespedes.map(h => [h.id, h])), [huespedes]);

  const conteo = (e: EstadoHabHotel) => habitaciones.filter(h => h.estado === e).length;
  const ocupacionPct = habitaciones.length
    ? Math.round((conteo('ocupada') / habitaciones.length) * 100)
    : 0;

  const llegadasSinHab = reservas.filter(
    r => r.fechaEntrada === hoy && (r.estado === 'pendiente' || r.estado === 'confirmada') && !r.habitacionId,
  );

  const visibles = habitaciones
    .filter(h => (piso === 'todos' || h.piso === piso) && (filtro === 'todas' || h.estado === filtro))
    .sort((a, b) => a.numero.localeCompare(b.numero));

  function intentarCambio(hab: HabitacionHotel, nuevo: EstadoHabHotel) {
    const error = validarCambioEstadoHab(hab, nuevo, reservas);
    if (error) {
      setAviso(`Habitación ${hab.numero}: ${error}`);
      return;
    }
    setAviso('');
    onCambiarEstado(hab.id, nuevo);
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      {/* Cabecera + KPIs */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Panel de habitaciones</h1>
            <p className="text-[14px] text-[#AEBCC1] mt-1">
              Estado en tiempo real · actualizado {ahora.toLocaleTimeString()}
            </p>
          </div>
          <span className="flex items-center gap-2 text-[13px] text-[#166534] bg-[#F0FAF4] border border-[#86EFAC] rounded-md px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            En vivo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {ESTADOS.map(e => (
            <Kpi key={e} valor={conteo(e)} label={HAB_META[e].label} color={HAB_META[e].dot} />
          ))}
          <Kpi valor={`${ocupacionPct}%`} label="Ocupación" color="#18345C" />
        </div>
      </div>

      {/* Llegadas sin habitación (asignación rápida) */}
      {llegadasSinHab.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-xl p-4">
            <p className="text-[14px] font-semibold text-[#9A3412] mb-3">
              Llegadas de hoy sin habitación asignada ({llegadasSinHab.length})
            </p>
            <div className="space-y-2">
              {llegadasSinHab.map(r => {
                const h = huespedDe.get(r.huespedId);
                const opciones = habitacionesDisponibles(r.fechaEntrada, r.fechaSalida, habitaciones, reservas, {
                  personas: r.personas,
                  ignorarReservaId: r.id,
                });
                const elegida = seleccion[r.id] ?? '';
                return (
                  <div key={r.id} className="bg-white border border-[#F3D9BE] rounded-lg px-3 py-2.5 flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-[14px] font-semibold text-[#18345C]">{h?.nombre ?? 'Huésped'}</p>
                      <p className="text-[12px] text-[#AEBCC1]">
                        {r.codigo} · {formatoFecha(r.fechaEntrada)} → {formatoFecha(r.fechaSalida)} · {r.personas} pers. · {r.tipoHabitacion}
                      </p>
                    </div>
                    <select
                      value={elegida}
                      onChange={e => setSeleccion(s => ({ ...s, [r.id]: e.target.value }))}
                      className="border border-[#E5E0D8] rounded-md px-2.5 py-2 text-[13px] text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
                    >
                      <option value="">Elegir habitación…</option>
                      {opciones.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.numero} · {o.tipo} · {o.capacidad} pers.
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={!elegida}
                      onClick={() => { onAsignar(r.id, elegida); setSeleccion(s => ({ ...s, [r.id]: '' })); }}
                      className="px-4 py-2 text-[13px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Asignar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="px-4 sm:px-6 pt-5 flex gap-2 flex-wrap">
        {(['todos', 1, 2, 3] as const).map(p => (
          <BotonFiltro key={String(p)} activo={piso === p} onClick={() => setPiso(p)}>
            {p === 'todos' ? 'Todos los pisos' : `Piso ${p}`}
          </BotonFiltro>
        ))}
        <span className="w-px bg-[#E5E0D8] mx-1" />
        <BotonFiltro activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todos</BotonFiltro>
        {ESTADOS.map(e => (
          <BotonFiltro key={e} activo={filtro === e} onClick={() => setFiltro(e)}>{HAB_META[e].label}</BotonFiltro>
        ))}
      </div>

      {aviso && (
        <div className="mx-4 sm:mx-6 mt-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] rounded-lg px-4 py-2.5">
          {aviso}
        </div>
      )}

      {/* Grid */}
      <div className="px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibles.map(h => {
            const enCurso = reservas.find(r => r.habitacionId === h.id && r.estado === 'en-curso');
            const proxima = reservas.find(
              r => r.habitacionId === h.id && (r.estado === 'confirmada' || r.estado === 'pendiente'),
            );
            const huesped = enCurso
              ? huespedDe.get(enCurso.huespedId)
              : proxima
                ? huespedDe.get(proxima.huespedId)
                : null;
            const meta = HAB_META[h.estado];
            return (
              <div key={h.id} className="bg-white border border-[#E5E0D8] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center text-[#18345C]">
                      <BedIcon size={18} />
                    </span>
                    <div>
                      <p className="text-[22px] font-bold text-[#18345C] leading-none">{h.numero}</p>
                      <p className="text-[12px] text-[#AEBCC1] mt-0.5">{h.tipo} · Piso {h.piso}</p>
                    </div>
                  </div>
                  <Chip cls={meta.chip}>{meta.label}</Chip>
                </div>

                {(enCurso || proxima) && (
                  <p className="text-[12px] text-[#6B7280] mt-3 border-t border-[#F0EBE3] pt-2">
                    {enCurso ? 'Ocupa: ' : 'Próxima: '}
                    <span className="font-medium">{huesped?.nombre ?? 'Huésped'}</span>
                    {enCurso ? ` · sale ${formatoFecha(enCurso.fechaSalida)}` : ` · entra ${formatoFecha(proxima!.fechaEntrada)}`}
                    {proxima && !enCurso && (
                      <> <Chip cls={RESERVA_META[proxima.estado].chip}>{RESERVA_META[proxima.estado].label}</Chip></>
                    )}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-[#F0EBE3]">
                  <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">Cambiar estado</p>
                  <div className="flex flex-wrap gap-2">
                    {HAB_TRANSICIONES[h.estado].map(nuevo => (
                      <button
                        key={nuevo}
                        onClick={() => intentarCambio(h, nuevo)}
                        className="text-[12px] font-semibold px-2.5 py-1 rounded-md border border-[#E5E0D8] text-[#18345C] hover:bg-[#18345C] hover:text-white transition-colors"
                      >
                        {HAB_META[nuevo].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({ valor, label, color }: { valor: number | string; label: string; color: string }) {
  return (
    <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
      <p className="text-[24px] font-bold leading-none" style={{ color }}>{valor}</p>
      <p className="text-[11px] text-[#6B7280] mt-1">{label}</p>
    </div>
  );
}

function BotonFiltro({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] font-medium px-3 py-1.5 rounded-md border transition-colors ${
        activo ? 'bg-[#18345C] text-white border-[#18345C]' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
      }`}
    >
      {children}
    </button>
  );
}
