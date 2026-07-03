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
    const yaExiste = extrasSeleccionados.some(
      (item) => item.id === extra.id
    );

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
      <div className="fixed left-0 right-0 top-0 z-[100] h-[calc(100dvh+96px)] bg-black/80 backdrop-blur-md" />

      <div className="fixed inset-0 z-[101] flex h-[100dvh] items-center justify-center overflow-hidden overflow-x-hidden px-3 py-3">
        <div className="max-h-[calc(100dvh-24px)] w-full max-w-[330px] overflow-y-auto overflow-x-hidden rounded-[1.4rem] bg-white text-black shadow-[0_22px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/20">
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#8f2b0d] px-4 py-3 text-white">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#fff200]/25 blur-2xl" />
            <div className="absolute -left-10 bottom-0 h-20 w-20 rounded-full bg-[#d94b16]/25 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#fff200]">
                  Personalizar producto
                </p>

                <h3 className="mt-1 line-clamp-2 text-base font-black uppercase leading-tight">
                  {producto.nombre}
                </h3>

                <p className="mt-1 text-[10px] font-semibold leading-snug text-white/70">
                  Puedes elegir extras o agregarlo sin extras.
                </p>
              </div>

              <button
                type="button"
                onClick={onCerrar}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white ring-1 ring-white/15 active:scale-95"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="relative mt-2 rounded-xl bg-black/35 px-3 py-2 ring-1 ring-white/15">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white">
                  Total producto
                </p>

                <p className="shrink-0 text-lg font-black leading-none text-[#fff200]">
                  {precioMXN(totalProducto)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 overflow-x-hidden p-3">
            <div className="overflow-x-hidden">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-500">
                Extras opcionales
              </p>

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
                      className={`flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[11px] font-black uppercase transition active:scale-[0.98] ${
                        activo
                          ? "bg-zinc-950 text-white ring-2 ring-[#d94b16]"
                          : "bg-zinc-100 text-zinc-800 ring-1 ring-black/10"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {extra.nombre}
                      </span>

                      <span className="shrink-0">
                        + {precioMXN(extra.precio)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-100 p-2.5 ring-1 ring-black/10">
              <div className="flex justify-between gap-3 text-[10px] font-bold text-zinc-500">
                <span>Precio base</span>
                <span className="shrink-0">{precioMXN(producto.precio)}</span>
              </div>

              <div className="mt-0.5 flex justify-between gap-3 text-[10px] font-bold text-zinc-500">
                <span>Extras</span>
                <span className="shrink-0">+ {precioMXN(totalExtras)}</span>
              </div>

              <div className="mt-1.5 flex justify-between gap-3 border-t border-black/10 pt-1.5 text-sm font-black text-zinc-950">
                <span>Total</span>

                <span className="shrink-0 text-[#d94b16]">
                  {precioMXN(totalProducto)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={onCerrar}
                className="flex min-h-10 items-center justify-center rounded-xl bg-zinc-200 px-3 py-2 text-[10px] font-black uppercase text-zinc-800 transition active:scale-[0.98]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarAgregar}
                className="flex min-h-10 items-center justify-center rounded-xl bg-[#d94b16] px-3 py-2 text-[10px] font-black uppercase text-white shadow-md shadow-[#d94b16]/25 transition active:scale-[0.98]"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}