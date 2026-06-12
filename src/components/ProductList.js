"use client";

import { useEffect, useState } from "react";

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

export default function ProductList({ categoriaNombre, productos }) {
  const [carrito, setCarrito] = useState([]);

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
    const item = carrito.find((producto) => producto.id === String(productoId));
    return item?.cantidad || 0;
  }

  function obtenerImagen(producto) {
    return producto.imagen_url || "";
  }

  function aumentar(producto) {
    const imagen = obtenerImagen(producto);

    const nuevoCarrito = [...carrito];
    const index = nuevoCarrito.findIndex(
      (item) => item.id === String(producto.id)
    );

    if (index >= 0) {
      nuevoCarrito[index] = {
        ...nuevoCarrito[index],
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: Number(producto.precio || 0),
        categoria: categoriaNombre,
        imagen,
        cantidad: Number(nuevoCarrito[index].cantidad || 0) + 1,
      };
    } else {
      nuevoCarrito.push({
        id: String(producto.id),
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: Number(producto.precio || 0),
        categoria: categoriaNombre,
        imagen,
        cantidad: 1,
      });
    }

    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  }

  function disminuir(producto) {
    const nuevoCarrito = carrito
      .map((item) => {
        if (item.id !== String(producto.id)) return item;

        return {
          ...item,
          cantidad: Number(item.cantidad || 0) - 1,
        };
      })
      .filter((item) => item.cantidad > 0);

    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  }

  return (
    <section className="mx-auto w-full max-w-sm px-3 pb-3">
      <div className="space-y-2.5">
        {productos.length === 0 ? (
          <div className="rounded-[1.3rem] bg-gradient-to-br from-white via-zinc-50 to-zinc-200 px-4 py-5 text-center text-xs font-black uppercase text-black shadow-lg shadow-black/15 ring-1 ring-black/10">
            No hay productos disponibles.
          </div>
        ) : (
          productos.map((producto) => {
            const cantidad = obtenerCantidad(producto.id);
            const imagen = obtenerImagen(producto);

            return (
              <article
                key={producto.id}
                className="flex w-full items-center gap-2.5 rounded-[1.35rem] bg-gradient-to-br from-white via-zinc-50 to-zinc-200 p-2.5 text-black shadow-lg shadow-black/15 ring-1 ring-black/10"
              >
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-gradient-to-br from-zinc-100 to-white ring-1 ring-black/10">
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={producto.nombre}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-center text-[9px] font-black uppercase leading-tight text-zinc-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-[13px] font-black uppercase leading-tight text-zinc-950">
                    {producto.nombre}
                  </h2>

                  {producto.descripcion ? (
                    <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-snug text-zinc-500">
                      {producto.descripcion}
                    </p>
                  ) : null}

                  <p className="mt-1 text-lg font-black leading-none text-[#d94b16]">
                    {precioMXN(producto.precio)}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => disminuir(producto)}
                      disabled={cantidad === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-lg font-black leading-none text-white shadow transition active:scale-95 disabled:opacity-35"
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
  );
}