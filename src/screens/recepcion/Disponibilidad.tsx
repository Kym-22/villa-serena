import { useMemo, useState } from 'react';
import type { HabitacionHotel, Reserva, TipoHabitacion } from '../../types';
import { fechaHoyISO, fechaRelativaISO, nochesEntre } from '../../data';
import { dinero, Campo, INPUT_CLS, BedIcon, habitacionesDisponibles } from './recUtils';

interface Props {
  habitaciones: HabitacionHotel[];
  reservas: Reserva[];
  onReservar: (preset: { entrada: string; salida: string; tipo: TipoHabitacion; habitacionId: string }) => void;
}

const TIPOS: (TipoHabitacion | 'Todos')[] = ['Todos', 'Standard', 'Superior', 'Deluxe', 'Suite Deluxe', 'Suite'];

export default function Disponibilidad({ habitaciones, reservas, onReservar }: Props) {
  const [entrada, setEntrada] = useState(fechaHoyISO());
  const [salida, setSalida] = useState(fechaRelativaISO(2));
  const [personas, setPersonas] = useState('1');
  const [tipo, setTipo] = useState<TipoHabitacion | 'Todos'>('Todos');

  const nPersonas = Math.max(1, Number(personas) || 1);
  const rangoValido = entrada < salida;
  const noches = rangoValido ? nochesEntre(entrada, salida) : 0;

  const resultados = useMemo(
    () =>
      rangoValido
        ? habitacionesDisponibles(entrada, salida, habitaciones, reservas, {
            personas: nPersonas,
            tipo: tipo === 'Todos' ? undefined : tipo,
          }).sort((a, b) => a.numero.localeCompare(b.numero))
        : [],
    [rangoValido, entrada, salida, habitaciones, reservas, nPersonas, tipo],
  );

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Consultar disponibilidad</h1>
        <p className="text-[15px] text-[#AEBCC1] mt-1">Habitaciones libres para un rango de fechas</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
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
            <select value={tipo} onChange={e => setTipo(e.target.value as TipoHabitacion | 'Todos')} className={INPUT_CLS}>
              {TIPOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Campo>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5">
        {!rangoValido ? (
          <p className="text-[14px] text-[#991B1B]">La fecha de salida debe ser posterior a la de entrada.</p>
        ) : (
          <>
            <p className="text-[14px] text-[#6B7280] mb-4">
              {resultados.length} habitación(es) disponible(s) · {noches} noche{noches !== 1 ? 's' : ''}
            </p>
            {resultados.length === 0 ? (
              <div className="bg-white border border-[#E5E0D8] rounded-xl p-10 text-center">
                <p className="text-[15px] text-[#AEBCC1]">No hay habitaciones libres con esos criterios.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {resultados.map(h => (
                  <div key={h.id} className="bg-white border border-[#E5E0D8] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center text-[#18345C]">
                        <BedIcon size={18} />
                      </span>
                      <div>
                        <p className="text-[22px] font-bold text-[#18345C] leading-none">{h.numero}</p>
                        <p className="text-[12px] text-[#AEBCC1] mt-0.5">{h.tipo} · Piso {h.piso}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EBE3]">
                      <div>
                        <p className="text-[13px] text-[#6B7280]">Hasta {h.capacidad} personas</p>
                        <p className="text-[18px] font-bold text-[#18345C]">
                          {dinero(h.precioNoche)} <span className="text-[12px] font-normal text-[#AEBCC1]">/ noche</span>
                        </p>
                        <p className="text-[12px] text-[#AEBCC1]">{dinero(h.precioNoche * noches)} por {noches} noche{noches !== 1 ? 's' : ''}</p>
                      </div>
                      <button
                        onClick={() =>
                          onReservar({ entrada, salida, tipo: h.tipo, habitacionId: h.id })
                        }
                        className="px-4 py-2 text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors shrink-0"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
