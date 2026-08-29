import { useMemo, useState } from 'react';
import type { EntradaHistorial } from '../types';

const HABITACIONES = [
  'Todas',
  '101','102','103','104','105','106',
  '201','202','203','204','205',
  '301','302','303','304',
];

const TIPOS_ACTIVIDAD = [
  'Todas',
  'Limpieza',
  'Solicitudes',
  'Incidencias',
  'Objetos',
];

interface Props {
  historial: EntradaHistorial[];
}

function categoriaActividad(tipo: string): string {
  const t = tipo.toLowerCase();

  if (t.includes('incidencia')) return 'Incidencias';
  if (t.includes('artículo') || t.includes('solicitud')) return 'Solicitudes';
  if (t.includes('objeto')) return 'Objetos';
  if (t.includes('limpieza')) return 'Limpieza';

  return 'Otros';
}

function esActividadRelevante(tipo: string): boolean {
  const t = tipo.toLowerCase();

  // No mostrar eventos automáticos ni estados intermedios.
  if (t.includes('solicitud recibida')) return false;
  if (t.includes('artículo en proceso')) return false;
  if (t.includes('limpieza iniciada')) return false;

  return (
    t.includes('limpieza completa') ||
    t.includes('limpieza finalizada') ||
    t.includes('artículo entregado') ||
    t.includes('incidencia reportada') ||
    t.includes('objeto registrado')
  );
}

function etiquetaFecha(fechaHora: string): string {
  // Si el valor ya contiene una fecha antes de una coma, la usamos.
  // Si solo contiene una hora, se considera "Hoy" para este prototipo.
  if (fechaHora.includes(',')) {
    const posibleFecha = fechaHora.split(',')[0].trim();

    if (
      posibleFecha.toLowerCase() === 'hoy' ||
      posibleFecha.toLowerCase() === 'ayer' ||
      posibleFecha.toLowerCase().includes('día')
    ) {
      return posibleFecha;
    }
  }

  return 'Hoy';
}

export default function Historial({ historial }: Props) {
  const [filtroHab, setFiltroHab] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todas');
  const [filtroFecha, setFiltroFecha] = useState('Todas');

  const historialPersonal = useMemo(
    () =>
      historial.filter(
        e =>
          e.responsable === 'Carmen Vidal' &&
          esActividadRelevante(e.tipo)
      ),
    [historial]
  );

  const fechasDisponibles = useMemo(() => {
    const fechas = Array.from(
      new Set(historialPersonal.map(e => etiquetaFecha(e.fechaHora)))
    );

    return ['Todas', ...fechas];
  }, [historialPersonal]);

  const filtrado = useMemo(() => {
    return historialPersonal.filter(e => {
      if (
        filtroHab !== 'Todas' &&
        e.habitacionNumero !== filtroHab
      ) {
        return false;
      }

      if (
        filtroTipo !== 'Todas' &&
        categoriaActividad(e.tipo) !== filtroTipo
      ) {
        return false;
      }

      if (
        filtroFecha !== 'Todas' &&
        etiquetaFecha(e.fechaHora) !== filtroFecha
      ) {
        return false;
      }

      return true;
    });
  }, [historialPersonal, filtroHab, filtroTipo, filtroFecha]);

  function limpiarFiltros() {
    setFiltroHab('Todas');
    setFiltroTipo('Todas');
    setFiltroFecha('Todas');
  }

  function estadoCls(estado: string) {
    const e = estado.toLowerCase();

    if (
      e === 'limpia' ||
      e === 'finalizada' ||
      e === 'entregado' ||
      e === 'guardado' ||
      e === 'atendida' ||
      e === 'resuelta'
    ) {
      return 'text-[#166534] bg-[#F0FAF4] border-[#86EFAC]';
    }

    if (
      e === 'pendiente' ||
      e === 'en proceso' ||
      e === 'en limpieza'
    ) {
      return 'text-[#78450A] bg-[#FFFBEF] border-[#F3D98B]';
    }

    return 'text-[#475569] bg-[#F1F5F9] border-[#CBD5E1]';
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&display=swap');
      `}</style>

      {/* CABECERA */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">
              Historial
            </h1>

            <p className="text-[14px] text-[#AEBCC1] mt-1">
              {filtrado.length} registro{filtrado.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-[13px] text-[#AEBCC1] hover:text-[#18345C] transition-colors font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-3 flex-wrap">
          <FiltroSelect
            label="Habitación"
            value={filtroHab}
            options={HABITACIONES}
            onChange={setFiltroHab}
          />

          <FiltroSelect
            label="Tipo de actividad"
            value={filtroTipo}
            options={TIPOS_ACTIVIDAD}
            onChange={setFiltroTipo}
          />

          <FiltroSelect
            label="Fecha"
            value={filtroFecha}
            options={fechasDisponibles}
            onChange={setFiltroFecha}
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="px-4 sm:px-6 py-5">
        {filtrado.length === 0 ? (
          <div className="text-center py-14 text-[#AEBCC1] text-[15px]">
            No hay registros con los filtros aplicados.
          </div>
        ) : (
          <>
            {/* TABLA — TABLET Y ESCRITORIO */}
            <div className="hidden sm:block bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-3 bg-[#F8F6F0] border-b border-[#E5E0D8] text-[11px] text-[#AEBCC1] uppercase tracking-widest font-medium">
                <div className="col-span-2">Habitación</div>
                <div className="col-span-4">Actividad</div>
                <div className="col-span-3">Fecha y hora</div>
                <div className="col-span-3">Resultado</div>
              </div>

              <div className="divide-y divide-[#F0EBE3]">
                {filtrado.map((e, i) => (
                  <div
                    key={e.id}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center hover:bg-[#F8F6F0] transition-colors ${
                      i % 2 !== 0 ? 'bg-[#FDFCFA]' : ''
                    }`}
                  >
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 text-[#18345C]">
                        <BedIcon />
                        <span className="text-[20px] font-semibold">
                          {e.habitacionNumero}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-4 pr-3">
                      <p className="text-[15px] font-medium text-[#1F2933]">
                        {e.tipo}
                      </p>
                      <p className="text-[12px] text-[#AEBCC1] mt-0.5">
                        {categoriaActividad(e.tipo)}
                      </p>
                    </div>

                    <div className="col-span-3 text-[14px] text-[#6B7280]">
                      {e.fechaHora}
                    </div>

                    <div className="col-span-3">
                      <span
                        className={`inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide border ${estadoCls(
                          e.estado
                        )}`}
                      >
                        {e.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TARJETAS — MÓVIL */}
            <div className="sm:hidden space-y-3">
              {filtrado.map(e => (
                <div
                  key={e.id}
                  className="bg-white border border-[#E5E0D8] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-[#18345C]">
                        <BedIcon />
                        <span className="text-[26px] font-semibold leading-none">
                          {e.habitacionNumero}
                        </span>
                      </div>

                      <p className="text-[15px] text-[#1F2933] font-medium mt-2">
                        {e.tipo}
                      </p>

                      <p className="text-[12px] text-[#AEBCC1] mt-0.5">
                        {categoriaActividad(e.tipo)}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide border shrink-0 ${estadoCls(
                        e.estado
                      )}`}
                    >
                      {e.estado}
                    </span>
                  </div>

                  <div className="text-[13px] text-[#AEBCC1]">
                    {e.fechaHora}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FiltroSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-[#AEBCC1] uppercase tracking-widest whitespace-nowrap hidden sm:block">
        {label}
      </label>

      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-[#E5E0D8] rounded-md px-3 py-2 text-[14px] text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
      >
        {options.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function BedIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7v10" />
      <path d="M21 10v7" />
      <path d="M3 13h18" />
      <path d="M5 13V9.5A1.5 1.5 0 0 1 6.5 8h3A1.5 1.5 0 0 1 11 9.5V13" />
      <path d="M11 13v-2a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v1" />
    </svg>
  );
}
