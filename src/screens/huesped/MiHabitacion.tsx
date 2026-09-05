import { useState } from 'react';
import type {
  HabitacionHotel,
  Domotica,
  TurnoAmenidad,
  ReservaAmenidad,
  AreaAmenidad,
} from '../../types';
import {
  fechaRelativaISO,
  formatoFecha,
  AMENIDADES_CONFIG,
  WIFI_RED,
} from '../../data';
import {
  Chip,
  Cabecera,
  Tarjeta,
  Aviso,
  Vacio,
  BotonFiltro,
  BotonPrimario,
  CodigoQR,
  plazasLibres,
  turnoLleno,
  KeyIcon,
  DoorIcon,
  ThermoIcon,
  LightIcon,
  CurtainIcon,
  WifiIcon,
  ClockIcon,
  CheckIcon,
  SparkIcon,
} from './huespedUtils';

const TEMP_MIN = 16;
const TEMP_MAX = 30;

interface Props {
  habitacion: HabitacionHotel;
  domotica: Domotica;
  turnos: TurnoAmenidad[];
  reservasAmenidad: ReservaAmenidad[];
  llaveActiva: boolean;
  codigoLlave?: string;
  estanciaCerrada: boolean;
  onActualizarDomotica: (cambios: Partial<Domotica>) => void;
  onActualizarLuz: (id: string, cambios: { encendida?: boolean; intensidad?: number }) => void;
  onConectarWifi: () => void;
  onReservarTurno: (turnoId: string, personas: number) => void;
  onCancelarTurno: (reservaId: string) => void;
  onIrCheckin: () => void;
}

export default function MiHabitacion({
  habitacion,
  domotica,
  turnos,
  reservasAmenidad,
  llaveActiva,
  codigoLlave,
  estanciaCerrada,
  onActualizarDomotica,
  onActualizarLuz,
  onConectarWifi,
  onReservarTurno,
  onCancelarTurno,
  onIrCheckin,
}: Props) {
  const [puerta, setPuerta] = useState<'cerrada' | 'abriendo' | 'abierta'>('cerrada');
  const [verQR, setVerQR] = useState(false);
  const [area, setArea] = useState<AreaAmenidad>('Spa');
  const [dia, setDia] = useState(fechaRelativaISO(0));

  const bloqueado = !llaveActiva;

  function abrirPuerta() {
    if (bloqueado || puerta !== 'cerrada') return;
    setPuerta('abriendo');
    // La cerradura real responde por Bluetooth; aquí se simula la espera.
    window.setTimeout(() => setPuerta('abierta'), 1200);
    window.setTimeout(() => setPuerta('cerrada'), 5000);
  }

  const config = AMENIDADES_CONFIG.find(a => a.area === area)!;
  const turnosDelDia = turnos.filter(t => t.area === area && t.fecha === dia);
  const dias = [0, 1, 2].map(d => fechaRelativaISO(d));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F0]" style={{ fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif' }}>
      <Cabecera
        titulo="Mi habitación"
        subtitulo={`Habitación ${habitacion.numero} · ${habitacion.tipo} · piso ${habitacion.piso}`}
      />

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {estanciaCerrada && (
          <Aviso tono="alerta">
            Tu estancia finalizó: la llave digital y los controles de la habitación quedaron desactivados.
          </Aviso>
        )}

        {/* ---------- Acceso a la habitación ---------- */}
        <Tarjeta titulo="Acceso a la habitación">
          {bloqueado ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[#F8F6F0] flex items-center justify-center mx-auto text-[#AEBCC1]">
                <KeyIcon size={22} />
              </div>
              <p className="text-[15px] font-medium text-[#18345C] mt-3">
                {estanciaCerrada ? 'Llave desactivada' : 'Todavía no tienes llave digital'}
              </p>
              <p className="text-[14px] text-[#AEBCC1] mt-1 max-w-md mx-auto">
                {estanciaCerrada
                  ? 'Se desactivó al procesar el pago del check-out, como medida de seguridad.'
                  : 'Completa el check-in web y la llave se activará en este mismo teléfono.'}
              </p>
              {!estanciaCerrada && (
                <div className="mt-4">
                  <BotonPrimario onClick={onIrCheckin}>Completar check-in</BotonPrimario>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 items-start">
              <div className="text-center">
                <button
                  onClick={abrirPuerta}
                  className="w-36 h-36 rounded-full mx-auto flex flex-col items-center justify-center gap-1 transition-colors"
                  style={{
                    backgroundColor: puerta === 'abierta' ? '#F0FAF4' : '#18345C',
                    color: puerta === 'abierta' ? '#166534' : '#FFFFFF',
                    border: puerta === 'abierta' ? '2px solid #86EFAC' : '2px solid #18345C',
                  }}
                >
                  {puerta === 'abierta' ? <CheckIcon size={30} /> : <DoorIcon size={30} />}
                  <span className="text-[14px] font-semibold mt-1">
                    {puerta === 'cerrada' ? 'Abrir puerta' : puerta === 'abriendo' ? 'Conectando…' : '¡Abierta!'}
                  </span>
                </button>
                <p className="text-[13px] text-[#6B7280] mt-3">
                  {puerta === 'abierta'
                    ? 'La cerradura se abrió. Volverá a bloquearse sola.'
                    : 'Acerca el teléfono a la cerradura y pulsa el botón.'}
                </p>
                <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
                  <Chip cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">NFC</Chip>
                  <Chip cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">Bluetooth</Chip>
                  <Chip cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">QR</Chip>
                </div>
              </div>

              <div>
                <p className="text-[15px] font-semibold text-[#18345C] flex items-center gap-2">
                  <KeyIcon size={16} /> Llave digital activa
                </p>
                <p className="text-[14px] text-[#6B7280] mt-1">
                  Si la cerradura no responde por Bluetooth, muestra el código QR en el lector.
                </p>

                {verQR && codigoLlave ? (
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <CodigoQR texto={codigoLlave} tamano={150} />
                    <button
                      onClick={() => setVerQR(false)}
                      className="text-[13px] font-semibold text-[#6B7280] hover:text-[#18345C]"
                    >
                      Ocultar código
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setVerQR(true)}
                    className="mt-3 px-4 py-2.5 min-h-[44px] text-[14px] font-semibold border border-[#18345C] text-[#18345C] rounded-md hover:bg-[#18345C] hover:text-white transition-colors"
                  >
                    Mostrar código QR
                  </button>
                )}
              </div>
            </div>
          )}
        </Tarjeta>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ---------- Clima ---------- */}
          <Tarjeta
            titulo="Temperatura"
            extra={
              <Interruptor
                activo={domotica.climaEncendido}
                disabled={estanciaCerrada}
                onClick={() => onActualizarDomotica({ climaEncendido: !domotica.climaEncendido })}
              />
            }
          >
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() =>
                  onActualizarDomotica({ temperatura: Math.max(TEMP_MIN, domotica.temperatura - 1) })
                }
                disabled={!domotica.climaEncendido || estanciaCerrada}
                aria-label="Bajar temperatura"
                className="w-12 h-12 rounded-full border border-[#E5E0D8] text-[22px] font-bold text-[#18345C] hover:bg-[#F8F6F0] disabled:text-[#AEBCC1]"
              >
                −
              </button>

              <div className="text-center">
                <p
                  className="text-[52px] font-bold leading-none"
                  style={{ color: domotica.climaEncendido ? '#18345C' : '#AEBCC1' }}
                >
                  {domotica.temperatura}°
                </p>
                <p className="text-[12px] text-[#AEBCC1] mt-1 flex items-center justify-center gap-1">
                  <ThermoIcon size={12} /> {domotica.climaEncendido ? 'Climatización activa' : 'Apagada'}
                </p>
              </div>

              <button
                onClick={() =>
                  onActualizarDomotica({ temperatura: Math.min(TEMP_MAX, domotica.temperatura + 1) })
                }
                disabled={!domotica.climaEncendido || estanciaCerrada}
                aria-label="Subir temperatura"
                className="w-12 h-12 rounded-full border border-[#E5E0D8] text-[22px] font-bold text-[#18345C] hover:bg-[#F8F6F0] disabled:text-[#AEBCC1]"
              >
                +
              </button>
            </div>

            <input
              type="range"
              min={TEMP_MIN}
              max={TEMP_MAX}
              value={domotica.temperatura}
              disabled={!domotica.climaEncendido || estanciaCerrada}
              onChange={e => onActualizarDomotica({ temperatura: Number(e.target.value) })}
              className="w-full mt-4 accent-[#18345C]"
              aria-label="Temperatura de la habitación"
            />
            <div className="flex justify-between text-[11px] text-[#AEBCC1]">
              <span>{TEMP_MIN}°</span>
              <span>{TEMP_MAX}°</span>
            </div>
          </Tarjeta>

          {/* ---------- Luces ---------- */}
          <Tarjeta titulo="Luces">
            <div className="space-y-4">
              {domotica.luces.map(l => (
                <div key={l.id}>
                  <div className="flex items-center gap-3">
                    <span style={{ color: l.encendida ? '#D8B94E' : '#AEBCC1' }}>
                      <LightIcon size={17} />
                    </span>
                    <p className="text-[15px] font-medium text-[#18345C] flex-1">{l.nombre}</p>
                    <span className="text-[13px] text-[#AEBCC1]">{l.encendida ? `${l.intensidad}%` : 'Apagada'}</span>
                    <Interruptor
                      activo={l.encendida}
                      disabled={estanciaCerrada}
                      onClick={() => onActualizarLuz(l.id, { encendida: !l.encendida })}
                    />
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={l.intensidad}
                    disabled={!l.encendida || estanciaCerrada}
                    onChange={e => onActualizarLuz(l.id, { intensidad: Number(e.target.value) })}
                    className="w-full mt-2 accent-[#D8B94E]"
                    aria-label={`Intensidad de ${l.nombre}`}
                  />
                </div>
              ))}
            </div>
          </Tarjeta>

          {/* ---------- Cortinas ---------- */}
          <Tarjeta titulo="Cortinas">
            <div className="flex items-center gap-3">
              <span className="text-[#18345C]"><CurtainIcon size={18} /></span>
              <p className="text-[15px] text-[#6B7280] flex-1">Apertura</p>
              <p className="text-[22px] font-bold text-[#18345C]">{domotica.cortinas}%</p>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={domotica.cortinas}
              disabled={estanciaCerrada}
              onChange={e => onActualizarDomotica({ cortinas: Number(e.target.value) })}
              className="w-full mt-3 accent-[#18345C]"
              aria-label="Apertura de las cortinas"
            />

            <div className="flex gap-2 mt-3">
              <BotonFiltro activo={domotica.cortinas === 0} onClick={() => onActualizarDomotica({ cortinas: 0 })}>
                Cerrar
              </BotonFiltro>
              <BotonFiltro activo={domotica.cortinas === 50} onClick={() => onActualizarDomotica({ cortinas: 50 })}>
                Media
              </BotonFiltro>
              <BotonFiltro activo={domotica.cortinas === 100} onClick={() => onActualizarDomotica({ cortinas: 100 })}>
                Abrir
              </BotonFiltro>
            </div>
          </Tarjeta>

          {/* ---------- Avisos y Wi-Fi ---------- */}
          <Tarjeta titulo="Avisos y conexión">
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-3">
                <span className="text-[#991B1B]"><SparkIcon size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#18345C]">No molestar</p>
                  <p className="text-[12px] text-[#AEBCC1]">Limpieza no entrará a la habitación.</p>
                </div>
                <Interruptor
                  activo={domotica.noMolestar}
                  disabled={estanciaCerrada}
                  onClick={() =>
                    onActualizarDomotica({
                      noMolestar: !domotica.noMolestar,
                      hacerHabitacion: domotica.noMolestar ? domotica.hacerHabitacion : false,
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-3">
                <span className="text-[#166534]"><CheckIcon size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#18345C]">Hacer la habitación</p>
                  <p className="text-[12px] text-[#AEBCC1]">Avisa a limpieza que puede pasar.</p>
                </div>
                <Interruptor
                  activo={domotica.hacerHabitacion}
                  disabled={estanciaCerrada}
                  onClick={() =>
                    onActualizarDomotica({
                      hacerHabitacion: !domotica.hacerHabitacion,
                      noMolestar: domotica.hacerHabitacion ? domotica.noMolestar : false,
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-3">
                <span style={{ color: domotica.wifiConectado ? '#166534' : '#AEBCC1' }}>
                  <WifiIcon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#18345C] truncate">{WIFI_RED}</p>
                  <p className="text-[12px] text-[#AEBCC1]">
                    {domotica.wifiConectado ? 'Conectado, sin contraseña' : 'Conexión automática con tu reserva'}
                  </p>
                </div>
                <button
                  onClick={onConectarWifi}
                  disabled={estanciaCerrada}
                  className={`px-3 py-2 min-h-[44px] text-[13px] font-semibold rounded-md border transition-colors shrink-0 ${
                    domotica.wifiConectado
                      ? 'bg-[#F0FAF4] text-[#166534] border-[#86EFAC]'
                      : 'bg-[#18345C] text-white border-[#18345C] hover:bg-[#102747]'
                  }`}
                >
                  {domotica.wifiConectado ? 'Conectado' : 'Conectar'}
                </button>
              </div>
            </div>
          </Tarjeta>
        </div>

        {/* ---------- Amenidades ---------- */}
        <div>
          <h2 className="text-[20px] font-semibold text-[#18345C] mb-3">Reservar instalaciones</h2>

          <div className="flex gap-2 flex-wrap mb-3">
            {AMENIDADES_CONFIG.map(a => (
              <BotonFiltro key={a.area} activo={area === a.area} onClick={() => setArea(a.area)}>
                {a.area}
              </BotonFiltro>
            ))}
          </div>

          <Tarjeta
            titulo={config.area}
            extra={<Chip cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">Aforo {config.aforo} por turno</Chip>}
          >
            <p className="text-[14px] text-[#6B7280]">{config.descripcion}</p>

            <div className="flex gap-2 flex-wrap mt-3">
              {dias.map((d, i) => (
                <BotonFiltro key={d} activo={dia === d} onClick={() => setDia(d)}>
                  {i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : formatoFecha(d)}
                </BotonFiltro>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {turnosDelDia.map(t => (
                <TurnoCard
                  key={t.id}
                  turno={t}
                  reservado={reservasAmenidad.some(r => r.turnoId === t.id)}
                  deshabilitado={estanciaCerrada}
                  onReservar={personas => onReservarTurno(t.id, personas)}
                />
              ))}
            </div>

            {turnosDelDia.length === 0 && (
              <p className="text-[14px] text-[#AEBCC1] mt-4">No hay turnos publicados para ese día.</p>
            )}
          </Tarjeta>

          <div className="mt-5">
            <Tarjeta titulo="Mis turnos reservados">
              {reservasAmenidad.length === 0 ? (
                <Vacio msg="No tienes turnos reservados todavía." />
              ) : (
                <div className="space-y-2">
                  {reservasAmenidad.map(r => (
                    <div key={r.id} className="flex items-center gap-3 bg-[#F8F6F0] border border-[#E5E0D8] rounded-lg px-3 py-3">
                      <span className="text-[#18345C]"><ClockIcon size={15} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-[#18345C] truncate">{r.area}</p>
                        <p className="text-[12px] text-[#AEBCC1]">
                          {formatoFecha(r.fecha)} · {r.hora} · {r.personas}{' '}
                          {r.personas === 1 ? 'persona' : 'personas'}
                        </p>
                      </div>
                      <button
                        onClick={() => onCancelarTurno(r.id)}
                        className="text-[13px] font-semibold text-[#991B1B] hover:underline shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Tarjeta>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Interruptor de encendido/apagado
   ========================================================= */

function Interruptor({
  activo,
  onClick,
  disabled = false,
}: {
  activo: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={activo}
      className="w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:opacity-40"
      style={{ backgroundColor: activo ? '#18345C' : '#E5E0D8' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: activo ? 22 : 2 }}
      />
    </button>
  );
}

/* =========================================================
   Turno de una instalación, con control de aforo
   ========================================================= */

function TurnoCard({
  turno,
  reservado,
  deshabilitado,
  onReservar,
}: {
  turno: TurnoAmenidad;
  reservado: boolean;
  deshabilitado: boolean;
  onReservar: (personas: number) => void;
}) {
  const [personas, setPersonas] = useState(1);
  const libres = plazasLibres(turno);
  const lleno = turnoLleno(turno);

  return (
    <div
      className={`border rounded-xl px-3 py-3 ${
        reservado ? 'bg-[#F0FAF4] border-[#86EFAC]' : lleno ? 'bg-[#F8F6F0] border-[#E5E0D8]' : 'bg-white border-[#E5E0D8]'
      }`}
    >
      <div className="flex items-center gap-2">
        <p className="text-[20px] font-semibold text-[#18345C] flex-1">{turno.hora}</p>
        {reservado ? (
          <Chip cls="bg-[#F0FAF4] text-[#166534] border-[#86EFAC]">Reservado</Chip>
        ) : lleno ? (
          <Chip cls="bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">Sin plazas</Chip>
        ) : (
          <Chip cls="bg-[#F8F6F0] text-[#6B7280] border-[#E5E0D8]">{libres} libres</Chip>
        )}
      </div>

      {/* Ocupación del turno */}
      <div className="h-1.5 rounded-full bg-[#E5E0D8] mt-2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round((turno.ocupados / turno.aforo) * 100)}%`,
            backgroundColor: lleno ? '#EF4444' : '#18345C',
          }}
        />
      </div>

      {!reservado && !lleno && (
        <div className="flex items-center gap-2 mt-3">
          <select
            value={personas}
            onChange={e => setPersonas(Number(e.target.value))}
            disabled={deshabilitado}
            aria-label="Número de personas"
            className="border border-[#E5E0D8] rounded-md px-2 py-2 text-[14px] text-[#1F2933] bg-white"
          >
            {Array.from({ length: Math.min(4, libres) }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={() => onReservar(personas)}
            disabled={deshabilitado}
            className="flex-1 px-3 py-2 min-h-[44px] text-[14px] font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors disabled:bg-[#E5E0D8] disabled:text-[#AEBCC1]"
          >
            Reservar
          </button>
        </div>
      )}
    </div>
  );
}
