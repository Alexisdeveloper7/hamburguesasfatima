"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const [presionado, setPresionado] = useState(false);

  const irPanelPrivado = () => {
    setPresionado(true);

    setTimeout(() => {
      setPresionado(false);
    }, 180);

    setTimeout(() => {
      router.push("/panelprivado");
    }, 260);
  };

  return (
    <footer className="mt-0 w-full border-t border-black/10 bg-[#fff200] px-4 py-3 text-center text-black shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="mx-auto max-w-md">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">
          Menú digital
        </p>

        <h2 className="mt-1 text-sm font-black uppercase leading-tight text-black">
          <button
            type="button"
            onClick={irPanelPrivado}
            className={`m-0 inline-block border-0 bg-transparent p-0 text-sm font-black uppercase leading-tight transition-all duration-150 ease-out ${
              presionado ? "scale-95 text-red-700" : "scale-100 text-black"
            }`}
          >
            Hamburguesas Fátima
          </button>
        </h2>

        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-black/60">
          Ordena fácil desde tu celular
        </p>

        <div className="mx-auto mt-2 h-[3px] w-16 rounded-full bg-gradient-to-r from-red-700 via-[#d94b16] to-black" />
      </div>
    </footer>
  );
}