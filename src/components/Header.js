export default function Header({
  titulo = "Hamburguesas Fátima",
  texto = "Menú digital",
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#fff200] text-black shadow-lg">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-black bg-white shadow-md">
          <img
            src="/logo.jpeg"
            alt="Logo Hamburguesas Fátima"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">
            {texto}
          </p>

          <h1 className="mt-0.5 truncate text-xl font-black uppercase leading-tight text-black">
            {titulo}
          </h1>

          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-black/60">
            Ordena fácil y rápido
          </p>
        </div>
      </div>
    </header>
  );
}