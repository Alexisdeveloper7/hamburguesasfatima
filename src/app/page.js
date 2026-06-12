import Link from "next/link";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function obtenerCategorias() {
  const categorias = await sql`
    SELECT 
      id,
      nombre,
      orden
    FROM categorias
    ORDER BY orden ASC, id ASC
  `;

  return categorias;
}

export default async function Home() {
  const categorias = await obtenerCategorias();

  return (
    <section className="flex flex-1 items-center px-3 py-3">
      <div className="mx-auto max-w-sm">
        <div className="mb-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#fff200]">
            Menú digital
          </p>

          <h1 className="mt-1 text-xl font-black uppercase leading-tight text-white">
            Elige tu comida
          </h1>

          <p className="mt-1 text-[11px] font-semibold text-white/70">
            Selecciona lo que se te antoja para comenzar tu pedido
          </p>
        </div>

        <div className="space-y-2">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              href={`/categoria/${categoria.id}`}
              className="group block overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-300 p-[1px] shadow-md shadow-black/15 transition active:scale-[0.98]"
            >
              <div className="rounded-[1.2rem] bg-gradient-to-br from-zinc-50 via-white to-zinc-200 px-4 py-3 text-center ring-1 ring-black/5 transition group-active:bg-zinc-100">
                <h2 className="text-sm font-black uppercase leading-tight text-black">
                  {categoria.nombre}
                </h2>

                <div className="mx-auto mt-2 h-[3px] w-12 rounded-full bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}