"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ConfirmarPedido from "@/components/ConfirmarPedido";

const COSTO_ENVIO = 20;

function precioMXN(precio) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(precio || 0));
}

function leerCarrito() {
  if (typeof window === "undefined") return [];

  try {
    const guardado = localStorage.getItem("carrito-fatima");
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito-fatima", JSON.stringify(carrito));
  window.dispatchEvent(new Event("carrito-actualizado"));
}

export default function CartBar() {
  const [carrito, setCarrito] = useState([]);
  const [verDetalle, setVerDetalle] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  useEffect(() => {
    function actualizarCarrito() {
      setCarrito(leerCarrito());
    }

    actualizarCarrito();

    window.addEventListener("carrito-actualizado", actualizarCarrito);
    window.addEventListener("storage", actualizarCarrito);

    return () => {
      window.removeEventListener("carrito-actualizado", actualizarCarrito);
      window.removeEventListener("storage", actualizarCarrito);
    };
  }, []);

  const resumen = useMemo(() => {
    const piezas = carrito.reduce((acc, item) => {
      return acc + Number(item.cantidad || 0);
    }, 0);

    const subtotal = carrito.reduce((acc, item) => {
      return acc + Number(item.cantidad || 0) * Number(item.precio || 0);
    }, 0);

    return {
      piezas,
      subtotal,
      envio: COSTO_ENVIO,
      total: subtotal + COSTO_ENVIO,
    };
  }, [carrito]);

  function cancelarPedido() {
    const confirmar = window.confirm("¿Seguro que quieres cancelar el pedido?");

    if (!confirmar) return;

    guardarCarrito([]);
    setCarrito([]);
    setVerDetalle(false);
    setMostrarConfirmar(false);
  }

  function limpiarPedidoConfirmado() {
    guardarCarrito([]);
    setCarrito([]);
    setVerDetalle(false);
    setMostrarConfirmar(false);
  }

  if (resumen.piezas === 0) return null;

  return (
    <>
      <div className="sticky bottom-1 z-40 mt-2 w-full pb-5 px-3">
        <section className="w-full overflow-hidden rounded-[1.15rem] border border-yellow-300/50 bg-zinc-950 text-white shadow-[0_14px_35px_rgba(0,0,0,0.38)]">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#8f2b0d] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-yellow-300/80">
                  Tu pedido
                </p>

                <p className="mt-0.5 text-[13px] font-black leading-none text-white">
                  {resumen.piezas} producto{resumen.piezas === 1 ? "" : "s"}
                </p>

                <p className="mt-0.5 text-[10px] font-bold leading-none text-white/60">
                  Productos: {precioMXN(resumen.subtotal)}
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-white/10 px-2.5 py-1.5 text-right ring-1 ring-white/10">
                <p className="text-[7px] font-black uppercase tracking-[0.1em] text-white/45">
                  Total
                </p>

                <p className="mt-0.5 text-base font-black leading-none text-[#fff200]">
                  {precioMXN(resumen.total)}
                </p>
              </div>
            </div>

            <div className="mt-1.5 rounded-xl bg-black/25 px-2.5 py-1.5 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-black uppercase tracking-[0.07em] text-white/60">
                  Total con envío
                </p>

                <p className="shrink-0 text-[10px] font-black text-yellow-300">
                  + {precioMXN(resumen.envio)} de envío
                </p>
              </div>
            </div>

            {verDetalle && (
              <div className="mt-1.5 rounded-xl bg-black/25 p-2 ring-1 ring-white/10">
                <div className="space-y-1.5">
                  {carrito.map((item) => {
                    const cantidad = Number(item.cantidad || 0);
                    const precio = Number(item.precio || 0);
                    const subtotalProducto = cantidad * precio;

                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2 border-b border-white/10 pb-1.5 last:border-b-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[10px] font-black uppercase leading-tight text-white">
                            {item.nombre}
                          </p>

                          <p className="mt-0.5 text-[9px] font-bold text-white/50">
                            {cantidad} x {precioMXN(precio)}
                          </p>
                        </div>

                        <p className="shrink-0 text-[10px] font-black text-[#fff200]">
                          {precioMXN(subtotalProducto)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-1.5 space-y-0.5 border-t border-white/15 pt-1.5">
                  <div className="flex justify-between gap-2 text-[10px] font-bold text-white/55">
                    <span>Productos</span>
                    <span>{precioMXN(resumen.subtotal)}</span>
                  </div>

                  <div className="flex justify-between gap-2 text-[10px] font-bold text-white/55">
                    <span>Envío</span>
                    <span>+ {precioMXN(resumen.envio)}</span>
                  </div>

                  <div className="flex justify-between gap-2 text-[12px] font-black text-white">
                    <span>Total</span>
                    <span className="text-[#fff200]">
                      {precioMXN(resumen.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMostrarConfirmar(true)}
              className="mt-1.5 flex min-h-10 w-full items-center justify-center rounded-xl bg-[#fff200] px-3 py-2 text-[11px] font-black uppercase text-black shadow-lg transition active:scale-[0.98]"
            >
              Confirmar pedido
            </button>

            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setVerDetalle((actual) => !actual)}
                className="flex min-h-9 items-center justify-center rounded-xl bg-white px-2 py-1.5 text-center text-[8px] font-black uppercase leading-none text-zinc-950 shadow-sm transition active:scale-[0.98]"
              >
                {verDetalle ? "Ocultar" : "Ver pedido"}
              </button>

              <Link
                href="/"
                className="flex min-h-9 items-center justify-center rounded-xl bg-[#d94b16] px-2 py-1.5 text-center text-[8px] font-black uppercase leading-none text-white shadow-sm transition active:scale-[0.98]"
              >
                ver Categorías
              </Link>

              <button
                type="button"
                onClick={cancelarPedido}
                className="flex min-h-9 items-center justify-center rounded-xl bg-red-600 px-2 py-1.5 text-center text-[8px] font-black uppercase leading-none text-white shadow-sm transition active:scale-[0.98]"
              >
                Cancelar pedido
              </button>
            </div>
          </div>
        </section>
      </div>

      {mostrarConfirmar && (
        <ConfirmarPedido
          carrito={carrito}
          resumen={resumen}
          onClose={() => setMostrarConfirmar(false)}
          onPedidoConfirmado={limpiarPedidoConfirmado}
        />
      )}
    </>
  );
}