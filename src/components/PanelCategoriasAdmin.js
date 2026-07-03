"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ModalCrearCategoria from "@/components/ModalCrearCategoria";
import ModalModificarCategoria from "@/components/ModalModificarCategoria";

export default function PanelCategoriasAdmin({ categorias = [] }) {
  const router = useRouter();

  const [cargando, setCargando] = useState(false);

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [ordenNuevo, setOrdenNuevo] = useState("");
  const [visibleNuevo, setVisibleNuevo] = useState(true);

  const [modalModificarAbierto, setModalModificarAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nombreEditando, setNombreEditando] = useState("");
  const [ordenEditando, setOrdenEditando] = useState("");
  const [visibleEditando, setVisibleEditando] = useState(true);

  function abrirModalCrear() {
    const ordenMayor = categorias.reduce((mayor, categoria) => {
      const orden = Number(categoria.orden || 0);
      return orden > mayor ? orden : mayor;
    }, 0);

    setNombreNuevo("");
    setOrdenNuevo(String(ordenMayor + 1));
    setVisibleNuevo(true);
    setModalCrearAbierto(true);
  }

  function cerrarModalCrear() {
    if (cargando) return;

    setModalCrearAbierto(false);
    setNombreNuevo("");
    setOrdenNuevo("");
    setVisibleNuevo(true);
  }

  async function crearCategoria(e) {
    e.preventDefault();

    if (!nombreNuevo.trim()) {
      alert("Escribe el nombre de la categoría.");
      return;
    }

    setCargando(true);

    const respuesta = await fetch("/api/panelprivado/categorias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombreNuevo.trim(),
        orden: ordenNuevo === "" ? 0 : Number(ordenNuevo),
        visible: visibleNuevo,
      }),
    });

    setCargando(false);

    if (!respuesta.ok) {
      alert("No se pudo crear la categoría.");
      return;
    }

    cerrarModalCrear();
    router.refresh();
  }

  function abrirModalModificar(categoria) {
    setCategoriaEditando(categoria);
    setNombreEditando(categoria.nombre || "");
    setOrdenEditando(categoria.orden ?? "");
    setVisibleEditando(categoria.visible ?? true);
    setModalModificarAbierto(true);
  }

  function cerrarModalModificar() {
    if (cargando) return;

    setModalModificarAbierto(false);
    setCategoriaEditando(null);
    setNombreEditando("");
    setOrdenEditando("");
    setVisibleEditando(true);
  }

  async function modificarCategoria(e) {
    e.preventDefault();

    if (!categoriaEditando) return;

    if (!nombreEditando.trim()) {
      alert("Escribe el nombre de la categoría.");
      return;
    }

    setCargando(true);

    const respuesta = await fetch(
      `/api/panelprivado/categorias/${categoriaEditando.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreEditando.trim(),
          orden: ordenEditando === "" ? 0 : Number(ordenEditando),
          visible: visibleEditando,
        }),
      }
    );

    setCargando(false);

    if (!respuesta.ok) {
      alert("No se pudo modificar la categoría.");
      return;
    }

    cerrarModalModificar();
    router.refresh();
  }

  async function eliminarCategoria(id, nombre) {
    const confirmar = confirm(
      `¿Seguro que quieres eliminar la categoría "${nombre}"? También se eliminarán sus productos.`
    );

    if (!confirmar) return;

    setCargando(true);

    const respuesta = await fetch(`/api/panelprivado/categorias/${id}`, {
      method: "DELETE",
    });

    setCargando(false);

    if (!respuesta.ok) {
      alert("No se pudo eliminar la categoría.");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <section className="flex flex-1 items-center px-3 py-3">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#fff200]">
              Panel privado
            </p>

            <h1 className="mt-1 text-xl font-black uppercase leading-tight text-white">
              Modificar categorías
            </h1>

            <p className="mt-1 text-[11px] font-semibold text-white/70">
              Crea, modifica o elimina categorías del menú
            </p>
          </div>

          <button
            type="button"
            onClick={abrirModalCrear}
            disabled={cargando}
            className="mb-3 w-full rounded-[1.2rem] bg-[#fff200] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black shadow-md shadow-black/20 transition active:scale-[0.98] disabled:opacity-60"
          >
            + Crear categoría
          </button>

          <div className="space-y-2">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-300 p-[1px] shadow-md shadow-black/15"
              >
                <div className="rounded-[1.2rem] bg-gradient-to-br from-zinc-50 via-white to-zinc-200 px-4 py-3 text-center ring-1 ring-black/5">
                  <Link
                    href={`/panelprivado/categoria/${categoria.id}`}
                    className="block"
                  >
                    <h2 className="text-sm font-black uppercase leading-tight text-black">
                      {categoria.nombre}
                    </h2>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                      Editar productos
                    </p>

                    <div className="mx-auto mt-2 h-[3px] w-12 rounded-full bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16]" />
                  </Link>

                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => abrirModalModificar(categoria)}
                      disabled={cargando}
                      className="w-full rounded-full bg-[#fff200] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-black shadow-sm shadow-black/15 transition active:scale-[0.96] disabled:opacity-60"
                    >
                      Modificar categoría
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        eliminarCategoria(categoria.id, categoria.nombre)
                      }
                      disabled={cargando}
                      className="w-full rounded-full bg-red-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-sm shadow-black/15 transition active:scale-[0.96] disabled:opacity-60"
                    >
                      Eliminar categoría
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categorias.length === 0 && (
            <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-white/10 px-4 py-4 text-center">
              <p className="text-xs font-bold text-white/70">
                Todavía no hay categorías creadas.
              </p>
            </div>
          )}
        </div>
      </section>

      <ModalCrearCategoria
        abierto={modalCrearAbierto}
        cargando={cargando}
        nombreNuevo={nombreNuevo}
        setNombreNuevo={setNombreNuevo}
        ordenNuevo={ordenNuevo}
        setOrdenNuevo={setOrdenNuevo}
        visibleNuevo={visibleNuevo}
        setVisibleNuevo={setVisibleNuevo}
        onSubmit={crearCategoria}
        onClose={cerrarModalCrear}
      />

      <ModalModificarCategoria
        abierto={modalModificarAbierto}
        cargando={cargando}
        nombreEditando={nombreEditando}
        setNombreEditando={setNombreEditando}
        ordenEditando={ordenEditando}
        setOrdenEditando={setOrdenEditando}
        visibleEditando={visibleEditando}
        setVisibleEditando={setVisibleEditando}
        onSubmit={modificarCategoria}
        onClose={cerrarModalModificar}
      />
    </>
  );
}