import { useMemo, useState } from 'react';
import type { ItemMenu, LineaPedido } from '../../types';
import {
  HABITACIONES_HOTEL,
  HUESPEDES_POR_HABITACION,
  pisoDeHabitacion,
} from '../../data';
import { Campo, CloseIcon, PhoneIcon, precio, totalLineas } from './rsUtils';

interface Props {
  menu: ItemMenu[];
  onCerrar: () => void;
  onGuardar: (datos: {
    habitacionNumero: string;
    huesped: string;
    lineas: LineaPedido[];
    notaGeneral: string;
  }) => void;
}

interface Seleccion {
  cantidad: number;
  nota: string;
}

export default function NuevoPedidoModal({ menu, onCerrar, onGuardar }: Props) {
  const [habitacion, setHabitacion] = useState('');
  const [huesped, setHuesped] = useState('');
  const [notaGeneral, setNotaGeneral] = useState('');
  const [seleccion, setSeleccion] = useState<Record<string, Seleccion>>({});
  const [errores, setErrores] = useState<{ habitacion?: string; lineas?: string }>({});

  // Solo se pueden pedir ítems disponibles (HU-06).
  const disponibles = useMemo(() => menu.filter(i => i.disponible), [menu]);

  const lineas: LineaPedido[] = useMemo(
    () =>
      Object.entries(seleccion)
        .filter(([, s]) => s.cantidad > 0)
        .map(([itemId, s]) => {
          const item = menu.find(i => i.id === itemId)!;
          return {
            itemId,
            nombre: item.nombre,
            precioUnitario: item.precio,
            cantidad: s.cantidad,
            nota: s.nota.trim() || undefined,
          };
        }),
    [seleccion, menu]
  );

  const total = totalLineas(lineas);

  function setCantidad(itemId: string, delta: number) {
    setSeleccion(prev => {
      const actual = prev[itemId] ?? { cantidad: 0, nota: '' };
      const cantidad = Math.max(0, actual.cantidad + delta);
      return { ...prev, [itemId]: { ...actual, cantidad } };
    });
    setErrores(e => ({ ...e, lineas: undefined }));
  }

  function setNota(itemId: string, nota: string) {
    setSeleccion(prev => {
      const actual = prev[itemId] ?? { cantidad: 0, nota: '' };
      return { ...prev, [itemId]: { ...actual, nota } };
    });
  }

  function elegirHabitacion(num: string) {
    setHabitacion(num);
    setHuesped(HUESPEDES_POR_HABITACION[num] ?? '');
    setErrores(e => ({ ...e, habitacion: undefined }));
  }

  function guardar() {
    const e: typeof errores = {};
    if (!habitacion) e.habitacion = 'Selecciona una habitación';
    if (lineas.length === 0) e.lineas = 'Agrega al menos un ítem al pedido';
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    onGuardar({
      habitacionNumero: habitacion,
      huesped: huesped.trim() || 'Huésped en habitación ' + habitacion,
      lineas,
      notaGeneral: notaGeneral.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />

      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E5E0D8] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="text-[#18345C]"><PhoneIcon size={16} /></span>
            <h2 className="text-[24px] font-semibold text-[#18345C]">Registrar pedido telefónico</h2>
          </div>
          <button onClick={onCerrar} className="text-[#AEBCC1] hover:text-[#1F2933] p-1">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Habitación y huésped */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Habitación" error={errores.habitacion}>
              <select
                value={habitacion}
                onChange={e => elegirHabitacion(e.target.value)}
                className="w-full border border-[#E5E0D8] rounded-md px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] bg-white"
              >
                <option value="">Seleccionar habitación…</option>
                {HABITACIONES_HOTEL.map(n => (
                  <option key={n} value={n}>
                    {n} · Piso {pisoDeHabitacion(n)}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Huésped">
              <input
                type="text"
                value={huesped}
                onChange={e => setHuesped(e.target.value)}
                placeholder="Nombre del huésped"
                className="w-full border border-[#E5E0D8] rounded-md px-3 py-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
              />
            </Campo>
          </div>

          {/* Menú */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[10px] text-[#AEBCC1] uppercase tracking-widest">Ítems del menú</p>
              {errores.lineas && <p className="text-xs text-[#991B1B]">{errores.lineas}</p>}
            </div>

            <div className="border border-[#E5E0D8] rounded-xl divide-y divide-[#F0EBE3] max-h-[38vh] overflow-y-auto">
              {disponibles.map(item => {
                const sel = seleccion[item.id] ?? { cantidad: 0, nota: '' };
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-[#1F2933]">{item.nombre}</p>
                        <p className="text-[12px] text-[#AEBCC1]">
                          {item.categoria} · {precio(item.precio)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Stepper
                          value={sel.cantidad}
                          onDec={() => setCantidad(item.id, -1)}
                          onInc={() => setCantidad(item.id, +1)}
                        />
                      </div>
                    </div>
                    {sel.cantidad > 0 && (
                      <input
                        type="text"
                        value={sel.nota}
                        onChange={e => setNota(item.id, e.target.value)}
                        placeholder="Nota para este ítem (sin cebolla, alergia…)"
                        className="w-full mt-2 border border-[#E5E0D8] rounded-md px-3 py-2 text-[13px] text-[#1F2933] focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[#AEBCC1] mt-1.5">
              Los ítems agotados no aparecen en esta lista.
            </p>
          </div>

          {/* Nota general */}
          <Campo label="Observaciones del pedido">
            <textarea
              rows={2}
              value={notaGeneral}
              onChange={e => setNotaGeneral(e.target.value)}
              placeholder="Alergias, hora preferida de entrega, indicaciones para llegar…"
              className="w-full border border-[#E5E0D8] rounded-md px-3 py-2.5 text-sm text-[#1F2933] resize-none focus:outline-none focus:border-[#18345C] placeholder:text-[#AEBCC1]"
            />
          </Campo>

          {/* Resumen */}
          <div className="flex items-center justify-between bg-[#F8F6F0] border border-[#E5E0D8] rounded-xl px-4 py-3">
            <div>
              <p className="text-[13px] text-[#6B7280]">
                {lineas.reduce((s, l) => s + l.cantidad, 0)} ítem(s) · quedará como <span className="font-semibold text-[#1E40AF]">Nuevo</span>
              </p>
            </div>
            <p className="text-[20px] font-bold text-[#18345C]">{precio(total)}</p>
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-6 flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Guardar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({
  value,
  onDec,
  onInc,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center border border-[#E5E0D8] rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onDec}
        disabled={value === 0}
        className="w-8 h-8 text-[#18345C] text-lg leading-none disabled:text-[#D8D3C8] hover:bg-[#F8F6F0] transition-colors"
      >
        −
      </button>
      <span className="w-8 text-center text-[15px] font-semibold text-[#1F2933]">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="w-8 h-8 text-[#18345C] text-lg leading-none hover:bg-[#F8F6F0] transition-colors"
      >
        +
      </button>
    </div>
  );
}
