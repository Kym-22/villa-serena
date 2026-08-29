import { useState } from 'react';
import type { HabitacionHotel, Reserva, Huesped, EstadoHabHotel } from '../../types';
import { formatoFecha } from '../../data';
import {
  Chip,
  HAB_META,
  HAB_TRANSICIONES,
  validarCambioEstadoHab,
  BedIcon,
} from './recUtils';

interface Props {
  habitaciones: HabitacionHotel[];
  reservas: Reserva[];
  huespedes: Huesped[];
  onCambiarEstado: (habId: string, nuevo: EstadoHabHotel) => void;
}

const ESTADOS: EstadoHabHotel[] = ['disponible', 'reservada', 'ocupada', 'en-limpieza', 'mantenimiento'];

export default function HabitacionesRecepcion({ habitaciones, reservas, huespedes, onCambiarEstado }: Props) {
  const [filtro, setFiltro] = useState<EstadoHabHotel | 'todas'>('todas');
  const [aviso, setAviso] = useState<string>('');

  const conteo = (e: EstadoHabHotel) => habitaciones.filter(h => h.estado === e).length;
  const visibles = habitaciones
    .filter(h => filtro === 'todas' || h.estado === filtro)
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
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Estado de habitaciones</h1>
        <p className="text-[15px] text-[#AEBCC1] mt-1">{habitaciones.length} habitaciones</p>

        <div className="flex gap-2 flex-wrap mt-4">
          <BotonFiltro activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>
            Todas ({habitaciones.length})
          </BotonFiltro>
          {ESTADOS.map(e => (
            <BotonFiltro key={e} activo={filtro === e} onClick={() => setFiltro(e)}>
              {HAB_META[e].label} ({conteo(e)})
            </BotonFiltro>
          ))}
        </div>
      </div>

      {aviso && (
        <div className="mx-4 sm:mx-6 mt-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] rounded-lg px-4 py-2.5">
          {aviso}
        </div>
      )}

      <div className="px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibles.map(h => {
            const enCurso = reservas.find(r => r.habitacionId === h.id && r.estado === 'en-curso');
            const huesped = enCurso ? huespedes.find(x => x.id === enCurso.huespedId) : null;
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

                {enCurso && (
                  <p className="text-[12px] text-[#6B7280] mt-3 border-t border-[#F0EBE3] pt-2">
                    {huesped?.nombre ?? 'Huésped'} · sale {formatoFecha(enCurso.fechaSalida)}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-[#F0EBE3]">
                  <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">Cambiar estado</p>
                  <div className="flex flex-wrap gap-2">
                    {HAB_TRANSICIONES[h.estado].length === 0 ? (
                      <span className="text-[12px] text-[#AEBCC1]">Sin cambios disponibles</span>
                    ) : (
                      HAB_TRANSICIONES[h.estado].map(nuevo => (
                        <button
                          key={nuevo}
                          onClick={() => intentarCambio(h, nuevo)}
                          className="text-[12px] font-semibold px-2.5 py-1 rounded-md border border-[#E5E0D8] text-[#18345C] hover:bg-[#18345C] hover:text-white transition-colors"
                        >
                          {HAB_META[nuevo].label}
                        </button>
                      ))
                    )}
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
        activo
          ? 'bg-[#18345C] text-white border-[#18345C]'
          : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
      }`}
    >
      {children}
    </button>
  );
}
