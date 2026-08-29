import { useMemo, useState } from 'react';
import type { Reserva, HabitacionHotel, TipoHabitacion } from '../../types';
import { fechaRelativaISO, formatoFecha } from '../../data';
import { dinero, calcularMetricas, descargarCSV, DownloadIcon } from './adminUtils';

type Periodo = '7d' | '30d' | 'mes' | 'anio';

interface Props {
  reservas: Reserva[];
  habitaciones: HabitacionHotel[];
  tarifasBase: Record<TipoHabitacion, number>;
}

function rango(periodo: Periodo): { desde: string; hasta: string; label: string } {
  const hasta = fechaRelativaISO(1); // exclusivo → incluye hoy
  const now = new Date();
  switch (periodo) {
    case '7d':
      return { desde: fechaRelativaISO(-6), hasta, label: 'Últimos 7 días' };
    case '30d':
      return { desde: fechaRelativaISO(-29), hasta, label: 'Últimos 30 días' };
    case 'mes': {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { desde: d.toISOString().slice(0, 10), hasta, label: 'Este mes' };
    }
    case 'anio': {
      const d = new Date(now.getFullYear(), 0, 1);
      return { desde: d.toISOString().slice(0, 10), hasta, label: 'Este año' };
    }
  }
}

export default function Reportes({ reservas, habitaciones, tarifasBase }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('30d');
  const { desde, hasta, label } = rango(periodo);

  const m = useMemo(
    () => calcularMetricas(desde, hasta, reservas, habitaciones, tarifasBase),
    [desde, hasta, reservas, habitaciones, tarifasBase],
  );

  const maxIngresoTipo = Math.max(1, ...m.porTipo.map(t => t.ingreso));
  const diasVisibles = m.porDia.slice(-31);
  const maxOcup = Math.max(1, ...diasVisibles.map(d => d.ocupacionPct));

  function exportar() {
    const filas: (string | number)[][] = [
      ['Reporte de desempeño', label],
      ['Período', `${formatoFecha(desde)} a ${formatoFecha(fechaRelativaISO(0))}`],
      [],
      ['Métrica', 'Valor'],
      ['Ocupación media (%)', m.ocupacionPct],
      ['ADR (tarifa media diaria)', m.adr],
      ['RevPAR', m.revpar],
      ['Noches vendidas', m.nochesVendidas],
      ['Noches disponibles', m.nochesDisponibles],
      ['Ingreso alojamiento', m.ingresoAlojamiento],
      ['Ingreso servicios', m.ingresoServicios],
      ['Ingreso total', m.ingresoTotal],
      [],
      ['Fecha', 'Ocupadas', 'Ocupación (%)', 'Ingreso alojamiento'],
      ...m.porDia.map(d => [d.fecha, d.ocupadas, d.ocupacionPct, d.ingreso]),
      [],
      ['Tipo de habitación', 'Noches vendidas', 'Ingreso'],
      ...m.porTipo.map(t => [t.tipo, t.noches, t.ingreso]),
    ];
    descargarCSV(`reporte-${periodo}-${fechaRelativaISO(0)}.csv`, filas);
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Reportes de desempeño</h1>
            <p className="text-[14px] text-[#AEBCC1] mt-1">
              {label} · {formatoFecha(desde)} → {formatoFecha(fechaRelativaISO(0))} · {m.dias} días
            </p>
          </div>
          <button
            onClick={exportar}
            className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            <DownloadIcon /> Exportar CSV
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          {([['7d', 'Últimos 7 días'], ['30d', 'Últimos 30 días'], ['mes', 'Este mes'], ['anio', 'Este año']] as [Periodo, string][]).map(
            ([id, txt]) => (
              <button
                key={id}
                onClick={() => setPeriodo(id)}
                className={`text-[13px] font-medium px-3 py-1.5 rounded-md border transition-colors ${
                  periodo === id ? 'bg-[#18345C] text-white border-[#18345C]' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                }`}
              >
                {txt}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-7">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <Kpi valor={`${m.ocupacionPct}%`} label="Ocupación media" destacado />
          <Kpi valor={dinero(m.adr)} label="ADR · tarifa media diaria" />
          <Kpi valor={dinero(m.revpar)} label="RevPAR · ingreso por hab. disponible" destacado />
          <Kpi valor={dinero(m.ingresoTotal)} label="Ingresos totales" />
          <Kpi valor={dinero(m.ingresoAlojamiento)} label="Ingreso por alojamiento" />
          <Kpi valor={dinero(m.ingresoServicios)} label="Ingreso por servicios" />
          <Kpi valor={String(m.nochesVendidas)} label="Noches vendidas" />
          <Kpi valor={`${m.nochesVendidas} / ${m.nochesDisponibles}`} label="Vendidas / disponibles" />
        </div>

        {/* Ocupación por día */}
        <section className="bg-white border border-[#E5E0D8] rounded-xl p-4">
          <h2 className="text-[16px] font-semibold text-[#18345C] mb-3">
            Ocupación por día {diasVisibles.length < m.porDia.length && `(últimos ${diasVisibles.length})`}
          </h2>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-40 min-w-full" style={{ minWidth: diasVisibles.length * 16 }}>
              {diasVisibles.map(d => (
                <div
                  key={d.fecha}
                  className="flex-1 h-full flex flex-col justify-end group relative"
                  style={{ minWidth: 10 }}
                  title={`${formatoFecha(d.fecha)} · ${d.ocupacionPct}% · ${d.ocupadas} hab.`}
                >
                  <div
                    className="w-full rounded-t bg-[#18345C] group-hover:bg-[#D8B94E] transition-colors"
                    style={{ height: `${Math.max(2, (d.ocupacionPct / maxOcup) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-[#AEBCC1] mt-2">
            <span>{formatoFecha(diasVisibles[0]?.fecha ?? desde)}</span>
            <span>{formatoFecha(diasVisibles[diasVisibles.length - 1]?.fecha ?? desde)}</span>
          </div>
        </section>

        {/* Ingresos por tipo */}
        <section className="bg-white border border-[#E5E0D8] rounded-xl p-4">
          <h2 className="text-[16px] font-semibold text-[#18345C] mb-3">Ingreso por tipo de habitación</h2>
          {m.porTipo.length === 0 ? (
            <p className="text-[13px] text-[#AEBCC1]">Sin datos en el período.</p>
          ) : (
            <div className="space-y-2.5">
              {m.porTipo.map(t => (
                <div key={t.tipo} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#1F2933] w-28 shrink-0">{t.tipo}</span>
                  <div className="flex-1 bg-[#F1F5F9] rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-[#18345C] rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(t.ingreso / maxIngresoTipo) * 100}%`, minWidth: 44 }}
                    >
                      <span className="text-[10px] font-semibold text-white">{dinero(t.ingreso)}</span>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#AEBCC1] w-16 shrink-0 text-right">{t.noches} noches</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tabla resumen diario */}
        <section className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-3 bg-[#F8F6F0] border-b border-[#E5E0D8] text-[11px] text-[#AEBCC1] uppercase tracking-widest font-medium">
            <span>Fecha</span>
            <span className="text-right">Ocupadas</span>
            <span className="text-right">Ocupación</span>
            <span className="text-right">Ingreso aloj.</span>
          </div>
          <div className="divide-y divide-[#F0EBE3] max-h-80 overflow-y-auto">
            {m.porDia.map(d => (
              <div key={d.fecha} className="grid grid-cols-4 px-4 py-2.5 text-[13px]">
                <span className="text-[#1F2933]">{formatoFecha(d.fecha)}</span>
                <span className="text-right text-[#6B7280]">{d.ocupadas}</span>
                <span className="text-right text-[#6B7280]">{d.ocupacionPct}%</span>
                <span className="text-right font-medium text-[#18345C]">{dinero(d.ingreso)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ valor, label, destacado }: { valor: string; label: string; destacado?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3.5 border ${destacado ? 'bg-[#18345C] border-[#18345C]' : 'bg-white border-[#E5E0D8]'}`}>
      <p className={`text-[24px] font-bold leading-none ${destacado ? 'text-white' : 'text-[#18345C]'}`}>{valor}</p>
      <p className={`text-[11px] mt-1.5 ${destacado ? 'text-[#AEBCC1]' : 'text-[#6B7280]'}`}>{label}</p>
    </div>
  );
}
