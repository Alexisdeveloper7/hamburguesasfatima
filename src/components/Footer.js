export default function Footer() {
  return (
    <footer className="mt-0 w-full border-t border-black/10 bg-[#fff200] px-4 py-3 text-center text-black shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="mx-auto max-w-md">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">
          Menú digital
        </p>

        <h2 className="mt-1 text-sm font-black uppercase leading-tight text-black">
          Hamburguesas Fátima
        </h2>

        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-black/60">
          Ordena fácil desde tu celular
        </p>

        <div className="mx-auto mt-2 h-[3px] w-16 rounded-full bg-gradient-to-r from-red-700 via-[#d94b16] to-black" />
      </div>
    </footer>
  );
}