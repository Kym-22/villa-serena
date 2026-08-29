import type { Modulo } from '../types';

interface ModuloDef {
  id: Modulo;
  label: string;
  corto: string;
  icon: React.ReactNode;
}

const MODULOS: ModuloDef[] = [
  {
    id: 'limpieza',
    label: 'Módulo de Limpieza',
    corto: 'Limpieza',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    id: 'roomservice',
    label: 'Room Service',
    corto: 'Room Svc.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.3A1 1 0 0 0 6 19h12" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </svg>
    ),
  },
  {
    id: 'recepcion',
    label: 'Recepción',
    corto: 'Recepción',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 21V10l8-5 8 5v11" />
        <path d="M4 21h16M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Administración',
    corto: 'Admin',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" />
        <rect x="12" y="8" width="3" height="10" />
        <rect x="17" y="4" width="3" height="14" />
      </svg>
    ),
  },
];

/**
 * Botones para saltar entre los módulos del sistema.
 * `variant="sidebar"` → pensado para las barras laterales azul marino.
 * `variant="inline"`  → chips compactos para la barra superior en móvil.
 */
export default function ModuloSwitcher({
  actual,
  onCambiar,
  variant = 'sidebar',
}: {
  actual: Modulo;
  onCambiar: (m: Modulo) => void;
  variant?: 'sidebar' | 'inline';
}) {
  const otros = MODULOS.filter(m => m.id !== actual);

  if (variant === 'inline') {
    return (
      <>
        {otros.map(m => (
          <button
            key={m.id}
            onClick={() => onCambiar(m.id)}
            className="text-[#AEBCC1] text-[11px] font-medium border border-[#1d3a5f] rounded-md px-1.5 py-1 hover:text-white shrink-0 whitespace-nowrap"
          >
            {m.corto}
          </button>
        ))}
      </>
    );
  }

  return (
    <div className="px-3 pb-3 shrink-0 space-y-2">
      {otros.map(m => (
        <button
          key={m.id}
          onClick={() => onCambiar(m.id)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors hover:brightness-110"
          style={{ color: '#AEBCC1', backgroundColor: '#0d1f38' }}
        >
          <span style={{ color: '#D8B94E' }}>{m.icon}</span>
          <span className="text-sm font-medium flex-1">{m.label}</span>
          <span>›</span>
        </button>
      ))}
    </div>
  );
}
