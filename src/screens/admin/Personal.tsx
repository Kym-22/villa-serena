import { useMemo, useState } from 'react';
import type {
  Empleado,
  RolPersonal,
  TurnoPersonal,
  PermisoModulo,
  EstadoAsistencia,
} from '../../types';
import { generarId } from '../../data';
import {
  Chip,
  Campo,
  INPUT_CLS,
  ASISTENCIA_META,
  PERMISO_LABEL,
  PlusIcon,
} from './adminUtils';

const ROLES: RolPersonal[] = ['Recepción', 'Limpieza', 'Room Service', 'Mantenimiento', 'Administración'];
const TURNOS: TurnoPersonal[] = ['Mañana', 'Tarde', 'Noche'];
const PERMISOS: PermisoModulo[] = ['limpieza', 'roomservice', 'recepcion', 'admin', 'mantenimiento'];
const ASISTENCIAS: EstadoAsistencia[] = ['presente', 'ausente', 'descanso', 'pendiente'];

interface Props {
  empleados: Empleado[];
  onAgregar: (e: Omit<Empleado, 'id'>) => void;
  onCambiarAsistencia: (id: string, a: EstadoAsistencia) => void;
  onToggleActivo: (id: string) => void;
  onCambiarTurno: (id: string, turno: TurnoPersonal) => void;
  onTogglePermiso: (id: string, permiso: PermisoModulo) => void;
}

export default function Personal({
  empleados,
  onAgregar,
  onCambiarAsistencia,
  onToggleActivo,
  onCambiarTurno,
  onTogglePermiso,
}: Props) {
  const [filtroRol, setFiltroRol] = useState<RolPersonal | 'todos'>('todos');
  const [filtroTurno, setFiltroTurno] = useState<TurnoPersonal | 'todos'>('todos');
  const [creando, setCreando] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);

  const activos = empleados.filter(e => e.activo);
  const cuenta = (a: EstadoAsistencia) => activos.filter(e => e.asistencia === a).length;

  const cobertura = useMemo(
    () =>
      TURNOS.map(t => ({
        turno: t,
        total: activos.filter(e => e.turno === t).length,
        presentes: activos.filter(e => e.turno === t && e.asistencia === 'presente').length,
      })),
    [activos],
  );

  const visibles = empleados
    .filter(e => (filtroRol === 'todos' || e.rol === filtroRol) && (filtroTurno === 'todos' || e.turno === filtroTurno))
    .sort((a, b) => Number(b.activo) - Number(a.activo) || a.nombre.localeCompare(b.nombre));

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Gestión de personal</h1>
            <p className="text-[14px] text-[#AEBCC1] mt-1">{activos.length} empleados activos de {empleados.length}</p>
          </div>
          <button
            onClick={() => setCreando(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            <PlusIcon /> Nuevo empleado
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi valor={cuenta('presente')} label="Presentes hoy" color="#166534" />
          <Kpi valor={cuenta('ausente')} label="Ausentes" color="#991B1B" />
          <Kpi valor={cuenta('descanso')} label="En descanso" color="#1E40AF" />
          <Kpi valor={cuenta('pendiente')} label="Sin registrar" color="#78450A" />
        </div>

        {/* Cobertura de turnos */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {cobertura.map(c => (
            <div key={c.turno} className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2">
              <p className="text-[12px] text-[#6B7280]">Turno {c.turno}</p>
              <p className="text-[15px] font-semibold text-[#18345C]">
                {c.presentes}/{c.total} <span className="text-[12px] font-normal text-[#AEBCC1]">presentes</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap mt-4">
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value as RolPersonal | 'todos')} className="border border-[#E5E0D8] rounded-md px-3 py-2 text-sm bg-white text-[#1F2933] focus:outline-none focus:border-[#18345C]">
            <option value="todos">Todos los roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filtroTurno} onChange={e => setFiltroTurno(e.target.value as TurnoPersonal | 'todos')} className="border border-[#E5E0D8] rounded-md px-3 py-2 text-sm bg-white text-[#1F2933] focus:outline-none focus:border-[#18345C]">
            <option value="todos">Todos los turnos</option>
            {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-3">
        {visibles.map(e => {
          const pct = e.tareasAsignadas > 0 ? Math.round((e.tareasCompletadas / e.tareasAsignadas) * 100) : 0;
          const am = ASISTENCIA_META[e.asistencia];
          return (
            <div key={e.id} className={`bg-white border rounded-xl p-4 ${e.activo ? 'border-[#E5E0D8]' : 'border-[#E5E0D8] opacity-60'}`}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[16px] font-semibold text-[#18345C]">{e.nombre}</p>
                    <Chip cls="bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]">{e.rol}</Chip>
                    <Chip cls={am.chip}>{am.label}</Chip>
                    {!e.activo && <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Inactivo</Chip>}
                  </div>
                  <p className="text-[12px] text-[#AEBCC1] mt-1">{e.telefono}</p>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <label className="text-[12px] text-[#6B7280] flex items-center gap-1.5">
                      Turno
                      <select
                        value={e.turno}
                        onChange={ev => onCambiarTurno(e.id, ev.target.value as TurnoPersonal)}
                        className="border border-[#E5E0D8] rounded-md px-2 py-1 text-[12px] bg-white text-[#1F2933] focus:outline-none focus:border-[#18345C]"
                      >
                        {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                    <span className="text-[12px] text-[#6B7280]">
                      Rendimiento: <span className="font-semibold text-[#18345C]">{e.tareasCompletadas}/{e.tareasAsignadas}</span> ({pct}%)
                    </span>
                    <span className="text-[12px] text-[#6B7280]">
                      Puntualidad: <span className="font-semibold text-[#18345C]">{e.puntualidadPct}%</span>
                    </span>
                  </div>

                  <div className="h-1.5 bg-[#EEF0F2] rounded-full overflow-hidden mt-2 max-w-xs">
                    <div className="h-full bg-[#18345C] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-stretch">
                  <div className="flex gap-1.5 flex-wrap">
                    {ASISTENCIAS.map(a => (
                      <button
                        key={a}
                        onClick={() => onCambiarAsistencia(e.id, a)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors ${
                          e.asistencia === a ? ASISTENCIA_META[a].chip : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                        }`}
                      >
                        {ASISTENCIA_META[a].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleActivo(e.id)}
                      className="flex-1 text-[12px] font-semibold px-3 py-1.5 rounded-md border border-[#E5E0D8] text-[#18345C] hover:bg-[#F8F6F0] transition-colors"
                    >
                      {e.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => setExpandido(x => (x === e.id ? null : e.id))}
                      className="flex-1 text-[12px] font-semibold px-3 py-1.5 rounded-md border border-[#E5E0D8] text-[#18345C] hover:bg-[#F8F6F0] transition-colors"
                    >
                      Permisos {expandido === e.id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
              </div>

              {expandido === e.id && (
                <div className="mt-3 pt-3 border-t border-[#F0EBE3]">
                  <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">Permisos de acceso a módulos</p>
                  <div className="flex flex-wrap gap-2">
                    {PERMISOS.map(p => {
                      const tiene = e.permisos.includes(p);
                      return (
                        <button
                          key={p}
                          onClick={() => onTogglePermiso(e.id, p)}
                          className={`text-[12px] font-medium px-3 py-1.5 rounded-md border transition-colors ${
                            tiene ? 'bg-[#18345C] text-white border-[#18345C]' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                          }`}
                        >
                          {tiene ? '✓ ' : ''}{PERMISO_LABEL[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {creando && <FormNuevo onCancelar={() => setCreando(false)} onGuardar={x => { onAgregar(x); setCreando(false); }} />}
    </div>
  );
}

function FormNuevo({
  onCancelar,
  onGuardar,
}: {
  onCancelar: () => void;
  onGuardar: (e: Omit<Empleado, 'id'>) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<RolPersonal>('Recepción');
  const [turno, setTurno] = useState<TurnoPersonal>('Mañana');
  const [telefono, setTelefono] = useState('');
  const [permisos, setPermisos] = useState<PermisoModulo[]>([]);
  const [err, setErr] = useState('');

  function toggle(p: PermisoModulo) {
    setPermisos(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  }

  function guardar() {
    if (!nombre.trim()) return setErr('El nombre es obligatorio.');
    if (!telefono.trim()) return setErr('El teléfono es obligatorio.');
    onGuardar({
      nombre: nombre.trim(),
      rol,
      turno,
      telefono: telefono.trim(),
      activo: true,
      permisos,
      tareasCompletadas: 0,
      tareasAsignadas: 0,
      puntualidadPct: 100,
      asistencia: 'pendiente',
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8]">
          <h2 className="text-[22px] font-semibold text-[#18345C]">Nuevo empleado</h2>
          <button onClick={onCancelar} className="text-[#AEBCC1] hover:text-[#1F2933] p-1 text-lg leading-none">✕</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Campo label="Nombre completo">
            <input type="text" value={nombre} onChange={e => { setNombre(e.target.value); setErr(''); }} className={INPUT_CLS} />
          </Campo>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Rol">
              <select value={rol} onChange={e => setRol(e.target.value as RolPersonal)} className={INPUT_CLS}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Campo>
            <Campo label="Turno">
              <select value={turno} onChange={e => setTurno(e.target.value as TurnoPersonal)} className={INPUT_CLS}>
                {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Campo>
          </div>
          <Campo label="Teléfono">
            <input type="text" value={telefono} onChange={e => { setTelefono(e.target.value); setErr(''); }} className={INPUT_CLS} />
          </Campo>
          <div>
            <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">Permisos de acceso</p>
            <div className="flex flex-wrap gap-2">
              {PERMISOS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(p)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-md border transition-colors ${
                    permisos.includes(p) ? 'bg-[#18345C] text-white border-[#18345C]' : 'bg-white text-[#6B7280] border-[#E5E0D8]'
                  }`}
                >
                  {PERMISO_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="text-xs text-[#991B1B]">{err}</p>}
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button onClick={onCancelar} className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors">
            Guardar empleado
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ valor, label, color }: { valor: number; label: string; color: string }) {
  return (
    <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5">
      <p className="text-[22px] font-bold leading-none" style={{ color }}>{valor}</p>
      <p className="text-[11px] text-[#6B7280] mt-1">{label}</p>
    </div>
  );
}
