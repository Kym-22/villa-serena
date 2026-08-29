import { useState } from 'react';
import type { OrdenTrabajo, Empleado, EstadoOT, PrioridadIncidencia } from '../../types';
import { formatoFecha } from '../../data';
import {
  Chip,
  PRIORIDAD_META,
  ESTADO_OT_META,
  ORIGEN_LABEL,
  estaAtrasada,
  diasHastaFecha,
  esTerminalOT,
  Cabecera,
  Kpi,
  BotonFiltro,
  Vacio,
  Modal,
  PlusIcon,
  WrenchIcon,
  AlertIcon,
} from './mantUtils';

const ORDEN_PRIORIDAD: Record<PrioridadIncidencia, number> = { alta: 0, media: 1, baja: 2 };
const ESTADOS: EstadoOT[] = ['abierta', 'asignada', 'en-proceso', 'resuelta', 'cerrada', 'cancelada'];

interface Props {
  ordenes: OrdenTrabajo[];
  tecnicos: Empleado[];
  onAbrirOrden: (id: string) => void;
  onAsignar: (ordenId: string, tecnicoId: string) => void;
  onNuevaOrden: () => void;
}

export default function OrdenesTrabajo({ ordenes, tecnicos, onAbrirOrden, onAsignar, onNuevaOrden }: Props) {
  const [fEstado, setFEstado] = useState<EstadoOT | 'todos' | 'activas'>('activas');
  const [fPrioridad, setFPrioridad] = useState<PrioridadIncidencia | 'todas'>('todas');
  const [fTecnico, setFTecnico] = useState<string | 'todos'>('todos');
  const [soloAtrasadas, setSoloAtrasadas] = useState(false);
  const [asignando, setAsignando] = useState<OrdenTrabajo | null>(null);

  const nombreTecnico = (id: string | null) => tecnicos.find(t => t.id === id)?.nombre ?? null;
  const cargaDe = (id: string) => ordenes.filter(o => o.tecnicoId === id && !esTerminalOT(o.estado)).length;

  const abiertas = ordenes.filter(o => o.estado === 'abierta');
  const enCurso = ordenes.filter(o => o.estado === 'asignada' || o.estado === 'en-proceso');
  const atrasadas = ordenes.filter(estaAtrasada);
  const cerradas = ordenes.filter(o => o.estado === 'cerrada');

  const visibles = ordenes
    .filter(o => {
      if (fEstado === 'todos') return true;
      if (fEstado === 'activas') return !esTerminalOT(o.estado);
      return o.estado === fEstado;
    })
    .filter(o => fPrioridad === 'todas' || o.prioridad === fPrioridad)
    .filter(o => fTecnico === 'todos' || o.tecnicoId === fTecnico)
    .filter(o => !soloAtrasadas || estaAtrasada(o))
    .sort((a, b) => {
      const atrA = estaAtrasada(a) ? 0 : 1;
      const atrB = estaAtrasada(b) ? 0 : 1;
      if (atrA !== atrB) return atrA - atrB;
      const terA = esTerminalOT(a.estado) ? 1 : 0;
      const terB = esTerminalOT(b.estado) ? 1 : 0;
      if (terA !== terB) return terA - terB;
      return ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
    });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera titulo="Órdenes de trabajo" subtitulo={`${ordenes.length} órdenes registradas`}>
        <button
          onClick={onNuevaOrden}
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
        >
          <PlusIcon /> Nueva orden
        </button>
      </Cabecera>

      <div className="px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi valor={String(abiertas.length)} label="Sin asignar" color={abiertas.length ? '#9A3412' : '#166534'} />
          <Kpi valor={String(enCurso.length)} label="En curso" />
          <Kpi valor={String(atrasadas.length)} label="Atrasadas" color={atrasadas.length ? '#991B1B' : '#166534'} />
          <Kpi valor={String(cerradas.length)} label="Cerradas" color="#166534" />
        </div>
      </div>

      {atrasadas.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
            <p className="text-[13px] font-semibold text-[#991B1B] flex items-center gap-2">
              <AlertIcon /> Órdenes atrasadas ({atrasadas.length})
            </p>
            <p className="text-[13px] text-[#7F1D1D] mt-1">
              {atrasadas.map(o => `${o.codigo} · ${o.ubicacion}`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="px-4 sm:px-6 pt-5 space-y-2">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[11px] text-[#AEBCC1] uppercase tracking-widest w-full sm:w-auto sm:mr-1">Estado</span>
          <BotonFiltro activo={fEstado === 'activas'} onClick={() => setFEstado('activas')}>En curso</BotonFiltro>
          <BotonFiltro activo={fEstado === 'todos'} onClick={() => setFEstado('todos')}>Todas</BotonFiltro>
          {ESTADOS.map(e => (
            <BotonFiltro key={e} activo={fEstado === e} onClick={() => setFEstado(e)}>
              {ESTADO_OT_META[e].label}
            </BotonFiltro>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[11px] text-[#AEBCC1] uppercase tracking-widest w-full sm:w-auto sm:mr-1">Técnico</span>
          <BotonFiltro activo={fTecnico === 'todos'} onClick={() => setFTecnico('todos')}>Todos</BotonFiltro>
          {tecnicos.map(t => (
            <BotonFiltro key={t.id} activo={fTecnico === t.id} onClick={() => setFTecnico(t.id)}>
              {t.nombre} ({cargaDe(t.id)})
            </BotonFiltro>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[11px] text-[#AEBCC1] uppercase tracking-widest w-full sm:w-auto sm:mr-1">Prioridad</span>
          <BotonFiltro activo={fPrioridad === 'todas'} onClick={() => setFPrioridad('todas')}>Todas</BotonFiltro>
          {(['alta', 'media', 'baja'] as PrioridadIncidencia[]).map(p => (
            <BotonFiltro key={p} activo={fPrioridad === p} onClick={() => setFPrioridad(p)}>
              {PRIORIDAD_META[p].label}
            </BotonFiltro>
          ))}
          <BotonFiltro activo={soloAtrasadas} onClick={() => setSoloAtrasadas(v => !v)}>Solo atrasadas</BotonFiltro>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 sm:px-6 py-5">
        {visibles.length === 0 ? (
          <Vacio msg="Ninguna orden coincide con los filtros seleccionados." />
        ) : (
          <div className="space-y-3">
            {visibles.map(o => {
              const em = ESTADO_OT_META[o.estado];
              const pm = PRIORIDAD_META[o.prioridad];
              const atrasada = estaAtrasada(o);
              const dias = diasHastaFecha(o.fechaCompromiso);
              const tecnico = nombreTecnico(o.tecnicoId);

              return (
                <div
                  key={o.id}
                  className={`bg-white border rounded-xl overflow-hidden ${atrasada ? 'border-[#FCA5A5]' : 'border-[#E5E0D8]'}`}
                >
                  <button
                    onClick={() => onAbrirOrden(o.id)}
                    className="w-full text-left px-4 py-4 hover:bg-[#FCFBF8] transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#F8F6F0', color: em.dot }}
                      >
                        <WrenchIcon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[17px] font-bold text-[#18345C] leading-none">{o.codigo}</p>
                          <Chip cls={em.chip}>{em.label}</Chip>
                          <Chip cls={pm.chip}>{pm.label}</Chip>
                          {atrasada && <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Atrasada</Chip>}
                          {o.impideUso && !esTerminalOT(o.estado) && (
                            <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Impide el uso</Chip>
                          )}
                        </div>

                        <p className="text-[15px] font-medium text-[#18345C] mt-2">
                          {o.esHabitacion ? `Habitación ${o.ubicacion}` : o.ubicacion} · {o.tipo}
                        </p>
                        <p className="text-[14px] text-[#6B7280] mt-0.5 line-clamp-2">{o.descripcion}</p>

                        <div className="flex items-center gap-3 flex-wrap mt-2 text-[12px] text-[#AEBCC1]">
                          <span>{ORIGEN_LABEL[o.origen]}</span>
                          <span>
                            Compromiso: {formatoFecha(o.fechaCompromiso)}
                            {!esTerminalOT(o.estado) && o.estado !== 'resuelta' && (
                              <span className={atrasada ? 'text-[#991B1B] font-semibold' : ''}>
                                {atrasada
                                  ? ` · ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'} de retraso`
                                  : dias === 0
                                    ? ' · hoy'
                                    : ` · en ${dias} día${dias === 1 ? '' : 's'}`}
                              </span>
                            )}
                          </span>
                          <span className={tecnico ? '' : 'text-[#9A3412] font-semibold'}>
                            {tecnico ? `Técnico: ${tecnico}` : 'Sin técnico asignado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {!esTerminalOT(o.estado) && (
                    <div className="px-4 pb-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => setAsignando(o)}
                        className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
                      >
                        {o.tecnicoId ? 'Reasignar' : 'Asignar técnico'}
                      </button>
                      <button
                        onClick={() => onAbrirOrden(o.id)}
                        className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
                      >
                        Abrir detalle
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {asignando && (
        <ModalAsignar
          orden={asignando}
          tecnicos={tecnicos}
          cargaDe={cargaDe}
          onCerrar={() => setAsignando(null)}
          onAsignar={id => {
            onAsignar(asignando.id, id);
            setAsignando(null);
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   HU-4 · Asignar la orden a un técnico
   ========================================================= */

function ModalAsignar({
  orden,
  tecnicos,
  cargaDe,
  onCerrar,
  onAsignar,
}: {
  orden: OrdenTrabajo;
  tecnicos: Empleado[];
  cargaDe: (id: string) => number;
  onCerrar: () => void;
  onAsignar: (tecnicoId: string) => void;
}) {
  return (
    <Modal
      titulo={orden.tecnicoId ? 'Reasignar orden' : 'Asignar técnico'}
      subtitulo={`${orden.codigo} · ${orden.esHabitacion ? `Habitación ${orden.ubicacion}` : orden.ubicacion}`}
      onCerrar={onCerrar}
      ancho="sm:max-w-lg"
    >
      <div className="space-y-3">
        <p className="text-[13px] text-[#6B7280]">
          El número entre paréntesis es la carga actual de cada técnico: órdenes que aún tiene sin cerrar.
        </p>

        {tecnicos.length === 0 ? (
          <Vacio msg="No hay técnicos activos con rol de Mantenimiento." />
        ) : (
          tecnicos.map(t => {
            const carga = cargaDe(t.id);
            const actual = orden.tecnicoId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onAsignar(t.id)}
                disabled={actual}
                className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg border text-left transition-colors ${
                  actual
                    ? 'border-[#86EFAC] bg-[#F0FAF4] cursor-default'
                    : 'border-[#E5E0D8] bg-white hover:border-[#18345C] hover:bg-[#F8F6F0]'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold"
                  style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                >
                  {t.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#18345C] truncate">{t.nombre}</p>
                  <p className="text-[12px] text-[#6B7280]">
                    Turno de {t.turno.toLowerCase()} · {carga} orden{carga === 1 ? '' : 'es'} en curso
                  </p>
                </div>
                {actual ? (
                  <Chip cls="bg-[#F0FAF4] text-[#166534] border-[#86EFAC]">Actual</Chip>
                ) : (
                  <span className="text-[#AEBCC1] text-lg shrink-0">›</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
