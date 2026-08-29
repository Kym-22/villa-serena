import { useMemo, useState } from 'react';
import type {
  SolicitudHuesped,
  Huesped,
  Reserva,
  EstadoSolicitudHuesped,
  PrioridadSolicitud,
  AreaSolicitud,
} from '../../types';
import { formatoFechaHora } from '../../data';
import {
  Chip,
  SOLICITUD_META,
  PRIORIDAD_META,
  Campo,
  INPUT_CLS,
  PlusIcon,
  CloseIcon,
} from './recUtils';

const AREAS: AreaSolicitud[] = ['Limpieza', 'Mantenimiento', 'Room Service', 'Recepción'];
const PRIORIDADES: PrioridadSolicitud[] = ['alta', 'media', 'baja'];
const SIGUIENTE: Record<EstadoSolicitudHuesped, EstadoSolicitudHuesped | null> = {
  'pendiente': 'en-proceso',
  'en-proceso': 'atendida',
  'atendida': null,
};

interface Props {
  solicitudes: SolicitudHuesped[];
  huespedes: Huesped[];
  reservas: Reserva[];
  onRegistrar: (s: Omit<SolicitudHuesped, 'id' | 'fecha' | 'estado'>) => void;
  onCambiarEstado: (id: string, estado: EstadoSolicitudHuesped) => void;
}

export default function SolicitudesRecepcion({
  solicitudes,
  huespedes,
  reservas,
  onRegistrar,
  onCambiarEstado,
}: Props) {
  const [creando, setCreando] = useState(false);
  const [filtroArea, setFiltroArea] = useState<AreaSolicitud | 'todas'>('todas');

  const [huespedId, setHuespedId] = useState('');
  const [habitacion, setHabitacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [area, setArea] = useState<AreaSolicitud>('Limpieza');
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>('media');
  const [err, setErr] = useState('');

  const huespedDe = useMemo(() => {
    const m = new Map<string, Huesped>();
    huespedes.forEach(h => m.set(h.id, h));
    return m;
  }, [huespedes]);

  // Sugerir habitación a partir de la reserva en curso del huésped elegido.
  function elegirHuesped(id: string) {
    setHuespedId(id);
    const enCurso = reservas.find(r => r.huespedId === id && r.estado === 'en-curso');
    const hab = enCurso
      ? // buscar número de habitación
        reservasHabNumero(enCurso, reservas)
      : '';
    if (hab) setHabitacion(hab);
    setErr('');
  }

  function registrar() {
    if (!huespedId) return setErr('Selecciona un huésped.');
    if (!habitacion.trim()) return setErr('Indica la habitación.');
    if (!descripcion.trim()) return setErr('Describe la solicitud.');
    onRegistrar({
      huespedId,
      habitacionNumero: habitacion.trim(),
      descripcion: descripcion.trim(),
      area,
      prioridad,
    });
    setHuespedId('');
    setHabitacion('');
    setDescripcion('');
    setArea('Limpieza');
    setPrioridad('media');
    setErr('');
    setCreando(false);
  }

  const visibles = solicitudes
    .filter(s => filtroArea === 'todas' || s.area === filtroArea)
    .slice()
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const pendientes = solicitudes.filter(s => s.estado !== 'atendida').length;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Solicitudes de huéspedes</h1>
            <p className="text-[15px] text-[#AEBCC1] mt-1">{pendientes} sin atender · {solicitudes.length} en total</p>
          </div>
          <button
            onClick={() => setCreando(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            <PlusIcon />
            Nueva solicitud
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <BtnArea activo={filtroArea === 'todas'} onClick={() => setFiltroArea('todas')}>Todas</BtnArea>
          {AREAS.map(a => (
            <BtnArea key={a} activo={filtroArea === a} onClick={() => setFiltroArea(a)}>{a}</BtnArea>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-3">
        {visibles.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-10 text-center">
            <p className="text-[15px] text-[#AEBCC1]">No hay solicitudes en esta área.</p>
          </div>
        ) : (
          visibles.map(s => {
            const h = huespedDe.get(s.huespedId);
            const pm = PRIORIDAD_META[s.prioridad];
            const sm = SOLICITUD_META[s.estado];
            const siguiente = SIGUIENTE[s.estado];
            return (
              <div key={s.id} className="bg-white border border-[#E5E0D8] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: pm.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[15px] font-semibold text-[#18345C]">
                        {h?.nombre ?? 'Huésped'} · Hab. {s.habitacionNumero}
                      </p>
                      <Chip cls={pm.chip}>{pm.label}</Chip>
                      <Chip cls={sm.chip}>{sm.label}</Chip>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-[#CBD5E1] text-[#475569] bg-[#F1F5F9] uppercase tracking-wide">
                        {s.area}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#1F2933] mt-1.5">{s.descripcion}</p>
                    <p className="text-[12px] text-[#AEBCC1] mt-1">
                      Registrada {formatoFechaHora(s.fecha)} · enviada a {s.area}
                    </p>
                  </div>
                  {siguiente && (
                    <button
                      onClick={() => onCambiarEstado(s.id, siguiente)}
                      className="shrink-0 text-[13px] font-semibold px-3 py-2 border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
                    >
                      {siguiente === 'en-proceso' ? 'Marcar en proceso' : 'Marcar atendida'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal nueva solicitud (HU-15 / HU-16) */}
      {creando && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreando(false)} />
          <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white">
              <h2 className="text-[22px] font-semibold text-[#18345C]">Nueva solicitud</h2>
              <button onClick={() => setCreando(false)} className="text-[#AEBCC1] hover:text-[#1F2933] p-1">
                <CloseIcon />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <Campo label="Huésped">
                <select value={huespedId} onChange={e => elegirHuesped(e.target.value)} className={INPUT_CLS}>
                  <option value="">Seleccionar…</option>
                  {huespedes.map(h => (
                    <option key={h.id} value={h.id}>{h.nombre} · {h.tipoDocumento} {h.documento}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Habitación">
                <input
                  type="text"
                  value={habitacion}
                  onChange={e => setHabitacion(e.target.value)}
                  placeholder="Ej. 101"
                  className={INPUT_CLS}
                />
              </Campo>
              <Campo label="Descripción de la solicitud">
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalle de lo que pide el huésped…"
                  className={INPUT_CLS + ' resize-none'}
                />
              </Campo>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo label="Área responsable">
                  <select value={area} onChange={e => setArea(e.target.value as AreaSolicitud)} className={INPUT_CLS}>
                    {AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Prioridad">
                  <select value={prioridad} onChange={e => setPrioridad(e.target.value as PrioridadSolicitud)} className={INPUT_CLS}>
                    {PRIORIDADES.map(p => (
                      <option key={p} value={p}>{PRIORIDAD_META[p].label}</option>
                    ))}
                  </select>
                </Campo>
              </div>
              {err && <p className="text-xs text-[#991B1B]">{err}</p>}
              <p className="text-[12px] text-[#AEBCC1]">
                Al registrarla, la solicitud queda como "pendiente" y enviada al área seleccionada.
              </p>
            </div>

            <div className="px-5 pb-6 flex gap-3">
              <button
                onClick={() => setCreando(false)}
                className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={registrar}
                className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
              >
                Registrar y enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Devuelve el número de la habitación asignada a una reserva.
function reservasHabNumero(reserva: Reserva, _reservas: Reserva[]): string {
  // El número está en la habitación, que aquí no tenemos; el id es "hh-<numero>".
  if (!reserva.habitacionId) return '';
  const m = reserva.habitacionId.match(/hh-(.+)/);
  return m ? m[1] : '';
}

function BtnArea({
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
        activo ? 'bg-[#18345C] text-white border-[#18345C]' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
      }`}
    >
      {children}
    </button>
  );
}
