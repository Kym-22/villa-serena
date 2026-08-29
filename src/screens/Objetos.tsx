import { useState } from 'react';
import type { ObjetoOlvidado } from '../types';
import { generarId, horaActual } from '../data';

const HABITACIONES = ['101','102','103','104','105','106','201','202','203','204','205','301','302','303','304'];

interface FormNuevo {
  habitacionNumero: string;
  descripcion: string;
  fechaHora: string;
  observaciones: string;
  foto: string;
}

interface Props {
  objetos: ObjetoOlvidado[];
  onRegistrar: (obj: ObjetoOlvidado) => void;
}

export default function Objetos({ objetos, onRegistrar }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormNuevo>({
    habitacionNumero: '',
    descripcion: '',
    fechaHora: '',
    observaciones: '',
    foto: '',
  });
  const [errores, setErrores] = useState<Partial<FormNuevo>>({});
  const [fotosPorId, setFotosPorId] = useState<Record<string, string>>({});

  function validar(): boolean {
    const e: Partial<FormNuevo> = {};
    if (!form.habitacionNumero) e.habitacionNumero = 'Selecciona una habitación';
    if (!form.descripcion.trim()) e.descripcion = 'Describe el objeto';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, foto: String(reader.result ?? '') }));
    };
    reader.readAsDataURL(archivo);
  }

  function handleGuardar() {
    if (!validar()) return;

    const id = generarId();

    onRegistrar({
      id,
      habitacionNumero: form.habitacionNumero,
      descripcion: form.descripcion.trim(),
      fechaHora: form.fechaHora.trim() || `Hoy, ${horaActual()}`,
      observaciones: form.observaciones.trim(),
      estado: 'guardado',
    });

    if (form.foto) {
      setFotosPorId(f => ({ ...f, [id]: form.foto }));
    }

    setMostrarForm(false);
    setForm({
      habitacionNumero: '',
      descripcion: '',
      fechaHora: '',
      observaciones: '',
      foto: '',
    });
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
              Objetos olvidados
            </h1>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Registrar objeto
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="px-4 sm:px-6 py-5">
        {objetos.length === 0 && (
          <div className="text-center py-12 text-[#AEBCC1] text-sm">No hay objetos olvidados registrados.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {objetos.map(obj => (
            <div
              key={obj.id}
              className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden"
            >
              <div className="relative h-40 bg-[#F8F6F0]">
                {fotosPorId[obj.id] ? (
                  <img
                    src={fotosPorId[obj.id]}
                    alt={obj.descripcion}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#AEBCC1]">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="8.5" cy="10" r="1.5" />
                      <path d="m21 15-5-5L5 19" />
                    </svg>
                    <span className="text-[12px] mt-2">Sin fotografía</span>
                  </div>
                )}

                <span
                  className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                    obj.estado === 'guardado'
                      ? 'bg-[#FFFBEF] text-[#78450A] border border-[#F3D98B]'
                      : 'bg-[#F0FAF4] text-[#166534] border border-[#86EFAC]'
                  }`}
                >
                  {obj.estado === 'guardado' ? 'Guardado' : 'Devuelto'}
                </span>
              </div>

              <div className="p-4">
                <p className="text-[16px] font-semibold text-[#18345C] mb-3">
                  {obj.descripcion}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[14px] text-[#6B7280]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Habitación {obj.habitacionNumero}
                  </div>

                  <div className="flex items-center gap-1.5 text-[14px] text-[#6B7280]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {obj.fechaHora}
                  </div>
                </div>

                {obj.observaciones && (
                  <p className="text-[13px] text-[#AEBCC1] mt-3 italic border-t border-[#F0EBE3] pt-3">
                    {obj.observaciones}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal — sheet en móvil */}
      {mostrarForm && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMostrarForm(false)} />
          <div className="relative z-10 bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white">
              <h2 className="text-[24px] font-semibold text-[#18345C]">
                Registrar objeto olvidado
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
                  className="w-full border border-[#E5E0D8] rounded-md px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
                >
                  <option value="">Seleccionar habitación…</option>
                  {HABITACIONES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Campo>

              <Campo label="Descripción del objeto" error={errores.descripcion}>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej. Libro y auriculares negros…"
                  className="w-full border border-[#E5E0D8] rounded-md px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
                />
              </Campo>

              <Campo label="Fecha y hora del hallazgo">
                <input
                  type="text"
                  value={form.fechaHora}
                  onChange={e => setForm(f => ({ ...f, fechaHora: e.target.value }))}
                  placeholder={`Hoy, ${horaActual()}`}
                  className="w-full border border-[#E5E0D8] rounded-md px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
                />
              </Campo>

              <Campo label="Fotografía del objeto">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFoto}
                    className="hidden"
                  />

                  {form.foto ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#E5E0D8]">
                      <img
                        src={form.foto}
                        alt="Vista previa del objeto"
                        className="w-full h-44 object-cover"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-black/45 text-white text-[13px] text-center py-2">
                        Cambiar fotografía
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#AEBCC1] rounded-xl px-4 py-6 text-center hover:border-[#18345C] transition-colors">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#18345C"
                        strokeWidth="1.5"
                        className="mx-auto mb-2"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8.5" cy="10" r="1.5" />
                        <path d="m21 15-5-5L5 19" />
                      </svg>

                      <p className="text-[14px] font-medium text-[#18345C]">
                        Agregar fotografía
                      </p>
                      <p className="text-[12px] text-[#AEBCC1] mt-1">
                        Selecciona una imagen del objeto encontrado
                      </p>
                    </div>
                  )}
                </label>
              </Campo>

              <Campo label="Observaciones">
                <textarea
                  rows={3}
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Dónde se encontró, estado del objeto…"
                  className="w-full border border-[#E5E0D8] rounded-md px-3 py-3 text-sm text-[#1F2933] resize-none focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
                />
              </Campo>
            </div>

            <div className="px-5 pb-6 flex gap-3">
              <button
                onClick={() => setMostrarForm(false)}
                className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
              >
                Guardar registro
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
