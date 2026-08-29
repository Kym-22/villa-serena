import { useMemo } from 'react';
import type { Pedido } from '../../types';
import { formatoHoraISO, pisoDeHabitacion } from '../../data';
import { ChipEstado, BedIcon, precio, totalLineas } from './rsUtils';

interface Props {
  pedidos: Pedido[];
  onAbrirDetalle: (id: string) => void;
}

interface FolioHabitacion {
  habitacionNumero: string;
  huesped: string;
  piso: number;
  pedidos: Pedido[];
  total: number;
}

export default function Cargos({ pedidos, onAbrirDetalle }: Props) {
  // El folio agrupa los pedidos NO cancelados por habitación (HU-08).
  const folios = useMemo<FolioHabitacion[]>(() => {
    const map = new Map<string, FolioHabitacion>();
    for (const p of pedidos) {
      if (p.estado === 'cancelado') continue;
      const actual =
        map.get(p.habitacionNumero) ??
        {
          habitacionNumero: p.habitacionNumero,
          huesped: p.huesped,
          piso: p.piso || pisoDeHabitacion(p.habitacionNumero),
          pedidos: [],
          total: 0,
        };
      actual.pedidos.push(p);
      actual.total += totalLineas(p.lineas);
      map.set(p.habitacionNumero, actual);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.habitacionNumero.localeCompare(b.habitacionNumero)
    );
  }, [pedidos]);

  const totalGeneral = folios.reduce((s, f) => s + f.total, 0);
  const anulados = pedidos.filter(p => p.estado === 'cancelado').length;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      {/* Cabecera */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Cargos a habitaciones</h1>
        <p className="text-[15px] text-[#AEBCC1] mt-1">
          {folios.length} habitación(es) con consumo · total {precio(totalGeneral)}
          {anulados > 0 && <> · {anulados} pedido(s) anulado(s) sin cargo</>}
        </p>
        <p className="text-[13px] text-[#6B7280] mt-2">
          Cada pedido se carga automáticamente al folio de la habitación. Recepción lo cobra en el check-out.
        </p>
      </div>

      {/* Folios */}
      <div className="px-4 sm:px-6 py-5 space-y-4">
        {folios.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-10 text-center">
            <p className="text-[15px] text-[#AEBCC1]">Todavía no hay cargos de Room Service.</p>
          </div>
        ) : (
          folios.map(f => (
            <div key={f.habitacionNumero} className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#F8F6F0] border-b border-[#E5E0D8]">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-white border border-[#E5E0D8] flex items-center justify-center text-[#18345C]">
                    <BedIcon size={17} />
                  </span>
                  <div>
                    <p className="text-[20px] font-bold text-[#18345C] leading-none">
                      Habitación {f.habitacionNumero}
                    </p>
                    <p className="text-[13px] text-[#AEBCC1] mt-0.5">
                      Piso {f.piso} · {f.huesped}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Folio</p>
                  <p className="text-[22px] font-bold text-[#18345C] leading-none">{precio(f.total)}</p>
                </div>
              </div>

              <div className="divide-y divide-[#F0EBE3]">
                {f.pedidos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onAbrirDetalle(p.id)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#F8F6F0] transition-colors"
                  >
                    <span className="text-[13px] text-[#AEBCC1] w-14 shrink-0">#{p.numero}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-[#1F2933] truncate">
                        {p.lineas.map(l => `${l.cantidad}× ${l.nombre}`).join(' · ')}
                      </p>
                      <p className="text-[12px] text-[#AEBCC1]">{formatoHoraISO(p.creadoEn)}</p>
                    </div>
                    <ChipEstado estado={p.estado} />
                    <span className="text-[15px] font-semibold text-[#18345C] w-20 text-right shrink-0">
                      {precio(totalLineas(p.lineas))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
