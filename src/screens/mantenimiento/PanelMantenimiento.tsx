import { useState } from 'react';
import type { OrdenTrabajo, HabitacionHotel, Incidencia, Empleado, PrioridadIncidencia } from '../../types';
import { formatoDuracion, fechaRelativaISO } from '../../data';
import {
  Chip,
  dinero,
  PRIORIDAD_META,
  ESTADO_OT_META,
  TIPOS_AVERIA,
  estaAtrasada,
  esTerminalOT,
  costoRepuestos,
  diasHastaFecha,
  Cabecera,
  Kpi,
  BotonFiltro,
  Vacio,
  AlertIcon,
  BedIcon,
} from './mantUtils';

type Periodo = '7d' | '30d' | 'todo';

const PERIODOS: { id: Periodo; label: string; dias: number | null }[] = [
  { id: '7d', label: 'Últimos 7 días', dias: 7 },
  { id: '30d', label: 'Últimos 30 días', dias: 30 },
  { id: 'todo', label: 'Todo', dias: null },
];

interface Props {
  ordenes: OrdenTrabajo[];
  habitaciones: HabitacionHotel[];
  incidencias: Incidencia[];
  tecnicos: Empleado[];
  onLiberarHabitacion: (numero: string) => void;
  onAbrirOrden: (id: string) => void;
}

export default function PanelMantenimiento({
  ordenes,
  habitaciones,
  incidencias,
  tecnicos,
  onLiberarHabitacion,
  onAbrirOrden,
}: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('30d');

  const def = PERIODOS.find(p => p.id === periodo)!;
  const desde = def.dias === null ? null : fechaRelativaISO(-def.dias);
  const enPeriodo = (o: OrdenTrabajo) => (desde === null ? true : o.creadaEn.slice(0, 10) >= desde);

  const delPeriodo = ordenes.filter(enPeriodo);

  const abiertas = ordenes.filter(o => !esTerminalOT(o.estado));
  const atrasadas = ordenes.filter(estaAtrasada);
  const cerradas = delPeriodo.filter(o => o.estado === 'cerrada');
  const sinAtender = incidencias.filter(i => i.estado === 'pendiente');

  const conTiempo = delPeriodo.filter(o => o.minutosEmpleados != null);
  const tiempoMedio = conTiempo.length
    ? Math.round(conTiempo.reduce((s, o) => s + (o.minutosEmpleados ?? 0), 0) / conTiempo.length)
    : 0;

  const costoTotal = delPeriodo.reduce((s, o) => s + costoRepuestos(o), 0);

  // Habitaciones que Mantenimiento tiene fuera de servicio (HU-8).
  const bloqueadas = habitaciones.filter(h => h.estado === 'mantenimiento');
  const ordenBloqueo = (numero: string) =>
    ordenes.find(o => o.esHabitacion && o.ubicacion === numero && o.impideUso && !esTerminalOT(o.estado)) ?? null;

  // Distribuciones
  const porTipo = TIPOS_AVERIA.map(t => ({ tipo: t, n: delPeriodo.filter(o => o.tipo === t).length })).filter(x => x.n > 0);
  const maxTipo = Math.max(1, ...porTipo.map(x => x.n));

  const prioridades: PrioridadIncidencia[] = ['alta', 'media', 'baja'];
  const porPrioridad = prioridades.map(p => ({ p, n: delPeriodo.filter(o => o.prioridad === p).length }));
  const maxPrioridad = Math.max(1, ...porPrioridad.map(x => x.n));

  const cargaTecnico = tecnicos.map(t => ({
    t,
    abiertas: ordenes.filter(o => o.tecnicoId === t.id && !esTerminalOT(o.estado)).length,
    cerradas: delPeriodo.filter(o => o.tecnicoId === t.id && o.estado === 'cerrada').length,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera titulo="Panel del área" subtitulo={`${abiertas.length} órdenes en curso · ${def.label.toLowerCase()}`} />

      <div className="px-4 sm:px-6 pt-5 flex gap-2 flex-wrap">
        {PERIODOS.map(p => (
          <BotonFiltro key={p.id} activo={periodo === p.id} onClick={() => setPeriodo(p.id)}>
            {p.label}
          </BotonFiltro>
        ))}
      </div>

      <div className="px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Kpi valor={String(abiertas.length)} label="Órdenes en curso" />
          <Kpi valor={String(atrasadas.length)} label="Atrasadas" color={atrasadas.length ? '#991B1B' : '#166534'} />
          <Kpi valor={String(sinAtender.length)} label="Incidencias sin atender" color={sinAtender.length ? '#9A3412' : '#166534'} />
          <Kpi valor={String(cerradas.length)} label="Cerradas en el período" color="#166534" />
          <Kpi valor={tiempoMedio ? formatoDuracion(tiempoMedio) : '—'} label="Tiempo medio" />
          <Kpi valor={dinero(costoTotal)} label="Repuestos del período" />
        </div>
      </div>

      {/* HU-8 · Habitaciones fuera de servicio */}
      <div className="px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[20px] font-semibold text-[#18345C]">Habitaciones fuera de servicio</h2>
          {bloqueadas.length > 0 && (
            <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">{bloqueadas.length}</Chip>
          )}
        </div>

        {bloqueadas.length === 0 ? (
          <Vacio msg="Ninguna habitación está fuera de servicio en este momento." />
        ) : (
          <div className="space-y-3">
            {bloqueadas.map(h => {
              const orden = ordenBloqueo(h.numero);
              const dias = orden ? Math.abs(diasHastaFecha(orden.creadaEn.slice(0, 10))) : null;

              return (
                <div key={h.id} className="bg-white border border-[#FCA5A5] rounded-xl px-4 py-4">
                  <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] flex items-center justify-center shrink-0 text-[#991B1B]">
                      <BedIcon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[24px] font-semibold text-[#18345C] leading-none">{h.numero}</p>
                        <Chip cls="bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]">{h.tipo}</Chip>
                        {orden && <Chip cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">{orden.codigo}</Chip>}
                      </div>

                      <p className="text-[14px] text-[#6B7280] mt-2">
                        {orden ? orden.descripcion : 'Sin orden de trabajo asociada.'}
                      </p>

                      <p className="text-[12px] text-[#AEBCC1] mt-1">
                        {dias !== null && `Inhabilitada desde hace ${dias} día${dias === 1 ? '' : 's'}`}
                      </p>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 flex gap-2 flex-wrap">
                      {orden && (
                        <button
                          onClick={() => onAbrirOrden(orden.id)}
                          className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
                        >
                          Ver orden
                        </button>
                      )}
                      <button
                        onClick={() => onLiberarHabitacion(h.numero)}
                        className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
                      >
                        Liberar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-[13px] text-[#6B7280] px-1">
              Al liberar, la habitación pasa a <strong className="text-[#18345C]">En limpieza</strong> para que ese
              módulo la valide antes de volver a venderse.
            </p>
          </div>
        )}
      </div>

      {/* Atrasadas */}
      {atrasadas.length > 0 && (
        <div className="px-4 sm:px-6 pt-6">
          <h2 className="text-[20px] font-semibold text-[#18345C] mb-3">Requieren atención</h2>
          <div className="space-y-2">
            {atrasadas.map(o => {
              const em = ESTADO_OT_META[o.estado];
              const dias = Math.abs(diasHastaFecha(o.fechaCompromiso));
              return (
                <button
                  key={o.id}
                  onClick={() => onAbrirOrden(o.id)}
                  className="w-full flex items-center gap-3 bg-white border border-[#FCA5A5] rounded-xl px-4 py-3 min-h-[44px] text-left hover:bg-[#FFFBFB] transition-colors"
                >
                  <span className="text-[#991B1B] shrink-0"><AlertIcon size={16} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-[#18345C]">{o.codigo}</span>
                    <span className="text-[14px] text-[#6B7280]">
                      {' · '}{o.esHabitacion ? `Habitación ${o.ubicacion}` : o.ubicacion}
                    </span>
                    <span className="block text-[12px] text-[#991B1B] font-semibold">
                      {dias} día{dias === 1 ? '' : 's'} de retraso
                    </span>
                  </span>
                  <Chip cls={em.chip}>{em.label}</Chip>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* HU-12 · Distribuciones */}
      <div className="px-4 sm:px-6 py-6 grid gap-4 lg:grid-cols-2">
        <div className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-4">
          <h3 className="text-[16px] font-semibold text-[#18345C] mb-3">Órdenes por tipo de avería</h3>
          {porTipo.length === 0 ? (
            <p className="text-[14px] text-[#AEBCC1]">Sin órdenes en el período seleccionado.</p>
          ) : (
            <div className="space-y-2.5">
              {porTipo.map(({ tipo, n }) => (
                <Barra key={tipo} label={tipo} valor={n} max={maxTipo} color="#18345C" />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-4">
          <h3 className="text-[16px] font-semibold text-[#18345C] mb-3">Órdenes por prioridad</h3>
          {delPeriodo.length === 0 ? (
            <p className="text-[14px] text-[#AEBCC1]">Sin órdenes en el período seleccionado.</p>
          ) : (
            <div className="space-y-2.5">
              {porPrioridad.map(({ p, n }) => (
                <Barra key={p} label={PRIORIDAD_META[p].label} valor={n} max={maxPrioridad} color={PRIORIDAD_META[p].dot} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-4 lg:col-span-2">
          <h3 className="text-[16px] font-semibold text-[#18345C] mb-3">Carga por técnico</h3>
          {cargaTecnico.length === 0 ? (
            <p className="text-[14px] text-[#AEBCC1]">No hay técnicos activos con rol de Mantenimiento.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cargaTecnico.map(({ t, abiertas: ab, cerradas: ce }) => (
                <div key={t.id} className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold"
                    style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                  >
                    {t.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#18345C] truncate">{t.nombre}</p>
                    <p className="text-[12px] text-[#6B7280]">Turno de {t.turno.toLowerCase()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[18px] font-bold text-[#18345C] leading-none">{ab}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">en curso · {ce} cerradas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Barra({ label, valor, max, color }: { label: string; valor: number; max: number; color: string }) {
  const pct = Math.round((valor / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-[#1F2933]">{label}</span>
        <span className="text-[13px] font-semibold text-[#18345C]">{valor}</span>
      </div>
      <div className="h-2 bg-[#F8F6F0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
