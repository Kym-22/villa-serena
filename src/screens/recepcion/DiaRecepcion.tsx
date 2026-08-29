import { useMemo } from 'react';
import type { Reserva, Huesped, HabitacionHotel, SeccionRecepcion } from '../../types';
import { fechaHoyISO, fechaRelativaISO, formatoFecha } from '../../data';
import { Chip, RESERVA_META, habitacionesDisponibles, BedIcon, CalendarIcon } from './recUtils';

interface Props {
  reservas: Reserva[];
  huespedes: Huesped[];
  habitaciones: HabitacionHotel[];
  onAbrirReserva: (id: string) => void;
  onIr: (s: SeccionRecepcion) => void;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export default function DiaRecepcion({ reservas, huespedes, habitaciones, onAbrirReserva, onIr }: Props) {
  const hoy = fechaHoyISO();
  const d = new Date();
  const titulo = `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;

  const huespedDe = useMemo(() => {
    const m = new Map<string, Huesped>();
    huespedes.forEach(h => m.set(h.id, h));
    return m;
  }, [huespedes]);

  const llegadas = reservas
    .filter(r => r.fechaEntrada === hoy && (r.estado === 'confirmada' || r.estado === 'pendiente'))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const salidas = reservas
    .filter(r => r.fechaSalida === hoy && r.estado === 'en-curso')
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const pendientes = reservas.filter(r => r.estado === 'pendiente');

  const libresHoy = habitacionesDisponibles(hoy, fechaRelativaISO(1), habitaciones, reservas).length;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="bg-[#18345C] px-4 sm:px-8 py-6">
        <p className="text-[#AEBCC1] text-[10px] tracking-widest uppercase mb-1">{titulo}</p>
        <h1 className="text-white text-[32px] font-semibold leading-tight">Recepción · vista del día</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat valor={llegadas.length} label="Check-in de hoy" />
          <Stat valor={salidas.length} label="Check-out de hoy" />
          <Stat valor={pendientes.length} label="Reservas pendientes" />
          <Stat valor={libresHoy} label="Habitaciones libres hoy" />
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-7">
        <Bloque
          titulo="Entradas programadas (check-in)"
          vacio="No hay llegadas para hoy."
          items={llegadas}
          huespedDe={huespedDe}
          habitaciones={habitaciones}
          onAbrirReserva={onAbrirReserva}
        />
        <Bloque
          titulo="Salidas programadas (check-out)"
          vacio="No hay salidas para hoy."
          items={salidas}
          huespedDe={huespedDe}
          habitaciones={habitaciones}
          onAbrirReserva={onAbrirReserva}
        />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-semibold text-[#18345C]">Reservas pendientes de confirmar</h2>
            <button onClick={() => onIr('reservas')} className="text-[13px] font-semibold text-[#18345C] hover:underline">
              Ver reservas ›
            </button>
          </div>
          {pendientes.length === 0 ? (
            <p className="text-[13px] text-[#AEBCC1]">Todo confirmado.</p>
          ) : (
            <div className="space-y-2">
              {pendientes.map(r => {
                const h = huespedDe.get(r.huespedId);
                return (
                  <button
                    key={r.id}
                    onClick={() => onAbrirReserva(r.id)}
                    className="w-full text-left bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#18345C] transition-colors"
                  >
                    <span className="w-9 h-9 rounded-lg bg-[#F8F6F0] flex items-center justify-center text-[#18345C] shrink-0">
                      <CalendarIcon size={15} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#18345C]">{h?.nombre ?? 'Huésped'}</p>
                      <p className="text-[12px] text-[#AEBCC1]">
                        {r.codigo} · {formatoFecha(r.fechaEntrada)} → {formatoFecha(r.fechaSalida)} · {r.tipoHabitacion}
                      </p>
                    </div>
                    <Chip cls={RESERVA_META[r.estado].chip}>{RESERVA_META[r.estado].label}</Chip>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-[#102747] rounded-lg py-3 px-2 gap-1">
      <span className="text-2xl sm:text-3xl font-bold leading-none text-[#D8B94E]">{valor}</span>
      <span className="text-[9px] sm:text-[10px] text-center leading-tight text-[#AEBCC1]">{label}</span>
    </div>
  );
}

function Bloque({
  titulo,
  vacio,
  items,
  huespedDe,
  habitaciones,
  onAbrirReserva,
}: {
  titulo: string;
  vacio: string;
  items: Reserva[];
  huespedDe: Map<string, Huesped>;
  habitaciones: HabitacionHotel[];
  onAbrirReserva: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="text-[20px] font-semibold text-[#18345C] mb-3">{titulo}</h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-[#AEBCC1]">{vacio}</p>
      ) : (
        <div className="space-y-2">
          {items.map(r => {
            const h = huespedDe.get(r.huespedId);
            const hab = habitaciones.find(x => x.id === r.habitacionId);
            return (
              <button
                key={r.id}
                onClick={() => onAbrirReserva(r.id)}
                className="w-full text-left bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#18345C] transition-colors"
              >
                <span className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex flex-col items-center justify-center text-[#18345C] shrink-0">
                  <BedIcon size={15} />
                  <span className="text-[10px] font-bold">{hab?.numero ?? '—'}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#18345C]">{h?.nombre ?? 'Huésped'}</p>
                  <p className="text-[12px] text-[#AEBCC1]">
                    {r.codigo} · {r.personas} pers. · {r.tipoHabitacion}
                  </p>
                </div>
                <Chip cls={RESERVA_META[r.estado].chip}>{RESERVA_META[r.estado].label}</Chip>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
