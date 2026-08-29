import { useMemo, useState } from 'react';
import type { Reserva, Huesped, HabitacionHotel, EstadoReserva } from '../../types';
import { formatoFecha } from '../../data';
import { Chip, RESERVA_META, BedIcon, SearchIcon, PlusIcon, CalendarIcon } from './recUtils';

interface Props {
  reservas: Reserva[];
  huespedes: Huesped[];
  habitaciones: HabitacionHotel[];
  onAbrir: (id: string) => void;
  onNueva: () => void;
}

const ESTADOS: (EstadoReserva | 'todos')[] = ['todos', 'pendiente', 'confirmada', 'en-curso', 'finalizada', 'cancelada'];

export default function Reservas({ reservas, huespedes, habitaciones, onAbrir, onNueva }: Props) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoReserva | 'todos'>('todos');
  const [fecha, setFecha] = useState('');

  const huespedDe = useMemo(() => {
    const m = new Map<string, Huesped>();
    huespedes.forEach(h => m.set(h.id, h));
    return m;
  }, [huespedes]);

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    return reservas
      .filter(r => {
        const h = huespedDe.get(r.huespedId);
        if (estado !== 'todos' && r.estado !== estado) return false;
        if (fecha && !(r.fechaEntrada <= fecha && fecha <= r.fechaSalida)) return false;
        if (term) {
          const blob = `${r.codigo} ${h?.nombre ?? ''} ${h?.documento ?? ''}`.toLowerCase();
          if (!blob.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => a.fechaEntrada.localeCompare(b.fechaEntrada));
  }, [reservas, huespedDe, q, estado, fecha]);

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Reservas</h1>
            <p className="text-[15px] text-[#AEBCC1] mt-1">
              {filtradas.length} de {reservas.length} reservas
            </p>
          </div>
          <button
            onClick={onNueva}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            <PlusIcon />
            Nueva reserva
          </button>
        </div>

        {/* Buscador (HU-13) */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEBCC1]">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre, DPI / pasaporte o código…"
              className="w-full border border-[#E5E0D8] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white placeholder:text-[#AEBCC1]"
            />
          </div>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value as EstadoReserva | 'todos')}
            className="border border-[#E5E0D8] rounded-md px-3 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white capitalize"
          >
            {ESTADOS.map(s => (
              <option key={s} value={s}>{s === 'todos' ? 'Todos los estados' : s}</option>
            ))}
          </select>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="border border-[#E5E0D8] rounded-md px-3 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
          />
          {(q || estado !== 'todos' || fecha) && (
            <button
              onClick={() => { setQ(''); setEstado('todos'); setFecha(''); }}
              className="text-[13px] text-[#AEBCC1] hover:text-[#18345C] font-medium"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5">
        {filtradas.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-10 text-center">
            <p className="text-[15px] text-[#AEBCC1]">No hay reservas que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map(r => {
              const h = huespedDe.get(r.huespedId);
              const hab = habitaciones.find(x => x.id === r.habitacionId);
              const meta = RESERVA_META[r.estado];
              return (
                <button
                  key={r.id}
                  onClick={() => onAbrir(r.id)}
                  className="w-full text-left bg-white border border-[#E5E0D8] rounded-xl px-4 py-4 flex items-center gap-4 hover:border-[#18345C] transition-colors"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#F8F6F0] flex flex-col items-center justify-center shrink-0 text-[#18345C]">
                    <BedIcon size={16} />
                    <span className="text-[11px] font-bold mt-0.5">{hab?.numero ?? '—'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[16px] font-semibold text-[#18345C]">{h?.nombre ?? 'Huésped'}</p>
                      <Chip cls={meta.chip}>{meta.label}</Chip>
                    </div>
                    <p className="text-[13px] text-[#6B7280] mt-1">
                      {r.codigo} · {h?.tipoDocumento} {h?.documento}
                    </p>
                    <p className="text-[13px] text-[#AEBCC1] mt-1 flex items-center gap-1.5 flex-wrap">
                      <CalendarIcon size={12} />
                      {formatoFecha(r.fechaEntrada)} → {formatoFecha(r.fechaSalida)} · {r.personas} pers. · {r.tipoHabitacion}
                    </p>
                  </div>
                  <span className="text-[13px] text-[#18345C] font-semibold shrink-0">Ver ›</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
