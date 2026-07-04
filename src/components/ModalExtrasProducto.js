"use client";

import { useEffect, useMemo, useState } from "react";

function precioSeguro(precio) {
  const numero = Number(precio);
  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

function precioMXN(precio) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precioSeguro(precio));
}

export default function ModalExtrasProducto({
  abierto,
  producto,
  onCerrar,
  onAgregar,
  extrasDisponibles = [],
}) {
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);

  const extras = useMemo(() => {
    if (!Array.isArray(extrasDisponibles)) return [];

    return extrasDisponibles.filter((extra) => {
      if (!extra) return false;
      if (!extra.nombre) return false;

      const precio = Number(extra.precio);

      return Number.isFinite(precio) && precio >= 0;
    });
  }, [extrasDisponibles]);

  useEffect(() => {
    if (!abierto) return;

    setExtrasSeleccionados([]);

    const scrollOriginalBody = document.body.style.overflow;
    const scrollOriginalHtml = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = scrollOriginalBody;
      document.documentElement.style.overflow = scrollOriginalHtml;
    };
  }, [abierto, producto]);

  if (!abierto || !producto || extras.length === 0) return null;

  function cambiarExtra(extra) {
    const yaExiste = extrasSeleccionados.some((item) => item.id === extra.id);

    if (yaExiste) {
      setExtrasSeleccionados((actuales) =>
        actuales.filter((item) => item.id !== extra.id)
      );
    } else {
      setExtrasSeleccionados((actuales) => [...actuales, extra]);
    }
  }

  function confirmarAgregar() {
    onAgregar({
      producto,
      extras: extrasSeleccionados,
      nota: "",
    });

    onCerrar();
  }

  const totalExtras = extrasSeleccionados.reduce((total, extra) => {
    return total + precioSeguro(extra.precio);
  }, 0);

  const totalProducto = precioSeguro(producto.precio) + totalExtras;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-orange-950/45 backdrop-blur-md"
        onClick={onCerrar}
      />

      <div className="fixed inset-0 z-[101] flex h-[100dvh] items-center justify-center overflow-hidden px-3 py-3">
        <div
          className="max-h-[calc(100dvh-24px)] w-full max-w-[350px] overflow-y-auto overflow-x-hidden rounded-[1.55rem] border border-orange-300/55 bg-gradient-to-br from-[#fff8ee] via-[#ffe8c8] to-[#ffc978] text-zinc-950 shadow-[0_24px_75px_rgba(154,72,18,0.45)] ring-1 ring-white/60"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-yellow-200/75 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-500/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.6),transparent_43%)]" />

            <div className="relative p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-600/10 px-2 py-0.5 ring-1 ring-orange-700/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />

                    <p className="text-[7px] font-black uppercase tracking-[0.15em] text-orange-800">
                      Personalizar producto
                    </p>
                  </div>

                  <h3 className="mt-1.5 break-words text-[16px] font-black uppercase leading-tight text-zinc-950">
                    {producto.nombre}
                  </h3>

                  <p className="mt-0.5 text-[9.5px] font-bold leading-tight text-zinc-700">
                    Elige los extras que quieras agregar a este producto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCerrar}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/75 text-xs font-black text-orange-800 transition active:scale-95"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 rounded-[1.2rem] bg-orange-900/5 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[7px] font-black uppercase tracking-[0.14em] text-orange-800">
                      Total producto
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold leading-tight text-zinc-700">
                      Precio base + extras
                    </p>
                  </div>

                  <div className="shrink-0 rounded-[1rem] bg-gradient-to-br from-[#ffcf42] via-[#ffc02e] to-[#f59e0b] px-3 py-1.5 text-right">
                    <p className="text-[17px] font-black leading-none text-zinc-950">
                      {precioMXN(totalProducto)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 rounded-[1.15rem] bg-white/50 px-3 py-2 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.12em] text-orange-900">
                      Pulsa para elegir extras
                    </p>

                    <p className="mt-0.5 text-[8.5px] font-bold leading-tight text-zinc-600">
                      Toca una opción para agregarla o quitarla.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-[8px] font-black uppercase text-orange-800">
                    {extrasSeleccionados.length} elegido
                    {extrasSeleccionados.length === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="mt-2 rounded-[1.2rem] bg-[#fff0d8]/80 p-2.5 backdrop-blur">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.12em] text-orange-900/75">
                    Extras opcionales
                  </p>

                  {extrasSeleccionados.length > 0 && (
                    <p className="rounded-full bg-orange-600/10 px-2 py-0.5 text-[7px] font-black uppercase text-orange-800">
                      + {precioMXN(totalExtras)}
                    </p>
                  )}
                </div>

                <div className="max-h-[230px] space-y-1.5 overflow-y-auto overflow-x-hidden pr-0.5">
                  {extras.map((extra) => {
                    const activo = extrasSeleccionados.some(
                      (item) => item.id === extra.id
                    );

                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => cambiarExtra(extra)}
                        className={`group flex min-h-11 w-full min-w-0 items-center justify-between gap-2.5 rounded-[1rem] px-3 py-2 text-left text-[10px] font-black uppercase leading-tight transition active:scale-[0.98] ${
                          activo
                            ? "bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white"
                            : "bg-orange-100/80 text-zinc-900 hover:bg-orange-200/75"
                        }`}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                              activo
                                ? "bg-white text-orange-700"
                                : "bg-white/80 text-orange-800"
                            }`}
                          >
                            {activo ? "✓" : "+"}
                          </span>

                          <span className="min-w-0 break-words">
                            {extra.nombre}
                          </span>
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${
                            activo
                              ? "bg-white/20 text-white"
                              : "bg-yellow-300/80 text-orange-900"
                          }`}
                        >
                          + {precioMXN(extra.precio)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 rounded-[1.2rem] bg-white/60 p-2.5 backdrop-blur">
                <div className="flex justify-between gap-3 text-[9px] font-bold text-zinc-600">
                  <span>Precio base</span>
                  <span className="shrink-0">{precioMXN(producto.precio)}</span>
                </div>

                <div className="mt-0.5 flex justify-between gap-3 text-[9px] font-bold text-zinc-600">
                  <span>Extras seleccionados</span>
                  <span className="shrink-0">+ {precioMXN(totalExtras)}</span>
                </div>

                <div className="mt-1.5 flex justify-between gap-3 border-t border-orange-900/10 pt-1.5 text-[13px] font-black text-zinc-950">
                  <span>Total</span>

                  <span className="shrink-0 text-orange-800">
                    {precioMXN(totalProducto)}
                  </span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={onCerrar}
                  className="flex min-h-10 items-center justify-center rounded-[1rem] bg-orange-100/80 px-3 py-2 text-[9px] font-black uppercase text-zinc-900 transition active:scale-[0.98]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarAgregar}
                  className="flex min-h-10 items-center justify-center rounded-[1rem] bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 px-3 py-2 text-[9px] font-black uppercase tracking-[0.04em] text-white transition active:scale-[0.98]"
                >
                  Agregar
                </button>
              </div>

              <p className="mt-2 text-center text-[8px] font-bold leading-tight text-zinc-600">
                También puedes agregar el producto sin seleccionar extras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}