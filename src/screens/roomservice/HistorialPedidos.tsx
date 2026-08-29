import { useMemo, useState } from 'react';
import type { Pedido, TurnoRS } from '../../types';
import {
  formatoHoraISO,
  formatoDuracion,
  minutosEntre,
  pisoDeHabitacion,
} from '../../data';
import { ChipEstado, BedIcon, precio, totalLineas } from './rsUtils';

type FiltroEstado = 'todos' | 'entregado' | 'cancelado';

interface Props {
  pedidos: Pedido[];
  turno: TurnoRS;
}

function fechaLabel(iso: string): string {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return 'Hoy';
  if (d.toDateString() === ayer.toDateString()) return 'Ayer';
  return d.toLocaleDateString();
}

export default function HistorialPedidos({ pedidos, turno }: Props) {
  const [filtroFecha, setFiltroFecha] = useState('Todas');
  const [filtroHab, setFiltroHab] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');

  // Pedidos cerrados de mi turno (entregados o cancelados).
  const cerrados = useMemo(
    () =>
      pedidos
        .filter(p => p.turno === turno && (p.estado === 'entregado' || p.estado === 'cancelado'))
        .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()),
    [pedidos, turno]
  );

  const fechasDisponibles = useMemo(
    () => ['Todas', ...Array.from(new Set(cerrados.map(p => fechaLabel(p.creadoEn))))],
    [cerrados]
  );
  const habitacionesDisponibles = useMemo(
    () => ['Todas', ...Array.from(new Set(cerrados.map(p => p.habitacionNumero))).sort()],
    [cerrados]
  );

  const filtrados = cerrados.filter(p => {
    if (filtroFecha !== 'Todas' && fechaLabel(p.creadoEn) !== filtroFecha) return false;
    if (filtroHab !== 'Todas' && p.habitacionNumero !== filtroHab) return false;
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
    return true;
  });

  const entregados = filtrados.filter(p => p.estado === 'entregado');
  const promedio =
    entregados.length > 0
      ? Math.round(
          entregados.reduce((s, p) => s + minutosEntre(p.creadoEn, p.entregadoEn), 0) / entregados.length
        )
      : 0;

  function limpiar() {
    setFiltroFecha('Todas');
    setFiltroHab('Todas');
    setFiltroEstado('todos');
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      {/* Cabecera */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Historial de pedidos</h1>
            <p className="text-[14px] text-[#AEBCC1] mt-1">
              {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''} · turno de {turno}
              {entregados.length > 0 && <> · entrega promedio {formatoDuracion(promedio)}</>}
            </p>
          </div>
          <button
            onClick={limpiar}
            className="text-[13px] text-[#AEBCC1] hover:text-[#18345C] transition-colors font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <FiltroSelect label="Fecha" value={filtroFecha} options={fechasDisponibles} onChange={setFiltroFecha} />
          <FiltroSelect label="Habitación" value={filtroHab} options={habitacionesDisponibles} onChange={setFiltroHab} />
          <FiltroSelect
            label="Estado"
            value={filtroEstado}
            options={['todos', 'entregado', 'cancelado']}
            onChange={v => setFiltroEstado(v as FiltroEstado)}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 sm:px-6 py-5">
        {filtrados.length === 0 ? (
          <div className="text-center py-14 text-[#AEBCC1] text-[15px]">
            No hay pedidos cerrados con los filtros aplicados.
          </div>
        ) : (
          <>
            {/* Tabla — tablet y escritorio */}
            <div className="hidden sm:block bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-3 bg-[#F8F6F0] border-b border-[#E5E0D8] text-[11px] text-[#AEBCC1] uppercase tracking-widest font-medium">
                <div className="col-span-3">Habitación</div>
                <div className="col-span-2">Creado</div>
                <div className="col-span-2">Entregado</div>
                <div className="col-span-2">Tiempo total</div>
                <div className="col-span-2">Importe</div>
                <div className="col-span-1 text-right">Estado</div>
              </div>
              <div className="divide-y divide-[#F0EBE3]">
                {filtrados.map((p, i) => (
                  <div
                    key={p.id}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center ${i % 2 !== 0 ? 'bg-[#FDFCFA]' : ''}`}
                  >
                    <div className="col-span-3 flex items-center gap-2 text-[#18345C]">
                      <BedIcon size={16} />
                      <span className="text-[19px] font-semibold">{p.habitacionNumero}</span>
                      <span className="text-[12px] text-[#AEBCC1]">
                        #{p.numero} · P{pisoDeHabitacion(p.habitacionNumero)}
                      </span>
                    </div>
                    <div className="col-span-2 text-[14px] text-[#6B7280]">{formatoHoraISO(p.creadoEn)}</div>
                    <div className="col-span-2 text-[14px] text-[#6B7280]">
                      {p.entregadoEn ? formatoHoraISO(p.entregadoEn) : '—'}
                    </div>
                    <div className="col-span-2 text-[14px] font-medium text-[#1F2933]">
                      {p.estado === 'entregado'
                        ? formatoDuracion(minutosEntre(p.creadoEn, p.entregadoEn))
                        : '—'}
                    </div>
                    <div className="col-span-2 text-[14px] font-semibold text-[#18345C]">
                      {precio(totalLineas(p.lineas))}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ChipEstado estado={p.estado} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarjetas — móvil */}
            <div className="sm:hidden space-y-3">
              {filtrados.map(p => (
                <div key={p.id} className="bg-white border border-[#E5E0D8] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-[#18345C]">
                      <BedIcon size={16} />
                      <span className="text-[24px] font-semibold leading-none">{p.habitacionNumero}</span>
                      <span className="text-[12px] text-[#AEBCC1]">#{p.numero}</span>
                    </div>
                    <ChipEstado estado={p.estado} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-[13px] text-[#6B7280]">
                    <span>Creado: {formatoHoraISO(p.creadoEn)}</span>
                    <span>Entregado: {p.entregadoEn ? formatoHoraISO(p.entregadoEn) : '—'}</span>
                    <span className="font-medium text-[#1F2933]">
                      Total:{' '}
                      {p.estado === 'entregado'
                        ? formatoDuracion(minutosEntre(p.creadoEn, p.entregadoEn))
                        : '—'}
                    </span>
                    <span className="font-semibold text-[#18345C]">{precio(totalLineas(p.lineas))}</span>
                  </div>
                  {p.estado === 'cancelado' && p.motivoCancelacion && (
                    <p className="text-[12px] text-[#991B1B] mt-2 border-t border-[#F0EBE3] pt-2">
                      {p.motivoCancelacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FiltroSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-[#AEBCC1] uppercase tracking-widest whitespace-nowrap hidden sm:block">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-[#E5E0D8] rounded-md px-3 py-2 text-[14px] text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white capitalize"
      >
        {options.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
