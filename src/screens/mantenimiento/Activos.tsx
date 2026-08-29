import { useState } from 'react';
import type { Activo, OrdenTrabajo, CategoriaActivo, EstadoActivo } from '../../types';
import { formatoFecha } from '../../data';
import {
  Chip,
  dinero,
  ACTIVO_META,
  CATEGORIAS_ACTIVO,
  ESTADO_OT_META,
  costoRepuestos,
  Cabecera,
  Kpi,
  BotonFiltro,
  Vacio,
  Modal,
  BoxIcon,
} from './mantUtils';

// A partir de este número de intervenciones el activo se marca como recurrente.
const UMBRAL_RECURRENTE = 2;

interface Props {
  activos: Activo[];
  ordenes: OrdenTrabajo[];
  onCambiarEstado: (id: string, estado: EstadoActivo) => void;
  onAbrirOrden: (id: string) => void;
}

export default function Activos({ activos, ordenes, onCambiarEstado, onAbrirOrden }: Props) {
  const [filtro, setFiltro] = useState<CategoriaActivo | 'todas'>('todas');
  const [detalle, setDetalle] = useState<Activo | null>(null);

  const ordenesDe = (id: string) => ordenes.filter(o => o.activoId === id);
  const costoDe = (id: string) => ordenesDe(id).reduce((s, o) => s + costoRepuestos(o), 0);

  const operativos = activos.filter(a => a.estado === 'operativo');
  const fueraServicio = activos.filter(a => a.estado === 'fuera-servicio');
  const recurrentes = activos.filter(a => ordenesDe(a.id).length >= UMBRAL_RECURRENTE);

  const visibles = activos
    .filter(a => filtro === 'todas' || a.categoria === filtro)
    .sort((a, b) => ordenesDe(b.id).length - ordenesDe(a.id).length || a.nombre.localeCompare(b.nombre));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera titulo="Activos y equipos" subtitulo={`${activos.length} equipos registrados`} />

      <div className="px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi valor={String(activos.length)} label="Equipos" />
          <Kpi valor={String(operativos.length)} label="Operativos" color="#166534" />
          <Kpi valor={String(fueraServicio.length)} label="Fuera de servicio" color={fueraServicio.length ? '#991B1B' : '#166534'} />
          <Kpi valor={String(recurrentes.length)} label="Con fallas repetidas" color={recurrentes.length ? '#9A3412' : '#166534'} />
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-5 flex gap-2 flex-wrap">
        <BotonFiltro activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</BotonFiltro>
        {CATEGORIAS_ACTIVO.map(c => (
          <BotonFiltro key={c} activo={filtro === c} onClick={() => setFiltro(c)}>{c}</BotonFiltro>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-5">
        {visibles.length === 0 ? (
          <Vacio msg="No hay equipos en esta categoría." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibles.map(a => {
              const intervenciones = ordenesDe(a.id).length;
              const am = ACTIVO_META[a.estado];
              return (
                <button
                  key={a.id}
                  onClick={() => setDetalle(a)}
                  className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-4 text-left hover:border-[#18345C] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
                      <BoxIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#18345C] leading-tight">{a.nombre}</p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5">{a.ubicacion} · {a.categoria}</p>

                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <Chip cls={am.chip}>{am.label}</Chip>
                        {intervenciones >= UMBRAL_RECURRENTE && (
                          <Chip cls="bg-[#FFF7ED] text-[#9A3412] border-[#FDBA74]">Recurrente</Chip>
                        )}
                      </div>

                      <p className="text-[12px] text-[#AEBCC1] mt-2">
                        {intervenciones} intervención{intervenciones === 1 ? '' : 'es'}
                        {costoDe(a.id) > 0 && ` · ${dinero(costoDe(a.id))} en repuestos`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {detalle && (
        <ModalActivo
          activo={detalle}
          ordenes={ordenesDe(detalle.id)}
          costo={costoDe(detalle.id)}
          onCerrar={() => setDetalle(null)}
          onCambiarEstado={estado => onCambiarEstado(detalle.id, estado)}
          onAbrirOrden={id => {
            setDetalle(null);
            onAbrirOrden(id);
          }}
        />
      )}
    </div>
  );
}

function ModalActivo({
  activo,
  ordenes,
  costo,
  onCerrar,
  onCambiarEstado,
  onAbrirOrden,
}: {
  activo: Activo;
  ordenes: OrdenTrabajo[];
  costo: number;
  onCerrar: () => void;
  onCambiarEstado: (estado: EstadoActivo) => void;
  onAbrirOrden: (id: string) => void;
}) {
  const estados: EstadoActivo[] = ['operativo', 'en-reparacion', 'fuera-servicio'];

  return (
    <Modal titulo={activo.nombre} subtitulo={`${activo.ubicacion} · ${activo.categoria}`} onCerrar={onCerrar}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Marca y modelo</p>
            <p className="text-[14px] font-medium text-[#1F2933] mt-0.5">{activo.marcaModelo}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Instalado</p>
            <p className="text-[14px] font-medium text-[#1F2933] mt-0.5">{formatoFecha(activo.instaladoEn)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Intervenciones</p>
            <p className="text-[14px] font-medium text-[#1F2933] mt-0.5">{ordenes.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Costo acumulado</p>
            <p className="text-[14px] font-medium text-[#1F2933] mt-0.5">{dinero(costo)}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest mb-2">Estado del equipo</p>
          <div className="flex gap-2 flex-wrap">
            {estados.map(e => (
              <button
                key={e}
                onClick={() => onCambiarEstado(e)}
                className={`px-4 py-2.5 min-h-[44px] text-[14px] font-medium rounded-md border transition-colors ${
                  activo.estado === e
                    ? 'bg-[#18345C] text-white border-[#18345C]'
                    : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                }`}
              >
                {ACTIVO_META[e].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest mb-2">Historial de órdenes</p>
          {ordenes.length === 0 ? (
            <p className="text-[14px] text-[#AEBCC1]">Este equipo aún no tiene órdenes de trabajo.</p>
          ) : (
            <div className="space-y-2">
              {ordenes.map(o => {
                const em = ESTADO_OT_META[o.estado];
                return (
                  <button
                    key={o.id}
                    onClick={() => onAbrirOrden(o.id)}
                    className="w-full flex items-center gap-3 bg-white border border-[#E5E0D8] rounded-lg px-3 py-3 min-h-[44px] text-left hover:border-[#18345C] transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: em.dot }} />
                    <span className="flex-1 min-w-0">
                      <span className="text-[14px] font-semibold text-[#18345C] block">{o.codigo}</span>
                      <span className="text-[13px] text-[#6B7280] block truncate">{o.descripcion}</span>
                    </span>
                    <Chip cls={em.chip}>{em.label}</Chip>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
