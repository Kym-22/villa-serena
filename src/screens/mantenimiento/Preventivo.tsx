import { useState } from 'react';
import type { TareaPreventiva, Activo, OrdenTrabajo } from '../../types';
import { formatoFecha } from '../../data';
import {
  Chip,
  FRECUENCIA_LABEL,
  diasHastaFecha,
  esTerminalOT,
  Cabecera,
  Kpi,
  BotonFiltro,
  Vacio,
  AlertIcon,
  CalendarIcon,
} from './mantUtils';

type Filtro = 'todas' | 'vencidas' | 'proximas' | 'inactivas';
const DIAS_PROXIMA = 7;

interface Props {
  tareas: TareaPreventiva[];
  activos: Activo[];
  ordenes: OrdenTrabajo[];
  onGenerarOrden: (tareaId: string) => void;
  onToggleActiva: (id: string) => void;
}

export default function Preventivo({ tareas, activos, ordenes, onGenerarOrden, onToggleActiva }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const activas = tareas.filter(t => t.activa);
  const vencidas = activas.filter(t => diasHastaFecha(t.proximaEjecucion) < 0);
  const proximas = activas.filter(t => {
    const d = diasHastaFecha(t.proximaEjecucion);
    return d >= 0 && d <= DIAS_PROXIMA;
  });

  const nombreActivo = (id: string | null) => activos.find(a => a.id === id)?.nombre ?? null;

  // Orden abierta generada desde esta tarea, si existe.
  const ordenDe = (tareaId: string) =>
    ordenes.find(o => o.tareaPreventivaId === tareaId && !esTerminalOT(o.estado)) ?? null;

  const visibles = tareas
    .filter(t => {
      if (filtro === 'todas') return true;
      if (filtro === 'inactivas') return !t.activa;
      if (!t.activa) return false;
      const d = diasHastaFecha(t.proximaEjecucion);
      if (filtro === 'vencidas') return d < 0;
      return d >= 0 && d <= DIAS_PROXIMA;
    })
    .sort((a, b) => {
      if (a.activa !== b.activa) return a.activa ? -1 : 1;
      return a.proximaEjecucion.localeCompare(b.proximaEjecucion);
    });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera
        titulo="Mantenimiento preventivo"
        subtitulo={`${activas.length} tareas activas en el plan`}
      />

      <div className="px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi valor={String(tareas.length)} label="Tareas en el plan" />
          <Kpi valor={String(vencidas.length)} label="Vencidas" color={vencidas.length ? '#991B1B' : '#166534'} />
          <Kpi valor={String(proximas.length)} label={`Próximos ${DIAS_PROXIMA} días`} color={proximas.length ? '#9A3412' : '#166534'} />
          <Kpi valor={String(tareas.length - activas.length)} label="Desactivadas" />
        </div>
      </div>

      {vencidas.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
            <p className="text-[13px] font-semibold text-[#991B1B] flex items-center gap-2">
              <AlertIcon /> Tareas vencidas ({vencidas.length})
            </p>
            <p className="text-[13px] text-[#7F1D1D] mt-1">
              {vencidas.map(t => `${t.nombre} (${Math.abs(diasHastaFecha(t.proximaEjecucion))} días)`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 pt-5 flex gap-2 flex-wrap">
        <BotonFiltro activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</BotonFiltro>
        <BotonFiltro activo={filtro === 'vencidas'} onClick={() => setFiltro('vencidas')}>Vencidas</BotonFiltro>
        <BotonFiltro activo={filtro === 'proximas'} onClick={() => setFiltro('proximas')}>Próximas</BotonFiltro>
        <BotonFiltro activo={filtro === 'inactivas'} onClick={() => setFiltro('inactivas')}>Desactivadas</BotonFiltro>
      </div>

      <div className="px-4 sm:px-6 py-5">
        {visibles.length === 0 ? (
          <Vacio msg="Ninguna tarea coincide con el filtro seleccionado." />
        ) : (
          <div className="space-y-3">
            {visibles.map(t => {
              const dias = diasHastaFecha(t.proximaEjecucion);
              const vencida = t.activa && dias < 0;
              const proxima = t.activa && dias >= 0 && dias <= DIAS_PROXIMA;
              const orden = ordenDe(t.id);

              return (
                <div
                  key={t.id}
                  className={`bg-white border rounded-xl px-4 py-4 ${
                    vencida ? 'border-[#FCA5A5]' : 'border-[#E5E0D8]'
                  } ${!t.activa ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
                      <CalendarIcon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[16px] font-semibold text-[#18345C]">{t.nombre}</p>
                        <Chip cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">{FRECUENCIA_LABEL[t.frecuencia]}</Chip>
                        {vencida && <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Vencida</Chip>}
                        {proxima && <Chip cls="bg-[#FFFBEF] text-[#78450A] border-[#F3D98B]">Próxima</Chip>}
                        {!t.activa && <Chip cls="bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]">Desactivada</Chip>}
                        {orden && <Chip cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">{orden.codigo}</Chip>}
                      </div>

                      <p className="text-[14px] text-[#6B7280] mt-1">
                        {t.ubicacion}
                        {nombreActivo(t.activoId) && ` · ${nombreActivo(t.activoId)}`}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap mt-2 text-[12px] text-[#AEBCC1]">
                        <span className={vencida ? 'text-[#991B1B] font-semibold' : ''}>
                          Próxima: {formatoFecha(t.proximaEjecucion)}
                          {t.activa &&
                            (dias < 0
                              ? ` · ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'} de retraso`
                              : dias === 0
                                ? ' · hoy'
                                : ` · en ${dias} día${dias === 1 ? '' : 's'}`)}
                        </span>
                        {t.ultimaEjecucion && <span>Última: {formatoFecha(t.ultimaEjecucion)}</span>}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 flex gap-2 flex-wrap">
                      <button
                        onClick={() => onToggleActiva(t.id)}
                        className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
                      >
                        {t.activa ? 'Desactivar' : 'Activar'}
                      </button>
                      {t.activa && !orden && (
                        <button
                          onClick={() => onGenerarOrden(t.id)}
                          className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
                        >
                          Generar orden
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
