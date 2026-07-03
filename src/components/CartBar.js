"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const cartRef = useRef(null);

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

  useEffect(() => {
    function cerrarDetalleSiClickFuera(event) {
      if (!verDetalle) return;
      if (!cartRef.current) return;

      const clickDentroDelCarrito = cartRef.current.contains(event.target);

      if (!clickDentroDelCarrito) {
        setVerDetalle(false);
      }
    }

    document.addEventListener("pointerdown", cerrarDetalleSiClickFuera);

    return () => {
      document.removeEventListener("pointerdown", cerrarDetalleSiClickFuera);
    };
  }, [verDetalle]);

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
    setVerDetalle(false);

    const confirmar = window.confirm("¿Seguro que quieres cancelar el pedido?");

    if (!confirmar) return;

    guardarCarrito([]);
    setCarrito([]);
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
      <div ref={cartRef} className="sticky bottom-2 z-40  w-full px-3 pb-4">
        <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-[1.3rem] border border-orange-300/50 bg-gradient-to-br from-[#fff3df] via-[#ffe1bd] to-[#ffc06f] text-zinc-950 shadow-[0_16px_42px_rgba(154,72,18,0.28)] ring-1 ring-white/40 backdrop-blur-xl">
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-yellow-200/65 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-500/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_42%)]" />

            <div className="relative p-2.5">
              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-600/10 px-2 py-0.5 ring-1 ring-orange-700/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />

                    <p className="text-[7px] font-black uppercase tracking-[0.15em] text-orange-800">
                      Tu pedido
                    </p>
                  </div>

                  <p className="mt-1 text-[14px] font-black leading-none text-zinc-950">
                    {resumen.piezas} producto
                    {resumen.piezas === 1 ? "" : "s"} en carrito
                  </p>

                  <p className="mt-0.5 text-[9px] font-bold leading-none text-zinc-700">
                    Productos: {precioMXN(resumen.subtotal)}
                  </p>
                </div>

                <div className="shrink-0 rounded-[1rem] bg-gradient-to-br from-[#ffcf42] via-[#ffc02e] to-[#f59e0b] px-2.5 py-1.5 text-right shadow-[0_7px_18px_rgba(180,83,9,0.22)] ring-1 ring-orange-700/15">
                  <p className="text-[6.5px] font-black uppercase tracking-[0.1em] text-zinc-800/70">
                    Total
                  </p>

                  <p className="mt-0.5 text-[16px] font-black leading-none text-zinc-950">
                    {precioMXN(resumen.total)}
                  </p>
                </div>
              </div>

              <div className="mt-1.5 rounded-[1rem] border border-orange-500/15 bg-orange-900/5 px-2.5 py-1.5 shadow-inner shadow-orange-700/5">
                <p className="text-center text-[9px] font-black uppercase leading-tight tracking-[0.035em] text-zinc-800">
                  Costo de envío a domicilio:{" "}
                  <span className="text-orange-800">
                    + {precioMXN(resumen.envio)}
                  </span>
                </p>
              </div>

              {verDetalle && (
                <div className="mt-1.5 rounded-[1rem] border border-orange-500/15 bg-[#fff0d8]/75 p-2 shadow-inner shadow-orange-700/5 backdrop-blur">
                  <div className="space-y-1.5">
                    {carrito.map((item) => {
                      const cantidad = Number(item.cantidad || 0);
                      const precio = Number(item.precio || 0);
                      const subtotalProducto = cantidad * precio;

                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 border-b border-orange-900/10 pb-1.5 last:border-b-0 last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-[10px] font-black uppercase leading-tight text-zinc-950">
                              {item.nombre}
                            </p>

                            <p className="mt-0.5 text-[9px] font-bold leading-tight text-zinc-600">
                              {cantidad} x {precioMXN(precio)}
                            </p>
                          </div>

                          <p className="shrink-0 text-[10px] font-black text-orange-800">
                            {precioMXN(subtotalProducto)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-1.5 space-y-0.5 border-t border-orange-900/10 pt-1.5">
                    <div className="flex justify-between gap-2 text-[9px] font-bold text-zinc-600">
                      <span>Productos</span>
                      <span>{precioMXN(resumen.subtotal)}</span>
                    </div>

                    <div className="flex justify-between gap-2 text-[9px] font-bold text-zinc-600">
                      <span>Costo de envío a domicilio</span>
                      <span>+ {precioMXN(resumen.envio)}</span>
                    </div>

                    <div className="flex justify-between gap-2 text-[12px] font-black text-zinc-950">
                      <span>Total</span>
                      <span className="text-orange-800">
                        {precioMXN(resumen.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setVerDetalle(false);
                  setMostrarConfirmar(true);
                }}
                className="mt-1.5 flex min-h-10 w-full items-center justify-center rounded-[1rem] bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.04em] text-white shadow-[0_9px_20px_rgba(194,65,12,0.36)] ring-1 ring-orange-300/40 transition active:scale-[0.98]"
              >
                Confirmar pedido
              </button>

              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setVerDetalle((actual) => !actual)}
                  className="flex min-h-9 items-center justify-center rounded-[1rem] border border-orange-700/10 bg-orange-100/70 px-2 py-1 text-center text-[7.5px] font-black uppercase leading-none text-zinc-900 shadow-sm transition active:scale-[0.98]"
                >
                  {verDetalle ? "Ocultar" : "Ver pedido"}
                </button>

                <Link
                  href="/"
                  onClick={() => setVerDetalle(false)}
                  className="flex min-h-9 items-center justify-center rounded-[1rem] border border-yellow-600/20 bg-yellow-300/75 px-2 py-1 text-center text-[7.5px] font-black uppercase leading-none text-zinc-950 shadow-sm transition active:scale-[0.98]"
                >
                  Ver categorías
                </Link>

                <button
                  type="button"
                  onClick={cancelarPedido}
                  className="flex min-h-9 items-center justify-center rounded-[1rem] bg-red-100/80 px-2 py-1 text-center text-[7.5px] font-black uppercase leading-none text-red-700 ring-1 ring-red-500/15 transition active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
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