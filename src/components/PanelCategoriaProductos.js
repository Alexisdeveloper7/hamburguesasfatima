"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PanelCategoriaProductos({
  categoria,
  productosIniciales,
}) {
  const [productos, setProductos] = useState(productosIniciales);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    imagen_url: "",
    precio: "",
    disponible: true,
    orden: "",
  });

  useEffect(() => {
    if (!modalAbierto || typeof window === "undefined") return;

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
  }, [modalAbierto]);

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setFormulario({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      imagen_url: producto.imagen_url || "",
      precio: String(Number(producto.precio || 0)),
      disponible: Boolean(producto.disponible),
      orden: String(producto.orden ?? 0),
    });
    setError("");
    setModalAbierto(true);
  };

  const limpiarYCerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
    setError("");
  };

  const cerrarModal = () => {
    if (guardando) return;
    limpiarYCerrarModal();
  };

  const cambiarCampo = (campo, valor) => {
    setFormulario((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

  const cambiarImagen = (archivo) => {
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      const imagen = new Image();

      imagen.onload = () => {
        const canvas = document.createElement("canvas");
        const maximo = 700;

        let ancho = imagen.width;
        let alto = imagen.height;

        if (ancho > alto && ancho > maximo) {
          alto = Math.round((alto * maximo) / ancho);
          ancho = maximo;
        } else if (alto > maximo) {
          ancho = Math.round((ancho * maximo) / alto);
          alto = maximo;
        }

        canvas.width = ancho;
        canvas.height = alto;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(imagen, 0, 0, ancho, alto);

        const imagenComprimida = canvas.toDataURL("image/webp", 0.75);

        cambiarCampo("imagen_url", imagenComprimida);
        setError("");
      };

      imagen.src = lector.result;
    };

    lector.readAsDataURL(archivo);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (!productoSeleccionado) return;

    const nombreLimpio = formulario.nombre.trim();
    const descripcionLimpia = formulario.descripcion.trim();
    const precioNumero = Number(formulario.precio);
    const ordenNumero = Number(formulario.orden || 0);

    if (!nombreLimpio) {
      setError("Escribe el nombre del producto.");
      return;
    }

    if (!Number.isFinite(precioNumero) || precioNumero < 0) {
      setError("Escribe un precio válido.");
      return;
    }

    if (!Number.isFinite(ordenNumero)) {
      setError("Escribe un orden válido.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const respuesta = await fetch(
        `/api/panelprivado/productos/${productoSeleccionado.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: nombreLimpio,
            descripcion: descripcionLimpia,
            imagen_url: formulario.imagen_url || "",
            precio: precioNumero,
            disponible: formulario.disponible,
            orden: ordenNumero,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudo guardar el producto.");
      }

      setProductos((productosActuales) =>
        productosActuales
          .map((producto) =>
            producto.id === datos.producto.id ? datos.producto : producto
          )
          .sort((a, b) => {
            if (Number(a.orden) !== Number(b.orden)) {
              return Number(a.orden) - Number(b.orden);
            }

            return Number(a.id) - Number(b.id);
          })
      );

      limpiarYCerrarModal();
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="flex h-[100dvh] flex-1 items-center justify-center overflow-hidden px-2.5 py-2.5">
      <div className="mx-auto w-full max-w-[315px]">
        <div className="mb-2 rounded-[1.25rem] border border-white/15 bg-white/10 px-3 py-2.5 text-center shadow-xl shadow-black/20 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16]" />

          <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#fff200] drop-shadow">
            Panel privado
          </p>

          <h1 className="mt-0.5 text-[1.1rem] font-black uppercase leading-none text-white drop-shadow">
            {categoria.nombre}
          </h1>

          <p className="mx-auto mt-1 max-w-[220px] text-[9px] font-semibold leading-tight text-white/75">
            Selecciona un producto para editarlo
          </p>
        </div>

        <Link
          href="/panelprivado"
          className="group mb-2 flex min-h-8 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-300 px-3 py-1.5 text-center text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-lg shadow-black/20 ring-1 ring-black/10 transition duration-300 active:scale-[0.97]"
        >
          Ver categorías
        </Link>

        <div className="grid grid-cols-2 gap-1.5">
          {productos.map((producto) => {
            const imagen = producto.imagen_url || "";

            return (
              <button
                key={producto.id}
                type="button"
                onClick={() => abrirModal(producto)}
                className="group block w-full overflow-hidden rounded-[1rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-300 p-[1px] text-left shadow-lg shadow-black/20 ring-1 ring-white/20 transition duration-300 active:scale-[0.97]"
              >
                <div className="relative min-h-[118px] overflow-hidden rounded-[0.95rem] bg-gradient-to-br from-zinc-50 via-white to-zinc-200 px-2 py-2 text-center ring-1 ring-black/5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-[#fff200]/30 blur-2xl" />

                  <div className="relative mx-auto mb-1 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md shadow-black/10 ring-1 ring-black/10">
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={producto.nombre}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="px-1 text-center text-[6px] font-black uppercase leading-tight text-zinc-400">
                        Sin imagen
                      </span>
                    )}
                  </div>

                  <h2 className="relative line-clamp-2 text-[9px] font-black uppercase leading-tight text-black">
                    {producto.nombre}
                  </h2>

                  {producto.descripcion ? (
                    <p className="relative mt-0.5 line-clamp-2 text-[7px] font-semibold leading-tight text-zinc-500">
                      {producto.descripcion}
                    </p>
                  ) : null}

                  <p className="relative mt-0.5 text-[10px] font-black text-[#d94b16]">
                    ${Number(producto.precio)}
                  </p>

                  <p
                    className={`relative mx-auto mt-1 inline-flex rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.08em] ring-1 ${
                      producto.disponible
                        ? "bg-green-50 text-green-700 ring-green-200"
                        : "bg-red-50 text-red-700 ring-red-200"
                    }`}
                  >
                    {producto.disponible ? "Disponible" : "Oculto"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {modalAbierto ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex h-[100dvh] items-center justify-center overflow-hidden bg-black/80 px-2.5 py-2.5 backdrop-blur-md"
        >
          <div className="w-full max-w-[300px] rounded-[1.3rem] bg-gradient-to-br from-[#fff200] via-[#ffb000] to-[#d94b16] p-[1px] shadow-2xl shadow-black/50">
            <form
              onSubmit={guardarCambios}
              className="rounded-[1.25rem] bg-gradient-to-br from-white via-zinc-50 to-zinc-200 px-3 py-2.5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#d94b16]">
                    Editar producto
                  </p>

                  <h2 className="mt-0.5 line-clamp-1 text-[13px] font-black uppercase leading-tight text-black">
                    {productoSeleccionado?.nombre}
                  </h2>

                  <p className="text-[9px] font-semibold text-zinc-500">
                    Actualiza los datos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarModal}
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
                      onChange={(e) => cambiarImagen(e.target.files?.[0])}
                      className="w-full cursor-pointer text-[9px] font-bold text-zinc-700 file:mr-1.5 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#d94b16] file:px-2 file:py-1 file:text-[8px] file:font-black file:uppercase file:text-white"
                    />

                    {formulario.imagen_url ? (
                      <button
                        type="button"
                        onClick={() => cambiarCampo("imagen_url", "")}
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
                    value={formulario.nombre}
                    onChange={(e) => cambiarCampo("nombre", e.target.value)}
                    className="w-full rounded-[0.8rem] border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100"
                    placeholder="Ej. Hamburguesa sencilla"
                  />
                </label>

                <label className="block">
                  <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                    Precio
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formulario.precio}
                    onChange={(e) => cambiarCampo("precio", e.target.value)}
                    className="w-full rounded-[0.8rem] border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100"
                    placeholder="Ej. 60"
                  />
                </label>

                <label className="block">
                  <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                    Descripción
                  </span>

                  <textarea
                    value={formulario.descripcion}
                    onChange={(e) =>
                      cambiarCampo("descripcion", e.target.value)
                    }
                    rows={1}
                    className="w-full resize-none rounded-[0.8rem] border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100"
                    placeholder="Ej. Con carne, queso..."
                  />
                </label>

                <label className="block">
                  <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-500">
                    Orden
                  </span>

                  <input
                    type="number"
                    step="1"
                    value={formulario.orden}
                    onChange={(e) => cambiarCampo("orden", e.target.value)}
                    className="w-full rounded-[0.8rem] border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-black shadow-sm outline-none transition duration-300 placeholder:text-zinc-400 focus:border-[#d94b16] focus:bg-white focus:ring-2 focus:ring-orange-100"
                    placeholder="Ej. 1"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    cambiarCampo("disponible", !formulario.disponible)
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
              </div>

              {error ? (
                <p className="mt-1.5 rounded-[0.8rem] bg-red-50 px-2 py-1.5 text-center text-[9px] font-bold text-red-600 ring-1 ring-red-100">
                  {error}
                </p>
              ) : null}

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="min-h-8 rounded-[0.8rem] bg-white px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-sm ring-1 ring-black/10 transition duration-300 active:scale-[0.98] disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="min-h-8 rounded-[0.8rem] bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16] px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-lg shadow-orange-500/25 ring-1 ring-orange-300/50 transition duration-300 active:scale-[0.98] disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}