import type { Pago, Reserva, Huesped } from '../../types';
import { formatoFechaHora } from '../../data';
import { dinero, calcularCuenta, CloseIcon } from './recUtils';
import type { HabitacionHotel } from '../../types';

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

interface Props {
  pago: Pago;
  reserva: Reserva;
  huesped: Huesped;
  habitacion: HabitacionHotel | null;
  onCerrar: () => void;
}

export default function Comprobante({ pago, reserva, huesped, habitacion, onCerrar }: Props) {
  const cuenta = calcularCuenta(reserva, habitacion);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8]">
          <h2 className="text-[20px] font-semibold text-[#18345C]">Comprobante de pago</h2>
          <button onClick={onCerrar} className="text-[#AEBCC1] hover:text-[#1F2933] p-1">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-5" id="comprobante-imprimible">
          <div className="text-center mb-4">
            <p className="text-[22px] font-bold text-[#18345C] leading-tight">Villa Serena</p>
            <p className="text-[12px] text-[#AEBCC1]">Comprobante {pago.comprobante}</p>
          </div>

          <div className="border-t border-dashed border-[#CBD5E1] pt-3 space-y-1.5 text-[13px] text-[#1F2933]">
            <Fila k="Fecha" v={formatoFechaHora(pago.fecha)} />
            <Fila k="Huésped" v={huesped.nombre} />
            <Fila k="Documento" v={`${huesped.tipoDocumento} ${huesped.documento}`} />
            <Fila k="Reserva" v={reserva.codigo} />
            <Fila k="Habitación" v={habitacion ? `${habitacion.numero} · ${habitacion.tipo}` : reserva.tipoHabitacion} />
          </div>

          <div className="border-t border-dashed border-[#CBD5E1] mt-3 pt-3 space-y-1.5 text-[13px]">
            <Fila k={`Alojamiento (${cuenta.noches} noche${cuenta.noches !== 1 ? 's' : ''})`} v={dinero(cuenta.alojamiento)} />
            {cuenta.servicios > 0 && <Fila k="Servicios adicionales" v={dinero(cuenta.servicios)} />}
            {cuenta.descuento > 0 && <Fila k="Descuento" v={`- ${dinero(cuenta.descuento)}`} />}
            <Fila k="Total de la cuenta" v={dinero(cuenta.total)} bold />
          </div>

          <div className="border-t border-dashed border-[#CBD5E1] mt-3 pt-3 space-y-1.5 text-[13px]">
            <Fila k="Monto pagado" v={dinero(pago.monto)} bold />
            <Fila k="Método de pago" v={METODO_LABEL[pago.metodo] ?? pago.metodo} />
            <Fila k="Total pagado a la fecha" v={dinero(cuenta.pagado)} />
            <Fila
              k="Saldo pendiente"
              v={dinero(Math.max(0, cuenta.saldo))}
              bold
            />
          </div>

          <p className="text-[11px] text-[#AEBCC1] text-center mt-4">
            Gracias por su preferencia.
          </p>
        </div>

        <div className="px-5 pb-6 flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 text-sm border border-[#E5E0D8] text-[#6B7280] rounded-md hover:bg-[#F8F6F0] transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 text-sm font-semibold bg-[#18345C] text-white rounded-md hover:bg-[#102747] transition-colors"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

function Fila({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={bold ? 'font-semibold text-[#18345C]' : 'text-[#6B7280]'}>{k}</span>
      <span className={bold ? 'font-bold text-[#18345C]' : 'text-[#1F2933]'}>{v}</span>
    </div>
  );
}
