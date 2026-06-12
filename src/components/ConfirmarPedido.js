"use client";

import { useEffect, useState } from "react";

const NUMERO_WHATSAPP = "523310128754";

function precioMXN(precio) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(precio || 0));
}

export default function ConfirmarPedido({
  carrito,
  resumen,
  onClose,
  onPedidoConfirmado,
}) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nota, setNota] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [errores, setErrores] = useState({
    nombre: "",
    direccion: "",
  });

  useEffect(() => {
    const scrollOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = scrollOriginal;
    };
  }, []);

  function crearPedidoTexto() {
    const ahora = new Date();

    const fecha = new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
    })
      .format(ahora)
      .replace("/", "-");

    const hora = new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(ahora);

    const productos = carrito
      .map((item) => {
        const cantidad = Number(item.cantidad || 0);
        return `• ${cantidad} x ${item.nombre}`;
      })
      .join("\n");

    return `🍔 Pedido Hamburguesas Fátima

📅 Fecha: ${fecha}
🕒 Hora: ${hora}

👤 Nombre: ${nombre.trim()}
📍 Dirección: ${direccion.trim()}
📝 Detalles del pedido: ${
      nota.trim() ? nota.trim() : "Sin detalles especiales"
    }
💳 Método de pago: ${
      metodoPago === "efectivo" ? "Efectivo" : "Transferencia"
    }

🛒 Productos:
${productos}

Subtotal: ${precioMXN(resumen.subtotal)}
Envío: ${precioMXN(resumen.envio)}
Total: ${precioMXN(resumen.total)}`;
  }

  function confirmarPedido() {
    const nuevosErrores = {
      nombre: "",
      direccion: "",
    };

    if (!nombre.trim()) {
      nuevosErrores.nombre = "Escribe tu nombre.";
    }

    if (!direccion.trim()) {
      nuevosErrores.direccion = "Escribe tu dirección.";
    }

    setErrores(nuevosErrores);

    if (nuevosErrores.nombre || nuevosErrores.direccion) {
      return;
    }

    const mensaje = encodeURIComponent(crearPedidoTexto());
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;

    window.open(url, "_blank", "noopener,noreferrer");

    if (onPedidoConfirmado) {
      onPedidoConfirmado();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-4">
      <div className="relative w-full max-w-[350px] overflow-hidden rounded-[1.4rem] bg-white text-black shadow-[0_22px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/20">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#fff200]/25 blur-2xl" />
        <div className="absolute -left-10 top-20 h-20 w-20 rounded-full bg-[#d94b16]/20 blur-2xl" />

        <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#8f2b0d] px-3 py-3 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#fff200]">
                Confirmar pedido
              </p>

              <h2 className="mt-0.5 text-base font-black uppercase leading-tight">
                Datos de entrega
              </h2>

              <p className="mt-0.5 text-[10px] font-semibold leading-snug text-white/70">
                Completa tus datos para enviar tu pedido por WhatsApp.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white ring-1 ring-white/15 active:scale-95"
            >
              ✕
            </button>
          </div>

          <div className="mt-2 rounded-xl bg-black/35 px-3 py-2 ring-1 ring-white/15">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white">
                Total a pagar
              </p>

              <p className="text-lg font-black leading-none text-[#fff200]">
                {precioMXN(resumen.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-2 p-3">
          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Escribe tu nombre
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setErrores((prev) => ({ ...prev, nombre: "" }));
              }}
              placeholder="Ej. Juan Pérez"
              className={`mt-0.5 h-9 w-full rounded-xl border bg-zinc-100 px-3 text-xs font-bold outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-2 ${
                errores.nombre
                  ? "border-red-300 ring-1 ring-red-200 focus:ring-red-400"
                  : "border-black/10 focus:ring-[#d94b16]"
              }`}
            />

            {errores.nombre && (
              <p className="mt-1 rounded-lg bg-red-50 px-2 py-1 text-[9px] font-black text-red-600 ring-1 ring-red-200">
                {errores.nombre}
              </p>
            )}
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Escribe tu dirección
            </label>

            <textarea
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value);
                setErrores((prev) => ({ ...prev, direccion: "" }));
              }}
              placeholder="Calle, número, colonia y referencias"
              rows={2}
              className={`mt-0.5 w-full resize-none rounded-xl border bg-zinc-100 px-3 py-1.5 text-xs font-bold leading-snug outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-2 ${
                errores.direccion
                  ? "border-red-300 ring-1 ring-red-200 focus:ring-red-400"
                  : "border-black/10 focus:ring-[#d94b16]"
              }`}
            />

            {errores.direccion && (
              <p className="mt-1 rounded-lg bg-red-50 px-2 py-1 text-[9px] font-black text-red-600 ring-1 ring-red-200">
                {errores.direccion}
              </p>
            )}
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Detalles del pedido
            </label>

            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. sin verdura, sin cebolla, con más salsa..."
              rows={2}
              className="mt-0.5 w-full resize-none rounded-xl border border-black/10 bg-zinc-100 px-3 py-1.5 text-xs font-bold leading-snug outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#d94b16]"
            />
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Selecciona tu método de pago
            </p>

            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`min-h-9 rounded-xl px-2 text-[10px] font-black uppercase transition active:scale-[0.98] ${
                  metodoPago === "efectivo"
                    ? "bg-[#d94b16] text-white shadow-md shadow-[#d94b16]/25"
                    : "bg-zinc-100 text-zinc-700 ring-1 ring-black/10"
                }`}
              >
                Efectivo
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("transferencia")}
                className={`min-h-9 rounded-xl px-2 text-[10px] font-black uppercase transition active:scale-[0.98] ${
                  metodoPago === "transferencia"
                    ? "bg-[#d94b16] text-white shadow-md shadow-[#d94b16]/25"
                    : "bg-zinc-100 text-zinc-700 ring-1 ring-black/10"
                }`}
              >
                Transferencia
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-zinc-100 via-white to-zinc-100 p-2.5 ring-1 ring-black/10">
            <div className="flex justify-between text-[10px] font-bold text-zinc-500">
              <span>Productos</span>
              <span>{precioMXN(resumen.subtotal)}</span>
            </div>

            <div className="mt-0.5 flex justify-between text-[10px] font-bold text-zinc-500">
              <span>Envío</span>
              <span>+ {precioMXN(resumen.envio)}</span>
            </div>

            <div className="mt-1.5 flex justify-between border-t border-black/10 pt-1.5 text-sm font-black text-zinc-950">
              <span>Total</span>
              <span className="text-[#d94b16]">
                {precioMXN(resumen.total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-9 items-center justify-center rounded-xl bg-zinc-200 px-3 py-2 text-[10px] font-black uppercase text-zinc-800 transition active:scale-[0.98]"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={confirmarPedido}
              className="flex min-h-9 items-center justify-center rounded-xl bg-[#fff200] px-3 py-2 text-[10px] font-black uppercase text-black shadow-md shadow-black/15 transition active:scale-[0.98]"
            >
              Enviar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}