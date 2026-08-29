import type { Pedido, TurnoRS } from '../../types';
import { formatoHoraISO, formatoDuracion, minutosEntre, TURNOS_HORARIO } from '../../data';
import {
  ChipEstado,
  ESTADO_META,
  BedIcon,
  ClockIcon,
  PhoneIcon,
  PlusIcon,
  precio,
  totalLineas,
} from './rsUtils';

interface Props {
  pedidos: Pedido[];
  turno: TurnoRS;
  onAbrirDetalle: (id: string) => void;
  onNuevoTelefonico: () => void;
  onSimularEntrante: () => void;
}

// Un pedido está "pendiente de atender" mientras no se haya entregado ni cancelado.
const ESTADOS_ACTIVOS: Pedido['estado'][] = ['nuevo', 'en-preparacion', 'en-camino'];

export default function PedidosPendientes({
  pedidos,
  turno,
  onAbrirDetalle,
  onNuevoTelefonico,
  onSimularEntrante,
}: Props) {
  const pendientes = pedidos
    .filter(p => p.turno === turno && ESTADOS_ACTIVOS.includes(p.estado))
    // Ordenados por antigüedad: el más antiguo (más urgente) primero.
    .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime());

  const nuevos = pendientes.filter(p => p.estado === 'nuevo').length;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      {/* Cabecera */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Pedidos pendientes</h1>
            <p className="text-[15px] text-[#AEBCC1] mt-1">
              Turno de {turno} · {TURNOS_HORARIO[turno]} · {pendientes.length} por atender
              {nuevos > 0 && <> · {nuevos} nuevo{nuevos !== 1 ? 's' : ''}</>}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onSimularEntrante}
              className="flex items-center gap-2 px-3 py-2.5 text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
            >
              <BedIcon size={15} />
              Simular pedido de la app
            </button>
            <button
              onClick={onNuevoTelefonico}
              className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
            >
              <PhoneIcon />
              Registrar pedido telefónico
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda de estados */}
      <div className="px-4 sm:px-6 pt-4 flex flex-wrap gap-3">
        {(['nuevo', 'en-preparacion', 'en-camino'] as const).map(e => (
          <span key={e} className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ESTADO_META[e].dot }} />
            {ESTADO_META[e].label}
          </span>
        ))}
      </div>

      {/* Lista */}
      <div className="px-4 sm:px-6 py-5">
        {pendientes.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-10 text-center">
            <p className="text-[15px] text-[#AEBCC1]">No hay pedidos pendientes en tu turno.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendientes.map((p, idx) => {
              const meta = ESTADO_META[p.estado];
              const minutos = minutosEntre(p.creadoEn);
              const total = totalLineas(p.lineas);
              const primero = idx === 0;
              return (
                <button
                  key={p.id}
                  onClick={() => onAbrirDetalle(p.id)}
                  className="w-full text-left bg-white border border-[#E5E0D8] rounded-xl pl-0 pr-4 py-4 flex items-stretch gap-4 hover:border-[#18345C] transition-colors relative overflow-hidden"
                >
                  {/* Barra de color por estado */}
                  <span className="w-1.5 shrink-0" style={{ backgroundColor: meta.barra }} />

                  <div className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C] self-center">
                    <BedIcon size={18} />
                  </div>

                  <div className="flex-1 min-w-0 self-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[28px] font-semibold text-[#18345C] leading-none">{p.habitacionNumero}</p>
                      <span className="text-[13px] text-[#AEBCC1]">#{p.numero}</span>
                      <ChipEstado estado={p.estado} />
                      {primero && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]">
                          Atender primero
                        </span>
                      )}
                      {p.origen === 'telefono' && (
                        <span className="text-[#AEBCC1]" title="Pedido telefónico"><PhoneIcon size={13} /></span>
                      )}
                    </div>

                    <p className="text-[14px] text-[#6B7280] mt-1.5 truncate">
                      {p.lineas.map(l => `${l.cantidad}× ${l.nombre}`).join(' · ')}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap mt-1.5 text-[13px] text-[#AEBCC1]">
                      <span className="flex items-center gap-1">
                        <ClockIcon size={12} />
                        Pedido: {formatoHoraISO(p.creadoEn)}
                      </span>
                      <span>Hace {formatoDuracion(minutos)}</span>
                    </div>
                  </div>

                  <div className="self-center text-right shrink-0">
                    <p className="text-[16px] font-bold text-[#18345C]">{precio(total)}</p>
                    <p className="text-[13px] text-[#18345C] font-medium mt-1">Ver detalle ›</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
