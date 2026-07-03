import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/neon";
import ProductList from "@/components/ProductList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function obtenerCategoria(id) {
  const categorias = await sql`
    SELECT 
      id,
      nombre
    FROM categorias
    WHERE id = ${id}
    LIMIT 1
  `;

  return categorias[0] || null;
}

async function obtenerProductos(categoriaId) {
  const productos = await sql`
    SELECT 
      p.id,
      p.categoria_id,
      p.nombre,
      p.descripcion,
      p.imagen_url,
      p.precio,
      p.disponible,
      p.orden,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pe.id,
            'producto_id', pe.producto_id,
            'nombre', pe.nombre,
            'precio', pe.precio
          )
          ORDER BY pe.id ASC
        ) FILTER (WHERE pe.id IS NOT NULL),
        '[]'::json
      ) AS extras
    FROM productos p
    LEFT JOIN producto_extras pe
      ON pe.producto_id = p.id
    WHERE p.categoria_id = ${categoriaId}
    AND p.disponible = true
    GROUP BY 
      p.id,
      p.categoria_id,
      p.nombre,
      p.descripcion,
      p.imagen_url,
      p.precio,
      p.disponible,
      p.orden
    ORDER BY p.orden ASC, p.id ASC
  `;

  return productos.map((producto) => ({
    ...producto,
    extras: Array.isArray(producto.extras) ? producto.extras : [],
  }));
}

export default async function CategoriaPage({ params }) {
  const { id } = await params;
  const categoriaId = Number(id);

  if (!categoriaId) {
    notFound();
  }

  const categoria = await obtenerCategoria(categoriaId);

  if (!categoria) {
    notFound();
  }

  const productos = await obtenerProductos(categoriaId);

  return (
    <section>
      <div className="mx-auto max-w-sm px-3 pt-3">
        <div className="mb-2.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-200">
            Elige tus productos
          </p>

          <h1 className="mt-1 text-xl font-black uppercase leading-tight text-white drop-shadow-sm">
            {categoria.nombre}
          </h1>

          <p className="mx-auto mt-1 max-w-[260px] text-[10px] font-semibold leading-snug text-white/70">
            Agrega los productos que quieras a tu pedido
          </p>

          <div className="mx-auto mt-2 h-[3px] w-14 rounded-full bg-gradient-to-r from-[#fff200] via-[#ffb000] to-white/70" />
        </div>

        <Link
          href="/"
          className="mb-3 flex min-h-9 items-center justify-center rounded-[1rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-200 px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.08em] text-black shadow-md shadow-black/15 ring-1 ring-black/10 transition active:scale-[0.98]"
        >
          Click aquí para ver categorías
        </Link>
      </div>

      <ProductList categoriaNombre={categoria.nombre} productos={productos} />
    </section>
  );
}