"use client";

import { useEffect } from "react";

export default function ModalProducto({
  abierto,
  productoSeleccionado,
  formulario,
  guardando,
  error,
  onCerrar,
  onGuardar,
  onEliminar,
  onCambiarCampo,
  onCambiarImagen,
}) {
  const esEditando = Boolean(productoSeleccionado);
  const extras = Array.isArray(formulario.extras) ? formulario.extras : [];

  useEffect(() => {
    if (!abierto || typeof window === "undefined") return;

    const scrollY = window.scrollY;

    const bodyOverflowOriginal = document.body.style.overflow;
    const htmlOverflowOriginal = document.documentElement.style.overflow;
    const bodyPositionOriginal = document.body.style.position;
    const bodyTopOriginal = document.body.style.top;
    const bodyWidthOriginal = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const bloquearEscape = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", bloquearEscape, true);

    return () => {
      document.body.style.overflow = bodyOverflowOriginal;
      document.documentElement.style.overflow = htmlOverflowOriginal;
      document.body.style.position = bodyPositionOriginal;
      document.body.style.top = bodyTopOriginal;
      document.body.style.width = bodyWidthOriginal;

      document.removeEventListener("keydown", bloquearEscape, true);

      window.scrollTo(0, scrollY);
    };
  }, [abierto]);

  if (!abierto) return null;

  const inputBase =
    "w-full rounded-[0.8rem] border border-zinc-200 bg-white px-2.5 py-1.5 text-[16px] font-bold text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100";

  const inputChico =
    "w-full rounded-[0.7rem] border border-zinc-200 bg-white px-2 py-1.5 text-[16px] font-bold text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100";

  const obtenerTextoPrecio = (valor) => {
    if (valor === undefined || valor === null) return "";
    return String(valor).trim();
  };

  const precioValido = (valor) => {
    const texto = obtenerTextoPrecio(valor);

    if (texto === "") return false;
    if (!/^\d+$/.test(texto)) return false;

    const numero = Number(texto);

    return Number.isFinite(numero) && numero >= 0;
  };

  const enfocarCampo = (selector, mensaje) => {
    const campo = document.querySelector(selector);

    if (!campo) {
      window.alert(mensaje);
      return;
    }

    campo.focus();
    campo.setCustomValidity(mensaje);
    campo.reportValidity();

    setTimeout(() => {
      campo.setCustomValidity("");
    }, 250);
  };

  const manejarGuardar = (e) => {
    e.preventDefault();

    if (!precioValido(formulario.precio)) {
      enfocarCampo(
        "[data-campo='precio-producto']",
        "Escribe 0 o un número positivo en el precio del producto."
      );
      return;
    }

    const extraSinPrecio = extras.findIndex(
      (extra) => !precioValido(extra.precio)
    );

    if (extraSinPrecio !== -1) {
      enfocarCampo(
        `[data-campo='precio-extra-${extraSinPrecio}']`,
        `Escribe 0 o un número positivo en el precio del Extra ${
          extraSinPrecio + 1
        }.`
      );
      return;
    }

    onGuardar(e);
  };

  const agregarExtra = () => {
    onCambiarCampo("extras", [
      ...extras,
      {
        nombre: "",
        precio: "",
      },
    ]);
  };

  const cambiarExtra = (index, campo, valor) => {
    const nuevosExtras = extras.map((extra, extraIndex) => {
      if (extraIndex !== index) return extra;

      return {
        ...extra,
        [campo]: valor,
      };
    });

    onCambiarCampo("extras", nuevosExtras);
  };

  const cambiarPrecioProducto = (valor) => {
    const soloNumeros = valor.replace(/[^\d]/g, "");
    onCambiarCampo("precio", soloNumeros);
  };

  const cambiarPrecioExtra = (index, valor) => {
    const soloNumeros = valor.replace(/[^\d]/g, "");
    cambiarExtra(index, "precio", soloNumeros);
  };

  const eliminarExtra = (index) => {
    const nuevosExtras = extras.filter((_, extraIndex) => extraIndex !== index);
    onCambiarCampo("extras", nuevosExtras);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex h-[100dvh] items-center justify-center overflow-hidden bg-black/80 px-2.5 py-2.5 backdrop-blur-md"
    >
      <div className="max-h-[calc(100dvh-20px)] w-full max-w-[310px] overflow-y-auto rounded-[1.3rem] bg-gradient-to-br from-[#fff200] via-[#ffb000] to-[#d94b16] p-[1px] shadow-2xl shadow-black/50">
        <form
          onSubmit={manejarGuardar}
          className="rounded-[1.25rem] bg-gradient-to-br from-white via-zinc-50 to-zinc-200 px-3 py-2.5"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#d94b16]">
                {esEditando ? "Editar producto" : "Agregar producto"}
              </p>

              <h2 className="mt-0.5 line-clamp-1 text-[13px] font-black uppercase leading-tight text-black">
                {esEditando ? productoSeleccionado?.nombre : "Nuevo producto"}
              </h2>

              <p className="text-[9px] font-semibold text-zinc-500">
                {esEditando
                  ? "Actualiza los datos."
                  : "Llena los datos del producto."}
              </p>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-lg font-black text-black shadow-md shadow-black/10 ring-1 ring-black/10 transition duration-300 active:scale-95 disabled:opacity-60"
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                Imagen
              </span>

              <div className="rounded-[0.9rem] border border-zinc-200 bg-white/80 p-1.5 shadow-inner shadow-black/5">
                {formulario.imagen_url ? (
                  <img
                    src={formulario.imagen_url}
                    alt="Vista previa"
                    className="mb-1 h-14 w-full rounded-lg bg-white object-contain p-1 shadow-sm ring-1 ring-black/10"
                  />
                ) : (
                  <div className="mb-1 flex h-14 w-full items-center justify-center rounded-lg bg-white text-center text-[8px] font-black uppercase tracking-[0.08em] text-zinc-400 shadow-sm ring-1 ring-black/10">
                    Sin imagen
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onCambiarImagen(e.target.files?.[0])}
                  className="w-full cursor-pointer text-[16px] font-bold text-zinc-700 file:mr-1.5 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#d94b16] file:px-2 file:py-1 file:text-[10px] file:font-black file:uppercase file:text-white"
                />

                {formulario.imagen_url ? (
                  <button
                    type="button"
                    onClick={() => {
                      const confirmar = window.confirm(
                        "¿Seguro que quieres eliminar la imagen de este producto?"
                      );

                      if (!confirmar) return;

                      onCambiarCampo("imagen_url", "");
                    }}
                    className="mt-1 w-full rounded-lg bg-zinc-200 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-black active:scale-[0.98]"
                  >
                    Quitar imagen
                  </button>
                ) : null}
              </div>
            </label>

            <label className="block">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                Nombre
              </span>

              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => onCambiarCampo("nombre", e.target.value)}
                className={inputBase}
                placeholder="Ej. Hamburguesa sencilla"
                autoComplete="off"
              />
            </label>

            <label className="block">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                Precio
              </span>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                data-campo="precio-producto"
                value={
                  formulario.precio === undefined || formulario.precio === null
                    ? ""
                    : String(formulario.precio)
                }
                onChange={(e) => cambiarPrecioProducto(e.target.value)}
                className={inputBase}
                placeholder="Ej. 60"
                autoComplete="off"
                required
                title="Escribe 0 o un número positivo."
              />
            </label>

            <label className="block">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                Descripción
              </span>

              <textarea
                value={formulario.descripcion}
                onChange={(e) =>
                  onCambiarCampo("descripcion", e.target.value)
                }
                rows={1}
                className="w-full resize-none rounded-[0.8rem] border border-zinc-200 bg-white px-2.5 py-1.5 text-[16px] font-semibold leading-tight text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100"
                placeholder="Ej. Con carne, queso..."
                autoComplete="off"
              />
            </label>

            <label className="block">
              <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                Orden
              </span>

              <input
                type="number"
                step="1"
                inputMode="numeric"
                value={formulario.orden}
                onChange={(e) => onCambiarCampo("orden", e.target.value)}
                className={inputBase}
                placeholder="Ej. 1"
                autoComplete="off"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                onCambiarCampo("disponible", !formulario.disponible)
              }
              className={`flex w-full items-center justify-between rounded-[0.8rem] px-2.5 py-1.5 text-left shadow-sm ring-1 transition duration-300 active:scale-[0.98] ${
                formulario.disponible
                  ? "bg-green-50 text-green-700 ring-green-200"
                  : "bg-red-50 text-red-700 ring-red-200"
              }`}
            >
              <span className="text-[8px] font-black uppercase tracking-[0.09em]">
                Estado
              </span>

              <span className="text-[8px] font-black uppercase tracking-[0.09em]">
                {formulario.disponible ? "Disponible" : "Oculto"}
              </span>
            </button>

            <div className="rounded-[0.95rem] bg-white/80 p-2 shadow-inner shadow-black/5 ring-1 ring-black/10">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                    Extras con precio
                  </p>

                  <p className="text-[8px] font-semibold leading-tight text-zinc-400">
                    Escribe 0 si no cobra extra.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={agregarExtra}
                  disabled={guardando}
                  className="shrink-0 rounded-full bg-[#d94b16] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  + Extra
                </button>
              </div>

              {extras.length > 0 ? (
                <div className="max-h-[145px] space-y-1.5 overflow-y-auto pr-0.5">
                  {extras.map((extra, index) => (
                    <div
                      key={extra.id || index}
                      className="rounded-[0.85rem] bg-zinc-100 p-1.5 ring-1 ring-black/10"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.08em] text-zinc-500">
                          Extra {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => eliminarExtra(index)}
                          disabled={guardando}
                          className="rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-black uppercase text-red-600 ring-1 ring-red-200 active:scale-[0.98] disabled:opacity-60"
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="grid grid-cols-[1fr_78px] gap-1.5">
                        <label className="block">
                          <span className="mb-0.5 block text-[7px] font-black uppercase tracking-[0.08em] text-zinc-400">
                            Nombre
                          </span>

                          <input
                            type="text"
                            value={extra.nombre || ""}
                            onChange={(e) =>
                              cambiarExtra(index, "nombre", e.target.value)
                            }
                            className={inputChico}
                            placeholder="Extra panela"
                            autoComplete="off"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-0.5 block text-[7px] font-black uppercase tracking-[0.08em] text-zinc-400">
                            Precio
                          </span>

                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            data-campo={`precio-extra-${index}`}
                            value={
                              extra.precio === undefined ||
                              extra.precio === null
                                ? ""
                                : String(extra.precio)
                            }
                            onChange={(e) =>
                              cambiarPrecioExtra(index, e.target.value)
                            }
                            className={inputChico}
                            placeholder="0"
                            autoComplete="off"
                            required
                            title="Escribe 0 o un número positivo."
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[0.85rem] bg-zinc-100 px-2 py-2 text-center text-[8px] font-black uppercase tracking-[0.08em] text-zinc-400 ring-1 ring-black/10">
                  Sin extras agregados
                </div>
              )}
            </div>
          </div>

          {error ? (
            <p className="mt-1.5 rounded-[0.8rem] bg-red-50 px-2 py-1.5 text-center text-[9px] font-bold text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          ) : null}

          <div
            className={`mt-2 grid gap-1.5 ${
              esEditando ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="min-h-8 rounded-[0.8rem] bg-white px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-sm ring-1 ring-black/10 transition duration-300 active:scale-[0.98] disabled:opacity-60"
            >
              Cancelar
            </button>

            {esEditando ? (
              <button
                type="button"
                onClick={onEliminar}
                disabled={guardando}
                className="min-h-8 rounded-[0.8rem] bg-red-600 px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-white shadow-sm transition duration-300 active:scale-[0.98] disabled:opacity-60"
              >
                Eliminar
              </button>
            ) : null}

            <button
              type="submit"
              disabled={guardando}
              className="min-h-8 rounded-[0.8rem] bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16] px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-lg shadow-orange-500/25 ring-1 ring-orange-300/50 transition duration-300 active:scale-[0.98] disabled:opacity-60"
            >
              {guardando
                ? "Guardando..."
                : esEditando
                  ? "Guardar"
                  : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}