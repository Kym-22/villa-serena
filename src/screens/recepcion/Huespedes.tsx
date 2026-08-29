import { useMemo, useState } from 'react';
import type { Huesped, Reserva, HabitacionHotel, TipoDocumento } from '../../types';
import { NACIONALIDADES, formatoFecha } from '../../data';
import {
  dinero,
  Chip,
  RESERVA_META,
  calcularCuenta,
  Campo,
  INPUT_CLS,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
} from './recUtils';

interface Props {
  huespedes: Huesped[];
  reservas: Reserva[];
  habitaciones: HabitacionHotel[];
  onRegistrar: (h: Omit<Huesped, 'id' | 'creadoEn'>) => void;
  onAbrirReserva: (id: string) => void;
}

interface Form {
  nombre: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  telefono: string;
  correo: string;
  nacionalidad: string;
}

const FORM_VACIO: Form = {
  nombre: '',
  tipoDocumento: 'DPI',
  documento: '',
  telefono: '',
  correo: '',
  nacionalidad: 'Guatemalteca',
};

export default function Huespedes({ huespedes, reservas, habitaciones, onRegistrar, onAbrirReserva }: Props) {
  const [q, setQ] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(FORM_VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof Form, string>>>({});

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...huespedes]
      .filter(h => !t || `${h.nombre} ${h.documento} ${h.correo}`.toLowerCase().includes(t))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [huespedes, q]);

  const perfil = huespedes.find(h => h.id === perfilId) ?? null;

  function validar(): boolean {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre completo es obligatorio.';
    if (!form.documento.trim()) e.documento = 'El DPI o pasaporte es obligatorio.';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio.';
    if (!form.correo.trim()) e.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) e.correo = 'Correo no válido.';
    if (!form.nacionalidad) e.nacionalidad = 'Selecciona la nacionalidad.';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function guardar() {
    if (!validar()) return;
    onRegistrar({
      nombre: form.nombre.trim(),
      tipoDocumento: form.tipoDocumento,
      documento: form.documento.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      nacionalidad: form.nacionalidad,
    });
    setForm(FORM_VACIO);
    setErrores({});
    setRegistrando(false);
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Huéspedes</h1>
            <p className="text-[15px] text-[#AEBCC1] mt-1">{huespedes.length} registrados</p>
          </div>
          <button
            onClick={() => setRegistrando(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            <PlusIcon />
            Registrar huésped
          </button>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEBCC1]">
            <SearchIcon size={15} />
          </span>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre, documento o correo…"
            className="w-full border border-[#E5E0D8] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white placeholder:text-[#AEBCC1]"
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(h => {
            const estancias = reservas.filter(r => r.huespedId === h.id).length;
            return (
              <button
                key={h.id}
                onClick={() => setPerfilId(h.id)}
                className="text-left bg-white border border-[#E5E0D8] rounded-xl p-4 hover:border-[#18345C] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
                    <UserIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-[#18345C] truncate">{h.nombre}</p>
                    <p className="text-[12px] text-[#AEBCC1]">{h.tipoDocumento} {h.documento}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0EBE3] text-[13px] text-[#6B7280] space-y-0.5">
                  <p>{h.telefono}</p>
                  <p className="truncate">{h.correo}</p>
                  <p className="text-[#AEBCC1]">{h.nacionalidad} · {estancias} reserva(s)</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal registro (HU-1) */}
      {registrando && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRegistrando(false)} />
          <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white">
              <h2 className="text-[22px] font-semibold text-[#18345C]">Registrar huésped</h2>
              <button onClick={() => setRegistrando(false)} className="text-[#AEBCC1] hover:text-[#1F2933] p-1">
                <CloseIcon />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <Campo label="Nombre completo *" error={errores.nombre}>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={INPUT_CLS} />
              </Campo>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo label="Tipo de documento">
                  <select
                    value={form.tipoDocumento}
                    onChange={e => setForm(f => ({ ...f, tipoDocumento: e.target.value as TipoDocumento }))}
                    className={INPUT_CLS}
                  >
                    <option value="DPI">DPI</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </Campo>
                <Campo label="Número de documento *" error={errores.documento}>
                  <input type="text" value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} className={INPUT_CLS} />
                </Campo>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo label="Teléfono *" error={errores.telefono}>
                  <input type="text" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={INPUT_CLS} />
                </Campo>
                <Campo label="Correo *" error={errores.correo}>
                  <input type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} className={INPUT_CLS} />
                </Campo>
              </div>
              <Campo label="Nacionalidad *" error={errores.nacionalidad}>
                <select value={form.nacionalidad} onChange={e => setForm(f => ({ ...f, nacionalidad: e.target.value }))} className={INPUT_CLS}>
                  {NACIONALIDADES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </Campo>
              <p className="text-[12px] text-[#AEBCC1]">Los campos marcados con * son obligatorios.</p>
            </div>

            <div className="px-5 pb-6 flex gap-3">
              <button
                onClick={() => setRegistrando(false)}
                className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
              >
                Guardar huésped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal perfil + historial (HU-17) */}
      {perfil && (
        <PerfilHuesped
          huesped={perfil}
          reservas={reservas.filter(r => r.huespedId === perfil.id)}
          habitaciones={habitaciones}
          onCerrar={() => setPerfilId(null)}
          onAbrirReserva={id => { setPerfilId(null); onAbrirReserva(id); }}
        />
      )}
    </div>
  );
}

function PerfilHuesped({
  huesped,
  reservas,
  habitaciones,
  onCerrar,
  onAbrirReserva,
}: {
  huesped: Huesped;
  reservas: Reserva[];
  habitaciones: HabitacionHotel[];
  onCerrar: () => void;
  onAbrirReserva: (id: string) => void;
}) {
  const ordenadas = [...reservas].sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada));
  const historicas = ordenadas.filter(r => r.estado === 'finalizada');

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />
      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
              <UserIcon size={20} />
            </span>
            <div>
              <h2 className="text-[22px] font-semibold text-[#18345C] leading-none">{huesped.nombre}</h2>
              <p className="text-[13px] text-[#AEBCC1] mt-1">{huesped.tipoDocumento} {huesped.documento}</p>
            </div>
          </div>
          <button onClick={onCerrar} className="text-[#AEBCC1] hover:text-[#1F2933] p-1 shrink-0">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px]">
            <Dato k="Teléfono" v={huesped.telefono} />
            <Dato k="Correo" v={huesped.correo} />
            <Dato k="Nacionalidad" v={huesped.nacionalidad} />
            <Dato k="Alta" v={formatoFecha(huesped.creadoEn)} />
          </div>

          <div>
            <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest mb-2">
              Historial de estadías ({historicas.length})
            </p>
            {ordenadas.length === 0 ? (
              <p className="text-[13px] text-[#AEBCC1]">Sin reservas registradas.</p>
            ) : (
              <div className="border border-[#E5E0D8] rounded-xl divide-y divide-[#F0EBE3]">
                {ordenadas.map(r => {
                  const hab = habitaciones.find(h => h.id === r.habitacionId) ?? null;
                  const cuenta = calcularCuenta(r, hab);
                  const meta = RESERVA_META[r.estado];
                  return (
                    <button
                      key={r.id}
                      onClick={() => onAbrirReserva(r.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F8F6F0] transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-[#18345C]">{r.codigo}</span>
                        <Chip cls={meta.chip}>{meta.label}</Chip>
                        <span className="text-[12px] text-[#AEBCC1]">Hab. {hab?.numero ?? '—'}</span>
                      </div>
                      <p className="text-[13px] text-[#6B7280] mt-1">
                        {formatoFecha(r.fechaEntrada)} → {formatoFecha(r.fechaSalida)} · {cuenta.noches} noche(s)
                      </p>
                      <p className="text-[12px] text-[#AEBCC1] mt-0.5">
                        Total {dinero(cuenta.total)} · pagado {dinero(cuenta.pagado)}
                        {r.servicios.length > 0 && ` · ${r.servicios.length} servicio(s)`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#AEBCC1]">{k}</p>
      <p className="text-[13px] text-[#1F2933] font-medium break-words">{v}</p>
    </div>
  );
}
