import type { Solicitud } from '../types';

function Chip({
  cls,
  children,
}: {
  cls: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide border ${cls}`}
    >
      {children}
    </span>
  );
}

function EstadoSolicitud({ estado }: { estado: string }) {
  if (estado === 'pendiente') {
    return (
      <Chip cls="bg-[#FFFBEF] text-[#78450A] border-[#F3D98B]">
        Pendiente
      </Chip>
    );
  }

  if (estado === 'en-limpieza' || estado === 'en-proceso') {
    return (
      <Chip cls="bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]">
        En proceso
      </Chip>
    );
  }

  return (
    <Chip cls="bg-[#F0FAF4] text-[#166534] border-[#86EFAC]">
      Atendida
    </Chip>
  );
}

function esUrgente(sol: Solicitud): boolean {
  return sol.observaciones?.toLowerCase().includes('urgente') ?? false;
}

function BedIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

interface Props {
  solicitudes: Solicitud[];

  // Se conservan estas props para que siga siendo compatible
  // con tu App.tsx actual, aunque ya no usamos artículos.
  onIniciarLimpieza?: (id: string) => void;
  onFinalizarLimpieza?: (id: string) => void;
  onAtenderArticulo?: (id: string) => void;
  onConfirmarEntrega?: (id: string) => void;

  onAbrirLimpieza: (
    solicitudId: string,
    habitacionNumero: string
  ) => void;
}

export default function Solicitudes({
  solicitudes,
  onAbrirLimpieza,
}: Props) {
  /*
   * Este módulo ya NO maneja artículos.
   * Room Service se encargará de entregar almohadas,
   * comida, bebidas, toallas solicitadas como entrega, etc.
   *
   * Aquí solo mostramos solicitudes de LIMPIEZA.
   */
  const solicitudesLimpieza = solicitudes
    .filter(s => s.tipo === 'limpieza')
    .sort((a, b) => {
      const urgenteA = esUrgente(a) ? 1 : 0;
      const urgenteB = esUrgente(b) ? 1 : 0;

      if (urgenteA !== urgenteB) {
        return urgenteB - urgenteA;
      }

      const orden: Record<string, number> = {
        pendiente: 0,
        'en-limpieza': 1,
        'en-proceso': 1,
        finalizada: 2,
        atendida: 2,
      };

      return (orden[a.estado] ?? 9) - (orden[b.estado] ?? 9);
    });

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F8F6F0]"
      style={{
        fontFamily: '"Afacad", "Segoe UI", Arial, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&display=swap');
      `}</style>

      {/* CABECERA */}
      <div className="px-4 sm:px-6 py-5 bg-white border-b border-[#E5E0D8]">
        <h1 className="text-[32px] font-semibold text-[#18345C] leading-tight">
          Solicitudes
        </h1>

        <p className="text-[15px] text-[#AEBCC1] mt-1">
          Solicitudes de limpieza de habitaciones
        </p>
      </div>

      {/* LISTA */}
      <div className="px-4 sm:px-6 py-5">
        {solicitudesLimpieza.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-8 text-center">
            <p className="text-[15px] text-[#AEBCC1]">
              No hay solicitudes de limpieza pendientes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudesLimpieza.map(sol => {
              const atendida =
                sol.estado === 'finalizada' ||
                sol.estado === 'atendida';

              return (
                <div
                  key={sol.id}
                  className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-4"
                >
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    {/* Icono */}
                    <div className="w-10 h-10 rounded-lg bg-[#F8F6F0] flex items-center justify-center shrink-0 text-[#18345C]">
                      <BedIcon size={18} />
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[28px] font-semibold text-[#18345C] leading-none">
                          {sol.habitacionNumero}
                        </p>

                        <EstadoSolicitud estado={sol.estado} />

                        {esUrgente(sol) && (
                          <Chip cls="bg-red-50 text-red-600 border-red-200">
                            Urgente
                          </Chip>
                        )}
                      </div>

                      <p className="text-[16px] font-medium text-[#1F2933] mt-2">
                        {sol.descripcion}
                      </p>

                      {sol.observaciones && (
                        <p className="text-[14px] text-[#6B7280] mt-1">
                          {sol.observaciones}
                        </p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap mt-2">
                        <span className="text-[13px] text-[#AEBCC1]">
                          Solicitado: {sol.hora}
                        </span>

                        {sol.horaEntrega && (
                          <span className="text-[13px] text-[#AEBCC1]">
                            Atendida: {sol.horaEntrega}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acción */}
                    {!atendida ? (
                      <button
                        type="button"
                        onClick={() =>
                          onAbrirLimpieza(
                            sol.id,
                            sol.habitacionNumero
                          )
                        }
                        className="
                          w-full
                          sm:w-auto
                          px-5
                          py-2.5
                          bg-[#18345C]
                          text-white
                          text-[15px]
                          font-semibold
                          rounded-md
                          hover:bg-[#102747]
                          transition-colors
                          shrink-0
                        "
                      >
                        {sol.estado === 'pendiente'
                          ? 'Atender solicitud'
                          : 'Continuar limpieza'}
                      </button>
                    ) : (
                      <div className="w-full sm:w-auto px-4 py-2.5 text-[14px] font-semibold text-[#166534] bg-[#F0FAF4] border border-[#86EFAC] rounded-md text-center shrink-0">
                        ✓ Atendida
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

