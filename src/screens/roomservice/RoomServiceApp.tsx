import { useMemo, useState } from 'react';
import type {
  Modulo,
  Pedido,
  ItemMenu,
  LineaPedido,
  NotificacionRS,
  SeccionRS,
  EstadoPedido,
} from '../../types';
import {
  MENU_INICIAL,
  PEDIDOS_INICIALES,
  ENCARGADO_RS,
  HABITACIONES_HOTEL,
  HUESPEDES_POR_HABITACION,
  generarId,
  ahoraISO,
  formatoHoraISO,
  turnoActual,
  siguienteNumeroPedido,
  pisoDeHabitacion,
} from '../../data';
import { SIGUIENTE_ESTADO, esTerminal, BellIcon, BedIcon, ClockIcon } from './rsUtils';
import ModuloSwitcher from '../ModuloSwitcher';
import PedidosPendientes from './PedidosPendientes';
import DetallePedido from './DetallePedido';
import NuevoPedidoModal from './NuevoPedidoModal';
import MenuCatalogo from './MenuCatalogo';
import HistorialPedidos from './HistorialPedidos';
import Cargos from './Cargos';

const SECCIONES: { id: SeccionRS; label: string; labelCorto: string }[] = [
  { id: 'pedidos', label: 'Pedidos pendientes', labelCorto: 'Pedidos' },
  { id: 'menu', label: 'Menú y catálogo', labelCorto: 'Menú' },
  { id: 'cargos', label: 'Cargos a habitaciones', labelCorto: 'Cargos' },
  { id: 'historial', label: 'Historial de pedidos', labelCorto: 'Historial' },
];

function SeccionIcon({ id, size = 18 }: { id: SeccionRS; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 } as const;
  if (id === 'pedidos')
    return (
      <svg {...p}>
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.3A1 1 0 0 0 6 19h12" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </svg>
    );
  if (id === 'menu')
    return (
      <svg {...p}>
        <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M13 2v20M13 8h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-4" />
      </svg>
    );
  if (id === 'cargos')
    return (
      <svg {...p}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface Props {
  onCambiarModulo: (m: Modulo) => void;
}

export default function RoomServiceApp({ onCambiarModulo }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_INICIALES);
  const [menu, setMenu] = useState<ItemMenu[]>(MENU_INICIAL);
  const [seccion, setSeccion] = useState<SeccionRS>('pedidos');
  const [pedidoAbierto, setPedidoAbierto] = useState<string | null>(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionRS[]>([]);
  const [toasts, setToasts] = useState<NotificacionRS[]>([]);
  const [panelNotif, setPanelNotif] = useState(false);

  const turno = useMemo(() => turnoActual(), []);

  const pedidoActual = pedidos.find(p => p.id === pedidoAbierto) ?? null;
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const nuevosTurno = pedidos.filter(p => p.turno === turno && p.estado === 'nuevo').length;

  /* ---------- Cambios de estado (HU-04) ---------- */
  function avanzarEstado(id: string) {
    setPedidos(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const siguiente = SIGUIENTE_ESTADO[p.estado];
        if (!siguiente) return p;
        const ahora = ahoraISO();
        return {
          ...p,
          estado: siguiente,
          entregadoEn: siguiente === 'entregado' ? ahora : p.entregadoEn,
          historial: [...p.historial, { estado: siguiente, fechaHora: ahora }],
        };
      })
    );
  }

  /* ---------- Cancelación (HU-05) ---------- */
  function cancelarPedido(id: string, motivo: string) {
    setPedidos(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (esTerminal(p.estado)) return p; // no se puede cancelar un pedido ya cerrado
        const ahora = ahoraISO();
        return {
          ...p,
          estado: 'cancelado' as EstadoPedido,
          motivoCancelacion: motivo,
          historial: [...p.historial, { estado: 'cancelado', fechaHora: ahora, motivo }],
        };
      })
    );
  }

  /* ---------- Pedido telefónico (HU-03) ---------- */
  function crearPedidoTelefonico(datos: {
    habitacionNumero: string;
    huesped: string;
    lineas: LineaPedido[];
    notaGeneral: string;
  }) {
    const ahora = ahoraISO();
    const nuevo: Pedido = {
      id: generarId(),
      numero: siguienteNumeroPedido(),
      habitacionNumero: datos.habitacionNumero,
      piso: pisoDeHabitacion(datos.habitacionNumero),
      huesped: datos.huesped,
      origen: 'telefono',
      turno,
      lineas: datos.lineas,
      notaGeneral: datos.notaGeneral,
      estado: 'nuevo',
      creadoEn: ahora,
      historial: [{ estado: 'nuevo', fechaHora: ahora }],
    };
    setPedidos(prev => [nuevo, ...prev]);
    setMostrarNuevo(false);
    setSeccion('pedidos');
  }

  /* ---------- Pedido entrante de la app + notificación (HU-10) ---------- */
  function simularPedidoEntrante() {
    const disponibles = menu.filter(i => i.disponible);
    if (disponibles.length === 0) return;

    const habitacion = HABITACIONES_HOTEL[Math.floor(Math.random() * HABITACIONES_HOTEL.length)];
    const cuantos = 1 + Math.floor(Math.random() * 2);
    const elegidos: ItemMenu[] = [];
    for (let i = 0; i < cuantos; i++) {
      const cand = disponibles[Math.floor(Math.random() * disponibles.length)];
      if (!elegidos.includes(cand)) elegidos.push(cand);
    }
    const lineas: LineaPedido[] = elegidos.map(it => ({
      itemId: it.id,
      nombre: it.nombre,
      precioUnitario: it.precio,
      cantidad: 1 + Math.floor(Math.random() * 2),
    }));

    const ahora = ahoraISO();
    const pedido: Pedido = {
      id: generarId(),
      numero: siguienteNumeroPedido(),
      habitacionNumero: habitacion,
      piso: pisoDeHabitacion(habitacion),
      huesped: HUESPEDES_POR_HABITACION[habitacion] ?? `Huésped en habitación ${habitacion}`,
      origen: 'app',
      turno,
      lineas,
      notaGeneral: '',
      estado: 'nuevo',
      creadoEn: ahora,
      historial: [{ estado: 'nuevo', fechaHora: ahora }],
    };

    const notif: NotificacionRS = {
      id: generarId(),
      pedidoId: pedido.id,
      habitacionNumero: habitacion,
      hora: ahora,
      leida: false,
    };

    setPedidos(prev => [pedido, ...prev]);
    setNotificaciones(prev => [notif, ...prev]);
    setToasts(prev => [notif, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== notif.id));
    }, 8000);
  }

  /* ---------- Menú (HU-06 / HU-07) ---------- */
  function marcarAgotado(id: string) {
    setMenu(prev => prev.map(i => (i.id === id ? { ...i, disponible: false } : i)));
  }
  function reactivarItem(id: string) {
    setMenu(prev => prev.map(i => (i.id === id ? { ...i, disponible: true } : i)));
  }

  /* ---------- Notificaciones ---------- */
  function abrirDesdeNotificacion(notif: NotificacionRS) {
    setNotificaciones(prev => prev.map(n => (n.id === notif.id ? { ...n, leida: true } : n)));
    setToasts(prev => prev.filter(t => t.id !== notif.id));
    setPanelNotif(false);
    setPedidoAbierto(notif.pedidoId);
  }
  function abrirDetalle(id: string) {
    setPedidoAbierto(id);
  }

  /* ---------- Contenido por sección ---------- */
  const contenido = (() => {
    switch (seccion) {
      case 'pedidos':
        return (
          <PedidosPendientes
            pedidos={pedidos}
            turno={turno}
            onAbrirDetalle={abrirDetalle}
            onNuevoTelefonico={() => setMostrarNuevo(true)}
            onSimularEntrante={simularPedidoEntrante}
          />
        );
      case 'menu':
        return <MenuCatalogo menu={menu} onMarcarAgotado={marcarAgotado} onReactivar={reactivarItem} />;
      case 'cargos':
        return <Cargos pedidos={pedidos} onAbrirDetalle={abrirDetalle} />;
      case 'historial':
        return <HistorialPedidos pedidos={pedidos} turno={turno} />;
    }
  })();

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — escritorio */}
        <nav className="hidden lg:flex flex-col w-56 shrink-0 h-full" style={{ backgroundColor: '#102747' }}>
          <div className="px-5 pt-7 pb-6 border-b shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <p className="text-white text-xl font-bold leading-tight" style={{ letterSpacing: '0.02em' }}>
              Villa Serena
            </p>
            <p className="text-xs mt-1" style={{ color: '#AEBCC1', letterSpacing: '0.06em' }}>
              Room Service
            </p>
          </div>

          <div className="flex-1 py-3 overflow-y-auto">
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = s.id === 'pedidos' ? nuevosTurno : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setSeccion(s.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors relative"
                  style={{ color: active ? '#FFFFFF' : '#AEBCC1', backgroundColor: active ? '#18345C' : 'transparent' }}
                >
                  {active && <span className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: '#D8B94E' }} />}
                  <span style={{ color: active ? '#D8B94E' : '#AEBCC1' }}>
                    <SeccionIcon id={s.id} />
                  </span>
                  <span className="text-sm font-medium flex-1">{s.label}</span>
                  {badge > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <ModuloSwitcher actual="roomservice" onCambiar={onCambiarModulo} />

          <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#1d3a5f' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ backgroundColor: '#D8B94E', color: '#102747' }}
              >
                DF
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{ENCARGADO_RS}</p>
                <p className="text-[10px] truncate" style={{ color: '#AEBCC1' }}>
                  Room Service · turno de {turno}
                </p>
              </div>
            </div>
          </div>
        </nav>

        {/* Área de contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra superior */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ backgroundColor: '#102747' }}>
            <p className="lg:hidden text-white text-lg font-bold">Villa Serena</p>
            <span className="lg:hidden text-[#AEBCC1] text-xs">·</span>
            <p className="text-[#AEBCC1] text-xs font-medium truncate flex-1">
              {SECCIONES.find(s => s.id === seccion)?.label}
            </p>

            <div className="lg:hidden flex gap-1.5 shrink-0">
              <ModuloSwitcher actual="roomservice" onCambiar={onCambiarModulo} variant="inline" />
            </div>

            {/* Campana de notificaciones */}
            <div className="relative">
              <button
                onClick={() => setPanelNotif(v => !v)}
                className="relative text-[#AEBCC1] hover:text-white p-1"
                aria-label="Notificaciones"
              >
                <BellIcon size={20} />
                {noLeidas > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                  >
                    {noLeidas}
                  </span>
                )}
              </button>

              {panelNotif && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setPanelNotif(false)} />
                  <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white border border-[#E5E0D8] rounded-xl shadow-2xl z-30">
                    <div className="px-4 py-3 border-b border-[#E5E0D8]">
                      <p className="text-[14px] font-semibold text-[#18345C]">Notificaciones</p>
                    </div>
                    {notificaciones.length === 0 ? (
                      <p className="px-4 py-6 text-[13px] text-[#AEBCC1] text-center">
                        Sin notificaciones. Los nuevos pedidos de la app aparecerán aquí.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#F0EBE3]">
                        {notificaciones.map(n => (
                          <button
                            key={n.id}
                            onClick={() => abrirDesdeNotificacion(n)}
                            className={`w-full text-left px-4 py-3 hover:bg-[#F8F6F0] transition-colors flex items-start gap-3 ${
                              n.leida ? 'opacity-60' : ''
                            }`}
                          >
                            <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
                              <BedIcon size={15} />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[14px] font-medium text-[#1F2933]">
                                Nuevo pedido · Habitación {n.habitacionNumero}
                              </p>
                              <p className="text-[12px] text-[#AEBCC1] flex items-center gap-1 mt-0.5">
                                <ClockIcon size={11} />
                                {formatoHoraISO(n.hora)} · Ver detalle
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sección activa */}
          <div className="flex-1 flex overflow-hidden relative">{contenido}</div>

          {/* Navegación inferior — móvil */}
          <div className="lg:hidden flex shrink-0 border-t" style={{ backgroundColor: '#102747', borderColor: '#1d3a5f' }}>
            {SECCIONES.map(s => {
              const active = seccion === s.id;
              const badge = s.id === 'pedidos' ? nuevosTurno : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setSeccion(s.id)}
                  className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors min-w-0"
                  style={{ color: active ? '#D8B94E' : '#AEBCC1' }}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5" style={{ backgroundColor: '#D8B94E' }} />
                  )}
                  <span className="relative">
                    <SeccionIcon id={s.id} size={20} />
                    {badge > 0 && (
                      <span
                        className="absolute -top-1 -right-2 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#D8B94E', color: '#102747' }}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] font-medium leading-tight truncate max-w-full px-0.5">{s.labelCorto}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toasts de nuevos pedidos (HU-10) */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-[calc(100%-2rem)] sm:w-80">
        {toasts.map(t => (
          <button
            key={t.id}
            onClick={() => abrirDesdeNotificacion(t)}
            className="w-full text-left bg-white border border-[#18345C] rounded-xl shadow-2xl px-4 py-3 flex items-start gap-3 animate-[fadein_0.2s_ease-out]"
          >
            <span className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
              <BellIcon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#18345C]">Nuevo pedido de Room Service</p>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Habitación {t.habitacionNumero} · {formatoHoraISO(t.hora)}
              </p>
              <p className="text-[12px] text-[#18345C] font-medium mt-1">Toca para ver el detalle</p>
            </div>
          </button>
        ))}
      </div>

      {/* Modales */}
      {pedidoActual && (
        <DetallePedido
          pedido={pedidoActual}
          onCerrar={() => setPedidoAbierto(null)}
          onAvanzarEstado={avanzarEstado}
          onCancelar={(id, motivo) => cancelarPedido(id, motivo)}
        />
      )}

      {mostrarNuevo && (
        <NuevoPedidoModal
          menu={menu}
          onCerrar={() => setMostrarNuevo(false)}
          onGuardar={crearPedidoTelefonico}
        />
      )}
    </div>
  );
}
