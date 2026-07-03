"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductoPanelCard from "@/components/ProductoPanelCard";
import ModalProducto from "@/components/ModalProducto";

const formularioVacio = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  precio: "",
  disponible: true,
  orden: "",
  extras: [],
};

function ordenarProductos(productos) {
  return [...productos].sort((a, b) => {
    if (Number(a.orden) !== Number(b.orden)) {
      return Number(a.orden) - Number(b.orden);
    }

    return Number(a.id) - Number(b.id);
  });
}

export default function PanelCategoriaProductos({
  categoria,
  productosIniciales,
}) {
  const router = useRouter();

  const [productos, setProductos] = useState(productosIniciales);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [formulario, setFormulario] = useState(formularioVacio);

  const abrirModalNuevo = () => {
    const siguienteOrden =
      productos.length > 0
        ? Math.max(...productos.map((producto) => Number(producto.orden || 0))) +
          1
        : 1;

    setProductoSeleccionado(null);
    setFormulario({
      ...formularioVacio,
      orden: String(siguienteOrden),
      extras: [],
    });
    setError("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoSeleccionado(producto);
    setFormulario({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      imagen_url: producto.imagen_url || "",
      precio: String(Number(producto.precio || 0)),
      disponible: Boolean(producto.disponible),
      orden: String(producto.orden ?? 0),
      extras: Array.isArray(producto.extras)
        ? producto.extras.map((extra) => ({
            id: extra.id,
            nombre: extra.nombre || "",
            precio: String(Number(extra.precio || 0)),
          }))
        : [],
    });
    setError("");
    setModalAbierto(true);
  };

  const limpiarYCerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
    setFormulario(formularioVacio);
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

  const guardarProducto = async (e) => {
    e.preventDefault();

    const nombreLimpio = formulario.nombre.trim();
    const descripcionLimpia = formulario.descripcion.trim();
    const precioNumero = Number(formulario.precio);
    const ordenNumero = Number(formulario.orden || 0);

    const extrasLimpios = Array.isArray(formulario.extras)
      ? formulario.extras
          .map((extra) => ({
            id: extra.id,
            nombre: String(extra.nombre || "").trim(),
            precio: Number(extra.precio),
          }))
          .filter((extra) => extra.nombre || Number.isFinite(extra.precio))
      : [];

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

    for (const extra of extrasLimpios) {
      if (!extra.nombre) {
        setError("Escribe el nombre de todos los extras o elimínalos.");
        return;
      }

      if (!Number.isFinite(extra.precio) || extra.precio < 0) {
        setError("Escribe un precio válido para todos los extras.");
        return;
      }
    }

    try {
      setGuardando(true);
      setError("");

      const esEditando = Boolean(productoSeleccionado);

      const url = esEditando
        ? `/api/panelprivado/productos/${productoSeleccionado.id}`
        : "/api/panelprivado/productos";

      const metodo = esEditando ? "PATCH" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoria_id: categoria.id,
          nombre: nombreLimpio,
          descripcion: descripcionLimpia,
          imagen_url: formulario.imagen_url || "",
          precio: precioNumero,
          disponible: formulario.disponible,
          orden: ordenNumero,
          extras: extrasLimpios,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudo guardar el producto.");
      }

      if (esEditando) {
        setProductos((productosActuales) =>
          ordenarProductos(
            productosActuales.map((producto) =>
              producto.id === datos.producto.id ? datos.producto : producto
            )
          )
        );
      } else {
        setProductos((productosActuales) =>
          ordenarProductos([...productosActuales, datos.producto])
        );
      }

      limpiarYCerrarModal();
      router.refresh();
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async () => {
    if (!productoSeleccionado) return;

    const confirmar = window.confirm(
      `¿Seguro que quieres eliminar "${productoSeleccionado.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setGuardando(true);
      setError("");

      const respuesta = await fetch(
        `/api/panelprivado/productos/${productoSeleccionado.id}`,
        {
          method: "DELETE",
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudo eliminar el producto.");
      }

      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) => producto.id !== productoSeleccionado.id
        )
      );

      limpiarYCerrarModal();
      router.refresh();
    } catch (err) {
      setError(err.message || "Ocurrió un error al eliminar.");
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

        <div className="mb-2 grid grid-cols-2 gap-1.5">
          <Link
            href="/panelprivado"
            className="group flex min-h-8 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-300 px-3 py-1.5 text-center text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-lg shadow-black/20 ring-1 ring-black/10 transition duration-300 active:scale-[0.97]"
          >
            Ver categorías
          </Link>

          <button
            type="button"
            onClick={abrirModalNuevo}
            className="group flex min-h-8 items-center justify-center rounded-[0.9rem] bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16] px-3 py-1.5 text-center text-[8px] font-black uppercase tracking-[0.08em] text-black shadow-lg shadow-orange-500/25 ring-1 ring-orange-300/50 transition duration-300 active:scale-[0.97]"
          >
            + Producto
          </button>
        </div>

        {productos.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {productos.map((producto) => (
              <ProductoPanelCard
                key={producto.id}
                producto={producto}
                onEditar={abrirModalEditar}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1rem] bg-white/90 px-3 py-5 text-center text-[9px] font-black uppercase tracking-[0.08em] text-black shadow-lg shadow-black/20 ring-1 ring-white/20">
            No hay productos todavía.
          </div>
        )}
      </div>

      <ModalProducto
        abierto={modalAbierto}
        productoSeleccionado={productoSeleccionado}
        formulario={formulario}
        guardando={guardando}
        error={error}
        onCerrar={cerrarModal}
        onGuardar={guardarProducto}
        onEliminar={eliminarProducto}
        onCambiarCampo={cambiarCampo}
        onCambiarImagen={cambiarImagen}
      />
    </section>
  );
}