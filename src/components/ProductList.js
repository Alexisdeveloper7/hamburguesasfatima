"use client";

import { useEffect, useState } from "react";
import ModalExtrasProducto from "@/components/ModalExtrasProducto";

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

function obtenerImagen(producto) {
  return producto?.imagen_url || "";
}

function obtenerExtras(producto) {
  if (!Array.isArray(producto?.extras)) return [];

  return producto.extras.filter((extra) => {
    if (!extra) return false;
    if (!extra.nombre) return false;

    const precio = Number(extra.precio);

    return Number.isFinite(precio) && precio >= 0;
  });
}

function crearIdItemCarrito(producto, extras = [], nota = "") {
  const productoId = String(producto.id);

  const extrasIds = extras
    .map((extra) => String(extra.id))
    .sort()
    .join("-");

  const notaLimpia = String(nota || "").trim().toLowerCase();

  if (!extrasIds && !notaLimpia) {
    return productoId;
  }

  return `${productoId}__extras_${extrasIds || "sin"}__nota_${
    notaLimpia || "sin"
  }`;
}

export default function ProductList({ categoriaNombre, productos }) {
  const productosSeguros = Array.isArray(productos) ? productos : [];

  const [carrito, setCarrito] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    function actualizar() {
      setCarrito(leerCarrito());
    }

    actualizar();

    window.addEventListener("carrito-actualizado", actualizar);
    window.addEventListener("storage", actualizar);

    return () => {
      window.removeEventListener("carrito-actualizado", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  function obtenerCantidad(productoId) {
    return carrito.reduce((total, item) => {
      const itemProductoId = String(item.producto_id || item.id);

      if (itemProductoId !== String(productoId)) {
        return total;
      }

      return total + Number(item.cantidad || 0);
    }, 0);
  }

  function agregarItemAlCarrito({ producto, extras = [], nota = "" }) {
    const imagen = obtenerImagen(producto);

    const extrasLimpios = Array.isArray(extras)
      ? extras.map((extra) => ({
          id: String(extra.id),
          nombre: extra.nombre,
          precio: precioSeguro(extra.precio),
        }))
      : [];

    const notaLimpia = String(nota || "").trim();

    const totalExtras = extrasLimpios.reduce((total, extra) => {
      return total + precioSeguro(extra.precio);
    }, 0);

    const precioBase = precioSeguro(producto.precio);
    const precioFinal = precioBase + totalExtras;

    const idItem = crearIdItemCarrito(producto, extrasLimpios, notaLimpia);

    const nuevoCarrito = [...carrito];

    const index = nuevoCarrito.findIndex((item) => item.id === idItem);

    if (index >= 0) {
      nuevoCarrito[index] = {
        ...nuevoCarrito[index],
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: precioFinal,
        precio_base: precioBase,
        total_extras: totalExtras,
        categoria: categoriaNombre,
        imagen,
        extras: extrasLimpios,
        nota: notaLimpia,
        producto_id: String(producto.id),
        cantidad: Number(nuevoCarrito[index].cantidad || 0) + 1,
      };
    } else {
      nuevoCarrito.push({
        id: idItem,
        producto_id: String(producto.id),
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: precioFinal,
        precio_base: precioBase,
        total_extras: totalExtras,
        categoria: categoriaNombre,
        imagen,
        extras: extrasLimpios,
        nota: notaLimpia,
        cantidad: 1,
      });
    }

    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  }

  function aumentar(producto) {
    const extras = obtenerExtras(producto);

    if (extras.length > 0) {
      setProductoSeleccionado(producto);
      setModalAbierto(true);
      return;
    }

    agregarItemAlCarrito({
      producto,
      extras: [],
      nota: "",
    });
  }

  function agregarDesdeModal({ producto, extras, nota }) {
    agregarItemAlCarrito({
      producto,
      extras,
      nota,
    });
  }

  function disminuir(producto) {
    const productoId = String(producto.id);

    const index = [...carrito]
      .map((item, itemIndex) => ({
        item,
        itemIndex,
      }))
      .reverse()
      .find(({ item }) => String(item.producto_id || item.id) === productoId)
      ?.itemIndex;

    if (index === undefined) return;

    const nuevoCarrito = carrito
      .map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          cantidad: Number(item.cantidad || 0) - 1,
        };
      })
      .filter((item) => Number(item.cantidad || 0) > 0);

    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-sm px-3 pb-3">
        <div className="space-y-2.5">
          {productosSeguros.length === 0 ? (
            <div className="rounded-[1.3rem] bg-gradient-to-br from-white via-zinc-50 to-zinc-200 px-4 py-5 text-center text-xs font-black uppercase text-black shadow-lg shadow-black/15 ring-1 ring-black/10">
              No hay productos disponibles.
            </div>
          ) : (
            productosSeguros.map((producto) => {
              const cantidad = obtenerCantidad(producto.id);
              const imagen = obtenerImagen(producto);
              const tieneImagen = Boolean(imagen);

              return (
                <article
                  key={producto.id}
                  className={`relative flex w-full items-center overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-white via-[#fffaf7] to-[#f3f4f6] text-black shadow-lg shadow-black/15 ring-1 ring-black/10 ${
                    tieneImagen ? "gap-2.5 p-2.5" : "p-3.5"
                  }`}
                >
                  {tieneImagen ? (
                    <div className="relative z-10 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white ring-1 ring-black/10">
                      <img
                        src={imagen}
                        alt={producto.nombre}
                        className="h-full w-full bg-white object-contain p-1"
                      />
                    </div>
                  ) : null}

                  <div className="relative z-10 min-w-0 flex-1">
                    <div
                      className={
                        tieneImagen
                          ? ""
                          : "border-l-4 border-[#d94b16] pl-3"
                      }
                    >
                      <h2
                        className={`line-clamp-2 font-black uppercase leading-tight text-zinc-950 ${
                          tieneImagen ? "text-[13px]" : "text-[14px]"
                        }`}
                      >
                        {producto.nombre}
                      </h2>

                      {producto.descripcion ? (
                        <p
                          className={`mt-1 line-clamp-2 font-bold leading-snug text-zinc-500 ${
                            tieneImagen ? "text-[10px]" : "text-[11px]"
                          }`}
                        >
                          {producto.descripcion}
                        </p>
                      ) : null}

                      <p
                        className={`mt-1 font-black leading-none text-[#d94b16] ${
                          tieneImagen ? "text-lg" : "text-xl"
                        }`}
                      >
                        {precioMXN(producto.precio)}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        tieneImagen ? "mt-2" : "mt-3"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => disminuir(producto)}
                        disabled={cantidad === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1eb] text-lg font-black leading-none text-[#d94b16] shadow-sm ring-1 ring-[#d94b16]/25 transition active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:ring-black/5 disabled:opacity-100"
                      >
                        −
                      </button>

                      <span className="flex h-8 min-w-9 items-center justify-center rounded-full bg-white px-2 text-sm font-black text-zinc-950 shadow-sm ring-1 ring-black/10">
                        {cantidad}
                      </span>

                      <button
                        type="button"
                        onClick={() => aumentar(producto)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d94b16] text-lg font-black leading-none text-white shadow transition active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <ModalExtrasProducto
        abierto={modalAbierto}
        producto={productoSeleccionado}
        extrasDisponibles={obtenerExtras(productoSeleccionado)}
        onCerrar={() => {
          setModalAbierto(false);
          setProductoSeleccionado(null);
        }}
        onAgregar={agregarDesdeModal}
      />
    </>
  );
}