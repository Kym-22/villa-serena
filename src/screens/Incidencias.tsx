import { useState } from 'react';
import type { Incidencia, PrioridadIncidencia, EstadoIncidencia } from '../types';
import { generarId, horaActual } from '../data';

const PRIORIDAD_CONFIG: Record<PrioridadIncidencia, { label: string; cls: string; dot: string }> = {
  alta:  { label: 'Alta',  cls: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]', dot: '#F87171' },
  media: { label: 'Media', cls: 'bg-[#FFFBEF] text-[#78450A] border border-[#F3D98B]', dot: '#F3D98B' },
  baja:  { label: 'Baja',  cls: 'bg-[#F0FAF4] text-[#166534] border border-[#86EFAC]', dot: '#4ADE80' },
};

const ESTADO_CONFIG: Record<EstadoIncidencia, { label: string; cls: string }> = {
  'pendiente':  { label: 'Pendiente',  cls: 'bg-[#FFFBEF] text-[#78450A] border border-[#F3D98B]' },
  'en-proceso': { label: 'En proceso', cls: 'bg-[#EFF6FF] text-[#1E40AF] border border-[#93C5FD]' },
  'resuelta':   { label: 'Resuelta',   cls: 'bg-[#F0FAF4] text-[#166534] border border-[#86EFAC]' },
};

const TIPOS = ['Fuga de agua', 'Avería técnica', 'Daño en mobiliario', 'Problema eléctrico', 'Suciedad grave', 'Otro'];
const HABITACIONES = ['101','102','103','104','105','106','201','202','203','204','205','301','302','303','304'];

interface FormNueva {
  habitacionNumero: string;
  tipo: string;
  descripcion: string;
  prioridad: PrioridadIncidencia;
  impideUso: boolean;
}

interface Props {
  incidencias: Incidencia[];
  onRegistrar: (inc: Incidencia) => void;
}

export default function Incidencias({ incidencias, onRegistrar }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormNueva>({ habitacionNumero: '', tipo: '', descripcion: '', prioridad: 'media', impideUso: false });
  const [errores, setErrores] = useState<Partial<FormNueva>>({});

  function validar(): boolean {
    const e: Partial<FormNueva> = {};
    if (!form.habitacionNumero) e.habitacionNumero = 'Selecciona una habitación';
    if (!form.tipo) e.tipo = 'Selecciona el tipo';
    if (!form.descripcion.trim()) e.descripcion = 'Escribe una descripción';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function handleRegistrar() {
    if (!validar()) return;
    onRegistrar({
      id: generarId(),
      habitacionNumero: form.habitacionNumero,
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      prioridad: form.prioridad,
      hora: horaActual(),
      estado: 'pendiente',
      impideUso: form.impideUso,
    });
    setMostrarForm(false);
    setForm({ habitacionNumero: '', tipo: '', descripcion: '', prioridad: 'media', impideUso: false });
    setErrores({});
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&display=swap');
      `}</style>
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">
              Incidencias
            </h1>
            <p className="text-[15px] text-[#AEBCC1] mt-1">
              Daños y desperfectos reportados
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva incidencia
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 sm:px-6 py-5 space-y-3">
        {incidencias.length === 0 && (
          <div className="text-center py-12 text-[#AEBCC1] text-sm">No hay incidencias registradas.</div>
        )}
        {incidencias.map(inc => {
          const pc = PRIORIDAD_CONFIG[inc.prioridad];
          const ec = ESTADO_CONFIG[inc.estado];
          return (
            <div key={inc.id} className="bg-white border border-[#E5E0D8] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: pc.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-[#1F2933]">Habitación {inc.habitacionNumero}</p>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${pc.cls}`}>{pc.label}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${ec.cls}`}>{ec.label}</span>
                    {inc.impideUso && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]">
                        Fuera de servicio
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#18345C]">{inc.tipo}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{inc.descripcion}</p>
                  <p className="text-[10px] text-[#AEBCC1] mt-1">Reportado: {inc.hora}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal formulario */}
      {mostrarForm && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMostrarForm(false)} />
          <div className="relative z-10 bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white">
              <h2 className="text-[24px] font-semibold text-[#18345C]">
                Reportar incidencia
              </h2>
              <button onClick={() => setMostrarForm(false)} className="text-[#AEBCC1] hover:text-[#1F2933] p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <Campo label="Habitación" error={errores.habitacionNumero}>
                <select
                  value={form.habitacionNumero}
                  onChange={e => setForm(f => ({ ...f, habitacionNumero: e.target.value }))}
                  className="w-full border border-[#E5E0D8] rounded-sm px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
                >
                  <option value="">Seleccionar habitación…</option>
                  {HABITACIONES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Campo>

              <Campo label="Tipo de problema" error={errores.tipo}>
                <select
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  className="w-full border border-[#E5E0D8] rounded-sm px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
                >
                  <option value="">Seleccionar tipo…</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Campo>

              <Campo label="Descripción" error={errores.descripcion}>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el problema con detalle…"
                  className="w-full border border-[#E5E0D8] rounded-sm px-3 py-3 text-sm text-[#1F2933] resize-none focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
                />
              </Campo>

              <Campo label="Nivel de prioridad">
                <div className="flex gap-2">
                  {(['alta', 'media', 'baja'] as PrioridadIncidencia[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, prioridad: p }))}
                      className={`flex-1 py-2.5 text-xs font-medium rounded-sm border capitalize transition-colors ${
                        form.prioridad === p
                          ? p === 'alta' ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
                          : p === 'media' ? 'bg-[#FFFBEF] text-[#78450A] border-[#F3D98B]'
                          : 'bg-[#F0FAF4] text-[#166534] border-[#86EFAC]'
                          : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </Campo>

              <div>
                <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">
                  ¿Impide utilizar la habitación?
                </p>
                <div className="flex gap-3">
                  {[{ val: true, label: 'Sí' }, { val: false, label: 'No' }].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => setForm(f => ({ ...f, impideUso: opt.val }))}
                      className={`flex-1 py-3 text-sm font-medium rounded-sm border transition-colors ${
                        form.impideUso === opt.val
                          ? 'bg-[#18345C] text-white border-[#18345C]'
                          : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {form.impideUso && (
                  <p className="text-xs text-[#991B1B] mt-2 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                    </svg>
                    La habitación se marcará como "Fuera de servicio".
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 pb-6 flex gap-3">
              <button
                onClick={() => setMostrarForm(false)}
                className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-sm hover:bg-[#F8F6F0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrar}
                className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-sm hover:bg-[#102747] transition-colors"
              >
                Registrar incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-1.5">{label}</p>
      {children}
      {error && <p className="text-xs text-[#991B1B] mt-1">{error}</p>}
    </div>
  );
}
