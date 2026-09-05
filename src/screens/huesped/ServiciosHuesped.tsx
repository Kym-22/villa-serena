import { useEffect, useRef, useState } from 'react';
import type {
  ItemMenu,
  CategoriaMenu,
  ServicioCatalogo,
  CategoriaServicioHuesped,
  PedidoHuesped,
  MensajeChat,
  HabitacionHotel,
  LineaPedidoHuesped,
  TipoPedidoHuesped,
} from '../../types';
import {
  formatoHoraISO,
  minutosEntre,
  ALERGIAS_FRECUENTES,
  TELEFONO_RECEPCION,
} from '../../data';
import {
  dinero,
  Chip,
  Campo,
  INPUT_CLS,
  Cabecera,
  Tarjeta,
  Aviso,
  Vacio,
  BotonFiltro,
  BotonPrimario,
  BotonSecundario,
  ESTADO_PEDIDO_META,
  PASOS_PEDIDO,
  pedidoActivo,
  totalPedido,
  CartIcon,
  ChatIcon,
  ClockIcon,
  CheckIcon,
  AlertIcon,
  PlusIcon,
} from './huespedUtils';

type Pestana = 'restaurante' | 'servicios' | 'pedidos' | 'chat';

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: 'restaurante', label: 'Restaurante' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'pedidos', label: 'Mis pedidos' },
  { id: 'chat', label: 'Chat con recepción' },
];

const CATEGORIAS_MENU: CategoriaMenu[] = ['Desayuno', 'Principales', 'Ligero', 'Postres', 'Bebidas'];
const CATEGORIAS_SERVICIO: CategoriaServicioHuesped[] = ['Habitación', 'Limpieza', 'Bienestar', 'Recepción'];

// Tiempo de preparación de cocina que se muestra al huésped.
const MINUTOS_RESTAURANTE = 35;

type Carrito = Record<string, number>;

interface Props {
  menu: ItemMenu[];
  servicios: ServicioCatalogo[];
  pedidos: PedidoHuesped[];
  mensajes: MensajeChat[];
  escribiendo: boolean;
  habitacion: HabitacionHotel;
  estanciaCerrada: boolean;
  onCrearPedido: (datos: {
    tipo: TipoPedidoHuesped;
    lineas: LineaPedidoHuesped[];
    nota: string;
    alergias: string;
    minutosEstimados: number;
  }) => number;
  onCancelarPedido: (id: string) => void;
  onEnviarMensaje: (texto: string) => void;
  onIrCuenta: () => void;
}

export default function ServiciosHuesped({
  menu,
  servicios,
  pedidos,
  mensajes,
  escribiendo,
  habitacion,
  estanciaCerrada,
  onCrearPedido,
  onCancelarPedido,
  onEnviarMensaje,
  onIrCuenta,
}: Props) {
  const [pestana, setPestana] = useState<Pestana>('restaurante');

  const [catMenu, setCatMenu] = useState<CategoriaMenu | 'todas'>('todas');
  const [catServicio, setCatServicio] = useState<CategoriaServicioHuesped | 'todas'>('todas');

  const [carritoMenu, setCarritoMenu] = useState<Carrito>({});
  const [carritoServicios, setCarritoServicios] = useState<Carrito>({});

  const [alergias, setAlergias] = useState<string[]>([]);
  const [otraAlergia, setOtraAlergia] = useState('');
  const [notaMenu, setNotaMenu] = useState('');
  const [notaServicio, setNotaServicio] = useState('');

  const activos = pedidos.filter(pedidoActivo);

  const itemsMenu = menu.filter(i => catMenu === 'todas' || i.categoria === catMenu);
  const itemsServicio = servicios.filter(s => catServicio === 'todas' || s.categoria === catServicio);

  const lineasMenu: LineaPedidoHuesped[] = Object.entries(carritoMenu)
    .filter(([, c]) => c > 0)
    .map(([id, cantidad]) => {
      const item = menu.find(m => m.id === id)!;
      return { refId: id, nombre: item.nombre, precioUnitario: item.precio, cantidad };
    });

  const lineasServicio: LineaPedidoHuesped[] = Object.entries(carritoServicios)
    .filter(([, c]) => c > 0)
    .map(([id, cantidad]) => {
      const s = servicios.find(x => x.id === id)!;
      return { refId: id, nombre: s.nombre, precioUnitario: s.precio, cantidad };
    });

  const totalMenu = lineasMenu.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);
  const totalServicio = lineasServicio.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);

  function cambiar(carrito: Carrito, set: (c: Carrito) => void, id: string, delta: number) {
    const actual = carrito[id] ?? 0;
    const nuevo = Math.max(0, Math.min(20, actual + delta));
    set({ ...carrito, [id]: nuevo });
  }

  function textoAlergias(): string {
    const extra = otraAlergia.trim();
    return [...alergias, ...(extra ? [extra] : [])].join(', ');
  }

  function enviarPedidoMenu() {
    if (lineasMenu.length === 0) return;
    onCrearPedido({
      tipo: 'restaurante',
      lineas: lineasMenu,
      nota: notaMenu.trim(),
      alergias: textoAlergias(),
      minutosEstimados: MINUTOS_RESTAURANTE,
    });
    setCarritoMenu({});
    setNotaMenu('');
    setPestana('pedidos');
  }

  function enviarPedidoServicio() {
    if (lineasServicio.length === 0) return;
    const minutos = Math.max(
      ...lineasServicio.map(l => servicios.find(s => s.id === l.refId)?.minutosEstimados ?? 20),
    );
    onCrearPedido({
      tipo: 'servicio',
      lineas: lineasServicio,
      nota: notaServicio.trim(),
      alergias: '',
      minutosEstimados: minutos,
    });
    setCarritoServicios({});
    setNotaServicio('');
    setPestana('pedidos');
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera
        titulo="Servicios y pedidos"
        subtitulo={`Habitación ${habitacion.numero} · todo se carga a la cuenta de tu estancia`}
      >
        <button
          onClick={onIrCuenta}
          className="px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
        >
          Ver mi cuenta
        </button>
      </Cabecera>

      {/* Pestañas */}
      <div className="px-4 sm:px-6 pt-5 flex gap-2 flex-wrap">
        {PESTANAS.map(p => (
          <BotonFiltro key={p.id} activo={pestana === p.id} onClick={() => setPestana(p.id)}>
            {p.label}
            {p.id === 'pedidos' && activos.length > 0 && (
              <span className="ml-1.5 text-[11px] font-bold">({activos.length})</span>
            )}
          </BotonFiltro>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {estanciaCerrada && (
          <Aviso tono="alerta">
            Tu estancia finalizó, por lo que ya no es posible hacer pedidos a la habitación.
          </Aviso>
        )}

        {/* ---------- RESTAURANTE ---------- */}
        {pestana === 'restaurante' && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <BotonFiltro activo={catMenu === 'todas'} onClick={() => setCatMenu('todas')}>Todo el menú</BotonFiltro>
                {CATEGORIAS_MENU.map(c => (
                  <BotonFiltro key={c} activo={catMenu === c} onClick={() => setCatMenu(c)}>{c}</BotonFiltro>
                ))}
              </div>

              <div className="space-y-3">
                {itemsMenu.map(item => (
                  <FilaCatalogo
                    key={item.id}
                    nombre={item.nombre}
                    descripcion={item.descripcion}
                    precio={item.precio}
                    etiqueta={item.categoria}
                    disponible={item.disponible && !estanciaCerrada}
                    motivoNoDisponible={!item.disponible ? 'Agotado hoy' : 'Estancia finalizada'}
                    cantidad={carritoMenu[item.id] ?? 0}
                    onCambiar={d => cambiar(carritoMenu, setCarritoMenu, item.id, d)}
                  />
                ))}
              </div>
            </div>

            {/* Carrito del restaurante */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-0 space-y-4">
                <Tarjeta titulo="Tu pedido">
                  {lineasMenu.length === 0 ? (
                    <p className="text-[14px] text-[#AEBCC1] py-4 text-center">
                      Aún no has agregado nada del menú.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {lineasMenu.map(l => (
                          <div key={l.refId} className="flex items-start gap-2 text-[14px]">
                            <span className="text-[#18345C] font-semibold shrink-0">{l.cantidad}×</span>
                            <span className="flex-1 text-[#6B7280]">{l.nombre}</span>
                            <span className="text-[#18345C] font-medium shrink-0">
                              {dinero(l.cantidad * l.precioUnitario)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#E5E0D8] mt-3 pt-3 flex justify-between items-baseline">
                        <span className="text-[15px] font-semibold text-[#18345C]">Total</span>
                        <span className="text-[22px] font-bold text-[#18345C]">{dinero(totalMenu)}</span>
                      </div>

                      <p className="text-[12px] text-[#AEBCC1] mt-1 flex items-center gap-1">
                        <ClockIcon size={12} /> Entrega estimada: {MINUTOS_RESTAURANTE} minutos
                      </p>
                    </>
                  )}
                </Tarjeta>

                <Tarjeta titulo="Alergias y preferencias">
                  <div className="flex flex-wrap gap-2">
                    {ALERGIAS_FRECUENTES.map(a => {
                      const activa = alergias.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() =>
                            setAlergias(as => (activa ? as.filter(x => x !== a) : [...as, a]))
                          }
                          className={`px-3 py-2 min-h-[44px] text-[13px] font-medium rounded-md border transition-colors ${
                            activa
                              ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
                              : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:bg-[#F8F6F0]'
                          }`}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 space-y-3">
                    <Campo label="Otra alergia o intolerancia">
                      <input
                        value={otraAlergia}
                        onChange={e => setOtraAlergia(e.target.value)}
                        className={INPUT_CLS}
                        placeholder="Indícalo aquí"
                      />
                    </Campo>
                    <Campo label="Nota para la cocina">
                      <textarea
                        value={notaMenu}
                        onChange={e => setNotaMenu(e.target.value)}
                        rows={2}
                        className={INPUT_CLS}
                        placeholder="Sin cebolla, tocar el timbre…"
                      />
                    </Campo>
                  </div>

                  {alergias.length > 0 && (
                    <div className="mt-3">
                      <Aviso tono="alerta">
                        <span className="flex items-start gap-2">
                          <AlertIcon /> La cocina recibirá tu aviso de alergias junto con el pedido.
                        </span>
                      </Aviso>
                    </div>
                  )}

                  <div className="mt-4">
                    <BotonPrimario
                      ancho
                      disabled={lineasMenu.length === 0 || estanciaCerrada}
                      onClick={enviarPedidoMenu}
                    >
                      Enviar pedido {totalMenu > 0 && `· ${dinero(totalMenu)}`}
                    </BotonPrimario>
                    <p className="text-[12px] text-[#AEBCC1] mt-2 text-center">
                      El importe se carga a la cuenta de la habitación {habitacion.numero}.
                    </p>
                  </div>
                </Tarjeta>
              </div>
            </div>
          </div>
        )}

        {/* ---------- SERVICIOS ---------- */}
        {pestana === 'servicios' && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <BotonFiltro activo={catServicio === 'todas'} onClick={() => setCatServicio('todas')}>Todos</BotonFiltro>
                {CATEGORIAS_SERVICIO.map(c => (
                  <BotonFiltro key={c} activo={catServicio === c} onClick={() => setCatServicio(c)}>{c}</BotonFiltro>
                ))}
              </div>

              <div className="space-y-3">
                {itemsServicio.map(s => (
                  <FilaCatalogo
                    key={s.id}
                    nombre={s.nombre}
                    descripcion={s.descripcion}
                    precio={s.precio}
                    etiqueta={`${s.categoria} · ${s.minutosEstimados} min`}
                    disponible={!estanciaCerrada}
                    motivoNoDisponible="Estancia finalizada"
                    cantidad={carritoServicios[s.id] ?? 0}
                    onCambiar={d => cambiar(carritoServicios, setCarritoServicios, s.id, d)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-0">
                <Tarjeta titulo="Servicios solicitados">
                  {lineasServicio.length === 0 ? (
                    <p className="text-[14px] text-[#AEBCC1] py-4 text-center">
                      Elige los servicios que necesites en tu habitación.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {lineasServicio.map(l => (
                          <div key={l.refId} className="flex items-start gap-2 text-[14px]">
                            <span className="text-[#18345C] font-semibold shrink-0">{l.cantidad}×</span>
                            <span className="flex-1 text-[#6B7280]">{l.nombre}</span>
                            <span className="text-[#18345C] font-medium shrink-0">
                              {l.precioUnitario === 0 ? 'Sin costo' : dinero(l.cantidad * l.precioUnitario)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#E5E0D8] mt-3 pt-3 flex justify-between items-baseline">
                        <span className="text-[15px] font-semibold text-[#18345C]">Total</span>
                        <span className="text-[22px] font-bold text-[#18345C]">{dinero(totalServicio)}</span>
                      </div>
                    </>
                  )}

                  <div className="mt-4">
                    <Campo label="Indicaciones para el personal">
                      <textarea
                        value={notaServicio}
                        onChange={e => setNotaServicio(e.target.value)}
                        rows={2}
                        className={INPUT_CLS}
                        placeholder="Pasar después de las 14:00, dejar en la puerta…"
                      />
                    </Campo>
                  </div>

                  <div className="mt-4">
                    <BotonPrimario
                      ancho
                      disabled={lineasServicio.length === 0 || estanciaCerrada}
                      onClick={enviarPedidoServicio}
                    >
                      Solicitar servicios
                    </BotonPrimario>
                  </div>
                </Tarjeta>
              </div>
            </div>
          </div>
        )}

        {/* ---------- MIS PEDIDOS ---------- */}
        {pestana === 'pedidos' && (
          <div className="space-y-4 max-w-3xl">
            {pedidos.length === 0 ? (
              <Vacio msg="Todavía no has hecho pedidos durante esta estancia." />
            ) : (
              pedidos.map(p => (
                <SeguimientoPedido key={p.id} pedido={p} onCancelar={() => onCancelarPedido(p.id)} />
              ))
            )}
          </div>
        )}

        {/* ---------- CHAT ---------- */}
        {pestana === 'chat' && (
          <div className="max-w-3xl">
            <ChatRecepcion
              mensajes={mensajes}
              escribiendo={escribiendo}
              onEnviar={onEnviarMensaje}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Fila de catálogo con selector de cantidad
   ========================================================= */

function FilaCatalogo({
  nombre,
  descripcion,
  precio,
  etiqueta,
  disponible,
  motivoNoDisponible,
  cantidad,
  onCambiar,
}: {
  nombre: string;
  descripcion: string;
  precio: number;
  etiqueta: string;
  disponible: boolean;
  motivoNoDisponible: string;
  cantidad: number;
  onCambiar: (delta: number) => void;
}) {
  return (
    <div className={`bg-white border rounded-xl px-4 py-4 ${cantidad > 0 ? 'border-[#18345C]' : 'border-[#E5E0D8]'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[16px] font-semibold text-[#18345C]">{nombre}</p>
            <Chip cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">{etiqueta}</Chip>
            {!disponible && (
              <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">{motivoNoDisponible}</Chip>
            )}
          </div>
          <p className="text-[14px] text-[#6B7280] mt-1">{descripcion}</p>
          <p className="text-[15px] font-semibold text-[#18345C] mt-1.5">
            {precio === 0 ? 'Sin costo adicional' : dinero(precio)}
          </p>
        </div>

        <div className="shrink-0">
          {cantidad === 0 ? (
            <button
              onClick={() => onCambiar(1)}
              disabled={!disponible}
              className={`px-4 py-2.5 min-h-[44px] text-[14px] font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                disponible
                  ? 'bg-[#18345C] text-white hover:bg-[#102747]'
                  : 'bg-[#F8F6F0] text-[#AEBCC1] cursor-not-allowed'
              }`}
            >
              <PlusIcon /> Agregar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCambiar(-1)}
                aria-label="Quitar una unidad"
                className="w-11 h-11 flex items-center justify-center rounded-md border border-[#E5E0D8] text-[#18345C] text-[18px] font-bold hover:bg-[#F8F6F0]"
              >
                −
              </button>
              <span className="text-[17px] font-semibold text-[#18345C] w-6 text-center">{cantidad}</span>
              <button
                onClick={() => onCambiar(1)}
                aria-label="Agregar una unidad"
                className="w-11 h-11 flex items-center justify-center rounded-md border border-[#E5E0D8] text-[#18345C] text-[18px] font-bold hover:bg-[#F8F6F0]"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HU-03 · Seguimiento en vivo del pedido
   ========================================================= */

function SeguimientoPedido({ pedido, onCancelar }: { pedido: PedidoHuesped; onCancelar: () => void }) {
  const em = ESTADO_PEDIDO_META[pedido.estado];
  const indice = PASOS_PEDIDO.indexOf(pedido.estado);
  const cancelado = pedido.estado === 'cancelado';
  const transcurrido = minutosEntre(pedido.creadoEn, pedido.entregadoEn);

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-xl px-4 sm:px-5 py-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
          <CartIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[17px] font-semibold text-[#18345C]">Pedido #{pedido.numero}</p>
            <Chip cls={em.chip}>{em.label}</Chip>
            <Chip cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">
              {pedido.tipo === 'restaurante' ? 'Restaurante' : 'Servicio'}
            </Chip>
          </div>
          <p className="text-[13px] text-[#AEBCC1] mt-1 flex items-center gap-1">
            <ClockIcon size={12} /> Pedido a las {formatoHoraISO(pedido.creadoEn)} · {transcurrido} min
            {pedido.estado === 'entregado' ? ' hasta la entrega' : ' transcurridos'}
          </p>
        </div>
        {totalPedido(pedido) > 0 && (
          <p className="text-[20px] font-bold text-[#18345C] shrink-0">{dinero(totalPedido(pedido))}</p>
        )}
      </div>

      {/* Línea de estados */}
      {!cancelado && (
        <div className="mt-4 flex items-center">
          {PASOS_PEDIDO.map((paso, i) => {
            const alcanzado = i <= indice;
            const meta = ESTADO_PEDIDO_META[paso];
            return (
              <div key={paso} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px]"
                    style={{ backgroundColor: alcanzado ? meta.dot : '#E5E0D8' }}
                  >
                    {alcanzado ? <CheckIcon size={12} /> : ''}
                  </span>
                  <span
                    className="text-[10px] text-center leading-tight max-w-[64px]"
                    style={{ color: alcanzado ? '#18345C' : '#AEBCC1' }}
                  >
                    {meta.label}
                  </span>
                </div>
                {i < PASOS_PEDIDO.length - 1 && (
                  <span
                    className="flex-1 h-0.5 mx-1 mb-4"
                    style={{ backgroundColor: i < indice ? ESTADO_PEDIDO_META[paso].dot : '#E5E0D8' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[14px] text-[#6B7280] mt-3">{em.descripcion}</p>

      <div className="mt-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-2.5 space-y-1">
        {pedido.lineas.map(l => (
          <div key={l.refId} className="flex items-start gap-2 text-[14px]">
            <span className="text-[#18345C] font-semibold shrink-0">{l.cantidad}×</span>
            <span className="flex-1 text-[#6B7280]">{l.nombre}</span>
            <span className="text-[#6B7280] shrink-0">
              {l.precioUnitario === 0 ? 'Sin costo' : dinero(l.cantidad * l.precioUnitario)}
            </span>
          </div>
        ))}
      </div>

      {(pedido.nota || pedido.alergias) && (
        <div className="mt-2 space-y-1">
          {pedido.alergias && (
            <p className="text-[13px] text-[#991B1B] flex items-center gap-1.5">
              <AlertIcon size={13} /> Alergias: {pedido.alergias}
            </p>
          )}
          {pedido.nota && <p className="text-[13px] text-[#6B7280]">Nota: {pedido.nota}</p>}
        </div>
      )}

      {pedido.estado === 'recibido' && (
        <div className="mt-4">
          <BotonSecundario onClick={onCancelar}>Cancelar pedido</BotonSecundario>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HU-03 · Mensajería con recepción
   ========================================================= */

function ChatRecepcion({
  mensajes,
  escribiendo,
  onEnviar,
}: {
  mensajes: MensajeChat[];
  escribiendo: boolean;
  onEnviar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState('');
  const finRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [mensajes.length, escribiendo]);

  function enviar() {
    const t = texto.trim();
    if (!t) return;
    onEnviar(t);
    setTexto('');
  }

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 sm:px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#18345C] flex items-center justify-center text-white shrink-0">
          <ChatIcon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#18345C]">Recepción</p>
          <p className="text-[12px] text-[#166534]">En línea · respondemos las 24 horas</p>
        </div>
        <a
          href={`tel:${TELEFONO_RECEPCION.replace(/\s/g, '')}`}
          className="text-[13px] font-semibold text-[#18345C] hover:underline shrink-0"
        >
          Llamar
        </a>
      </div>

      <div className="px-4 sm:px-5 py-4 space-y-3 max-h-[420px] overflow-y-auto bg-[#F8F6F0]">
        {mensajes.map(m => {
          const mio = m.autor === 'huesped';
          return (
            <div key={m.id} className={`flex ${mio ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                  mio
                    ? 'bg-[#18345C] text-white rounded-br-sm'
                    : 'bg-white text-[#1F2933] border border-[#E5E0D8] rounded-bl-sm'
                }`}
              >
                <p className="text-[14px] leading-snug">{m.texto}</p>
                <p className={`text-[10px] mt-1 ${mio ? 'text-[#AEBCC1]' : 'text-[#AEBCC1]'}`}>
                  {formatoHoraISO(m.hora)}
                </p>
              </div>
            </div>
          );
        })}

        {escribiendo && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E5E0D8] rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <p className="text-[13px] text-[#AEBCC1]">Recepción está escribiendo…</p>
            </div>
          </div>
        )}

        <div ref={finRef} />
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-[#E5E0D8] flex gap-2">
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') enviar();
          }}
          className={INPUT_CLS}
          placeholder="Escribe tu consulta a recepción…"
        />
        <button
          onClick={enviar}
          disabled={!texto.trim()}
          className={`px-4 py-2.5 min-h-[44px] text-[14px] font-semibold rounded-md transition-colors shrink-0 ${
            texto.trim()
              ? 'bg-[#18345C] text-white hover:bg-[#102747]'
              : 'bg-[#E5E0D8] text-[#AEBCC1] cursor-not-allowed'
          }`}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
