"use client";

export default function ProductoPanelCard({ producto, onEditar }) {
  const imagen = producto.imagen_url || "";

  return (
    <button
      type="button"
      onClick={() => onEditar(producto)}
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
}