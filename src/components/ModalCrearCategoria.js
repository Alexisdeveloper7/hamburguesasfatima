"use client";

export default function ModalCrearCategoria({
  abierto,
  cargando,
  nombreNuevo,
  setNombreNuevo,
  ordenNuevo,
  setOrdenNuevo,
  visibleNuevo,
  setVisibleNuevo,
  onSubmit,
  onClose,
}) {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid min-h-dvh place-items-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[370px] overflow-hidden rounded-[1.7rem] border border-white/10 bg-zinc-950 shadow-[0_24px_70px_rgba(0,0,0,0.70)]"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#fff200]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-[#d94b16]/35 blur-3xl" />

        <div className="relative max-h-[calc(100dvh-3rem)] overflow-y-auto px-5 py-5">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff200] text-xl font-black text-black shadow-lg shadow-yellow-400/20">
              +
            </div>

            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#fff200]">
              Nueva categoría
            </p>

            <h2 className="mt-1 text-xl font-black uppercase leading-tight text-white">
              Crear categoría
            </h2>

            <p className="mx-auto mt-1 max-w-[270px] text-[11px] font-semibold leading-4 text-white/60">
              Agrega una categoría nueva para organizar tus productos.
            </p>
          </div>

          <div className="mt-5">
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
              Nombre
            </label>

            <input
              type="text"
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              autoComplete="off"
              placeholder="Ej. Hamburguesas"
              className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-[16px] font-bold text-black outline-none placeholder:text-zinc-400 focus:border-[#fff200] focus:ring-4 focus:ring-[#fff200]/20"
            />
          </div>

          <div className="mt-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
              Orden
            </label>

            <input
              type="number"
              inputMode="numeric"
              value={ordenNuevo}
              onChange={(e) => setOrdenNuevo(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-[16px] font-bold text-black outline-none focus:border-[#fff200] focus:ring-4 focus:ring-[#fff200]/20"
            />
          </div>

          <button
            type="button"
            onClick={() => setVisibleNuevo(!visibleNuevo)}
            className={`mt-4 flex min-h-11 w-full touch-manipulation items-center justify-center rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] transition active:scale-[0.97] ${
              visibleNuevo
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : "bg-zinc-700 text-white shadow-lg shadow-black/20"
            }`}
          >
            {visibleNuevo ? "Visible en el menú" : "Oculta en el menú"}
          </button>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="flex min-h-11 touch-manipulation items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition active:scale-[0.97] disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className="flex min-h-11 touch-manipulation items-center justify-center rounded-2xl bg-[#fff200] px-3 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-black shadow-lg shadow-yellow-400/20 transition active:scale-[0.97] disabled:opacity-60"
            >
              {cargando ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}