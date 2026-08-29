import { useState } from 'react';
import type { OrdenTrabajo, Empleado, Repuesto } from '../../types';
import { formatoFecha, formatoFechaHora, formatoDuracion } from '../../data';
import {
  Chip,
  Campo,
  INPUT_CLS,
  dinero,
  PRIORIDAD_META,
  ESTADO_OT_META,
  ORIGEN_LABEL,
  SIGUIENTE_ESTADO_OT,
  ACCION_AVANZAR_OT,
  esTerminalOT,
  estaAtrasada,
  costoRepuestos,
  Modal,
  Vacio,
  ClockIcon,
  BoxIcon,
} from './mantUtils';

const MOTIVOS_RAPIDOS = [
  'El equipo fue reemplazado',
  'Falta de repuesto',
  'Reportado por error',
  'Lo asume un proveedor externo',
];

type Modo = null | 'asignar' | 'resolver' | 'cancelar' | 'reprogramar' | 'repuesto';

interface Props {
  orden: OrdenTrabajo;
  tecnicos: Empleado[];
  repuestos: Repuesto[];
  onCerrar: () => void;
  onAsignar: (ordenId: string, tecnicoId: string) => void;
  onAvanzar: (ordenId: string, extra?: { solucion?: string; minutos?: number }) => void;
  onCancelar: (ordenId: string, motivo: string) => void;
  onReprogramar: (ordenId: string, fecha: string, motivo: string) => void;
  onAgregarRepuesto: (ordenId: string, repuestoId: string, cantidad: number) => void;
  onQuitarRepuesto: (ordenId: string, indice: number) => void;
}

export default function DetalleOrden({
  orden,
  tecnicos,
  repuestos,
  onCerrar,
  onAsignar,
  onAvanzar,
  onCancelar,
  onReprogramar,
  onAgregarRepuesto,
  onQuitarRepuesto,
}: Props) {
  const [modo, setModo] = useState<Modo>(null);

  const em = ESTADO_OT_META[orden.estado];
  const pm = PRIORIDAD_META[orden.prioridad];
  const siguiente = SIGUIENTE_ESTADO_OT[orden.estado];
  const terminal = esTerminalOT(orden.estado);
  const tecnico = tecnicos.find(t => t.id === orden.tecnicoId);
  const costo = costoRepuestos(orden);

  function accionPrincipal() {
    if (orden.estado === 'abierta') return setModo('asignar');
    if (orden.estado === 'en-proceso') return setModo('resolver');
    onAvanzar(orden.id);
  }

  return (
    <Modal
      titulo={orden.codigo}
      subtitulo={
        <span className="flex items-center gap-2 flex-wrap">
          <span>{orden.esHabitacion ? `Habitación ${orden.ubicacion}` : orden.ubicacion}</span>
          <span>·</span>
          <span>{orden.tipo}</span>
        </span>
      }
      onCerrar={onCerrar}
    >
      <div className="space-y-5">
        {/* Estado */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip cls={em.chip}>{em.label}</Chip>
          <Chip cls={pm.chip}>Prioridad {pm.label.toLowerCase()}</Chip>
          {estaAtrasada(orden) && <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Atrasada</Chip>}
          {orden.impideUso && !terminal && (
            <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Impide el uso</Chip>
          )}
        </div>

        {/* Descripción */}
        <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-3">
          <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">Trabajo solicitado</p>
          <p className="text-[15px] text-[#1F2933] mt-1">{orden.descripcion}</p>
        </div>

        {/* Datos */}
        <div className="grid grid-cols-2 gap-3">
          <Dato label="Origen" valor={ORIGEN_LABEL[orden.origen]} />
          <Dato label="Técnico" valor={tecnico?.nombre ?? 'Sin asignar'} alerta={!tecnico && !terminal} />
          <Dato label="Compromiso" valor={formatoFecha(orden.fechaCompromiso)} alerta={estaAtrasada(orden)} />
          <Dato label="Creada" valor={formatoFechaHora(orden.creadaEn)} />
          {orden.area && <Dato label="Reportó" valor={orden.area} />}
          {orden.minutosEmpleados != null && (
            <Dato label="Tiempo empleado" valor={formatoDuracion(orden.minutosEmpleados)} />
          )}
        </div>

        {/* Solución */}
        {orden.solucion && (
          <div className="bg-[#F0FAF4] border border-[#86EFAC] rounded-lg px-4 py-3">
            <p className="text-[11px] text-[#166534] uppercase tracking-widest">Solución aplicada</p>
            <p className="text-[15px] text-[#1F2933] mt-1">{orden.solucion}</p>
          </div>
        )}

        {/* Cancelación */}
        {orden.motivoCancelacion && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg px-4 py-3">
            <p className="text-[11px] text-[#991B1B] uppercase tracking-widest">Motivo de cancelación</p>
            <p className="text-[15px] text-[#1F2933] mt-1">{orden.motivoCancelacion}</p>
          </div>
        )}

        {/* Repuestos (HU-11) */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest flex items-center gap-1.5">
              <BoxIcon size={13} /> Repuestos utilizados
            </p>
            {!terminal && (
              <button
                onClick={() => setModo(modo === 'repuesto' ? null : 'repuesto')}
                className="text-[13px] font-semibold text-[#18345C] hover:underline"
              >
                {modo === 'repuesto' ? 'Cerrar' : '+ Añadir'}
              </button>
            )}
          </div>

          {modo === 'repuesto' && (
            <FormRepuesto
              repuestos={repuestos}
              onGuardar={(id, cant) => {
                onAgregarRepuesto(orden.id, id, cant);
                setModo(null);
              }}
              onCancelar={() => setModo(null)}
            />
          )}

          {orden.repuestos.length === 0 ? (
            <p className="text-[14px] text-[#AEBCC1]">Sin repuestos registrados.</p>
          ) : (
            <div className="space-y-1.5">
              {orden.repuestos.map((r, i) => (
                <div
                  key={`${r.repuestoId}-${i}`}
                  className="flex items-center gap-3 bg-white border border-[#E5E0D8] rounded-lg px-3 py-2"
                >
                  <p className="flex-1 text-[14px] text-[#1F2933] min-w-0 truncate">{r.nombre}</p>
                  <p className="text-[13px] text-[#6B7280] shrink-0">×{r.cantidad}</p>
                  <p className="text-[14px] font-semibold text-[#18345C] shrink-0">
                    {dinero(r.cantidad * r.costoUnitario)}
                  </p>
                  {!terminal && (
                    <button
                      onClick={() => onQuitarRepuesto(orden.id, i)}
                      aria-label={`Quitar ${r.nombre}`}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded text-[#AEBCC1] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-between px-3 pt-1">
                <p className="text-[13px] text-[#6B7280]">Costo en repuestos</p>
                <p className="text-[15px] font-bold text-[#18345C]">{dinero(costo)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Formularios de acción */}
        {modo === 'asignar' && (
          <FormAsignar
            tecnicos={tecnicos}
            onAsignar={id => {
              onAsignar(orden.id, id);
              setModo(null);
            }}
            onCancelar={() => setModo(null)}
          />
        )}

        {modo === 'resolver' && (
          <FormResolver
            onGuardar={(solucion, minutos) => {
              onAvanzar(orden.id, { solucion, minutos });
              setModo(null);
            }}
            onCancelar={() => setModo(null)}
          />
        )}

        {modo === 'cancelar' && (
          <FormCancelar
            onGuardar={motivo => onCancelar(orden.id, motivo)}
            onCancelar={() => setModo(null)}
          />
        )}

        {modo === 'reprogramar' && (
          <FormReprogramar
            fechaActual={orden.fechaCompromiso}
            onGuardar={(fecha, motivo) => {
              onReprogramar(orden.id, fecha, motivo);
              setModo(null);
            }}
            onCancelar={() => setModo(null)}
          />
        )}

        {/* Acciones */}
        {!terminal && !modo && (
          <div className="space-y-2 pt-1">
            <button
              onClick={accionPrincipal}
              className="w-full px-4 py-3.5 min-h-[48px] text-[16px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
            >
              {ACCION_AVANZAR_OT[orden.estado]}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setModo('reprogramar')}
                className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
              >
                Reprogramar
              </button>
              <button
                onClick={() => setModo('cancelar')}
                className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#FCA5A5] text-[#991B1B] rounded-md hover:bg-[#FEF2F2] transition-colors"
              >
                Cancelar orden
              </button>
            </div>

            {siguiente === 'cerrada' && (
              <p className="text-[13px] text-[#6B7280] text-center">
                Al cerrar la orden, la incidencia que la originó queda resuelta.
              </p>
            )}
          </div>
        )}

        {terminal && (
          <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-3 text-center">
            <p className="text-[14px] font-semibold text-[#6B7280]">
              Esta orden está {em.label.toLowerCase()} y ya no admite cambios.
            </p>
          </div>
        )}

        {/* Historial */}
        <div>
          <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <ClockIcon size={13} /> Historial
          </p>
          <div className="space-y-0">
            {orden.historial.map((h, i) => {
              const hm = ESTADO_OT_META[h.estado];
              const ultimo = i === orden.historial.length - 1;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: hm.dot }} />
                    {!ultimo && <span className="w-px flex-1 bg-[#E5E0D8] my-1" />}
                  </div>
                  <div className={ultimo ? 'pb-0' : 'pb-4'}>
                    <p className="text-[14px] font-medium text-[#18345C]">{hm.label}</p>
                    {h.nota && <p className="text-[13px] text-[#6B7280]">{h.nota}</p>}
                    <p className="text-[12px] text-[#AEBCC1]">
                      {formatoFechaHora(h.fechaHora)} · {h.responsable}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Piezas ---------- */

function Dato({ label, valor, alerta }: { label: string; valor: string; alerta?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-[#AEBCC1] uppercase tracking-widest">{label}</p>
      <p className={`text-[14px] font-medium mt-0.5 ${alerta ? 'text-[#991B1B]' : 'text-[#1F2933]'}`}>{valor}</p>
    </div>
  );
}

function Recuadro({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-4 space-y-3">{children}</div>;
}

function FormAsignar({
  tecnicos,
  onAsignar,
  onCancelar,
}: {
  tecnicos: Empleado[];
  onAsignar: (id: string) => void;
  onCancelar: () => void;
}) {
  return (
    <Recuadro>
      <p className="text-[14px] font-semibold text-[#18345C]">Elige el técnico responsable</p>
      {tecnicos.length === 0 ? (
        <Vacio msg="No hay técnicos activos con rol de Mantenimiento." />
      ) : (
        tecnicos.map(t => (
          <button
            key={t.id}
            onClick={() => onAsignar(t.id)}
            className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] bg-white border border-[#E5E0D8] rounded-lg text-left hover:border-[#18345C] transition-colors"
          >
            <span className="flex-1 text-[15px] font-medium text-[#18345C]">{t.nombre}</span>
            <span className="text-[12px] text-[#6B7280]">Turno de {t.turno.toLowerCase()}</span>
          </button>
        ))
      )}
      <button
        onClick={onCancelar}
        className="w-full px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-white transition-colors"
      >
        Cancelar
      </button>
    </Recuadro>
  );
}

function FormResolver({
  onGuardar,
  onCancelar,
}: {
  onGuardar: (solucion: string, minutos: number) => void;
  onCancelar: () => void;
}) {
  const [solucion, setSolucion] = useState('');
  const [minutos, setMinutos] = useState('');
  const [errores, setErrores] = useState<{ solucion?: string; minutos?: string }>({});

  function guardar() {
    const e: typeof errores = {};
    if (!solucion.trim()) e.solucion = 'Describe la solución aplicada.';
    const n = Number(minutos);
    if (!minutos.trim()) e.minutos = 'Indica el tiempo empleado.';
    else if (!Number.isFinite(n) || n <= 0) e.minutos = 'Debe ser un número mayor que cero.';
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    onGuardar(solucion.trim(), n);
  }

  return (
    <Recuadro>
      <p className="text-[14px] font-semibold text-[#18345C]">Registrar la solución</p>

      <Campo label="Solución aplicada" error={errores.solucion}>
        <textarea
          value={solucion}
          onChange={e => setSolucion(e.target.value)}
          rows={3}
          className={INPUT_CLS}
          placeholder="Qué se hizo para resolver la avería"
        />
      </Campo>

      <Campo label="Tiempo empleado (minutos)" error={errores.minutos}>
        <input
          type="number"
          min={1}
          value={minutos}
          onChange={e => setMinutos(e.target.value)}
          className={INPUT_CLS}
          placeholder="45"
        />
      </Campo>

      <div className="flex gap-2">
        <button
          onClick={onCancelar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
        >
          Marcar como resuelta
        </button>
      </div>
    </Recuadro>
  );
}

function FormCancelar({
  onGuardar,
  onCancelar,
}: {
  onGuardar: (motivo: string) => void;
  onCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  function guardar() {
    if (!motivo.trim()) {
      setError('La cancelación exige un motivo.');
      return;
    }
    onGuardar(motivo.trim());
  }

  return (
    <Recuadro>
      <p className="text-[14px] font-semibold text-[#991B1B]">Cancelar la orden</p>

      <div className="flex gap-2 flex-wrap">
        {MOTIVOS_RAPIDOS.map(m => (
          <button
            key={m}
            onClick={() => {
              setMotivo(m);
              setError('');
            }}
            className={`text-[13px] px-3 py-2 rounded-md border transition-colors ${
              motivo === m
                ? 'bg-[#18345C] text-white border-[#18345C]'
                : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <Campo label="Motivo" error={error}>
        <textarea
          value={motivo}
          onChange={e => {
            setMotivo(e.target.value);
            if (error) setError('');
          }}
          rows={2}
          className={INPUT_CLS}
          placeholder="Por qué se cancela esta orden"
        />
      </Campo>

      <div className="flex gap-2">
        <button
          onClick={onCancelar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-white transition-colors"
        >
          Volver
        </button>
        <button
          onClick={guardar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#991B1B] text-white rounded-md hover:bg-[#7F1D1D] transition-colors"
        >
          Confirmar cancelación
        </button>
      </div>
    </Recuadro>
  );
}

function FormReprogramar({
  fechaActual,
  onGuardar,
  onCancelar,
}: {
  fechaActual: string;
  onGuardar: (fecha: string, motivo: string) => void;
  onCancelar: () => void;
}) {
  const [fecha, setFecha] = useState(fechaActual);
  const [motivo, setMotivo] = useState('');
  const [errores, setErrores] = useState<{ fecha?: string; motivo?: string }>({});

  function guardar() {
    const e: typeof errores = {};
    if (!fecha) e.fecha = 'Indica la nueva fecha.';
    if (!motivo.trim()) e.motivo = 'Justifica el cambio de fecha.';
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    onGuardar(fecha, motivo.trim());
  }

  return (
    <Recuadro>
      <p className="text-[14px] font-semibold text-[#18345C]">Reprogramar la orden</p>

      <Campo label="Nueva fecha de compromiso" error={errores.fecha}>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className={INPUT_CLS} />
      </Campo>

      <Campo label="Motivo del cambio" error={errores.motivo}>
        <input
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          className={INPUT_CLS}
          placeholder="Ej. a la espera del repuesto"
        />
      </Campo>

      <div className="flex gap-2">
        <button
          onClick={onCancelar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
        >
          Guardar fecha
        </button>
      </div>
    </Recuadro>
  );
}

function FormRepuesto({
  repuestos,
  onGuardar,
  onCancelar,
}: {
  repuestos: Repuesto[];
  onGuardar: (repuestoId: string, cantidad: number) => void;
  onCancelar: () => void;
}) {
  const [id, setId] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [errores, setErrores] = useState<{ id?: string; cantidad?: string }>({});

  function guardar() {
    const e: typeof errores = {};
    if (!id) e.id = 'Elige un repuesto.';
    const n = Number(cantidad);
    if (!Number.isFinite(n) || n <= 0) e.cantidad = 'Cantidad no válida.';
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    onGuardar(id, n);
  }

  return (
    <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-4 py-4 space-y-3 mb-3">
      <Campo label="Repuesto" error={errores.id}>
        <select value={id} onChange={e => setId(e.target.value)} className={INPUT_CLS}>
          <option value="">Seleccionar…</option>
          {repuestos.map(r => (
            <option key={r.id} value={r.id}>
              {r.nombre} — {dinero(r.costoUnitario)} / {r.unidad}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Cantidad" error={errores.cantidad}>
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
          className={INPUT_CLS}
        />
      </Campo>

      <p className="text-[12px] text-[#AEBCC1]">
        En esta versión el consumo es informativo: todavía no descuenta del inventario de Administración.
      </p>

      <div className="flex gap-2">
        <button
          onClick={onCancelar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          className="flex-1 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
        >
          Añadir
        </button>
      </div>
    </div>
  );
}
