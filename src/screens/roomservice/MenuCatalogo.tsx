import { useState } from 'react';
import type { ItemMenu, CategoriaMenu } from '../../types';
import { precio } from './rsUtils';

const ORDEN_CATEGORIAS: CategoriaMenu[] = [
  'Desayuno',
  'Principales',
  'Ligero',
  'Postres',
  'Bebidas',
];

interface Props {
  menu: ItemMenu[];
  onMarcarAgotado: (id: string) => void;
  onReactivar: (id: string) => void;
}

export default function MenuCatalogo({ menu, onMarcarAgotado, onReactivar }: Props) {
  // La reactivación de un ítem agotado requiere permiso de administrador (HU-07).
  const [modoAdmin, setModoAdmin] = useState(false);

  const disponibles = menu.filter(i => i.disponible).length;
  const agotados = menu.length - disponibles;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      {/* Cabecera */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">Menú y catálogo</h1>
            <p className="text-[15px] text-[#AEBCC1] mt-1">
              {disponibles} disponibles · {agotados} agotados
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none bg-[#F8F6F0] border border-[#E5E0D8] rounded-md px-3 py-2">
            <input
              type="checkbox"
              checked={modoAdmin}
              onChange={e => setModoAdmin(e.target.checked)}
              className="accent-[#18345C] w-4 h-4"
            />
            <span className="text-[14px] font-medium text-[#1F2933]">Modo administrador</span>
          </label>
        </div>
        {!modoAdmin && agotados > 0 && (
          <p className="text-[13px] text-[#9A3412] mt-2">
            Activa el modo administrador para reactivar ítems agotados.
          </p>
        )}
      </div>

      {/* Catálogo */}
      <div className="px-4 sm:px-6 py-5 space-y-7">
        {ORDEN_CATEGORIAS.map(cat => {
          const items = menu.filter(i => i.categoria === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="text-[20px] font-semibold text-[#18345C] mb-3">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-xl p-4 flex flex-col ${
                      item.disponible ? 'border-[#E5E0D8]' : 'border-[#FCA5A5]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[16px] font-semibold text-[#18345C]">{item.nombre}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide border shrink-0 ${
                          item.disponible
                            ? 'bg-[#F0FAF4] text-[#166534] border-[#86EFAC]'
                            : 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
                        }`}
                      >
                        {item.disponible ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#6B7280] mt-1 flex-1">{item.descripcion}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EBE3]">
                      <p className="text-[18px] font-bold text-[#18345C]">{precio(item.precio)}</p>

                      {item.disponible ? (
                        <button
                          onClick={() => onMarcarAgotado(item.id)}
                          className="text-[13px] font-semibold px-3 py-1.5 rounded-md border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                        >
                          Marcar agotado
                        </button>
                      ) : (
                        <button
                          onClick={() => onReactivar(item.id)}
                          disabled={!modoAdmin}
                          className="text-[13px] font-semibold px-3 py-1.5 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-[#18345C] text-[#18345C] hover:bg-[#18345C] hover:text-white"
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
